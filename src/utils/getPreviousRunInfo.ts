import { Issue } from "../getIssues";
import { TwoslashResults } from "../runTwoslashRuns";

export const getPreviousRunInfo = (issue: Issue): TwoslashResults[] | undefined => {
  const botComment = issue.comments.nodes.find(c => c.body.includes("<!--- VerifyBotStart --->"))
  if (!botComment) return undefined

  try {
    const jsonString = botComment.body.split("<!--- VerifyBotStart --->")[0].split("<!--- VerifyBotEnd --->")[0]
    return JSON.parse(jsonString)
  } catch (error) {
    return undefined
  }
}
