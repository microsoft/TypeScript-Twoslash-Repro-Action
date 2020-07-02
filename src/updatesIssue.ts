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

  // const latestCurrentRuns = newRuns.filter(r => r.label === "Latest")
  const groupedBySource = groupBy(newRuns, ts => ts.commentID || "__body")

  const msg = makeMessageForOlderRuns(groupedBySource)
  await api.editOrCreateComment(issue.id, previousRun?.commentID, msg)
}

const makeMessageForOlderRuns = (runsBySource: Record<string, TwoslashResults[]>) => {
  const sources = Object.keys(runsBySource).sort()
  const inner = sources.map(source => {
      const runs = runsBySource[source]

      const summerizedRows: { name: string, output: string }[] = []
      runs.forEach(run => {
        const summary = simpleSummary(run)
        const existingSame = summerizedRows.find(r => r.output === summary)
        if (!existingSame){
          summerizedRows.push({ name: run.label, output: summary })
        } else {
          existingSame.name = `${existingSame.name}, ${run.label}`
        }
      });

      const toRow = (label: string, summary: string) => `
<tr>
<td>${label}</td>
<td>
  <p>${summary}</p>
</td>
</tr>`

      const simpleSummary = (run: TwoslashResults) => {
        const msg: string[] = []
        if (run.state === RunState.Green) msg.push(":+1: Compiled")
        if (run.state === RunState.HasAssertions) msg.push(`:warning: Assertions: \n - ${run.assertions.join("\n - ")}`)
        if (run.state === RunState.RaisedException) msg.push(`:bangbang: Exception: ${run.exception}`)
        if (run.state === RunState.CompileFailed) msg.push(`:x: Failed: ${run.exception}`)
        return "<p>" + msg.join("<br/>") + "</p>"
      }
    
      return `
<h4>${runs[0].description}</h4>
<td>
  <table role="table">
    <thead>
      <tr>
        <th width="50">Version</th>
        <th width="100%">Info</th>
      </tr>
    </thead>
    <tbody>
      ${summerizedRows.sort((l, r) => r.name.localeCompare(l.name)).map(r => toRow(r.name, r.output)).join("\n")}
    </tbody>
  </table>
</td>
      `
  });


  return `<details>
  <summary>Historical Information</summary>
${inner.join("\n\n")}
  </detail>
  `
}

// https://gist.github.com/JamieMason/0566f8412af9fe6a1d470aa1e089a752#gistcomment-2999506
function groupBy<T extends any, K extends keyof T>(array: T[], key: K | { (obj: T): string }): Record<string, T[]> {
  const keyFn = key instanceof Function ? key : (obj: T) => obj[key]
  return array.reduce(
    (objectsByKeyValue, obj) => {
      const value = keyFn(obj)
      // @ts-ignore
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
      return objectsByKeyValue
    },
    {} as Record<string, T[]>
  )
}
