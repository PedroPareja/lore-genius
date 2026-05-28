import { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"

interface KeywordInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function KeywordInput({ label, values, onChange, placeholder = "Add keyword..." }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addKeyword()
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      removeKeyword(values.length - 1)
    }
  }

  const addKeyword = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInputValue("")
  }

  const removeKeyword = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md bg-bg-input min-h-[42px]">
        {values.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded text-sm"
          >
            {value}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="hover:text-danger cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addKeyword}
          placeholder={values.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-secondary"
        />
      </div>
      <p className="text-xs text-text-secondary">Press Enter or comma to add</p>
    </div>
  )
}