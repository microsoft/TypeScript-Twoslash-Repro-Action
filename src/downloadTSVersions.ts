import {execSync} from 'child_process'
import {existsSync, mkdirSync} from 'fs'
import fetch from 'node-fetch'
import {join} from 'path'

// Fills ./dist/ts with the last 5 major-min releases of TypeScript

export const downloadTypeScriptVersions = async () => {
  const releases = await downloadReleases()
  const usableReleases = reduceToMajMin(releases)

  const mostRecentFive = usableReleases.sort().reverse().slice(0, 5)
  console.log('Grabbing: ', mostRecentFive)

  for (const version of mostRecentFive) {
    ensureTSVersionExists(version)
  }
}

const extractTSVersion = (version: string) => {
  const zip = join(__dirname, '..', 'dist', 'ts-zips', version + '.tgz')
  const toFolder = join(zip, '..', '..', 'ts')
  if (!existsSync(toFolder)) mkdirSync(toFolder)

  execSync(`tar zxf ${zip} --directory ${toFolder}`)

  // This goes to ./dist/ts/package - so rename to ./dist/ts/3.7.4
  execSync(`mv ${toFolder}/package ${toFolder}/${version}`)
}

export const downloadTSVersion = (version: string) => {
  const url = `https://registry.npmjs.org/typescript/-/typescript-${version}.tgz`
  const zips = join(__dirname, '..', 'dist', 'ts-zips')
  if (!existsSync(zips)) mkdirSync(zips)

  const toFile = join(zips, version + '.tgz')
  execSync(`curl ${url} > ${toFile}`)
}

export const ensureTSVersionExists = (version: string) => {
  if (existsSync(join(__dirname, '..', 'dist', version))) return

  downloadTSVersion(version)
  extractTSVersion(version)
}

// Grab the versions the playground uses
const downloadReleases = async () => {
  const response = await fetch('https://typescript.azureedge.net/indexes/releases.json')
  const releases = await response.json()
  return releases.versions as string[]
}

// Get the highest maj/min ignoring patch versions
const reduceToMajMin = (versions: string[]) => {
  const latestMajMin = new Map()
  versions.forEach(v => {
    const majMin = v.split('.')[0] + '.' + v.split('.')[1]
    if (!latestMajMin.has(majMin)) {
      latestMajMin.set(majMin, v)
    }
  })

  return [...latestMajMin.values()] as string[]
}
