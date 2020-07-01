import {readFileSync} from 'fs'
import {join} from 'path'
import {markdownToCodeBlocks} from '../utils/markdownToCodeBlocks'

const exampleMD = readFileSync(join(__dirname, 'fixtures', 'exampleMarkdown.md'), 'utf8')

test('converts the markdown fine', async () => {
  const addDashR = exampleMD.split("\n").join("\r\n")
  const input = markdownToCodeBlocks(addDashR)
  expect(input).toMatchInlineSnapshot(`
    Array [
      Object {
        "content": ">  test('NOOPs with no issues', async () => {
    >    const input = markdownToCodeBlocks(exampleMD)
    >    expect(input).toMatchInlineSnapshot(\`undefined\`)
    >  })
    >  ",
        "lang": "ts",
        "tags": Array [
          "repro",
        ],
      },
      Object {
        "content": "export const markdownToCodeBlocks = (md: string) => {
      const codeBlocks = md.split(\\"",
        "lang": "ts",
        "tags": Array [
          "repro",
        ],
      },
      Object {
        "content": "
    - thing thing
      
      ",
        "lang": "",
        "tags": Array [],
      },
      Object {
        "content": "
    - thing thing
      ",
        "lang": "",
        "tags": Array [],
      },
      Object {
        "content": "",
        "lang": "",
        "tags": Array [],
      },
    ]
  `)
})
