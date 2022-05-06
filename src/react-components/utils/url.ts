import type {Notification} from '../NotificationCenter'

function isLegitCallback (notification: Notification): string | undefined {
  if (notification.onClickCallback) {
    const {kind, content} = notification.onClickCallback
    return kind === 'href' ? content : undefined
  }
}

export function getLink (notification: Notification): HTMLAnchorElement {
  const content = isLegitCallback(notification)
  if (content) {
    const parser = document.createElement('a')
    parser.href = content

    const trimUpToIndex = content.match(new RegExp(`^${parser.protocol}//${parser.host}`))?.[0].length
    parser.href = content.substring(trimUpToIndex)
    return parser
  }
}
