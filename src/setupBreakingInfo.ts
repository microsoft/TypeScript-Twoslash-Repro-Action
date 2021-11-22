import {downloadTypeScriptVersions, ensureTSVersionExists} from './downloadTSVersions'
import {TwoslashRun} from './issuesToTwoslashRuns'
import {requireTS, runTwoSlash, runTwoslashRuns, TwoslashResults} from './runTwoslashRuns'
import {BreakageInfo} from './updatesIssue'

export type BisectVersion = [version: string, date: string]

// Grab every version of TypeScript
const downloadAllTSVersions = async () => {
  const response = await fetch('http://registry.npmjs.org/typescript')
  const json = await response.json()
  return extractDateAndVersionMetadata(json)
}

/** So we can have much less of that 14mb json file in memory */
export const extractDateAndVersionMetadata = (packument: any) => {
  const time = packument.time
  delete time['modified']
  delete time['created']

  return Object.keys(time).map(key => [key, time[key]]) as BisectVersion[]
}

export async function binarySearch(ar: any[], func: (version: BisectVersion) => Promise<number>) {
  var m = 0
  var n = ar.length - 1
  while (m <= n) {
    var k = (n + m) >> 1
    var cmp = await func(ar[k])
    if (cmp > 0) {
      m = k + 1
    } else if (cmp < 0) {
      n = k - 1
    } else {
      return ar[k]
    }
  }

  return ar[m - 1]
}

const compareResults = (run: TwoslashRun, todaysResult: TwoslashResults[]) => async (version: BisectVersion) => {
  ensureTSVersionExists(version[0])
  const ts = requireTS(version[0])
  const newResults = run.codeBlocksToRun.map(code => runTwoSlash('Check for breakage')(code, ts))
  let same = true

  // Look to make sure that every result from today's run include a corresponding result for yesterday's run
  newResults.forEach(res => {
    if (!todaysResult.some(todays => resultsSame(res, todays))) {
      same = false
    }
  })

  return same === true ? 1 : -1
}

export const getBreakageInfo = async (run: TwoslashRun, results: TwoslashResults[]) => {
  const latestResults = getLatest(results)
  const allVersions = await downloadAllTSVersions()

  const comparer = compareResults(run, latestResults)
  const version = await binarySearch(allVersions, comparer)

  const info: BreakageInfo = {
    estimatedVersion: version[0],
    estimatedDate: version[1]
  }

  return info
}

const getLatest = (runs: TwoslashResults[]) => runs.filter(r => r.label === 'Nightly')

const resultsSame = (lhs: TwoslashResults, rhs: TwoslashResults) => {
  if (lhs.description != rhs.description) return false
  if (lhs.state != rhs.state) return false
  if (lhs.fails != rhs.fails) return false
  if (lhs.assertions != rhs.assertions) return false
  if (lhs.exception != rhs.exception) return false

  return true
}
