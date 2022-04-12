import { execSync } from "child_process";
import { createServer } from "http";

export function gitBisect(
  oldRef: string,
  newRef: string,
  test: () => boolean | Promise<boolean>
): string {
  exec(`git bisect start ${oldRef} ${newRef} --`);
  
  const server = createServer(async (_, res) => {
    try {
      res.writeHead(200).end(await test() ? '0' : '1');
    } catch (err) {
      console.error(err);
      res.writeHead(200).end('125');
    }
  });

  server.listen(3000);
  exec('git bisect run "exit `curl -s http://localhost:3000`"');
  server.close();
  const sha = exec('git rev-parse HEAD');
  exec('git bisect reset');
  return sha;
}

function exec(cmd: string) {
  return execSync(cmd, { encoding: "utf8", stdio: "inherit" });
}
