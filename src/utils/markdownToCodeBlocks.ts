export type CodeBlock = {
  lang: string
  tags: string[]
  content: string
}

export const markdownToCodeBlocks = (md: string) => {
  const codeBlocks = md.split('```')
  if (codeBlocks.length === 1) return []

  const blocks: CodeBlock[] = []
  let opener = false

  // TODO: Remove prefix on code > ?

  codeBlocks.forEach(code => {
    if (opener) {
      const lines = code.split(/\r?\n/)
      const line = lines[0]
      const [lang, ...tags] = line.split(' ')
      lines.shift()

      blocks.push({
        lang,
        tags,
        content: lines.join('\r\n')
      })
    }
    opener = !opener
  })

  return blocks
}
