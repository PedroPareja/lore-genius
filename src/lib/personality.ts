import { PersonalityBucket, PersonalityProfile, PersonalityTrait, PERSONALITY_AREAS } from "@/types/personality"

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function bucketFor(value: number): PersonalityBucket {
  if (value < 15) return "Very Low"
  if (value < 30) return "Low"
  if (value < 45) return "Moderate-Low"
  if (value < 55) return "Moderate"
  if (value < 70) return "Moderate-High"
  if (value < 85) return "High"
  return "Very High"
}

export function rollPersonality(seedStr?: string): PersonalityProfile {
  const seed = seedStr ? hashString(seedStr) : Math.floor(Math.random() * 0xffffffff)
  const rng = mulberry32(seed)
  const actualSeed = seedStr || String(seed)

  const traits: PersonalityTrait[] = PERSONALITY_AREAS.map((area) => {
    const value = Math.floor(rng() * 101)
    return { area, value, bucket: bucketFor(value) }
  })

  return { seed: actualSeed, traits }
}

export function formatPersonality(profile: PersonalityProfile): string {
  const lines = ["[Personality]"]
  for (const trait of profile.traits) {
    lines.push(`${trait.area}: ${trait.bucket} (${trait.value})`)
  }
  return lines.join("\n")
}
