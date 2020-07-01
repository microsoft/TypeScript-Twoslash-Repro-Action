import { Issue } from "../getIssues";
import { TwoslashResults } from "../runTwoslashRuns";
import { EmbeddedTwoslashRun } from "../updatesIssue";

export const getPreviousRunInfo = (issue: Issue): TwoslashResults[] | undefined => {
  const botComment = issue.comments.nodes.find(c => c.body.includes("<!--- TypeScriptBot"))
  if (!botComment) return undefined

  try {
    const jsonString = botComment.body.split("<!--- TypeScriptBot %%% ")[1].split(" %%% --->")[0]
    return JSON.parse(jsonString)
  } catch (error) {
    return undefined
  }
}

export const runInfoString = (run: EmbeddedTwoslashRun) => {
  return  `<!--- TypeScriptBot %%% ${JSON.stringify(run)} %%% --->`
}
