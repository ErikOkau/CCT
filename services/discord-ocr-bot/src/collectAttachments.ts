import type { Attachment, Message } from 'discord.js'
import { MAX_IMAGES } from '../../../utils/guildBattleOcrParse.ts'

export { MAX_IMAGES }

function isImageAttachment(att: Attachment): boolean {
  if (att.contentType?.startsWith('image/')) return true
  const name = att.name ?? ''
  if (/\.(png|jpe?g|webp|gif|heic|heif)$/i.test(name)) return true
  // Phone uploads often have no extension / generic content-type but expose dimensions
  if ((att.width ?? 0) > 0 && (att.height ?? 0) > 0) return true
  if (!att.contentType && att.size > 10_000) return true
  return false
}

function attachmentsFromMessage(message: Message): Attachment[] {
  return [...message.attachments.values()].filter(isImageAttachment)
}

/** Up to MAX_IMAGES (6) screenshots: this message + optional reply from same author (scroll split across 2 messages). */
export async function collectParticipantImages(message: Message): Promise<{
  attachments: Attachment[]
  mergedFromReply: boolean
  skippedNonImages: number
}> {
  const current = attachmentsFromMessage(message)
  const skippedNonImages = message.attachments.size - current.length

  if (current.length >= MAX_IMAGES || !message.reference?.messageId) {
    return {
      attachments: current.slice(0, MAX_IMAGES),
      mergedFromReply: false,
      skippedNonImages
    }
  }

  try {
    const ref = await message.channel.messages.fetch(message.reference.messageId)
    if (ref.author.id !== message.author.id) {
      return {
        attachments: current.slice(0, MAX_IMAGES),
        mergedFromReply: false,
        skippedNonImages
      }
    }

    const fromRef = attachmentsFromMessage(ref)
    const combined = [...fromRef, ...current]
    return {
      attachments: combined.slice(0, MAX_IMAGES),
      mergedFromReply: fromRef.length > 0,
      skippedNonImages
    }
  } catch {
    return {
      attachments: current.slice(0, MAX_IMAGES),
      mergedFromReply: false,
      skippedNonImages
    }
  }
}

export function maxImagesLabel(): number {
  return MAX_IMAGES
}
