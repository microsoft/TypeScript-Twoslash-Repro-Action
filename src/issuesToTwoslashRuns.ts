import { Issue } from "./getIssues"
import { markdownToCodeBlocks, CodeBlock } from "./utils/markdownToCodeBlocks"
import { Context } from "./getContext"

export type TwoslashRun = {
  issueNumber: number

  codeBlocksToRun: {
    // If missing, then it's in body
    description: string
    commentID?: string
    block: CodeBlock
  }[]
}

export const issueToTwoslashRun = (ctx: Context) => (issue: Issue): TwoslashRun => {
  // Body -> CodeBlocks
  const bodyCode = markdownToCodeBlocks(issue.body)
  const codeBlocks: TwoslashRun["codeBlocksToRun"] = bodyCode.filter(validCodeblocks(ctx.tag)).map((c, i) => ({
    block: c,
    description: `<a href='#issue-${issue.id}'>Issue body</a> code block by @${issue.author.login}`
  }))

  // Comment -> CodeBlocks[]
  const commentCodeBlocks = issue.comments.nodes.map(c => ({
    twoslashRuns: markdownToCodeBlocks(c.body).filter(validCodeblocks(ctx.tag)),
    commentID: c.id,
    description: `<a href='${c.url}'>Comment</a> by @${issue.author.login}</a>`
  }))

  // Flatten to Comment -> CodeBlock
  //            Comment -> CodeBlock
  commentCodeBlocks.forEach(comment => {
    comment.twoslashRuns.forEach(run => {
      codeBlocks.push({
        commentID: comment.commentID,
        block: run,
        description: comment.description
      })
    });
  });

  return {
    issueNumber: issue.number,
    codeBlocksToRun: codeBlocks
  }
}


const validCodeblocks = (tag: string) => (codeBlock: CodeBlock) => codeBlock.tags.includes(tag)
