import { execSync } from "child_process";
import { join } from "path";
import { Context } from "./getContext";
import { Issue } from "./getIssues";
import { getRequestsFromIssue, TwoslashRequest } from "./getRequestsFromIssue";
import { gitBisect } from "./utils/gitBisect";
import { runTwoSlash, TwoslashResult } from "./runTwoslashRequests";
import { getResultCommentInfoForRequest } from "./utils/getExistingComments";

export interface BisectResult {
  badCommit: string;
  newRef: string;
  oldRef: string;
  stdout: string;
  request: TwoslashRequest;
}

export async function gitBisectTypeScript(context: Context, issue: Issue): Promise<BisectResult | undefined> {
  const requests = getRequestsFromIssue(context)(issue)
  const request = requests[requests.length - 1]
  const resultComment = request && getResultCommentInfoForRequest(issue.comments.nodes, request)

  if (!resultComment) return;

  let newResult: TwoslashResult | undefined;
  let oldResult: TwoslashResult | undefined;
  for (let i = resultComment.info.runs.length - 1; i >= 0; i--) {
    const current = resultComment.info.runs[i];
    if (!newResult || resultsAreEqual(newResult, current)) {
      newResult = current;
    } else {
      oldResult = current;
      break;
    }
  }

  if (!oldResult || !newResult) return;
  const oldRef = `v${oldResult.label}`
  const newRef = newResult.label === "Nightly" ? resultComment.info.typescriptSha : `v${newResult.label}`
  const oldMergeBase = execSync(`git merge-base ${oldRef} main`, { cwd: context.workspace, encoding: 'utf8' }).trim()
  const newMergeBase = execSync(`git merge-base ${newRef} main`, { cwd: context.workspace, encoding: 'utf8' }).trim()

  const { output, sha } = await gitBisect(
    context.workspace,
    oldMergeBase,
    newMergeBase,
    () => {
      console.log("npm ci")
      execSync("npm ci", { cwd: context.workspace })
      console.log("npx gulp local")
      execSync("npx gulp local", { cwd: context.workspace, stdio: "inherit" })
      const tsPath = join(context.workspace, "built/local/typescript.js")

      delete require.cache[require.resolve(tsPath)]
      const result = runTwoSlash("bisecting")({
        block: request.block,
        description: "",
      }, require(tsPath))

      return resultsAreEqual(oldResult!, result)
    }
  )

  return {
    request,
    stdout: output,
    badCommit: sha,
    newRef: newResult.label,
    oldRef: oldResult.label,
  };
}

function resultsAreEqual(a: TwoslashResult, b: TwoslashResult) {
  return a.assertions.toString() === b.assertions.toString()
    && a.fails.toString() === b.fails.toString()
    && a.emit === b.emit
    && a.exception === b.exception;
}