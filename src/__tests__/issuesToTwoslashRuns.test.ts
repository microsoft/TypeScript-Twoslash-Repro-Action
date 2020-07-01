import {issueToTwoslashRun} from '../issuesToTwoslashRuns'
import {Issue} from '../getIssues'
import {Context} from '../getContext'

const testCtx: Context = {
  label: 'repro',
  name: 'myRepo',
  owner: 'orta',
  token: '123456',
  tag: "repro"
}

const oneCodeBlock = ` comment blah
\`\`\`ts repro\r
console.log("Hello")\r
\`\`\`\r
`

const threeCodeBlocks = ` comment blah
\`\`\`ts repro\r
console.log("Hello")\r
\`\`\`\r
\`\`\`ts repro\r
console.log("2")\r
\`\`\`\r
\`\`\`js\r
console.log("Hello")\r
\`\`\`\r
`


const issueWithBody: Issue = {
  number: 123,
  body: oneCodeBlock,
  comments: {nodes: []}
}

const issueWithBodyAndComments: Issue = {
  number: 123,
  body: threeCodeBlocks,
  comments: {nodes: [{
    body: oneCodeBlock,
    id: "1"
  }]}
}

test('handles getting a code sample out of body', async () => {
  const input = issueToTwoslashRun(testCtx)(issueWithBody)
  expect(input.issueNumber).toEqual(123)
  
  const run = input.codeBlocksToRun[0]
  expect(run.block.content).toContain("console.log")
  expect(run.block.lang).toEqual("ts")
})


test('handles getting a code sample out of comments', async () => {
  const input = issueToTwoslashRun(testCtx)(issueWithBodyAndComments)
  // 2 in body, 1 in comment
  expect(input.codeBlocksToRun.length).toEqual(3)
})

