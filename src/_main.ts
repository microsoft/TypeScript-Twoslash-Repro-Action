import {getIssues} from './getIssues'
import {getContext} from './getContext'
import {issueToTwoslashRun} from './issuesToTwoslashRuns'
import {updateIssue} from './updatesIssue'
import {runTwoslashRuns} from './runTwoslashRuns'
import {createAPI} from './utils/api'
import {downloadTypeScriptVersions} from './downloadTSVersions'
import { getPreviousRunInfo } from './utils/getPreviousRunInfo'
import { getBreakageInfo } from './setupBreakingInfo'

async function run() {
  const ctx = getContext()
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`)

  await downloadTypeScriptVersions()

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the label: ${ctx.label}`)

  for (const issue of issues) {
    process.stdout.write('.')
    if (issues.indexOf(issue) % 10) console.log('')

    const runs = issueToTwoslashRun(ctx)(issue)

    const results = runTwoslashRuns(issue, runs)
    
    const runInfo = getPreviousRunInfo(issue)
    const breakage = runInfo?.breakageInfo || await getBreakageInfo(runs, results)

    const api = createAPI(ctx)
    await updateIssue(ctx, issue, results, breakage, api)
  }
}
process.stdout.write('.')

process.on('unhandledRejection', error => {
  console.error('Error', error)
  process.exitCode = 1
})

run()
