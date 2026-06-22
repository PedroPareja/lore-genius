import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Sparkles, Upload, AlertTriangle } from "lucide-react"
import { Button, Input, Textarea } from "@/components/ui"
import { useAgentStore } from "@/stores"
import { useEditorStore } from "@/stores"
import { useLorebookStore } from "@/stores"
import { useSettingsStore } from "@/stores"
import { AgentProgressPanel } from "./AgentProgressPanel"
import { importTemplates } from "@/lib/templateFile"
import { AILorebookRequest } from "@/types/agent"
import { CharacterTemplate } from "@/types/templates"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function AILorebookWizard() {
  const { setView } = useEditorStore()
  const { lorebook, isDirty } = useLorebookStore()
  const { isRunning, phase } = useAgentStore()
  const settings = useSettingsStore((s) => s.settings)

  const [worldIdea, setWorldIdea] = useState("")
  const [lorebookName, setLorebookName] = useState("")
  const [targetCount, setTargetCount] = useState(5)
  const [generateConcepts, setGenerateConcepts] = useState(true)
  const [extraInstructions, setExtraInstructions] = useState("")
  const [showAbortConfirm, setShowAbortConfirm] = useState(false)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [importedTemplatesCount, setImportedTemplatesCount] = useState(0)
  const [importError, setImportError] = useState<string | null>(null)

  const ephemeralTemplatesRef = useRef<CharacterTemplate[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start from a clean slate whenever the wizard is opened, so a previous run's
  // finished/aborted progress panel doesn't leak into a fresh visit. Don't
  // touch a run that is currently in flight (in case the component remounts).
  useEffect(() => {
    if (!useAgentStore.getState().isRunning) {
      useAgentStore.getState().reset()
    }
  }, [])

  const handleBack = () => {
    if (isRunning) {
      setShowAbortConfirm(true)
    } else {
      setView("editor")
    }
  }

  const handleStop = () => {
    useAgentStore.getState().stop()
  }

  const handleImportTemplates = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)

    try {
      const result = await importTemplates(file)
      ephemeralTemplatesRef.current = result.templates.map((t) => ({
        id: `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...t,
      }))
      setImportedTemplatesCount(result.templates.length)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed")
    }
    e.target.value = ""
  }

  const handleGenerate = async () => {
    if (lorebook && isDirty) {
      setShowReplaceConfirm(true)
      return
    }

    await startGeneration()
  }

  const startGeneration = async () => {
    const request: AILorebookRequest = {
      worldIdea,
      lorebookName: lorebookName || "Untitled Lorebook",
      targetCharacterCount: targetCount,
      generateConcepts,
      ephemeralTemplates: ephemeralTemplatesRef.current.length > 0 ? ephemeralTemplatesRef.current : undefined,
      extraInstructions: extraInstructions || undefined,
      includeUserPersona: true,
    }

    // `agentStore.start` runs the full pipeline and surfaces results via the store state.
    await useAgentStore.getState().start(request)

    const { phase } = useAgentStore.getState()
    if (phase === "done") {
      useEditorStore.getState().setView("editor")
    }
  }

  const handleReplaceConfirm = () => {
    setShowReplaceConfirm(false)
    startGeneration()
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-xl font-semibold text-text-primary">AI Lorebook Generator</h2>
          </div>

          {isRunning ? (
            <div className="text-center py-12 text-text-secondary">
              <p className="text-lg mb-2">Generation in progress...</p>
              <p className="text-sm">This may take a few minutes depending on complexity</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">World idea / concept description *</label>
                  <Textarea
                    value={worldIdea}
                    onChange={(e) => setWorldIdea(e.target.value)}
                    placeholder="A totalitarian theocracy where women are reduced to reproductive vessels..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Lorebook name *</label>
                  <Input
                    value={lorebookName}
                    onChange={(e) => setLorebookName(e.target.value)}
                    placeholder="The Handmaid's Tale"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">
                    Target number of characters *
                  </label>
                  <Input
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={50}
                  />
                  <p className="text-xs text-text-secondary">
                    Estimated max feasible: ~{Math.floor(settings.ai.maxContextSize / 1500)} characters based on context size
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="generateConcepts"
                    checked={generateConcepts}
                    onChange={(e) => setGenerateConcepts(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="generateConcepts" className="text-sm text-text-primary">
                    Generate concepts?
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Character templates JSON (optional)</label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose file...
                    </Button>
                    {importedTemplatesCount > 0 && (
                      <span className="text-sm text-success self-center">
                        {importedTemplatesCount} template(s) loaded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">
                    Import templates to use for character generation. Falls back to in-app templates or generic generation if empty.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplates}
                    className="hidden"
                  />
                  {importError && (
                    <p className="text-xs text-danger">{importError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Extra instructions (optional)</label>
                  <Textarea
                    value={extraInstructions}
                    onChange={(e) => setExtraInstructions(e.target.value)}
                    placeholder="Set a somber, literary tone; include political intrigue..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!worldIdea.trim() || !lorebookName.trim()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Lorebook
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(isRunning || phase !== "idle") && (
        <div className="w-80">
          <AgentProgressPanel
            maxContextSize={settings.ai.maxContextSize}
            onStop={handleStop}
          />
        </div>
      )}

      <Dialog open={showAbortConfirm} onOpenChange={setShowAbortConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abort Generation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary py-2">
            Stopping now will discard all generated entries. The lorebook will not be created.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbortConfirm(false)}>
              Continue Generating
            </Button>
            <Button variant="destructive" onClick={() => {
              setShowAbortConfirm(false)
              handleStop()
              setView("editor")
            }}>
              Abort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Current Lorebook?</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-md">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm text-warning">
              Generating a new AI lorebook will replace the currently open lorebook. Unsaved changes will be lost.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplaceConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleReplaceConfirm}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
