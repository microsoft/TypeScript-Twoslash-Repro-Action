import { twoslasher } from "@typescript/twoslash";
import { Context } from "./getContext";
import { getIssueComments } from "./getIssues";
import { gitBisect } from "./gitBisect";
import { TwoslashResults } from "./runTwoslashRuns";
import { EmbeddedTwoslashRun } from "./updatesIssue";

export async function gitBisectTypeScript(context: Context, issue: string) {
  const issueNumber = parseInt(issue, 10);
  const comments = await getIssueComments(context, issueNumber);
  const prevRunComment = (() => {
    for (let i = comments.length - 1; i >= 0; i--) {
      const comment = comments[i];
      if (comment.author.login === "typescript-bot") {
        const jsonContentStart = comment.body.indexOf("<!--- TypeScriptBot %%%");
        if (jsonContentStart > -1) {
          return JSON.parse(comment.body.substring(
            jsonContentStart + "<!--- TypeScriptBot %%%".length,
            comment.body.indexOf("%%% --->", jsonContentStart),
          )) as EmbeddedTwoslashRun;
        }
      }
    }
  })();

  if (!prevRunComment) return;

  let newRef;
  let oldRef;
  for (let i = prevRunComment.runs.length - 1; i >= 0; i--) {
    const current = prevRunComment.runs[i];
    if (!newRef || resultsAreEqual(newRef, current)) {
      newRef = current;
    } else {
      oldRef = current;
      break;
    }
  }

  if (!oldRef || !newRef) return;

  const runRequest = comments.find(c => c.id === prevRunComment.commentID)

  gitBisect(
    oldRef.label,
    newRef.label === "Nightly" ? prevRunComment.typescriptNightlyVersion : newRef.label,
    () => twoslasher(prevRunComment)
  )
}

function resultsAreEqual(a: TwoslashResults, b: TwoslashResults) {
  return a.assertions.toString() === b.assertions.toString()
    && a.fails.toString() === b.fails.toString()
    && a.emit === b.emit
    && a.exception === b.exception;
}