import {getInput, info} from '@actions/core'

export type Context = ReturnType<typeof getContext>

export const getContext = () => {
  const token = getInput('github-token') || process.env.GITHUB_REPOSITORY!
  const repo = getInput('repo')
  const label = getInput('label')
  const owner = repo.split('/')[0]
  const name = repo.split('/')[1]

  const ctx = {
    token,
    owner,
    name,
    label
  }

  info(`Context: ${JSON.stringify(ctx, null, '  ')}`);
  return ctx
}
