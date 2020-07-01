import { Issue } from "./getIssues";
import { Context } from "./getContext";
import { TwoslashResults } from "./runTwoslashRuns";

export const updateIssue = async (ctx: Context, issue: Issue, runs: TwoslashResults[]) => {
  console.log("updating issue", issue.number)
}
