import { ChevronDown, ChevronUp } from "lucide-react"
import { Button, Input, Label, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui"
import { useEditorStore } from "@/stores"
import type { LorebookEntry, EntryPosition, EntryRole } from "@/types/lorebook"

interface AdvancedOptionsProps {
  entry: LorebookEntry
  onUpdate: (fields: Partial<LorebookEntry>) => void
}

export function AdvancedOptions({ entry, onUpdate }: AdvancedOptionsProps) {
  const { advancedOptionsExpanded, toggleAdvanced } = useEditorStore()

  return (
    <Collapsible open={advancedOptionsExpanded} onOpenChange={toggleAdvanced}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between text-text-secondary hover:text-text-primary">
          <span className="text-sm font-medium">Advanced Options</span>
          {advancedOptionsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={entry.order}
              onChange={(e) => onUpdate({ order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={String(entry.position)}
              onValueChange={(v) => onUpdate({ position: parseInt(v) as EntryPosition })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Before Character Definition</SelectItem>
                <SelectItem value="1">After Character Definition</SelectItem>
                <SelectItem value="2">Author's Note Area</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group</Label>
            <Input
              value={entry.group}
              onChange={(e) => onUpdate({ group: e.target.value })}
              placeholder="default"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={String(entry.role)}
              onValueChange={(v) => onUpdate({ role: parseInt(v) as EntryRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">System</SelectItem>
                <SelectItem value="1">User</SelectItem>
                <SelectItem value="2">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Depth</Label>
            <Input
              type="number"
              value={entry.depth}
              onChange={(e) => onUpdate({ depth: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Scan Depth (global)</Label>
            <Input
              type="number"
              value={entry.scanDepth ?? ""}
              onChange={(e) => onUpdate({ scanDepth: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Use global"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={entry.constant}
              onCheckedChange={(checked) => onUpdate({ constant: checked })}
            />
            <Label>Constant</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={entry.disable}
              onCheckedChange={(checked) => onUpdate({ disable: checked })}
            />
            <Label>Disabled</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={entry.excludeRecursion}
              onCheckedChange={(checked) => onUpdate({ excludeRecursion: checked })}
            />
            <Label>Exclude Recursion</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={entry.caseSensitive}
              onCheckedChange={(checked) => onUpdate({ caseSensitive: checked })}
            />
            <Label>Case Sensitive</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={entry.matchWholeWords}
              onCheckedChange={(checked) => onUpdate({ matchWholeWords: checked })}
            />
            <Label>Match Whole Words</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={entry.vectorized}
              onCheckedChange={(checked) => onUpdate({ vectorized: checked })}
            />
            <Label>Vectorized</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={entry.useProbability}
              onCheckedChange={(checked) => onUpdate({ useProbability: checked })}
            />
            <Label>Use Probability</Label>
          </div>

          {entry.useProbability && (
            <div className="space-y-2">
              <Label>Probability</Label>
              <Input
                type="number"
                value={entry.probability}
                onChange={(e) => onUpdate({ probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                min={0}
                max={100}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Sticky</Label>
            <Input
              type="number"
              value={entry.sticky}
              onChange={(e) => onUpdate({ sticky: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Cooldown</Label>
            <Input
              type="number"
              value={entry.cooldown}
              onChange={(e) => onUpdate({ cooldown: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Delay</Label>
            <Input
              type="number"
              value={entry.delay}
              onChange={(e) => onUpdate({ delay: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}