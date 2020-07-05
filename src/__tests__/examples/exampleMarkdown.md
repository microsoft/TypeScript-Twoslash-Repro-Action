## Hello

A paragraph of stuff `code` sure

> ```ts repro
>  test('NOOPs with no issues', async () => {
>    const input = markdownToCodeBlocks(exampleMD)
>    expect(input).toMatchInlineSnapshot(`undefined`)
>  })
>  ```

```ts repro
export const markdownToCodeBlocks = (md: string) => {
  const codeBlocks = md.split("```")
  if (codeBlocks.length === 1) return []

  const blocks: CodeBlock[] = []
  let opener = false

  codeBlocks.forEach(code => {
    if (opener) {
      const lines = code.split("\n")
      const line = lines[0]
      const [lang, ...tags] = line.split(" ")
      lines.shift()

      blocks.push({
        lang,
        tags,
        content: lines.join("\n")
      })
    }
    opener = !opener
  })

  return blocks
}
```

- thing thing
  
  ```js repro
  some code
  ```

- thing thing
  ```ts misc repro
  some code
  ```
