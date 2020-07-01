import { getIssues } from './getIssues'
import { getContext } from './getContext'
import { issueToTwoslashRun } from './issuesToTwoslashRuns'
import { updateIssue } from './updatesIssue'
import { stdout } from 'process'


async function run() {
  const ctx = getContext()
  console.log(`Context: ${JSON.stringify(ctx, null, '  ')}`);

  const issues = await getIssues(ctx)
  console.log(`Found: ${issues.length} issues with the tag`);


  for (const issue of issues) {
    process.stdout.write(".")
    if (issues.indexOf(issue) % 10) console.log("")
    
    const runs = issueToTwoslashRun(ctx)(issue)
    await updateIssue(ctx, issue, runs)
  }
}

process.on('unhandledRejection', error => {
  console.error('Error', error);
  process.exitCode = 1
});

run()
