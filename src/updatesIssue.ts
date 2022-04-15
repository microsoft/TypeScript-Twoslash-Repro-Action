import {Issue} from './getIssues'
import {TwoslashResult, RunState} from './runTwoslashRequests'
import {
  getResultCommentInfoForRequest,
  getBisectCommentInfoForRequest,
  embedInfo,
  getAllTypeScriptBotComments
} from './utils/getExistingComments'
import {API} from './utils/api'
import {getTypeScriptNightlyVersion} from './utils/getTypeScriptNightlyVersion'
import {TwoslashRequest} from './getRequestsFromIssue'
import {BisectResult} from './gitBisectTypeScript'

export async function fixOrDeleteOldComments(issue: Issue, api: API): Promise<Issue> {
  const outdatedComments = getAllTypeScriptBotComments(issue.comments.nodes)
    .filter(c => c.info.version !== 1)
    .map(c => c.comment)
  for (const comment of outdatedComments) {
    await api.deleteComment(comment.id)
  }
  if (outdatedComments.length) {
    return {
      ...issue,
      comments: {nodes: issue.comments.nodes.filter(c => !outdatedComments.includes(c))}
    }
  }
  return issue
}

export function postBisectComment(issue: Issue, result: BisectResult, api: API) {
  const existingCommentInfo = getBisectCommentInfoForRequest(issue.comments.nodes, result.request)
  const embedded = embedInfo({
    kind: 'bisect-result',
    version: 1,
    requestCommentId: result.request.commentID
  })
  const message = `The change between ${result.oldLabel} and ${result.newLabel} occurred at ${result.badCommit}.\n\n${embedded}`
  return api.editOrCreateComment(issue.id, existingCommentInfo?.comment, message)
}

export const updateIssue = async (request: TwoslashRequest, issue: Issue, newRuns: TwoslashResult[], api: API) => {
  process.stdout.write(`\nUpdating issue ${issue.number}: `)
  if (newRuns.length === 0) return

  return updateMainComment(request, newRuns, api, issue)
}

async function updateMainComment(request: TwoslashRequest, newResults: TwoslashResult[], api: API, issue: Issue) {
  const nightly = getNightly(newResults)!
  const older = newResults.filter(r => r !== nightly)

  const existingCommentInfo = getResultCommentInfoForRequest(issue.comments.nodes, request)
  const introduction = intro(request)
  const above = makeMessageForMainRun(request.description, nightly)
  const bottom = makeMessageForOlderRuns(older)
  const nightlyVersion = await getTypeScriptNightlyVersion()

  const embedded = embedInfo({
    version: 1,
    kind: 'twoslash-result',
    code: request.block,
    runs: newResults,
    requestCommentId: request.commentID,
    typescriptNightlyVersion: nightlyVersion.version,
    typescriptSha: nightlyVersion.sha
  })
  const msg = `${introduction}\n\n${above}\n\n${bottom}\n\n${embedded}`
  return api.editOrCreateComment(issue.id, existingCommentInfo?.comment, msg)
}

const intro = (request: TwoslashRequest) => {
  const docsLink = 'https://github.com/microsoft/TypeScript-Twoslash-Repro-Action/tree/master/docs/user-facing.md'
  const repro = request.commentUrl ? `[this repro](${request.commentUrl})` : `the repro in the issue body`
  return (
    `:wave: Hi, I'm the [Repro bot](${docsLink}). I can help narrow down and track compiler bugs across releases! ` +
    `This comment reflects the current state of ${repro} running against the nightly TypeScript.<hr />`
  )
}

/** Above the fold */
export const makeMessageForMainRun = (description: string, nightlyResult: TwoslashResult) => {
  const summarized = summarizeRunsAsHTML([nightlyResult])[0]
  return [description, summarized.output].join('\n\n')
}

/** Makes the "Historical" section at the end of an issue */
const makeMessageForOlderRuns = (runs: TwoslashResult[]) => {
  // Sources are the issue body, or comments etc
  const summarizeRuns = summarizeRunsAsHTML(runs)
  const inner = `
  <table role="table">
    <thead>
      <tr>
        <th width="250">Version</th>
        <th width="80%">Reproduction Outputs</th>
      </tr>
    </thead>
    <tbody>
      ${summarizeRuns
        .sort((l, r) => r.label.localeCompare(l.label))
        .map(r => toRow(r.label, r.output))
        .join('\n')}
    </tbody>
  </table>
`

  return `<details>
  <summary>Historical Information</summary>
${inner}
  </detail>
  `
}

const listify = (arr: string[]) =>
  arr.length ? `<ul><li><code>${arr.join('</code></li><li><code>')}</code></li></ul>` : ''

const simpleSummary = (run: TwoslashResult) => {
  const msg: string[] = []
  if (run.state === RunState.Green) msg.push(':+1: Compiled')
  if (run.state === RunState.HasAssertions) msg.push(`:warning: Assertions: ${listify(run.assertions)}`)
  if (run.state === RunState.RaisedException) msg.push(`:bangbang: Exception: ${run.exception}`)
  if (run.state === RunState.CompileFailed) msg.push(`:x: Failed: \n - ${listify(run.fails)}`)
  if (run.emit) msg.push('Emit: \n\n```ts\n' + run.emit + '\n```\n\n')
  return '<p>' + msg.join('<br/>') + '</p>'
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
const summarizeRunsAsHTML = (runs: TwoslashResult[]) => {
  const summarizedRows: {label: string; output: string}[] = []
  runs.forEach(run => {
    const summary = simpleSummary(run)
    const existingSame = summarizedRows.find(r => r.output === summary)
    if (!existingSame) {
      summarizedRows.push({label: run.label, output: summary})
    } else {
      existingSame.label = `${existingSame.label}, ${run.label}`
    }
  })

  return summarizedRows
}

const getNightly = (runs: TwoslashResult[]) => runs.find(r => r.label === 'Nightly')
