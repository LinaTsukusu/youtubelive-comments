import {
  Action,
  FetchOptions,
  GetLiveChatResponse,
  LiveChatMembershipItemRenderer,
  LiveChatMembershipMilestoneRenderer,
  LiveChatPaidMessageRenderer,
  LiveChatPaidStickerRenderer,
  LiveChatSponsorshipsHeaderRenderer,
  LiveChatTextMessageRenderer,
  MessageRun,
  Thumbnail,
  RemoveChatItemAction,
  TimeoutChatItemAction,
} from "./types/yt-response.js"
import { ChatItem, ImageItem, MessageItem } from "./types/data.js"
export function getOptionsFromLivePage(data: string, chatType?: boolean): FetchOptions & { liveId: string } {
  let liveId: string
  const idResult = data.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=(.+?)">/)
  if (idResult) {
    liveId = idResult[1]
  } else {
    throw new Error("Live Stream was not found")
  }

  const replayResult = data.match(/['"]isReplay['"]:\s*(true)/)
  if (replayResult) {
    throw new Error(`${liveId} is finished live`)
  }

  const liveChatResult = data.match(/['"]liveChatRenderer['"]\s*:/)
  if (!liveChatResult) {
    throw new Error("Live chat was not found")
  }

  let apiKey: string
  const keyResult = data.match(/['"]INNERTUBE_API_KEY['"]:\s*['"](.+?)['"]/)
  if (keyResult) {
    apiKey = keyResult[1]
  } else {
    throw new Error("API Key was not found")
  }

  let clientVersion: string
  const verResult = data.match(/['"]clientVersion['"]:\s*['"]([\d.]+?)['"]/)
  if (verResult) {
    clientVersion = verResult[1]
  } else {
    throw new Error("Client Version was not found")
  }

  let continuation: string | undefined
  const continuationResult = data.matchAll(/['"]continuation['"]:\s*['"](.+?)['"]/g)
  const list = Array.from(continuationResult)

  // Ensure that the required index exists before accessing it
  if (chatType && list.length > 2 && list[2]?.[1]) {
    /** CONTINUATION to be used when retrieving all chats. */
    continuation = list[2][1]
  } else if (list.length > 1 && list[1]?.[1]) {
    /** CONTINUATION to be used when retrieving the top chat. */
    continuation = list[1][1]
  }

  if (!continuation) {
    throw new Error("Continuation was not found")
  }

  return {
    liveId,
    apiKey,
    clientVersion,
    continuation,
  }
}

/** Convert get_live_chat response */
export function parseChatData(data: GetLiveChatResponse): [ChatItem[], string] {
  let chatItems: ChatItem[] = []
  if (data.continuationContents.liveChatContinuation.actions) {
    chatItems = data.continuationContents.liveChatContinuation.actions
      .map((v) => parseActionToChatItem(v))
      .filter((v): v is NonNullable<ChatItem> => v !== null)
  }

  const continuationData = data.continuationContents.liveChatContinuation.continuations[0]
  let continuation = ""
  if (continuationData.invalidationContinuationData) {
    continuation = continuationData.invalidationContinuationData.continuation
  } else if (continuationData.timedContinuationData) {
    continuation = continuationData.timedContinuationData.continuation
  }

  return [chatItems, continuation]
}

/** Converting a Thumbnail object to an ImageItem. */
function parseThumbnailToImageItem(data: Thumbnail[], alt: string): ImageItem {
  const thumbnail = data.pop()
  if (thumbnail) {
    return {
      url: thumbnail.url,
      alt: alt,
    }
  } else {
    return {
      url: "",
      alt: "",
    }
  }
}

function convertColorToHex6(colorNum: number) {
  return `#${colorNum.toString(16).slice(2).toLocaleUpperCase()}`
}

/** メッセージrun配列をMessageItem配列へ変換 */
function parseMessages(runs?: MessageRun[]): MessageItem[] {
  if (!runs) {
    return []
  }

  return runs.map((run: MessageRun): MessageItem => {
    if ("text" in run) {
      return run
    } else {
      // Emoji
      const thumbnail = run.emoji.image.thumbnails.shift()
      const isCustomEmoji = Boolean(run.emoji.isCustomEmoji)
      const shortcut = run.emoji.shortcuts ? run.emoji.shortcuts[0] : ""
      return {
        url: thumbnail ? thumbnail.url : "",
        alt: shortcut,
        isCustomEmoji: isCustomEmoji,
        emojiText: isCustomEmoji ? shortcut : run.emoji.emojiId,
      }
    }
  })
}

interface LiveChatMembershipGiftRenderer extends LiveChatSponsorshipsHeaderRenderer {
  id: string
  timestampUsec: string
  authorExternalChannelId: string
}

/** Determines the type of action and returns a Renderer. */
function rendererFromAction(
  action: Action
):
  | LiveChatTextMessageRenderer
  | LiveChatPaidMessageRenderer
  | LiveChatPaidStickerRenderer
  | LiveChatMembershipItemRenderer
  | LiveChatMembershipMilestoneRenderer
  | LiveChatMembershipGiftRenderer
  | LiveChatMembershipMilestoneRenderer
  | RemoveChatItemAction
  | TimeoutChatItemAction
  | null {
  if (action.removeChatItemAction) {
    return {
      type: "REMOVE",
      targetItemId: action.removeChatItemAction.targetItemId,
    }
  } else if (action.removeChatItemByAuthorAction) {
    return {
      type: "TIMEOUT",
      externalChannelId: action.removeChatItemByAuthorAction.externalChannelId,
    }
  } else if (!action.addChatItemAction) {
    return null
  }
  const item = action.addChatItemAction.item
  if (item.liveChatTextMessageRenderer) {
    return item.liveChatTextMessageRenderer
  } else if (item.liveChatPaidMessageRenderer) {
    return item.liveChatPaidMessageRenderer
  } else if (item.liveChatPaidStickerRenderer) {
    return item.liveChatPaidStickerRenderer
  } else if (item.liveChatMembershipItemRenderer) {
    return item.liveChatMembershipItemRenderer
  } else if (item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer) {
    const parentRenderer = item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer
    return {
      id: parentRenderer.id,
      timestampUsec: parentRenderer.timestampUsec,
      authorExternalChannelId: parentRenderer.authorExternalChannelId,
      ...parentRenderer.header.liveChatSponsorshipsHeaderRenderer,
    }
  } else if (item.liveChatSponsorshipsGiftRedemptionAnnouncementRenderer) {
    return item.liveChatSponsorshipsGiftRedemptionAnnouncementRenderer
  } else if (item.LiveChatMembershipMilestoneRenderer) {
    return item.LiveChatMembershipMilestoneRenderer
  }
  return null
}

function isRemoveAction(renderer: unknown): renderer is RemoveChatItemAction {
  return (
    typeof renderer === "object" &&
    renderer !== null &&
    "type" in renderer &&
    (renderer as RemoveChatItemAction).type === "REMOVE"
  )
}

function isTimeoutAction(renderer: unknown): renderer is TimeoutChatItemAction {
  return (
    typeof renderer === "object" &&
    renderer !== null &&
    "type" in renderer &&
    (renderer as TimeoutChatItemAction).type === "TIMEOUT"
  )
}

/** An action to a ChatItem */
function parseActionToChatItem(data: Action): ChatItem | RemoveChatItemAction | TimeoutChatItemAction | null {
  const messageRenderer = rendererFromAction(data)

  if (messageRenderer === null) {
    return null
  }

  if (isRemoveAction(messageRenderer)) {
    return messageRenderer
  }

  if (isTimeoutAction(messageRenderer)) {
    return messageRenderer
  }

  if (!("id" in messageRenderer)) {
    return null
  }

  let message: MessageRun[] = []
  if ("message" in messageRenderer) {
    message = messageRenderer.message.runs
  } else if ("empty" in messageRenderer) {
    message = messageRenderer.headerPrimaryText.runs
  } else if ("headerSubtext" in messageRenderer) {
    message = messageRenderer.headerSubtext.runs
  }
  const authorNameText = messageRenderer.authorName?.simpleText ?? ""
  const ret: ChatItem = {
    id: messageRenderer.id,
    author: {
      name: authorNameText,
      thumbnail: parseThumbnailToImageItem(messageRenderer.authorPhoto.thumbnails, authorNameText),
      channelId: messageRenderer.authorExternalChannelId,
    },
    message: parseMessages(message),
    isMembership: false,
    isOwner: false,
    isVerified: false,
    isModerator: false,
    timestamp: new Date(Number(messageRenderer.timestampUsec) / 1000),
  }

  if (messageRenderer.authorBadges) {
    for (const entry of messageRenderer.authorBadges) {
      const badge = entry.liveChatAuthorBadgeRenderer
      if (badge.customThumbnail) {
        ret.author.badge = {
          thumbnail: parseThumbnailToImageItem(badge.customThumbnail.thumbnails, badge.tooltip),
          label: badge.tooltip,
        }
        ret.isMembership = true
      } else {
        switch (badge.icon?.iconType) {
          case "OWNER":
            ret.isOwner = true
            break
          case "VERIFIED":
            ret.isVerified = true
            break
          case "MODERATOR":
            ret.isModerator = true
            break
        }
      }
    }
  }

  /** For getting the correct amount of months on membership renew */
  if ("headerPrimaryText" in messageRenderer) {
    const primaryText = messageRenderer.headerPrimaryText.runs

    ret.primaryText = parseMessages(primaryText)
  }

  if ("sticker" in messageRenderer) {
    ret.superchat = {
      amount: messageRenderer.purchaseAmountText.simpleText,
      color: convertColorToHex6(messageRenderer.backgroundColor),
      sticker: parseThumbnailToImageItem(
        messageRenderer.sticker.thumbnails,
        messageRenderer.sticker.accessibility.accessibilityData.label
      ),
    }
  } else if ("purchaseAmountText" in messageRenderer) {
    ret.superchat = {
      amount: messageRenderer.purchaseAmountText.simpleText,
      color: convertColorToHex6(messageRenderer.bodyBackgroundColor),
    }
  } else if (
    data.addChatItemAction?.item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer &&
    "primaryText" in messageRenderer &&
    messageRenderer.primaryText.runs
  ) {
    ret.membershipGift = {
      message: parseMessages(messageRenderer.primaryText.runs),
    }
    if (messageRenderer.image?.thumbnails?.[0]) {
      ret.membershipGift.image = {
        ...messageRenderer.image.thumbnails[0],
        alt: "",
      }
    }
  }

  return ret
}
