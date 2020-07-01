import { getIssues } from './getIssues'
import { getContext } from './getContext'
import { issueToTwoslashRun } from './issuesToTwoslashRuns'
import { updateIssue } from './updatesIssue'
import { runTwoslashRuns } from './runTwoslashRuns'


async function run() {
  const ctx = getContext()
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`);

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the label: ${ctx.label}`);

  for (const issue of issues) {
    process.stdout.write(".")
    if (issues.indexOf(issue) % 10) console.log("")

    const runs = issueToTwoslashRun(ctx)(issue)
    
    const results = runTwoslashRuns(issue, runs)
    console.log(JSON.stringify(results, null, "  "))
    
    await updateIssue(ctx, issue, results)
  }
}

process.on('unhandledRejection', error => {
  console.error('Error', error);
  process.exitCode = 1
});

run()
