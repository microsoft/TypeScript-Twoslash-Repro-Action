import {runInfoString, getPreviousRunInfo} from '../utils/getPreviousRunInfo'
import {Issue} from '../getIssues'

test('gets the value in and then out again', () => {
  const prefix = runInfoString({a: '123'} as any)
  // Only the bits that matter
  const issue: Issue = {
    comments: {
      nodes: [
        {
          body: prefix + '## Some markdown etc '
        }
      ]
    }
  } as any

  const result = getPreviousRunInfo(issue)
  expect(result).toEqual({commentID: undefined, runs: { a: '123' }})
})
