import { useEffect, useRef } from "react"
import { Square, CheckCircle, Circle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui"
import { useAgentStore } from "@/stores"
import type { AgentStepStatus } from "@/types/agent"

interface AgentProgressPanelProps {
  maxContextSize: number
  onStop: () => void
}

function StatusIcon({ status }: { status: AgentStepStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "running":
      return <Circle className="h-4 w-4 text-accent animate-pulse" />
    case "error":
      return <XCircle className="h-4 w-4 text-danger" />
    case "aborted":
      return <AlertCircle className="h-4 w-4 text-warning" />
    default:
      return <Circle className="h-4 w-4 text-text-secondary" />
  }
}

export function AgentProgressPanel({ maxContextSize, onStop }: AgentProgressPanelProps) {
  const { steps, log, tokensUsed, isRunning, phase } = useAgentStore()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  return (
    <div className="h-full flex flex-col bg-bg-surface border-l border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary mb-2">Generation Progress</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Tokens used: {tokensUsed.toLocaleString()} / {maxContextSize.toLocaleString()}
          </span>
          {isRunning && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </div>
        <div className="mt-2 h-1.5 bg-bg-input rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((tokensUsed / maxContextSize) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Steps</h4>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <StatusIcon status={step.status} />
                <span className={`text-sm ${step.status === "running" ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Live Log</h4>
          <div
            ref={logRef}
            className="h-48 overflow-y-auto bg-bg-input rounded p-2 font-mono text-xs"
          >
            {log.map((line, i) => (
              <div key={i} className="text-text-secondary whitespace-pre-wrap break-words">
                {">"} {line}
              </div>
            ))}
            {log.length === 0 && (
              <div className="text-text-secondary italic">Waiting...</div>
            )}
          </div>
        </div>
      </div>

      {phase === "done" && (
        <div className="p-4 border-t border-border bg-success/10">
          <p className="text-sm text-success font-medium">Generation complete!</p>
        </div>
      )}

      {phase === "error" && (
        <div className="p-4 border-t border-border bg-danger/10">
          <p className="text-sm text-danger font-medium">Generation failed</p>
        </div>
      )}

      {phase === "aborted" && (
        <div className="p-4 border-t border-border bg-warning/10">
          <p className="text-sm text-warning font-medium">Generation aborted</p>
        </div>
      )}
    </div>
  )
}
