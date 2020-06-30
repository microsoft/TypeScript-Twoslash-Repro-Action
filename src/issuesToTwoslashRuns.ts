import { Issue } from "./getIssues"
import { markdownToCodeBlocks, CodeBlock } from "./utils/markdownToCodeBlocks"
import { Context } from "./getContext"

export type TwoslashRun = {
  issueNumber: number

  codeBlocksToRun: {
    // If missing, then it's in body
    commentID?: string
    block: CodeBlock
  }[]
}

// export const issuesToTwoslashRuns = (ctx:Context, issues: Issue[]): TwoslashRun[] => {
//   return issues.map(issueToTwoslashRun(ctx))
// }

export const issueToTwoslashRun = (ctx: Context) => (issue: Issue): TwoslashRun => {
  // Body -> CodeBlocks
  const bodyCode = markdownToCodeBlocks(issue.body)
  const codeBlocks: TwoslashRun["codeBlocksToRun"] = bodyCode.filter(validCodeblocks(ctx.label)).map(c => ({
    block: c
  }))

  // Comment -> CodeBlocks[]
  const commentCodeBlocks = issue.comments.nodes.map(c => ({
    twoslashRuns: markdownToCodeBlocks(c.body).filter(validCodeblocks(ctx.label)),
    commentID: c.id
  }))

  // Flatten to Comment -> CodeBlock
  //            Comment -> CodeBlock
  commentCodeBlocks.forEach(comment => {
    comment.twoslashRuns.forEach(run => {
      codeBlocks.push({
        commentID: comment.commentID,
        block: run
      })
    });
  });

  return {
    issueNumber: issue.number,
    codeBlocksToRun: codeBlocks
  }
}


const validCodeblocks = (label: string) => (codeBlock: CodeBlock) => codeBlock.tags.includes(label)
