import {sanitizeUrl} from '@braintree/sanitize-url'

export function getLink (content: string, allowExternalHrefs = false): HTMLAnchorElement {
  const parser = document.createElement('a')
  parser.href = sanitizeUrl(content)

  if (!allowExternalHrefs) {
    const trimUpToIndex = content.match(new RegExp(`^${parser.protocol}//${parser.host}`))?.[0].length
    parser.href = sanitizeUrl(content.substring(trimUpToIndex))
  }
  return parser
}
