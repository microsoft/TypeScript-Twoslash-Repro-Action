import {Issue} from '../getIssues'
import { TwoslashRequest } from '../getRequestsFromIssue'
import {EmbeddedTwoslashResult} from '../updatesIssue'

export const getResultCommentInfoForRequest = (comments: Issue['comments']['nodes'], request: TwoslashRequest): EmbeddedTwoslashResult | undefined => {
  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i];
    if (comment.author.login === "typescript-bot") {
      const jsonContentStart = comment.body.indexOf("<!--- TypeScriptBot %%%");
      if (jsonContentStart > -1) {
        try {
          const info = JSON.parse(comment.body.substring(
            jsonContentStart + "<!--- TypeScriptBot %%%".length,
            comment.body.indexOf("%%% --->", jsonContentStart),
          )) as EmbeddedTwoslashResult;
          if (info.requestCommentId === request.commentID) {
            return info;
          }
        } catch {
          continue;
        }
      }
    }
  }
}

export const runInfoString = (run: EmbeddedTwoslashResult) => {
  return `<!--- TypeScriptBot %%% ${JSON.stringify(run)} %%% --->`
}
