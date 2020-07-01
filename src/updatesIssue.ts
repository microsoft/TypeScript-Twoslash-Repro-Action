import { Issue } from "./getIssues";
import { Context } from "./getContext";
import { TwoslashResults } from "./runTwoslashRuns";
import { getPreviousRunInfo } from "./utils/getPreviousRunInfo";


const enum RunState {
  RaisedException, // from fail to pass
  CompileFailed,
  HasAssertions,
  Green
}

export type EmbeddedTwoslashRun = {
  state: RunState
  runs: TwoslashResults
}

export const updateIssue = async (ctx: Context, issue: Issue, newRuns: TwoslashResults[]) => {
  console.log("updating issue", issue.number)

  const previousRun = getPreviousRunInfo(issue)
  const uncommented = !!previousRun

  
}
