import {issuesToTwoslashRuns, issueToTwoslashRun} from '../issuesToTwoslashRuns'
import {Issue} from '../getIssues'

test('NOOPs with no issues', async () => {
  const input = issuesToTwoslashRuns([])
  expect(input).toMatchInlineSnapshot(`Array []`)
})

test('handles getting a code sample out of body', async () => {
  const issueWithBody: Issue = {
    number: 123,
    body: ` comment blah
\`\`\` ts twoslash
console.log("Hello")
\`\`\`
    `,
    comments: {nodes: []}
  }

  const input = issueToTwoslashRun(issueWithBody)
  expect(input).toMatchInlineSnapshot(`Object {}`)
})
