import {getInput} from '@actions/core'

export type Context = ReturnType<typeof getContext>

export const getContext = () => {
  const token = getInput('github-token') || process.env.GITHUB_REPOSITORY!
  const repo = getInput('repo')
  const label = getInput('label')
  const owner = repo.split('/')[0]
  const name = repo.split('/')[1]

  return {
    token,
    owner,
    name,
    label
  }
}
