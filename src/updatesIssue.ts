import { Issue } from "./getIssues";
import { TwoslashRun } from "./issuesToTwoslashRuns";
import { Context } from "./getContext";

export const updateIssue = async (ctx: Context, issue: Issue, runs: TwoslashRun) => {
  console.log("updating issue", issue.number)
}
