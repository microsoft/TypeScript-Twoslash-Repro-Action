import {getOctokit} from '@actions/github'
import {Context} from '../getContext'
import {diffLines} from 'diff'
import {Issue} from '../getIssues'

const addComment = `mutation($input: AddCommentInput!) { addComment(input: $input) { clientMutationId } }`
const editComment = `mutation($input: UpdateIssueCommentInput!) { updateIssueComment(input: $input) { clientMutationId } }`
const deleteComment = `mutation($input: DeleteIssueCommentInput!) { deleteIssueComment(input: $input) { clientMutationId } }`

export type API = ReturnType<typeof createAPI>

export const createAPI = (ctx: Context) => {
  const octokit = getOctokit(ctx.token)

  return {
    editOrCreateComment: async (
      issueID: string,
      existingComment: Issue['comments']['nodes'][number] | undefined,
      body: string
    ) => {
      // https://regex101.com/r/ZORaaK/1
      const sanitizedBody = body.replace(
        /home\/runner\/work\/TypeScript-Twoslash-Repro-Action\/TypeScript-Twoslash-Repro-Action\/dist/g,
        '[root]'
      )
      if (existingComment) {
        if (existingComment.body !== sanitizedBody) {
          console.log(diffLines(existingComment.body, sanitizedBody))
          return octokit.graphql(editComment, {input: {id: existingComment.id, body: sanitizedBody}})
        }
      } else {
        return octokit.graphql(addComment, {input: {subjectId: issueID, body: sanitizedBody}})
      }
    },
    deleteComment: async (commentId: string) => {
      return octokit.graphql(deleteComment, {input: {id: commentId}})
    }
  }
}
