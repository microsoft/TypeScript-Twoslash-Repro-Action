import { getIssues } from './getIssues'
import { getContext } from './getContext'
import { issueToTwoslashRun } from './issuesToTwoslashRuns'
import { updateIssue } from './updatesIssue'


async function run() {
  const ctx = getContext()
  const issues = await getIssues(ctx)
  for (const issue of issues) {
    const runs = issueToTwoslashRun(ctx)(issue)
    await updateIssue(ctx, issue, runs)
  }
}

run()
