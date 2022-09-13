import {getRequestsFromIssue} from '../getRequestsFromIssue'
import {Issue} from '../getIssues'
import {Context} from '../getContext'
import {issueFixture} from './fixtures/issue41617'

const testCtx: Context = {
  label: 'repro',
  name: 'myRepo',
  owner: 'orta',
  token: '123456',
  tag: 'repro',
  workspace: '',
  bisect: undefined,
  issue: undefined,
  dryRun: false
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
  id: '',
  databaseId: 123,
  author: {
    login: 'hey'
  },
  comments: {nodes: []}
}

const issueWithBodyAndComments: Issue = {
  number: 123,
  id: '',
  databaseId: 123,
  author: {
    login: 'hello'
  },
  body: threeCodeBlocks,
  comments: {
    nodes: [
      {
        body: oneCodeBlock,
        id: '1',

        url: 'https://thing.com',
        author: {
          login: 'hey'
        }
      }
    ]
  }
}

test('handles getting a code sample out of body', async () => {
  const input = getRequestsFromIssue(testCtx)(issueWithBody)

  const run = input[0]
  expect(run.block.content).toContain('console.log')
  expect(run.block.lang).toEqual('ts')
})

test('handles getting a code sample out of comments', async () => {
  const input = getRequestsFromIssue(testCtx)(issueWithBodyAndComments)
  // only one repro per body/comment supported
  expect(input.length).toEqual(2)
})

test('handles the right names', async () => {
  const input = getRequestsFromIssue(testCtx)(issueFixture)
  // 1 in body, 1 in comment
  expect(input.length).toEqual(2)

  const body = input[0]
  const comment = input[1]

  expect(body.description).toEqual("<a href='#issue-747830259'>Issue body</a> code block by @Igorbek")
  expect(comment.description).toEqual(
    "<a href='https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957284'>Comment</a> by @weswigham</a>"
  )
})
