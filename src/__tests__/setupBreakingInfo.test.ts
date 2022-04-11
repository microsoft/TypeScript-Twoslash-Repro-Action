import {readFileSync} from 'fs'
import {join} from 'path'
import {compare} from "semver"

import {binarySearch, BisectVersion, extractDateAndVersionMetadata} from '../setupBreakingInfo'

const examplePkg = readFileSync(join(__dirname, 'fixtures', 'typescript.json'), 'utf8')

it('extracts the useful metadata for bisecting', () => {
  const versions = extractDateAndVersionMetadata(JSON.parse(examplePkg))
  expect(versions[3]).toMatchInlineSnapshot(`
    Array [
      "0.8.2",
      "2013-01-22T01:31:00.505Z",
    ]
  `)
})

it('bisects with a known function for checking a version', async () => {
    const versions = extractDateAndVersionMetadata(JSON.parse(examplePkg)).filter(v => v[0].includes("-dev"))
    const picker = async (v: BisectVersion) => {
        const res = compare("4.5.0-dev.20210824", v[0], { includePrerelease: true})
        return res
    }
    const results = await binarySearch(versions, picker)
    expect(results[0]).toEqual("4.5.0-dev.20210824")
  })

  
  