import { EventEmitter } from "node:events"
import TypedEmitter from "typed-emitter"
import { ChatItem, YoutubeId } from "./types/data.js"
import { FetchOptions } from "./types/yt-response.js"
import { fetchChat, fetchLivePage } from "./requests.js"

type LiveChatEvents = {
  start: (liveId: string) => void
  end: (reason?: string) => void
  chat: (chatItem: ChatItem) => void
  error: (err: Error | unknown) => void
}

/**
 * YouTube live chat acquisition event
 */
export class LiveChat extends (EventEmitter as new () => TypedEmitter<LiveChatEvents>) {
  liveId?: string
  #observer?: NodeJS.Timeout
  #options?: FetchOptions
  readonly #interval: number = 1000
  readonly #id: YoutubeId
  readonly #chatType: boolean = false

  constructor(id: YoutubeId, chatType = false, interval = 1000) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }

    this.#id = id
    this.#interval = interval
    this.#chatType = chatType
  }

  async start(): Promise<boolean> {
    try {
      const options = await fetchLivePage(this.#id, this.#chatType)
      if (this.#observer && this.liveId == options.liveId) {
        return false
      } else if (this.#observer && this.liveId != options.liveId) {
        this.stop("liveID is changed")
      }
      this.liveId = options.liveId
      this.#options = options

      this.#observer = setInterval(() => this.#execute(), this.#interval)

      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stop(reason?: string) {
    if (this.#observer) {
      clearInterval(this.#observer)
      this.#observer = undefined
      this.emit("end", reason)
    }
  }

  async #execute() {
    if (!this.#options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {
      const [chatItems, continuation] = await fetchChat(this.#options)
      chatItems.forEach((chatItem) => this.emit("chat", chatItem))

      this.#options.continuation = continuation
    } catch (err) {
      this.emit("error", err)
    }
  }
}

