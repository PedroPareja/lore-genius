import { AILorebookRequest, AgentPlan, AgentStep, AgentStepStatus } from "@/types/agent"
import { LorebookEntry } from "@/types/lorebook"
import { CharacterTemplate } from "@/types/templates"
import { useAIStore } from "@/stores/aiStore"
import { useLorebookStore } from "@/stores/lorebookStore"
import { useTemplatesStore } from "@/stores/templatesStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useEditorStore } from "@/stores/editorStore"
import { rollPersonality, formatPersonality } from "@/lib/personality"
import { estimateTokens } from "@/lib/tokenizer"

const STOPWORDS = new Set(["of", "the", "a", "an", "de", "van", "la", "le", "el", "das", "dos"])

export class AgentAbortError extends Error {
  constructor() {
    super("Aborted")
    this.name = "AbortError"
  }
}

class AgentError extends Error {
  cause: unknown
  constructor(message: string, cause: unknown) {
    super(message)
    this.name = "AgentError"
    this.cause = cause
  }
}

type AgentPhase = "idle" | "planning" | "concepts" | "characters" | "done" | "error" | "aborted"

interface AgentHooks {
  appendLog: (line: string) => void
  updateStep: (id: string, patch: Partial<AgentStep>) => void
  setPhase: (phase: AgentPhase) => void
  setPlan: (plan: AgentPlan | null) => void
  setSteps: (steps: AgentStep[]) => void
  setTokensUsed: (tokens: number) => void
  setError: (error: string | null) => void
  getSignal: () => AbortSignal
}

interface PreparedEntry {
  stepId: string
  partial: Partial<LorebookEntry>
}

function pending(id: string, label: string): AgentStep {
  return { id, label, status: "pending" as AgentStepStatus }
}

function checkAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new AgentAbortError()
}

function buildPlanPrompt(
  request: AILorebookRequest,
  templates: CharacterTemplate[]
): string {
  const templateList = templates
    .map(
      (t) =>
        `- id:${t.id} name:${t.name}: ${t.data.slice(0, 200)}${t.data.length > 200 ? "..." : ""}`
    )
    .join("\n")

  return `You are a creative worldbuilding assistant. Generate a detailed plan for a lorebook.

World Idea: ${request.worldIdea}
Target Character Count: ${request.targetCharacterCount}
${request.extraInstructions ? `Extra Instructions: ${request.extraInstructions}` : ""}

Available Character Templates:
${templateList || "No templates available. Invent distinct character concepts grounded in the world."}

Respond with ONLY a valid JSON object in this exact format (no markdown fences, no explanation):
{
  "userPersonaSummary": "a short paragraph describing the user's persona in this world",
  "concepts": [{"keyword": "concept_name", "role": "brief description"}],
  "characters": [{"templateId": "template_id", "templateName": "Template Name", "name": "Character Name", "role": "their role/job"}]
}

Requirements:
- Exactly ${request.targetCharacterCount} characters.
- Each character must reference a UNIQUE templateId from those provided above (use the literal id strings). If fewer templates are available than ${request.targetCharacterCount}, you may reuse a template, but each character still needs a distinct name and role.
- ${request.generateConcepts ? "Provide 4-8 concept keyword/role pairs relevant to the world." : "Return an empty concepts array."}
- Character names should be evocative and appropriate to the world.
- The role should be a single short noun phrase describing the character's function in the world.`
}

function stripJsonFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
}

async function callAI(prompt: string, hooks: AgentHooks): Promise<string> {
  const aiStore = useAIStore.getState()
  checkAborted(hooks.getSignal())
  const result = await aiStore.generate(
    prompt,
    {
      entryComment: "",
      entryKeys: [],
      entryKeysecondary: [],
      entryGroup: "",
      entryContent: "",
    },
    "write"
  )
  checkAborted(hooks.getSignal())
  return result
}

