import {Issue} from './getIssues'
import {markdownToCodeBlocks, CodeBlock} from './utils/markdownToCodeBlocks'
import {Context} from './getContext'

export type TwoslashRequest = {
  description: string
  // If missing, then it's in body
  commentID?: string
  commentUrl?: string
  block: CodeBlock
}

export const getRequestsFromIssue =
  (ctx: Context) =>
  (issue: Issue): TwoslashRequest[] => {
    // Body -> CodeBlock
    const requests: TwoslashRequest[] = []
    const bodyCodeBlock = markdownToCodeBlocks(issue.body).find(isReproCodeBlock(ctx.tag))
    if (bodyCodeBlock) {
      requests.push({
        description: `<a href='#issue-${issue.databaseId}'>Issue body</a> code block by @${issue.author.login}`,
        block: bodyCodeBlock
      })
    }

    // Comment -> CodeBlock
    for (const comment of issue.comments.nodes) {
      const block = markdownToCodeBlocks(comment.body).find(isReproCodeBlock(ctx.tag))
      if (block) {
        requests.push({
          block,
          commentID: comment.id,
          commentUrl: comment.url,
          description: `<a href='${comment.url}'>Comment</a> by @${comment.author?.login || 'ghost'}</a>`
        })
      }
    }

    return requests
  }

const isReproCodeBlock = (tag: string) => (codeBlock: CodeBlock) => codeBlock.tags.includes(tag)
