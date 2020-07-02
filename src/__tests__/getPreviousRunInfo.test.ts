import { runInfoString, getPreviousRunInfo } from "../utils/getPreviousRunInfo";
import { Issue } from "../getIssues";

test("gets the value in and then out again", () => {
  const prefix = runInfoString({ a: "123" } as any)
  const issue: Issue = {
    body: "",
    id: "123124",
    comments: { nodes: [{
      body: prefix + "## Some markdown etc ",
      id: "2333",
    }]},
    number: 23
  }

  const result = getPreviousRunInfo(issue)
  expect(result).toEqual({ a : "123" })
})
