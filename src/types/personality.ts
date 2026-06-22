export type PersonalityBucket =
  | "Very Low"
  | "Low"
  | "Moderate-Low"
  | "Moderate"
  | "Moderate-High"
  | "High"
  | "Very High"

export interface PersonalityTrait {
  area: string
  value: number
  bucket: PersonalityBucket
}

export interface PersonalityProfile {
  seed: string
  traits: PersonalityTrait[]
}

export const PERSONALITY_AREAS: string[] = [
  "Friendliness",
  "Honesty",
  "Confidence",
  "Agreeableness",
  "Manners",
  "Discipline",
  "Rebelliousness",
  "Loyalty",
  "Emotional Capacity",
  "Intelligence",
  "Positivity",
  "Activity Level",
  "Social Tendency",
  "Courage",
  "Patience",
  "Creativity",
  "Humor",
  "Generosity",
  "Trust",
  "Ambition",
  "Stress Response",
  "Curiosity",
  "Empathy",
  "Independence",
  "Adaptability",
  "Energy",
  "Sensitivity",
  "Perseverance",
  "Self-Control",
  "Playfulness",
]
