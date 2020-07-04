import {runTwoSlash} from '../runTwoslashRuns'
import {TwoslashRun} from '../issuesToTwoslashRuns'

const isWatch = process.env.npm_config_argv!.includes('-w') || process.env.npm_config_argv!.includes('--watch')
const maybeTest = isWatch ? test.skip : test

maybeTest('handles a crashing test', () => {
  const broken = makeRun(`const a = 123; a = 321`)
  const result = runTwoSlash('test')(broken)

  expect(result.fails[0]).toContain(`Cannot assign to `)
})

maybeTest('handles a showEmit test', () => {
  const showJS = makeRun(`// @showEmit\nconst a: number = 123`)
  const result = runTwoSlash('test')(showJS)

  expect(result.emit).toEqual(`"use strict";\nconst a = 123;\n`)
})

maybeTest('handles a query test', () => {
  const showJS = makeRun(`const abcde: number = 123\n//      ^?`)
  const result = runTwoSlash('test')(showJS)

  expect(result.assertions).toEqual(['const abcde: number'])
})

const makeRun = (code: string): TwoslashRun['codeBlocksToRun'][number] => ({
  description: 'test run',
  block: {
    lang: 'ts',
    content: code,
    tags: []
  }
})
