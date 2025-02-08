/** Post-opening moulds. */

/** Acquired chat details. */
export interface ChatItem {
  id: string
  author: {
    name: string
    thumbnail?: ImageItem
    channelId: string
    badge?: {
      thumbnail: ImageItem
      label: string
    }
  }
  message: MessageItem[]
  primaryText?: MessageItem[]
  superchat?: {
    amount: string
    color: string
    sticker?: ImageItem
  }
  membershipGift?: {
    message: MessageItem[]
    image?: ImageItem
  }
  isMembership: boolean
  isVerified: boolean
  isOwner: boolean
  isModerator: boolean
  timestamp: Date
}

/** Chat message strings or pictograms */
export type MessageItem = { text: string } | EmojiItem

/** Image */
export interface ImageItem {
  url: string
  alt: string
}

/** Emoji */
export interface EmojiItem extends ImageItem {
  emojiText: string
  isCustomEmoji: boolean
}

export type YoutubeId = { channelId: string } | { liveId: string } | { handle: string }
