import { getIssues } from './getIssues'
import { getContext } from './getContext'
import { issuesToTwoslashRuns, issueToTwoslashRun } from './issuesToTwoslashRuns'


async function run() {
  const ctx = getContext()
  const issues = await getIssues(ctx)
  for (const issue of issues) {
    const runs = issueToTwoslashRun(ctx)(issue)
    await updateIss
  }
  
  
}

run()
