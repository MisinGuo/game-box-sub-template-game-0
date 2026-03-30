'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

// 从 children 中提取纯文本（用于生成 id）
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as any).props?.children)
  }
  return ''
}

// 生成标题 id（与 TOC 生成逻辑保持一致）
function generateHeadingId(children: React.ReactNode): string {
  const text = extractText(children)
  // 移除 HTML 标签，只保留纯文本，然后生成 id
  const cleanText = text.replace(/<[^>]*>/g, '').trim()
  return cleanText.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
}

// 自定义组件样式
const components: Components = {
  // 标题 - 添加 id 以支持锚点定位
  h1: ({ children }) => (
    <h1 id={generateHeadingId(children)} className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 id={generateHeadingId(children)} className="text-xl font-bold text-white mt-8 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 id={generateHeadingId(children)} className="text-lg font-bold text-white mt-6 mb-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 id={generateHeadingId(children)} className="text-base font-bold text-white mt-4 mb-2">{children}</h4>
  ),
  
  // 段落
  p: ({ children }) => (
    <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
  ),
  
  // 图片 - 关键部分
  img: ({ src, alt }) => (
    <img
      src={src || ''}
      alt={alt || '图片'}
      className="w-full max-w-full rounded-lg my-4 object-cover"
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
      }}
    />
  ),
  
  // 链接
  a: ({ href, children, ...props }) => {
    // 检查是否是模板变量链接
    if (href?.includes('{{') || href?.includes('siteConfig')) {
      return (
        <span className="text-orange-400 cursor-pointer font-bold">
          {children}
        </span>
      )
    }
    // 外部链接
    if (href?.startsWith('http')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
          {...props}
        >
          {children}
        </a>
      )
    }
    // 内部链接
    return (
      <a href={href} className="text-blue-400 hover:text-blue-300 underline" {...props}>
        {children}
      </a>
    )
  },
  
  // 列表
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-slate-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-slate-300">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-slate-300">{children}</li>
  ),
  
  // 代码
  code: ({ children, className }) => {
    // 检查是否是代码块（有 language 类名）
    const isCodeBlock = className?.includes('language-')
    if (isCodeBlock) {
      return (
        <code className={`${className} block bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm`}>
          {children}
        </code>
      )
    }
    // 行内代码
    return (
      <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400 text-sm">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-slate-800 rounded-lg my-4 overflow-x-auto">{children}</pre>
  ),
  
  // 引用
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-orange-500 pl-4 py-2 my-4 bg-slate-800/50 text-slate-300 italic">
      {children}
    </blockquote>
  ),
  
  // 分割线
  hr: () => <hr className="border-slate-700 my-6" />,
  
  // 加粗和斜体
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-200">{children}</em>
  ),
  
  // 表格
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-slate-700">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-800">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-slate-700 px-4 py-2 text-left text-white font-bold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-700 px-4 py-2 text-slate-300">{children}</td>
  ),
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 移除 YAML frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '')
  
  // 处理模板变量（替换为占位符或移除）
  const processedContent = contentWithoutFrontmatter
    .replace(/\{\{siteConfig\.jumpDomain\}\}/g, '#')
    .replace(/\{\{[^}]+\}\}/g, '')
  
  return (
    <div className="prose prose-invert prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
