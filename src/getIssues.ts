import {getOctokit} from '@actions/github'
import {Context} from './getContext'

export type Issue = {
  /** GQL ID */
  id: string
  /** Used to link to the body comment */
  databaseId: number
  /** User facing number per repo */
  number: number
  body: string
  author: {
    login: string
  }

  comments: {
    nodes: {
      body: string
      id: string
      url: string
      author?: {
        login: string
      } | null
    }[]
  }
}

export async function getIssue(context: Context, issue: number): Promise<Issue> {
  const octokit = getOctokit(context.token)
  const req = issueQuery(context.owner, context.name, issue)
  return ((await octokit.graphql(req.query, req.vars)) as any).repository.issue
}

export async function getIssues(context: Context): Promise<Issue[]> {
  const octokit = getOctokit(context.token)
  if (context.issue) {
    return [await getIssue(context, parseInt(context.issue, 10))]
  }

  const req = issuesQuery(context.owner, context.name, context.label)
  const initialIssues = (await octokit.graphql(req.query, {...req.vars})) as any
  // TODO: check if nodes length == 100, then start looping

  return initialIssues.repository.issues.nodes
}

const issuesQuery = (owner: string, name: string, label: string) => {
  const query = `query GetLabeledIssues($owner: String!, $name: String!, $label:String!) { 
    repository(name: $name, owner:$owner) {
      issues(labels:[$label], states:OPEN, first:100) {
        nodes {
          id
          databaseId
          number

          body

          author {
            login
          }

          comments(first: 100) {
            nodes {
              body
              id
              url

              author {
                login
              }
            }
          }
        }
      }
    }
  }`

  const vars = {
    owner,
    name,
    label
  }

  return {
    query,
    vars
  }
}

const issueQuery = (owner: string, name: string, issue: number) => {
  const query = `query GetIssue($owner: String!, $name: String!, $issue:Int!) {
    repository(name: $name, owner:$owner) {
      issue(number: $issue) {
        id
        databaseId
        number

        body

        author {
          login
        }
        comments(last: 100) {
          nodes {
            body
            id
            url

            author {
              login
            }
          }
        }
      }
    }
  }`

  const vars = {
    owner,
    name,
    issue
  }

  return {
    query,
    vars
  }
}
