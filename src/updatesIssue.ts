import { Issue } from "./getIssues";
import { Context } from "./getContext";
import { TwoslashResults, RunState } from "./runTwoslashRuns";
import { getPreviousRunInfo } from "./utils/getPreviousRunInfo";
import { API } from "./utils/api";

export type EmbeddedTwoslashRun = {
  commentID: string
  runs: TwoslashResults[]
}

export const updateIssue = async (ctx: Context, issue: Issue, newRuns: TwoslashResults[], api: API) => {
  console.log("updating issue", issue.number)

  const previousRun = getPreviousRunInfo(issue)

  const latestCurrentRuns = newRuns.filter(r => r.label === "Latest")
  const olderRuns = newRuns.filter(r => r.label !== "Latest")

  const msg = makeMessageForOlderRuns(olderRuns)
  await api.editOrCreateComment(issue.id, previousRun?.commentID, msg)
}

const makeMessageForOlderRuns = (runs: TwoslashResults[]) => {
  const toRow = (run: TwoslashResults) => `<tr>
  <td>${run.label}</td>
  <td>
    <p>${simpleSummary(run)}</p>
  </td>
  </tr>`

  const simpleSummary = (run: TwoslashResults) => {
    const msg: string[] = []
    if (run.state === RunState.Green) msg.push(":+1: Compiled")
    if (run.state === RunState.HasAssertions) msg.push(":warning: Assertions")
    if (run.state === RunState.RaisedException) msg.push(`:bangbang: Exception: ${run.exception}`)
    if (run.state === RunState.CompileFailed) msg.push(`:x: Failed: ${run.exception}`)
    return "<p>" + msg.join("<br/>") + "</p>"
  }

  return `
  <details>
  <summary>Historical Information</summary>
  <td>
    <table role="table">
      <thead>
        <tr>
          <th width="50">Version</th>
          <th width="100%">Info</th>
        </tr>
      </thead>
      <tbody>
        ${runs.map(toRow).join("\n")}
      </tbody>
    </table>
  </td>
  </details>`
}


