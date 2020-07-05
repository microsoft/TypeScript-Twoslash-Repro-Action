import { join } from "path"
import { readFileSync } from "fs"
import fetch from "node-fetch"

export const  getTypeScriptMeta = async () => {
  const pkgPath = join(__dirname, "..", "..", "node_modules", "typescript", "package.json")
  const pkgJSON = JSON.parse(readFileSync(pkgPath, "utf8"))

  const version = pkgJSON.version

  const npmInfo = await fetch(`https://registry.npmjs.org/typescript/${version}`);
  const res = await npmInfo.json()

  return {
    version,
    sha: res.gitHead
  }
}
