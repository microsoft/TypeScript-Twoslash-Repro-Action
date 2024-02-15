import {Issue} from '../getIssues'
import {TwoslashRequest} from '../getRequestsFromIssue'
import {TwoslashResult} from '../runTwoslashRequests'
import {CodeBlock} from './markdownToCodeBlocks'

export interface EmbeddedInfo {
  version: 1
  requestCommentId: string | undefined
}

export interface EmbeddedTwoslashResult extends EmbeddedInfo {
  kind: 'twoslash-result'
  code: CodeBlock
  typescriptNightlyVersion: string
  typescriptSha: string
  runs: TwoslashResult[]
}

export interface EmbeddedBisectResult extends EmbeddedInfo {
  kind: 'bisect-result'
}

export type InfoComment<T extends EmbeddedInfo> = {
  comment: Issue['comments']['nodes'][number]
  info: T
}

export const getResultCommentInfoForRequest = (
  comments: Issue['comments']['nodes'],
  request: TwoslashRequest
): InfoComment<EmbeddedTwoslashResult> | undefined => {
  return findTypeScriptBotComment(
    comments,
    (info): info is EmbeddedTwoslashResult =>
      info.kind === 'twoslash-result' && info.requestCommentId === request.commentID
  )
}

export const embedInfo = (info: EmbeddedTwoslashResult | EmbeddedBisectResult) => {
  return `<!--- TypeScriptBot %%% ${JSON.stringify(info)} %%% --->`
}

export function getBisectCommentInfoForRequest(
  comments: Issue['comments']['nodes'],
  request: TwoslashRequest
): InfoComment<EmbeddedBisectResult> | undefined {
  return findTypeScriptBotComment(
    comments,
    (info): info is EmbeddedBisectResult => info.kind === 'bisect-result' && info.requestCommentId === request.commentID
  )
}

export function getAllTypeScriptBotComments(comments: Issue['comments']['nodes']): InfoComment<EmbeddedInfo>[] {
  const results: InfoComment<EmbeddedInfo>[] = []
  for (const comment of comments) {
    if (comment.author?.login === 'typescript-bot') {
      const info = tryParseInfo(comment.body)
      if (info) {
        results.push({comment, info})
      }
    }
  }
  return results
}

function findTypeScriptBotComment<T>(
  comments: Issue['comments']['nodes'],
  predicate: (json: any) => json is T
): {comment: Issue['comments']['nodes'][number]; info: T} | undefined {
  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i]
    if (comment.author?.login === 'typescript-bot') {
      const info = tryParseInfo(comment.body)
      if (info && predicate(info)) {
        return {comment, info}
      }
    }
  }
}

function tryParseInfo(body: string) {
  const jsonContentStart = body.indexOf('<!--- TypeScriptBot %%%')
  if (jsonContentStart > -1) {
    try {
      return JSON.parse(
        body.substring(jsonContentStart + '<!--- TypeScriptBot %%%'.length, body.indexOf('%%% --->', jsonContentStart))
      )
    } catch {}
  }
}
