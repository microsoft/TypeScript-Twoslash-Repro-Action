import { Issue } from "./getIssues";
import { Context } from "./getContext";
import { TwoslashResults, RunState } from "./runTwoslashRuns";
import { getPreviousRunInfo } from "./utils/getPreviousRunInfo";
import { API } from "./utils/api";
import { runInContext } from "vm";

export type EmbeddedTwoslashRun = {
  commentID: string
  runs: TwoslashResults[]
}

export const updateIssue = async (ctx: Context, issue: Issue, newRuns: TwoslashResults[], api: API) => {
  console.log("updating issue", issue.number, issue.id)

  const previousRun = getPreviousRunInfo(issue)

  const nightlyNew = getLatest(newRuns)
  const previousNightly = getLatest(newRuns)

  const above = makeMessageForMainRuns(nightlyNew, previousNightly)

  const groupedBySource = groupBy(newRuns, ts => ts.commentID || "__body")
  const bottom = makeMessageForOlderRuns(groupedBySource)

  const msg = `${above}\n\n${bottom}`

  await api.editOrCreateComment(issue.id, previousRun?.commentID, msg)
}

/** Above the fold */
const makeMessageForMainRuns = (newLatestRuns: TwoslashResults[], oldLatestRuns: TwoslashResults[]) => {
  // If they're inconsistent, then treat it as though there are no latest runs
  if (newLatestRuns.length !== oldLatestRuns.length) oldLatestRuns.splice(0, oldLatestRuns.length)

  const groupedBySource = groupBy(newLatestRuns, ts => ts.commentID || "__body")
  const sources = Object.keys(groupedBySource).sort().reverse()

  const inner = sources.map(source => {
    const runs = groupedBySource[source]
    const summerizeRuns = summerizeRunsAsHTML(runs)

    const sortedRuns = summerizeRuns.sort((l, r) => r.label.localeCompare(l.label))
    return sortedRuns.map(r => toRow(r.description, r.output)).join("\n <br/>")
  })

  return inner.join("\n\n")
}

/** Makes the "Historical" section at the end of an issue */
const makeMessageForOlderRuns = (runsBySource: Record<string, TwoslashResults[]>) => {

  // Sources are the issue body, or comments etc
  const sources = Object.keys(runsBySource).sort().reverse()
  const inner = sources.map(source => {
      const runs = runsBySource[source]
      const summerizeRuns = summerizeRunsAsHTML(runs)
    
      return `
<h4>${runs[0].description}</h4>
<td>
  <table role="table">
    <thead>
      <tr>
        <th width="250">Version</th>
        <th width="80%">Reproduction Outputs</th>
      </tr>
    </thead>
    <tbody>
      ${summerizeRuns.sort((l, r) => r.name.localeCompare(l.name)).map(r => toRow(r.name, r.output)).join("\n")}
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

const listify = (arr: string[]) => arr.length ? `<ul><li><code>${arr.join("</code></li><li><code>")}</code></li></ul>` : "" 

const simpleSummary = (run: TwoslashResults) => {
  const msg: string[] = []
  if (run.state === RunState.Green) msg.push(":+1: Compiled")
  if (run.state === RunState.HasAssertions) msg.push(`:warning: Assertions: ${listify(run.assertions)}`)
  if (run.state === RunState.RaisedException) msg.push(`:bangbang: Exception: ${run.exception}`)
  if (run.state === RunState.CompileFailed) msg.push(`:x: Failed: \n - ${listify(run.fails)}`)
  if (run.emit) msg.push(`Emit: <pre><code>${run.emit}</code></pre>`)
  return "<p>" + msg.join("<br/>") + "</p>"
}

const toRow = (label: string, summary: string) => `
<tr>
<td>${label}</td>
<td>
  <p>${summary}</p>
</td>
</tr>`

/** 
* Looks through the results of the runs and creates consolidated results
* e.g [ { 3.6.2: "A B"}, { 3.7.1: "A B"},  { 3.8.1: "A B C"}]
*  -> [ {"3.6.2, 3.7.1": "A B"}, { 3.8.1: "A B C" }]
*/
const summerizeRunsAsHTML = (runs: TwoslashResults[]) => {
      const summerizedRows: { label: string, description: string, output: string }[] = []
      runs.forEach(run => {
        const summary = simpleSummary(run)
        const existingSame = summerizedRows.find(r => r.output === summary)
        if (!existingSame){
          summerizedRows.push({ label: run.label, description: run.description, output: summary })
        } else {
          existingSame.label = `${existingSame.label}, ${run.label}`
        }
      });

    return summerizedRows
}

const getLatest = (runs: TwoslashResults[]) =>  runs.filter(r => r.label === "Nightly")
