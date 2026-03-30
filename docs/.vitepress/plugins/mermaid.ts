import type MarkdownIt from 'markdown-it'

export function mermaidPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = token.content.trim()
    const info = token.info.trim()
    
    if (info === 'mermaid') {
      return `<Mermaid code="${encodeURIComponent(code)}" />`
    }
    
    return fence(tokens, idx, options, env, self)
  }
}
