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

  if (ctx.bisect) {
    if (!ctx.issue) {
      throw new Error('Must provide an issue number to bisect')
    }
    let issue = await getIssue(ctx, parseInt(ctx.issue, 10))
    issue = await fixOrDeleteOldComments(issue, api, ctx)

    const result = await gitBisectTypeScript(ctx, issue)
    if (result && !ctx.dryRun) {
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

    issue = await fixOrDeleteOldComments(issue, api, ctx)
    const requests = getRequestsFromIssue(ctx)(issue)
    for (const request of requests) {
      const results = runTwoslashRequests(issue, request)
      if (!ctx.dryRun) {
        await updateIssue(request, issue, results, api)
      }
    }
  }
}
process.stdout.write('.')

process.on('unhandledRejection', error => {
  console.error('Error', error)
  process.exitCode = 1
})

run()