async function runPlan(
  request: AILorebookRequest,
  templates: CharacterTemplate[],
  hooks: AgentHooks
): Promise<AgentPlan> {
  hooks.appendLog("Planning: analyzing world idea and building character outline...")
  hooks.updateStep("plan", { status: "running" })

  const prompt = buildPlanPrompt(request, templates)
  let response: string
  try {
    response = await callAI(prompt, hooks)
  } catch (err) {
    hooks.updateStep("plan", { status: "error" })
    throw err
  }

  try {
    const plan = JSON.parse(stripJsonFences(response)) as AgentPlan

    if (!plan || typeof plan.userPersonaSummary !== "string" || !Array.isArray(plan.characters)) {
      throw new Error("Plan JSON is missing required fields (userPersonaSummary or characters).")
    }

    if (plan.characters.length !== request.targetCharacterCount) {
      hooks.appendLog(
        `Warning: model returned ${plan.characters.length} characters (requested ${request.targetCharacterCount}); proceeding with the model's count.`
      )
    }

    // Reconcile template ids against the known set; if a model returns an unknown id or a
    // duplicate, fall back to an unused template so each character references a real template.
    const knownIds = new Set(templates.map((t) => t.id))
    const knownNames = new Map(templates.map((t) => [t.name, t.id] as const))
    const usedIds = new Set<string>()
    for (const c of plan.characters) {
      let id = c.templateId
      if (!knownIds.has(id)) {
        id = knownNames.get(c.templateName) ?? (c.templateId as string)
      }
      if (!knownIds.has(id) || usedIds.has(id)) {
        const free = templates.find((t) => !usedIds.has(t.id))
        id = free ? free.id : (id ?? "")
      }
      usedIds.add(id)
      c.templateId = id
      if (!c.templateName) {
        const t = templates.find((t) => t.id === id)
        if (t) c.templateName = t.name
      }
    }

    if (!Array.isArray(plan.concepts)) plan.concepts = []

    hooks.updateStep("plan", { status: "done" })
    hooks.appendLog(
      `Plan complete: ${plan.characters.length} characters, ${plan.concepts.length} concepts`
    )
    return plan
  } catch (err) {
    hooks.updateStep("plan", { status: "error" })
    throw new AgentError(
      `Plan: failed to parse JSON from model. ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
      err
    )
  }
}

function buildConceptPrompt(
  concept: { keyword: string; role: string },
  request: AILorebookRequest
): string {
  return `Write a short lorebook concept entry for the world "${request.lorebookName}".

World idea: ${request.worldIdea}
${request.extraInstructions ? `Extra instructions: ${request.extraInstructions}` : ""}

Concept keyword: ${concept.keyword}
Concept role/meaning: ${concept.role}

Write 2-4 sentences (50-100 words) of concise, evocative lore that explains this concept inside the world.
Output ONLY the entry content, no headings, no preamble, no markdown fences.`
}

function buildUserPersonaPrompt(plan: AgentPlan, request: AILorebookRequest): string {
  return `Write the {{user}} persona entry for the world "${request.lorebookName}".

World idea: ${request.worldIdea}
${request.extraInstructions ? `Extra instructions: ${request.extraInstructions}` : ""}

Planned user persona summary: ${plan.userPersonaSummary}

Expand this into a second-person persona description (2-4 paragraphs) covering the user's role, status, and starting situation in this world.
Output ONLY the persona text, no headings, no preamble, no markdown fences.`
}

function buildCharacterPrompt(
  template: CharacterTemplate | undefined,
  name: string,
  role: string,
  request: AILorebookRequest,
  priorContext: string
): string {
  const profile = rollPersonality(name)
  const profileText = formatPersonality(profile)
  const templateBlock = template
    ? `Character template "${template.name}" (immutable base material; template fixed traits PREVAIL over the rolled personality):\n${template.data}`
    : "No template provided — invent a coherent character that fits the world."

  return `Write a full SillyTavern character lorebook entry for the character "${name}".

World: ${request.lorebookName}
World idea: ${request.worldIdea}
${request.extraInstructions ? `Extra instructions: ${request.extraInstructions}` : ""}

${templateBlock}

Role in world: ${role}

${priorContext ? `Previously generated entries (for world/name consistency):\n${priorContext}\n` : ""}

[Random Personality Profile — inspiration only; the AI MAY override individual traits, but any trait the template fixes PREVAILS over the roll]
${profileText}

Write the entry using these labeled sections (use the exact bold labels shown):

**Appearance / Physical Description**:
<physical description>

**Personality**:
<personality, drawing on the rolled profile but respecting template fixed traits>

**Bio**:
<background and history>

**Motivations & Struggles**:
<goals, conflicts, fears>

Output ONLY the entry text with the four labeled sections. No preamble, no wrapping markdown fences around the whole thing.`
}

function extractKeywords(name: string, role: string): string[] {
  const words = name
    .split(/[\s,.\-_'"]+/i)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w.toLowerCase()))
  if (role) {
    for (const part of role.split(/[\s,.\-_'"]+/i)) {
      const p = part.trim()
      if (p.length > 1 && !STOPWORDS.has(p.toLowerCase())) words.push(p)
    }
  }
  // Deduplicate case-insensitively, preserving original casing.
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of words) {
    const key = w.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(w)
    }
  }
  return out
}

function summarisePrior(
  entries: { name: string; content: string }[],
  headroom: number
): string {
  if (entries.length === 0) return ""
  // Keep the most recent entry in full (when it fits) + a list of names of the rest, to stay
  // within the headroom budget (a simplified truncation strategy per IMPLEMENTATION_PLAN M5).
  let summary = ""
  const names: string[] = []
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    if (i === entries.length - 1 && summary.length + e.content.length <= headroom) {
      summary += `- ${e.name}: ${e.content}\n`
    } else {
      names.push(e.name)
    }
  }
  let prefix = ""
  if (names.length > 0) prefix += `Other characters already in the world: ${names.join(", ")}.\n`
  return (prefix + summary).trim()
}

export async function runAgent(
  request: AILorebookRequest,
  hooks: AgentHooks
): Promise<void> {
  const templatesStore = useTemplatesStore.getState()
  const lorebookStore = useLorebookStore.getState()
  const settings = useSettingsStore.getState().settings
  const maxContextSize = settings.ai.maxContextSize

  let templates = templatesStore.getAll()
  if (request.templateIds && request.templateIds.length > 0) {
    templates = templates.filter((t) => request.templateIds!.includes(t.id))
  }
  if (templates.length === 0 && request.targetCharacterCount > 0) {
    hooks.appendLog("No templates available, using generic character generation.")
    templates = Array.from({ length: request.targetCharacterCount }, (_, i) => ({
      id: `generic-${i}`,
      name: `Generic Character ${i + 1}`,
      data: "A character in this world. Invent a distinct name and role that fits the world idea.",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }))
  }

  // Initial step skeleton (refined after planning, when concept names are known).
  let steps: AgentStep[] = [
    pending("plan", "Planning"),
    ...(request.includeUserPersona ? [pending("user", "Creating {{user}} persona")] : []),
    ...(request.generateConcepts ? [pending("concepts", "Generating concepts")] : []),
    ...Array.from({ length: request.targetCharacterCount }, (_, i) =>
      pending(`char:${i}`, `Character ${i + 1}/${request.targetCharacterCount}`)
    ),
  ]
  hooks.setSteps(steps)

  const commitSteps = (next: AgentStep[]) => {
    steps = next
    hooks.setSteps(next)
  }
  const setStepStatus = (id: string, status: AgentStepStatus) => {
    hooks.updateStep(id, { status })
  }

  hooks.appendLog(`Starting AI Lorebook generation: "${request.lorebookName}"`)
  hooks.appendLog(
    `World: ${request.worldIdea.slice(0, 100)}${request.worldIdea.length > 100 ? "..." : ""}`
  )
  hooks.appendLog(`Using ${templates.length} template(s).`)

  const preparedEntries: PreparedEntry[] = []
  let tokensUsed = 0
  let conceptCount = 0
  let characterCount = 0

  try {
    hooks.setPhase("planning")
    const plan = await runPlan(request, templates, hooks)
    hooks.setPlan(plan)
    tokensUsed += estimateTokens(JSON.stringify(plan))
    hooks.setTokensUsed(tokensUsed)

    // Refine step list with concrete concept names now that the plan is known.
    if (request.generateConcepts && plan.concepts.length > 0) {
      const conceptSteps = plan.concepts.map((c) =>
        pending(`concept:${c.keyword}`, `Concept: ${c.keyword}`)
      )
      const kept = steps.filter(
        (s) => !s.id.startsWith("concept:") && s.id !== "concepts"
      )
      // Insert concept steps right after the user step (or after the plan step if no user).
      const insertIndex = request.includeUserPersona
        ? kept.findIndex((s) => s.id === "user") + 1
        : kept.findIndex((s) => s.id === "plan") + 1
      const nextSteps = [...kept]
      nextSteps.splice(insertIndex, 0, ...conceptSteps)
      commitSteps(nextSteps)
    }

    if (request.includeUserPersona) {
      checkAborted(hooks.getSignal())
      hooks.setPhase("concepts")
      setStepStatus("user", "running")
      hooks.appendLog("Generating {{user}} persona entry...")
      const userContent = await callAI(buildUserPersonaPrompt(plan, request), hooks)
      tokensUsed += estimateTokens(userContent)
      hooks.setTokensUsed(tokensUsed)
      preparedEntries.push({
        stepId: "user",
        partial: {
          key: ["{{user}}"],
          comment: "{{user}}",
          content: userContent,
          constant: true,
          position: 0,
          group: "persona",
        },
      })
      setStepStatus("user", "done")
      hooks.appendLog("  {{user}} persona entry generated.")
    }

    if (request.generateConcepts && plan.concepts.length > 0) {
      hooks.setPhase("concepts")
      hooks.appendLog(`Generating ${plan.concepts.length} concept entries...`)
      for (const concept of plan.concepts) {
        checkAborted(hooks.getSignal())
        const stepId = `concept:${concept.keyword}`
        setStepStatus(stepId, "running")
        hooks.appendLog(`  concept "${concept.keyword}"...`)
        const content = await callAI(buildConceptPrompt(concept, request), hooks)
        tokensUsed += estimateTokens(content)
        hooks.setTokensUsed(tokensUsed)
        preparedEntries.push({
          stepId,
          partial: {
            key: [concept.keyword],
            comment: concept.keyword,
            content,
            constant: false,
            position: 0,
            group: "concepts",
          },
        })
        setStepStatus(stepId, "done")
        conceptCount++
      }
    } else {
      hooks.appendLog("Skipping concepts (not requested or none planned).")
    }

    hooks.setPhase("characters")
    hooks.appendLog(`Generating ${plan.characters.length} character entries...`)

    const generated: { name: string; content: string }[] = []
    for (let i = 0; i < plan.characters.length; i++) {
      checkAborted(hooks.getSignal())
      const char = plan.characters[i]
      const stepId = `char:${i}`
      setStepStatus(stepId, "running")

      const template = templates.find(
        (t) => t.id === char.templateId || t.name === char.templateName
      )
      const headroom = Math.max(1024, Math.floor(maxContextSize * 0.6))
      const prior = summarisePrior(generated, headroom)

      hooks.appendLog(`  character "${char.name}" (role: ${char.role})...`)
      const content = await callAI(
        buildCharacterPrompt(template, char.name, char.role, request, prior),
        hooks
      )
      tokensUsed += estimateTokens(content)
      hooks.setTokensUsed(tokensUsed)

      const keywords = extractKeywords(char.name, char.role)
      preparedEntries.push({
        stepId,
        partial: {
          key: keywords,
          comment: char.name,
          content,
          constant: false,
          position: 1,
          group: "characters",
        },
      })
      generated.push({ name: char.name, content })
      setStepStatus(stepId, "done")
      hooks.appendLog(`    keywords: ${keywords.join(", ")}`)
      characterCount++
    }

    checkAborted(hooks.getSignal())

    hooks.appendLog("Committing lorebook...")
    lorebookStore.createNewLorebook(request.lorebookName)

    let order = 0
    for (const prepared of preparedEntries) {
      const uid = lorebookStore.addEntry()
      lorebookStore.updateEntry(uid, { ...prepared.partial, order: order++ })
    }

    // Select the first committed entry so the editor lands on it.
    const entries = lorebookStore.getEntries()
    if (entries.length > 0) {
      useEditorStore.getState().selectEntry(entries[0].uid)
    }

    lorebookStore.markClean()
    hooks.setPhase("done")
    hooks.setTokensUsed(tokensUsed)
    hooks.appendLog(
      `Lorebook created: ${characterCount} character(s), ${conceptCount} concept(s).`
    )
  } catch (err) {
    if (err instanceof AgentAbortError || (err instanceof Error && err.name === "AbortError")) {
      hooks.setPhase("aborted")
      hooks.appendLog("Generation aborted by user. No lorebook was created.")
    } else {
      hooks.setPhase("error")
      const msg = err instanceof Error ? err.message : "Unknown error"
      hooks.setError(msg)
      hooks.appendLog(`Error: ${msg}`)
    }
  }
}