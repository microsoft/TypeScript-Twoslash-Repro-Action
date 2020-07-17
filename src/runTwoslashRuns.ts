import {TwoslashRun} from './issuesToTwoslashRuns'
import {twoslasher} from '@typescript/twoslash'
import {existsSync, readdirSync} from 'fs'
import {join} from 'path'
import {Issue} from './getIssues'
import {getPreviousRunInfo} from './utils/getPreviousRunInfo'

export const enum RunState {
  RaisedException, // from fail to pass
  CompileFailed,
  HasAssertions,
  Green
}

export type TwoslashResults = {
  assertions: string[]
  fails: string[]
  emit?: string
  time: number
  exception?: string
  label: string // e.g. 3.9.5
  description: string // e.g. Issue body by orta
  state: RunState
  commentID?: string
}

export function runTwoslashRuns(issue: Issue, runs: TwoslashRun): TwoslashResults[] {
  const oldResults = getPreviousRunInfo(issue)
  let latestRuns = runs.codeBlocksToRun.map(runTwoSlash('Nightly'))

  if (!oldResults) {
    // TODO: Fix d.ts for flat
    const olderRuns = (runs.codeBlocksToRun.map(runTwoSlashOnOlderVersions) as any).flat()
    return [...olderRuns, ...latestRuns]
  } else {
    const withoutLatest = oldResults.runs.filter(f => f.label !== 'Nightly')
    return [...withoutLatest, ...latestRuns]
  }
}

export const runTwoSlashOnOlderVersions = (run: TwoslashRun['codeBlocksToRun'][number]) => {
  //                       dev                                  prod
  const possibleTSRoots = [join(__dirname, '..', 'dist', 'ts'), join(__dirname, 'ts')]
  const tsRoot = possibleTSRoots.find(f => existsSync(f))!
  const tsVersions = readdirSync(tsRoot).filter(f => f.split('.').length !== 2)
  return tsVersions.map(tsVersion => {
    const ts = require(join(tsRoot, tsVersion))
    return runTwoSlash(tsVersion)(run, ts)
  })
}

// TODO: Timeouts?
//
export const runTwoSlash = (label: string) => (
  run: TwoslashRun['codeBlocksToRun'][number],
  ts?: any
): TwoslashResults => {
  let result: ReturnType<typeof twoslasher>
  const start = new Date()
  const getTime = () => Math.round(new Date().getTime() - start.getTime())

  // TypeScript dep needs to be looked up by the workflow define parts of the FS first
  const typeScripts = ['/home/runner/work/TypeScript/node_modules/typescript']
  const t = typeScripts.find(tpath => existsSync(tpath)) || 'typescript'
  console.log(t)
  console.log(readdirSync('/home/runner/work/TypeScript/'))
  console.log(readdirSync('/home/runner/work/TypeScript/node_modules'))
  console.log(readdirSync('/home/runner/work/TypeScript/node_modules/typescript'))
  const tsModule = ts || require(t)
  try {
    const opts = {noErrorValidation: true, noStaticSemanticInfo: true}
    result = twoslasher(run.block.content, run.block.lang, opts, tsModule)
  } catch (error) {
    return {
      assertions: [],
      fails: [],
      exception: error.name + ' - ' + error.message + '\n\n```\n' + error.stack + '\n```\n\n',
      time: getTime(),
      label,
      commentID: run.commentID,
      state: RunState.RaisedException,
      description: run.description
    }
  }

  const fails = result.errors.map(e => e.renderedMessage)

  let state = RunState.Green
  if (result.queries.length) state = RunState.HasAssertions
  if (fails.length) state = RunState.CompileFailed

  const returnResults: TwoslashResults = {
    fails,
    assertions: result.queries.map(q => q.text || q.completions!.map(q => q.name).join(', ')),
    emit: result.code,
    time: getTime(),
    label,
    commentID: run.commentID,
    state,
    description: run.description
  }

  const showEmit = run.block.content.includes('// @showEmit') // this would also hit @showEmittedFiles only
  if (!showEmit) delete returnResults['emit']

  return returnResults
}
