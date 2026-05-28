import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui"
import { useTheme } from "@/hooks"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const icons = {
    dark: <Moon className="h-4 w-4" />,
    light: <Sun className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Theme: ${theme}`}>
      {icons[theme]}
    </Button>
  )
}