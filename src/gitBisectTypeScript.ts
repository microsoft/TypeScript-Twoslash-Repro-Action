import {execSync} from 'child_process'
import {join} from 'path'
import {Context} from './getContext'
import {Issue} from './getIssues'
import {getRequestsFromIssue, TwoslashRequest} from './getRequestsFromIssue'
import {gitBisect} from './utils/gitBisect'
import {runTwoSlash, TwoslashResult} from './runTwoslashRequests'
import {EmbeddedTwoslashResult, getResultCommentInfoForRequest, InfoComment} from './utils/getExistingComments'

export interface BisectResult {
  badCommit: string
  newLabel: string
  oldLabel: string
  stdout: string
  request: TwoslashRequest
}

export async function gitBisectTypeScript(context: Context, issue: Issue): Promise<BisectResult | undefined> {
  const requests = getRequestsFromIssue(context)(issue)
  const request = requests[requests.length - 1]
  const resultComment = request && getResultCommentInfoForRequest(issue.comments.nodes, request)
  const bisectRevisions =
    getRevisionsFromComment(issue, request, context) ||
    (resultComment && getRevisionsFromPreviousRun(resultComment, context))
  if (!bisectRevisions) return

  const {output, sha} = await gitBisect(context.workspace, bisectRevisions.oldRef, bisectRevisions.newRef, () => {
    const result = buildAndRun(request, context)
    execSync(`git checkout . && git clean -f`, {cwd: context.workspace})
    return resultsAreEqual(bisectRevisions.oldResult, result)
  })

  return {
    request,
    stdout: output,
    badCommit: sha,
    newLabel: bisectRevisions.newLabel,
    oldLabel: bisectRevisions.oldLabel
  }
}

function resultsAreEqual(a: TwoslashResult, b: TwoslashResult) {
  return (
    a.assertions.toString() === b.assertions.toString() &&
    a.fails.toString() === b.fails.toString() &&
    a.emit === b.emit &&
    Math.abs(a.time - b.time) < Math.min(a.time, b.time) * 10 &&
    exceptionsAreEqual(a.exception, b.exception)
  )
}

function exceptionsAreEqual(a: string | undefined, b: string | undefined) {
  if (a === b) return true
  if (!a || !b) return false
  const [aMessage, ...aStack] = a.split('\n'),
    [bMessage, ...bStack] = b.split('\n')
  if (aMessage !== bMessage || aStack.length !== bStack.length) return false
  return aStack.every((line, i) => line.replace(/\(?[\\/].*$/, '') === bStack[i].replace(/\(?[\\/].*$/, ''))
}

interface BisectRevisions {
  oldRef: string
  newRef: string
  oldLabel: string
  newLabel: string
  oldResult: TwoslashResult
}

function getRevisionsFromPreviousRun(
  resultComment: InfoComment<EmbeddedTwoslashResult>,
  context: Context
): BisectRevisions | undefined {
  let newResult: TwoslashResult | undefined
  let oldResult: TwoslashResult | undefined
  for (let i = resultComment.info.runs.length - 1; i >= 0; i--) {
    const current = resultComment.info.runs[i]
    if (!newResult || resultsAreEqual(newResult, current)) {
      newResult = current
    } else {
      oldResult = current
      break
    }
  }
  if (oldResult && newResult) {
    const oldRef = `v${oldResult.label}`
    const newRef = newResult.label === 'Nightly' ? resultComment.info.typescriptSha : `v${newResult.label}`
    const oldMergeBase = execSync(`git merge-base ${oldRef} main`, {cwd: context.workspace, encoding: 'utf8'}).trim()
    const newMergeBase = execSync(`git merge-base ${newRef} main`, {cwd: context.workspace, encoding: 'utf8'}).trim()
    return {
      oldRef: oldMergeBase,
      newRef: newMergeBase,
      oldLabel: oldResult.label,
      newLabel: newResult.label,
      oldResult
    }
  }
}

const bisectCommentRegExp = /^@typescript-bot bisect (?:this )?(?:good|old) ([^\s]+) (?:bad|new) ([^\s]+)/
function getRevisionsFromComment(
  issue: Issue,
  request: TwoslashRequest,
  context: Context
): BisectRevisions | undefined {
  for (let i = issue.comments.nodes.length - 1; i >= 0; i--) {
    const comment = issue.comments.nodes[i]
    const match = comment.body.match(bisectCommentRegExp)
    if (match) {
      const [, oldLabel, newLabel] = match
      const oldRef = execSync(`git merge-base ${oldLabel} main`, {cwd: context.workspace, encoding: 'utf8'}).trim()
      const newRef = execSync(`git merge-base ${newLabel} main`, {cwd: context.workspace, encoding: 'utf8'}).trim()
      execSync(`git checkout ${oldRef}`, {cwd: context.workspace})
      const oldResult = buildAndRun(request, context)
      return {
        oldRef,
        newRef,
        oldLabel,
        newLabel,
        oldResult
      }
    }
  }
}

function buildAndRun(request: TwoslashRequest, context: Context) {
  try {
    // Try building without npm install for speed, it will work a fair amount of the time
    execSync('npx gulp local', {cwd: context.workspace})
  } catch {
    try {
      execSync('npm ci || rm -rf node_modules && npm install --no-save --before="`git show -s --format=%ci`"', {
        cwd: context.workspace
      })
    } catch {
      console.error('npm install failed, but continuing anyway')
      // Playwright is particularly likely to fail to install, but it doesn't
      // matter. May as well attempt the build and see if it works.
    }
    execSync('npx gulp local', {cwd: context.workspace, stdio: 'inherit'})
  }

  const tsPath = join(context.workspace, 'built/local/typescript.js')
  delete require.cache[require.resolve(tsPath)]
  return runTwoSlash('bisecting')(
    {
      block: request.block,
      description: ''
    },
    require(tsPath),
    join(context.workspace, 'built/local')
  )
}
