const {getIssues} = require('../lib/getIssues')
const {issueToTwoslashRun} = require('../lib/issuesToTwoslashRuns')
const {runTwoslashRuns} = require('../lib/runTwoslashRuns')

const name = 'TypeScript'
const owner = 'microsoft'
const label = 'Has Repro'
const tag = 'repro'

const issueToRun = 41617

const go = async () => {
  const ctx = {token: process.env.GITHUB_TOKEN, label, name, owner, tag}
  const issues = await getIssues(ctx)

  if (issueToRun) {
    const issue = issues.find(i => i.number === issueToRun)
    const runs = issueToTwoslashRun(ctx)(issue)
    
    console.log({issue})
    const results = runTwoslashRuns(issue, runs)
    console.log({results})
  }

  // console.log(runs)
  // debugger
}

go()
