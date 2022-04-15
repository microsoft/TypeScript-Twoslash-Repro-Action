import {getInput} from '@actions/core'

export type Context = ReturnType<typeof getContext>

export const getContext = () => {
  const token = getInput('github-token') || process.env.GITHUB_TOKEN!
  const repo = getInput('repo') || process.env.GITHUB_REPOSITORY || 'microsoft/TypeScript'
  const workspace = process.env.GITHUB_WORKSPACE!
  const label = getInput('label') || 'Has Repro'
  const tag = getInput('code-tag') || 'repro'
  const bisectIssue = getInput('bisect') || (process.env.BISECT_ISSUE as string | undefined)
  const owner = repo.split('/')[0]
  const name = repo.split('/')[1]

  const ctx = {
    token,
    owner,
    name,
    label,
    tag,
    bisectIssue,
    workspace
  }

  return ctx
}
