import {getInput} from '@actions/core'

export interface Context {
  token: string;
  owner: string;
  name: string;
  label: string;
  tag: string;
  issue: string | undefined;
  bisect: string | undefined;
  workspace: string;
  dryRun: boolean;
}

export const getContext = () => {
  const token = getInput('github-token') || process.env.GITHUB_TOKEN!
  const repo = getInput('repo') || process.env.GITHUB_REPOSITORY || 'microsoft/TypeScript'
  const workspace = process.env.GITHUB_WORKSPACE!
  const label = getInput('label') || 'Has Repro'
  const tag = getInput('code-tag') || 'repro'
  const issue = getInput('issue') || process.env.ISSUE
  const bisect = getInput('bisect') || (process.env.BISECT as string | undefined)
  const owner = repo.split('/')[0]
  const name = repo.split('/')[1]
  const dryRun = !!process.env.DRY

  const ctx: Context = {
    token,
    owner,
    name,
    label,
    tag,
    issue,
    bisect,
    workspace,
    dryRun,
  }

  return ctx
}
