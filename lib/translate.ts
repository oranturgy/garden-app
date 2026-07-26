import Anthropic from '@anthropic-ai/sdk'

const HEBREW_RE = /[֐-׿]/

function hasHebrew(text: string): boolean {
  return HEBREW_RE.test(text)
}

// Translates all Hebrew-containing string values in a record to English.
// Fields without Hebrew are returned unchanged. Returns the same record
// unchanged if the API key is absent or the call fails.
export async function translateFields<T extends Record<string, string | null | undefined>>(
  fields: T
): Promise<T> {
  const hebrewEntries = Object.entries(fields).filter(
    ([, v]) => typeof v === 'string' && hasHebrew(v)
  ) as [string, string][]

  if (hebrewEntries.length === 0) return fields

  try {
    const client = new Anthropic()
    const payload = Object.fromEntries(hebrewEntries)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: 'You are a Hebrew-to-English translator embedded in a garden tracking app. The user writes garden-related text in Hebrew. Translate each JSON value to natural English. Return ONLY valid JSON with the exact same keys and translated values. No explanation, no markdown, no extra text.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
    })

    const block = response.content[0]
    if (block.type !== 'text') return fields

    const translated = JSON.parse(block.text) as Record<string, string>
    return { ...fields, ...translated } as T
  } catch {
    // If translation fails for any reason, save the original text
    return fields
  }
}
