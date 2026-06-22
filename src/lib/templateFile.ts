import { z } from "zod"
import { CharacterTemplate } from "@/types/templates"

export const templateFileSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.number().optional(),
  templates: z.array(
    z.object({
      name: z.string().min(1),
      data: z.string(),
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
    })
  ),
})

export type TemplateFile = z.infer<typeof templateFileSchema>

export function exportTemplates(templates: CharacterTemplate[], filename = "character-templates"): void {
  const file: TemplateFile = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    templates: templates.map((t) => ({
      name: t.name,
      data: t.data,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importTemplates(
  file: File
): Promise<{ templates: Omit<CharacterTemplate, "id">[]; schemaVersion: number }> {
  const text = await file.text()
  const json = JSON.parse(text)
  const parsed = templateFileSchema.parse(json)
  return {
    templates: parsed.templates.map((t) => ({
      name: t.name,
      data: t.data,
      createdAt: t.createdAt ?? Date.now(),
      updatedAt: t.updatedAt ?? Date.now(),
    })),
    schemaVersion: parsed.schemaVersion,
  }
}
