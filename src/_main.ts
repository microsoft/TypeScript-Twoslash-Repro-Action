import {getIssues} from './getIssues'
import {getContext} from './getContext'
import {getRequestsFromIssue} from './getRequestsFromIssue'
import {updateIssue} from './updatesIssue'
import {runTwoslashRequests} from './runTwoslashRequests'
import {createAPI} from './utils/api'
import {downloadTypeScriptVersions} from './downloadTSVersions'

async function run() {
  const ctx = getContext()
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`)

  if (ctx.bisectIssue) {
    return gitBisectTypeScript(ctx.bisectIssue);
  }

  await downloadTypeScriptVersions()

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the label: ${ctx.label}`)

  for (const issue of issues) {
    process.stdout.write('.')
    if (issues.indexOf(issue) % 10) console.log('')

    const requests = getRequestsFromIssue(ctx)(issue)
    const api = createAPI(ctx)
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
