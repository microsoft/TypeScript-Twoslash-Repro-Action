import { getOctokit } from '@actions/github'
import { Context } from './getContext'

export type Issue = {
  id: string
  number: number
  body: string

  comments: {
    nodes: {
      body: string
      id: string
    }[]
  }
}

export async function getIssues(context: Context): Promise<Issue[]> {
  const octokit = getOctokit(context.token)
  const req = issuesQuery(context.owner, context.name, context.label)
  // const auth = {
  //   headers: {
  //     authorization: `token ${process.env.GITHUB_TOKEN}`
  //   }
  // }

  const initialIssues = (await octokit.graphql(req.query, {
    ...req.vars,
    // ...auth
  })) as any
  // TODO: check if nodes length == 100, then start looping

  return initialIssues.repository.issues.nodes
}

const issuesQuery = (owner: string, name: string, label: string) => {
  const query = `query GetLabeledIssues($owner: String!, $name: String!, $label:String!) { 
    repository(name: $name, owner:$owner) {
      issues(labels:[$label], states:OPEN, first:100) {
        nodes {
          id
          number
          body

          comments(first: 100) {
            nodes {
              body
              id
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
