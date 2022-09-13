import fetch from 'node-fetch'

export const getTypeScriptNightlyVersion = async (): Promise<{version: string; sha: string}> => {
  const npmInfo = await fetch(`https://registry.npmjs.org/typescript`)
  const res = await npmInfo.json()
  const version = res['dist-tags'].next
  return {version, sha: res.versions[version].gitHead}
}
