import {sanitizeUrl} from '@braintree/sanitize-url'
import type {MicroLcNotificationCenter} from '../micro-lc-notification-center'

export function getLink (this: MicroLcNotificationCenter, content: string, 
  allowExternalHrefs = false, linkTarget = '_self'): HTMLAnchorElement {
  const {
    shadowRoot
  } = this
  const doc = shadowRoot?.ownerDocument ?? window.document
  const parser = doc.createElement('a')
  parser.href = sanitizeUrl(content)
  parser.target = sanitizeUrl(linkTarget)

  if (!allowExternalHrefs) {
    const trimUpToIndex = content.match(new RegExp(`^${parser.protocol}//${parser.host}`, 'i'))?.[0].length
    parser.href = sanitizeUrl(content.substring(trimUpToIndex))
  }
  return parser
}
