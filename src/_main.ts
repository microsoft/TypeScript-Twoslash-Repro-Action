import { getIssues } from './getIssues'
import { getContext } from './getContext'
import { issueToTwoslashRun } from './issuesToTwoslashRuns'
import { updateIssue } from './updatesIssue'


async function run() {
  const ctx = getContext()
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`);

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the label: ${ctx.label}`);

  for (const issue of issues) {
    process.stdout.write(".")
    if (issues.indexOf(issue) % 10) console.log("")

    console.log(JSON.stringify(issue, null, "  "))

    const runs = issueToTwoslashRun(ctx)(issue)
    console.log(runs)
    await updateIssue(ctx, issue, runs)
  }
}

process.on('unhandledRejection', error => {
  console.error('Error', error);
  process.exitCode = 1
});

run()
