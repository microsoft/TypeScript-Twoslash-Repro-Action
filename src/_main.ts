import {getIssue, getIssues} from './getIssues'
import {Context, getContext} from './getContext'
import {getRequestsFromIssue} from './getRequestsFromIssue'
import {fixOrDeleteOldComments, postBisectComment, updateIssue} from './updatesIssue'
import {runTwoslashRequests} from './runTwoslashRequests'
import {createAPI} from './utils/api'
import {downloadTypeScriptVersions} from './downloadTSVersions'
import {gitBisectTypeScript} from './gitBisectTypeScript'

async function run() {
  const ctx = getContext()
  const api = createAPI(ctx)
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`)

  if (ctx.bisectIssue) {
    let issue = await getIssue(ctx, parseInt(ctx.bisectIssue, 10))
    issue = await fixOrDeleteOldComments(issue, api)

    const result = await gitBisectTypeScript(ctx, issue)
    if (result) {
      await postBisectComment(issue, result, api)
    }
    return
  }

  await downloadTypeScriptVersions()

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the label: ${ctx.label}`)

  for (let issue of issues) {
    process.stdout.write('.')
    if (issues.indexOf(issue) % 10) console.log('')

    issue = await fixOrDeleteOldComments(issue, api)
    const requests = getRequestsFromIssue(ctx)(issue)
    for (const request of requests) {
      const results = runTwoslashRequests(issue, request)
      await updateIssue(request, issue, results, api)
    }
  }
}
process.stdout.write('.')

process.on('unhandledRejection', error => {
  console.error('Error', error)
  process.exitCode = 1
})

run()
