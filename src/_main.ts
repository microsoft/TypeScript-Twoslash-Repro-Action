import { getIssues } from './getIssues'
import { getContext } from './getContext'

async function run() {
  const ctx = getContext()
  const issues = await getIssues(ctx)
  
}

run()
