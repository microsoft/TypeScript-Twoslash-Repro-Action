import {TwoslashRequest} from './getRequestsFromIssue'
import {twoslasher} from '@typescript/twoslash'
import {existsSync, readdirSync} from 'fs'
import {join} from 'path'
import {Issue} from './getIssues'
import {getResultCommentInfoForRequest} from './utils/getExistingComments'

export const enum RunState {
  RaisedException, // from fail to pass
  CompileFailed,
  HasAssertions,
  Green
}

export type TwoslashResult = {
  assertions: string[]
  fails: string[]
  emit?: string
  time: number
  exception?: string
  label: string // e.g. 3.9.5
  state: RunState
}

export function runTwoslashRequests(issue: Issue, request: TwoslashRequest): TwoslashResult[] {
  const oldResults = getResultCommentInfoForRequest(issue.comments.nodes, request)
  const tsRoot = getTypeScriptDir()
  const nightlyTs = require(join(tsRoot, "nightly"))
  let latestRun = runTwoSlash('Nightly')(request, nightlyTs)

  if (!oldResults) {
    const olderRuns = runTwoSlashOnOlderVersions(request)
    return [...olderRuns, latestRun]
  } else {
    const withoutLatest = oldResults.info.runs.filter(f => f.label !== 'Nightly')
    return [...withoutLatest, latestRun]
  }
}

function getTypeScriptDir() {
  //                       dev                                  prod
  const possibleTSRoots = [join(__dirname, '..', 'dist', 'ts'), join(__dirname, 'ts')]
  return possibleTSRoots.find(f => existsSync(f))!
}

export const runTwoSlashOnOlderVersions = (request: TwoslashRequest) => {
  const tsRoot = getTypeScriptDir()
  const tsVersions = readdirSync(tsRoot).filter(f => f !== "nightly")
  return tsVersions.map(tsVersion => {
    const ts = require(join(tsRoot, tsVersion))
    return runTwoSlash(tsVersion)(request, ts)
  })
}

// TODO: Timeouts?
//
export const runTwoSlash =
  (label: string) =>
  (request: TwoslashRequest, ts: any): TwoslashResult => {
    let result: ReturnType<typeof twoslasher>
    const start = new Date()
    const getTime = () => Math.round(new Date().getTime() - start.getTime())

    try {
      const opts = {noErrorValidation: true, noStaticSemanticInfo: true}
      result = twoslasher(request.block.content, request.block.lang, {defaultOptions: opts, tsModule: ts})
    } catch (error: any) {
      return {
        assertions: [],
        fails: [],
        exception: error.name + ' - ' + error.message + '\n\n```\n' + error.stack + '\n```\n\n',
        time: getTime(),
        label,
        state: RunState.RaisedException,
      }
    }

    const fails = result.errors.map(e => e.renderedMessage)

    let state = RunState.Green
    if (result.queries.length) state = RunState.HasAssertions
    if (fails.length) state = RunState.CompileFailed

    const returnResults: TwoslashResult = {
      fails,
      assertions: result.queries.map(q => q.text || q.completions!.map(q => q.name).join(', ')),
      emit: result.code,
      time: getTime(),
      label,
      state,
    }

    const showEmit = request.block.content.includes('// @showEmit') // this would also hit @showEmittedFiles only
    if (!showEmit) delete returnResults['emit']

    return returnResults
  }
