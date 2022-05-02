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
  const existingCommentInfo = getResultCommentInfoForRequest(issue.comments.nodes, request)
  const bodyText = createCommentText(newResults, request)
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
  const msg = `${bodyText}\n\n${embedded}`
  return api.editOrCreateComment(issue.id, existingCommentInfo?.comment, msg)
}

export function createCommentText(newResults: TwoslashResult[], request: TwoslashRequest) {
  const nightly = getNightly(newResults)!
  const older = newResults.filter(r => r !== nightly)

  const fastest = newResults.reduce((fastest, run) => (run.time < fastest.time ? run : fastest), newResults[0])
  const slowest = newResults.reduce((slowest, run) => (run.time > slowest.time ? run : slowest), newResults[0])
  const slowThreshold = fastest.time * 10
  const isSlow = (run: TwoslashResult) => run.time >= slowThreshold
  const reportPerf = isSlow(slowest)

  const introduction = intro(request)
  const above = makeMessageForMainRun(request.description, nightly, reportPerf ? isSlow : undefined)
  const bottom = makeMessageForOlderRuns(older, reportPerf ? isSlow : undefined)
  return `${introduction}\n\n${above}\n\n${bottom}`
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
const makeMessageForMainRun = (
  description: string,
  nightlyResult: TwoslashResult,
  isSlow?: (result: TwoslashResult) => boolean
) => {
  const summarized = summarizeRunsAsHTML([nightlyResult], isSlow)[0]
  return [description, summarized.output, summarized.time ? `${summarized.time} than historical runs` : ''].join('\n\n')
}

/** Makes the "Historical" section at the end of an issue */
const makeMessageForOlderRuns = (runs: TwoslashResult[], isSlow?: (result: TwoslashResult) => boolean) => {
  // Sources are the issue body, or comments etc
  const summarizeRuns = summarizeRunsAsHTML(runs, isSlow)
  const inner = `
  <table role="table">
    <thead>
      <tr>
        <th width="250">Version</th>
        <th width="80%">Reproduction Outputs</th>
        ${isSlow ? '<th>Time</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${summarizeRuns
        .sort((l, r) => r.label.localeCompare(l.label))
        .map(r => toRow(r.label, r.output, r.time))
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

const toRow = (label: string, summary: string, time: string | undefined) => `
<tr>
<td>${label}</td>
<td>
  <p>${summary}</p>
</td>
${time !== undefined ? `<td>${time}</td>` : ''}
</tr>`

/**
 * Looks through the results of the runs and creates consolidated results
 * e.g [ { 3.6.2: "A B"}, { 3.7.1: "A B"},  { 3.8.1: "A B C"}]
 *  -> [ {"3.6.2, 3.7.1": "A B"}, { 3.8.1: "A B C" }]
 */
const summarizeRunsAsHTML = (runs: TwoslashResult[], isSlow: ((run: TwoslashResult) => boolean) | undefined) => {
  const summarizedRows: {label: string; output: string; time?: string}[] = []
  runs.forEach(run => {
    const summary = simpleSummary(run)
    const time = isSlow ? (isSlow(run) ? '⚠️ Way slower' : '') : undefined
    const existingSame = summarizedRows.find(r => r.output === summary && r.time === time)
    if (!existingSame) {
      summarizedRows.push({label: run.label, output: summary, time})
    } else {
      existingSame.label = `${existingSame.label}, ${run.label}`
    }
  })

  return summarizedRows
}

const getNightly = (runs: TwoslashResult[]) => runs.find(r => r.label === 'Nightly')
