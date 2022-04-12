import {runInfoString, getResultCommentInfoForRequest} from '../utils/getResultCommentInfoForRequest'
import {Issue} from '../getIssues'
import { TwoslashRequest } from '../getRequestsFromIssue'

test('gets the value in and then out again', () => {
  // Only the bits that matter
  const issue: Issue = {
    comments: {
      nodes: [
        {
          author: { login: 'typescript-bot-impersonator' },
          body: 'Look at me I am totally @typescript-bot haha ' + runInfoString({ typescriptNightlyVersion: '4.5.2', code: undefined!, requestCommentId: '12345', runs: [] })
        },
        {
          author: { login: 'typescript-bot' },
          body: 'Blah blah blah ' + runInfoString({ typescriptNightlyVersion: '4.5.2', code: undefined!, requestCommentId: '12345', runs: [] })
        },
        {
          author: { login: 'typescript-bot' },
          body: 'Blah blah blah ' + runInfoString({ typescriptNightlyVersion: '4.4.1', code: undefined!, requestCommentId: '54321', runs: [] })
        }
      ]
    }
  } as any

  expect(getResultCommentInfoForRequest(issue.comments.nodes, { commentID: '12345' } as TwoslashRequest))
    .toEqual({ typescriptNightlyVersion: '4.5.2', code: undefined!, requestCommentId: '12345', runs: [] })
  
  expect(getResultCommentInfoForRequest(issue.comments.nodes, { commentID: '54321' } as TwoslashRequest))
    .toEqual({ typescriptNightlyVersion: '4.4.1', code: undefined!, requestCommentId: '54321', runs: [] })
})
