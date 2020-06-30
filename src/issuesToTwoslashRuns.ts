import { Issue } from "./getIssues"

export type TwoslashRun = {
  issueID: string

  twoslashRuns: {
    // If missing, then it's in body
    commentID?: string
    twoslashRun: string
  }[]
}

export const issuesToTwoslashRuns = (issues: Issue[]): TwoslashRun[] => {
  return issues.map(issueToTwoslashRun)
}


export const issueToTwoslashRun = (issues: Issue): TwoslashRun => {
  return {} as any
}
