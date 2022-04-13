import {getInput} from '@actions/core'

export type Context = ReturnType<typeof getContext>

export const getContext = () => {
  const token = getInput('github-token')
  const repo = getInput('repo') || process.env.GITHUB_REPOSITORY!
  const workspace = process.env.GITHUB_WORKSPACE!
  const label = getInput('label')
  const tag = getInput('code-tag')
  const bisectIssue = getInput('bisect') as string | undefined
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
