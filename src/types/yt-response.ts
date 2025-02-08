/** API response type */

/** get_live_chat Response */
export interface GetLiveChatResponse {
  responseContext: object
  trackingParams?: string
  continuationContents: {
    liveChatContinuation: {
      continuations: Continuation[]
      actions: Action[]
    }
  }
}

export interface Continuation {
  invalidationContinuationData?: {
    invalidationId: {
      objectSource: number
      objectId: string
      topic: string
      subscribeToGcmTopics: boolean
      protoCreationTimestampMs: string
    }
    timeoutMs: number
    continuation: string
  }
  timedContinuationData?: {
    timeoutMs: number
    continuation: string
    clickTrackingParams: string
  }
}

export interface Action {
  addChatItemAction?: AddChatItemAction
  addLiveChatTickerItemAction?: object
  removeChatItemAction?: RemoveChatItemAction
  removeChatItemByAuthorAction?: TimeoutChatItemAction
}

export interface Thumbnail {
  url: string
  width?: number
  height?: number
}

export interface MessageText {
  text: string
}

export interface MessageEmoji {
  emoji: {
    emojiId: string
    shortcuts: string[]
    searchTerms: string[]
    supportsSkinTone: boolean
    image: {
      thumbnails: Thumbnail[]
      accessibility: {
        accessibilityData: {
          label: string
        }
      }
    }
    variantIds: string[]
    isCustomEmoji?: true
  }
}

export type MessageRun = MessageText | MessageEmoji

export interface AuthorBadge {
  liveChatAuthorBadgeRenderer: {
    customThumbnail?: {
      thumbnails: Thumbnail[]
    }
    icon?: {
      iconType: string
    }
    tooltip: string
    accessibility: {
      accessibilityData: {
        label: string
      }
    }
  }
}

export interface MessageRendererBase {
  authorName?: {
    simpleText: string
  }
  authorPhoto: {
    thumbnails: Thumbnail[]
  }
  authorBadges?: AuthorBadge[]
  contextMenuEndpoint: {
    clickTrackingParams: string
    commandMetadata: {
      webCommandMetadata: {
        ignoreNavigation: true
      }
    }
    liveChatItemContextMenuEndpoint: {
      params: string
    }
  }
  id: string
  timestampUsec: string
  authorExternalChannelId: string
  contextMenuAccessibility: {
    accessibilityData: {
      label: string
    }
  }
}

export interface LiveChatTextMessageRenderer extends MessageRendererBase {
  message: {
    runs: MessageRun[]
  }
}

export interface LiveChatPaidMessageRenderer extends LiveChatTextMessageRenderer {
  purchaseAmountText: {
    simpleText: string
  }
  headerBackgroundColor: number
  headerTextColor: number
  bodyBackgroundColor: number
  bodyTextColor: number
  authorNameTextColor: number
}

export interface LiveChatPaidStickerRenderer extends MessageRendererBase {
  purchaseAmountText: {
    simpleText: string
  }
  sticker: {
    thumbnails: Thumbnail[]
    accessibility: {
      accessibilityData: {
        label: string
      }
    }
  }
  moneyChipBackgroundColor: number
  moneyChipTextColor: number
  stickerDisplayWidth: number
  stickerDisplayHeight: number
  backgroundColor: number
  authorNameTextColor: number
  headerPrimaryText: {
    runs: MessageRun[]
  }
}

export interface LiveChatMembershipItemRenderer extends MessageRendererBase {
  headerSubtext: {
    runs: MessageRun[]
  }
  authorBadges: AuthorBadge[]
}

export interface LiveChatMembershipMilestoneRenderer extends MessageRendererBase {
  headerPrimaryText: {
    runs: MessageRun[]
  }
  empty: boolean
  authorBadges: AuthorBadge[]
}

export interface LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
  id: string
  timestampUsec: string
  authorExternalChannelId: string
  header: {
    liveChatSponsorshipsHeaderRenderer: LiveChatSponsorshipsHeaderRenderer
  }
}

export interface liveChatSponsorshipsGiftRedemptionAnnouncementRenderer extends MessageRendererBase {
  message: {
    runs: MessageRun[]
  }
}

export interface LiveChatSponsorshipsHeaderRenderer {
  primaryText: {
    runs: MessageRun[]
  }
  image?: {
    thumbnails?: { url: string }[]
  }
  authorName?: {
    simpleText: string
  }
  authorPhoto: {
    thumbnails: Thumbnail[]
  }
  authorBadges?: AuthorBadge[]
  contextMenuEndpoint: {
    clickTrackingParams: string
    commandMetadata: {
      webCommandMetadata: {
        ignoreNavigation: true
      }
    }
    liveChatItemContextMenuEndpoint: {
      params: string
    }
  }
  contextMenuAccessibility: {
    accessibilityData: {
      label: string
    }
  }
}

export interface AddChatItemAction {
  item: {
    liveChatTextMessageRenderer?: LiveChatTextMessageRenderer
    liveChatPaidMessageRenderer?: LiveChatPaidMessageRenderer
    liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer
    liveChatPaidStickerRenderer?: LiveChatPaidStickerRenderer
    liveChatSponsorshipsGiftPurchaseAnnouncementRenderer?: LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer
    liveChatSponsorshipsGiftRedemptionAnnouncementRenderer?: liveChatSponsorshipsGiftRedemptionAnnouncementRenderer
    LiveChatMembershipMilestoneRenderer?: LiveChatMembershipMilestoneRenderer
    liveChatViewerEngagementMessageRenderer?: object
  }
  clientId: string
}

export interface RemoveChatItemAction {
  type: "REMOVE"
  targetItemId: string
}

export interface TimeoutChatItemAction {
  type: "TIMEOUT"
  externalChannelId: string
}

/** Options for get_live_chat */
export interface FetchOptions {
  apiKey: string
  clientVersion: string
  continuation: string
}
