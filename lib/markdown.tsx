import React from 'react'

/**
 * Parse markdown links [text](url) into clickable React elements
 *
 * Converts markdown-style links to HTML anchors while preserving surrounding text.
 * Used to render digest summaries with clickable links on the web.
 *
 * @example
 * parseMarkdownLinks('Check out [this link](https://example.com) for more')
 * // Returns: ['Check out ', <a href="https://example.com">this link</a>, ' for more']
 */
export function parseMarkdownLinks(text: string): React.ReactNode {
  if (!text) return text

  const parts: React.ReactNode[] = []
  // Match markdown links: [link text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

  let lastIndex = 0
  let match
  let key = 0

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the link as an anchor element
    const [fullMatch, linkText, url] = match
    parts.push(
      <a
        key={`link-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
      >
        {linkText}
      </a>
    )

    lastIndex = match.index + fullMatch.length
  }

  // Add any remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

/**
 * Alternative: Strip markdown URLs entirely, keeping only the link text
 *
 * Use this if you want to remove URLs from the display completely.
 *
 * @example
 * stripMarkdownUrls('[Example](https://example.com)')
 * // Returns: 'Example'
 */
export function stripMarkdownUrls(text: string): string {
  if (!text) return text
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}
