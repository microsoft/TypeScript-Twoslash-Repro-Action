import {runTwoSlashOnOlderVersions} from '../runTwoslashRuns'
import {TwoslashRun} from '../issuesToTwoslashRuns'

// Skip these v.slow tests on watch mode
const isWatch = (process.env.npm_config_argv!.includes("-w") || process.env.npm_config_argv!.includes("--watch")) 
const maybeTest = isWatch ? test.skip : test

maybeTest('runs code against the older TS versions', () => {
  const run: TwoslashRun = {
    issueNumber: 1,
    codeBlocksToRun: [
      {
        description: "",
        block: {
          content: "// @errors: 2588\nconst a = '123'; a = 6",
          lang: 'ts',
          tags: []
        }
      }
    ]
  }

  const results = runTwoSlashOnOlderVersions(run.codeBlocksToRun[0])
  results.forEach(r => {
    expect(r.fails.length).toEqual(1)
  });
})
