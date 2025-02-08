# youtube-chat

> Fetch YouTube live chat without API

☢ ***You will need to take full responsibility for your action*** ☢

## Getting started
1. Install
    - `npm i https://github.com/advancedbear/youtube-chat.git`
    - `yarn add https://github.com/advancedbear/youtube-chat.git`
2. Import
    - Javascript
    ```javascript
    const { LiveChat } = require("youtube-chat")
    ```
    - Typescript
    ```typescript
    import { LiveChat } from "youtube-chat"
    ```
3. Create instance with ChannelID or LiveID
    ```javascript
    // If channelId is specified, liveId in the current stream is automatically acquired.
    // Recommended
    const liveChat = new LiveChat({ channelId: "CHANNEL_ID_HERE" })
    
    // Or specify LiveID in Stream manually.
    const liveChat = new LiveChat({ liveId: "LIVE_ID_HERE" })
    
    // If the second argument is `true`, fetch "LiveChat" instead of "TopChat".
    const liveChat = new LiveChat({ liveId: "LIVE_ID_HERE" }, true)
    
    ```
4. Add events
    ```typescript
    // Emit at start of observation chat.
    // liveId: string
    liveChat.on("start", (liveId) => {
      /* Your code here! */
    })
   
    // Emit at end of observation chat.
    // reason: string?
    liveChat.on("end", (reason) => {
      /* Your code here! */
    })
    
    // Emit at receive chat.
    // chat: ChatItem
    liveChat.on("chat", (chatItem) => {
      /* Your code here! */
    })
    
    // Emit when an error occurs
    // err: Error or any
    liveChat.on("error", (err) => {
      /* Your code here! */
    })
    ```
5. Start
    ```typescript
    // Start fetch loop
    const ok = await liveChat.start()
    if (!ok) {
      console.log("Failed to start, check emitted error")
    }
    ```
6. Stop loop
   ```typescript
   liveChat.stop()
   ```

## Types
### ChatItem
```typescript
interface ChatItem {
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
```

### MessageItem

```typescript
type MessageItem = { text: string } | EmojiItem
```

### ImageItem
```typescript
interface ImageItem {
  url: string
  alt: string
}
```

### EmojiItem
```typescript
interface EmojiItem extends ImageItem {
  emojiText: string
  isCustomEmoji: boolean
}
```

### RemoveChatItemAction

```typescript
interface RemoveChatItemAction {
  type: "REMOVE"
  targetItemId: string
}
```

### TimeoutChatItemAction

```typescript
interface TimeoutChatItemAction {
  type: "TIMEOUT"
  externalChannelId: string
}
```

## References
- https://drroot.page/wp/?p=227
- https://github.com/taizan-hokuto/pytchat

Thank you!👍
