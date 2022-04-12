import fetch from "node-fetch"

export const getTypeScriptNightlyVersion = async (): Promise<string> => {
  const npmInfo = await fetch(`https://registry.npmjs.org/typescript`);
  const res = await npmInfo.json()
  return res["dist-tags"].next
}
