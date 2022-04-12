import {Issue} from '../getIssues'
import {EmbeddedTwoslashResult} from '../updatesIssue'

export const getLatestRequest = (issue: Issue): EmbeddedTwoslashResult | undefined => {
  const botComment = issue.comments.nodes.filter(c => c.body.includes('<!--- TypeScriptBot')).pop()
  if (!botComment) return undefined

  try {
    const jsonString = botComment.body.split('<!--- TypeScriptBot %%% ')[1].split(' %%% --->')[0]

    const json = JSON.parse(jsonString)
    if ("typescriptNightlyVersion" in json === false) return undefined

    return {
      ...json,
      commentID: botComment.id 
    } 
  } catch (error) {
    return undefined
  }
}

export const runInfoString = (run: EmbeddedTwoslashResult) => {
  return `<!--- TypeScriptBot %%% ${JSON.stringify(run)} %%% --->`
}
