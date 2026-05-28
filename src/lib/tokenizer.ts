import { encode } from "gpt-tokenizer"

export function estimateTokens(text: string): number {
  try {
    return encode(text).length
  } catch {
    return Math.ceil(text.length / 4)
  }
}