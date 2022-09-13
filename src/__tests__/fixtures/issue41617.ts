export const issueFixture = {
  id: 'MDU6SXNzdWU3NDc4MzAyNTk=',
  databaseId: 747830259,
  number: 41617,
  body: '**TypeScript Version:**  4.1.2\r\n\r\n**Search Terms:** CFA, narrowing, generic, mapped type, conditional type, type assertion\r\n\r\n**Code**\r\n\r\n```ts repro\r\ninterface A { x: number }\r\n\r\ndeclare function isA(a: unknown): a is A;\r\n\r\ntype FunctionsObj<T> = {\r\n  [K in keyof T]: () => unknown\r\n}\r\n\r\nfunction g<\r\n  T extends FunctionsObj<T>,\r\n  M extends keyof T\r\n>(a2: ReturnType<T[M]>) {\r\n  if (isA(a2)) {\r\n    // a2 is not narrowed\r\n    a2.x // error, but should be ok\r\n  }\r\n}\r\n```\r\n\r\n**Expected behavior:**\r\n\r\nType of `a2` should be narrowed to `ReturnType<T[M]> & A`\r\nIt works this way in TS 4.0\r\n\r\n**Actual behavior:**\r\n\r\nType of `a2` remains only `ReturnType<T[M]>`\r\n\r\n**Playground Link:** https://www.typescriptlang.org/play?ts=4.1.0-beta#code/JYOwLgpgTgZghgYwgAgILIN7IB4C5kgCuAtgEbTIC+AUNQCYQIA2cUKMhICYwA9iMmABnVAAo4+TgGsQvAO4gAlPjiChaANy0wATwAOKAGKdufEEIDypAFYAeACoA+ZAF5M1ZMgDaAaUECpCB1eGGR7AF18UUVXZ2lZBWoaag4uHn5kAHNbDzDkCGxIEDp1YzSzSxsHRwAaXIBZfMKIYvVA4ND7akdxACZ8ACUIMEIoEHt9CAcvevDHGIxc4FDRYTE4XsUF3M8NgDpsZAB6I-yoKF4oXJoaIA\r\n',
  author: {login: 'Igorbek'},
  comments: {
    nodes: [
      {
        body: 'I tried to reduce the repro, but it reproduces only when all these present:\r\n- conditional type that is being narrowed `ReturnType<>`\r\n- generic mapped type that is constraints by itself `T extends FunctionsObj<T>` \r\n- field accessed with generic type `T[M]`',
        id: 'MDEyOklzc3VlQ29tbWVudDczMjM1MjQ4MQ==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-732352481',
        author: {login: 'Igorbek'}
      },
      {
        body: '@typescript-bot run repros',
        id: 'MDEyOklzc3VlQ29tbWVudDczMzg1NjMxOA==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-733856318',
        author: {login: 'orta'}
      },
      {
        body: "Heya @orta, I've started to run the code sample repros for you. [Here's the link to my best guess at the log](https://github.com/microsoft/TypeScript/actions/runs/383720915).",
        id: 'MDEyOklzc3VlQ29tbWVudDczMzg1NjM5OA==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-733856398',
        author: {login: 'typescript-bot'}
      },
      {
        body: ':wave: Hi, I\'m the [Repro bot](https://github.com/microsoft/TypeScript-Twoslash-Repro-Action/tree/master/docs/user-facing.md). I can help narrow down and track compiler bugs across releases! This comment reflects the current state of the 2 repros in this issue running against the nightly TypeScript. If something changes, I will post a new comment.<hr />\n\n\n<tr>\n<td><a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek</td>\n<td>\n  <p><p>:x: Failed: \n - <ul><li><code>Property \'x\' does not exist on type \'ReturnType&lt;T[M]>\'.</code></li></ul></p></p>\n</td>\n</tr>\n\n\n<tr>\n<td><a href=\'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957284\'>Comment</a> by @Igorbek</a></td>\n<td>\n  <p><p>:bangbang: Exception: TypeError - Cannot read property \'ES2016\' of undefined\n\n```\nTypeError: Cannot read property \'ES2016\' of undefined\n    at Object.twoslasher (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:820:29)\n    at /home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3798:29\n    at Array.map (<anonymous>)\n    at Object.runTwoslashRuns (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3764:43)\n    at run (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:1301:43)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n```\n\n</p></p>\n</td>\n</tr>\n\n<details>\n  <summary>Historical Information</summary>\n\n<h4><a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek</h4>\n<td>\n  <table role="table">\n    <thead>\n      <tr>\n        <th width="250">Version</th>\n        <th width="80%">Reproduction Outputs</th>\n      </tr>\n    </thead>\n    <tbody>\n      \n<tr>\n<td>4.1.2, Nightly</td>\n<td>\n  <p><p>:x: Failed: \n - <ul><li><code>Property \'x\' does not exist on type \'ReturnType&lt;T[M]>\'.</code></li></ul></p></p>\n</td>\n</tr>\n\n<tr>\n<td>3.7.5, 3.8.2, 3.9.2, 4.0.2</td>\n<td>\n  <p><p>:+1: Compiled</p></p>\n</td>\n</tr>\n    </tbody>\n  </table>\n</td>\n\n\n\n<h4><a href=\'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957284\'>Comment</a> by @Igorbek</a></h4>\n<td>\n  <table role="table">\n    <thead>\n      <tr>\n        <th width="250">Version</th>\n        <th width="80%">Reproduction Outputs</th>\n      </tr>\n    </thead>\n    <tbody>\n      \n<tr>\n<td>Nightly</td>\n<td>\n  <p><p>:bangbang: Exception: TypeError - Cannot read property \'ES2016\' of undefined\n\n```\nTypeError: Cannot read property \'ES2016\' of undefined\n    at Object.twoslasher (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:820:29)\n    at /home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3798:29\n    at Array.map (<anonymous>)\n    at Object.runTwoslashRuns (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3764:43)\n    at run (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:1301:43)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n```\n\n</p></p>\n</td>\n</tr>\n    </tbody>\n  </table>\n</td>\n\n  </detail>\n  \n\n<!--- TypeScriptBot %%% {"runs":[{"fails":[],"assertions":[],"time":317,"label":"3.7.5","state":3,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"fails":[],"assertions":[],"time":309,"label":"3.8.2","state":3,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"fails":[],"assertions":[],"time":326,"label":"3.9.2","state":3,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"fails":[],"assertions":[],"time":377,"label":"4.0.2","state":3,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"fails":["Property \'x\' does not exist on type \'ReturnType&lt;T[M]>\'."],"assertions":[],"time":437,"label":"4.1.2","state":1,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"fails":["Property \'x\' does not exist on type \'ReturnType&lt;T[M]>\'."],"assertions":[],"time":329,"label":"Nightly","state":1,"description":"<a href=\'#issue-747830259\'>Issue body</a> code block by @Igorbek"},{"assertions":[],"fails":[],"exception":"TypeError - Cannot read property \'ES2016\' of undefined\\n\\n```\\nTypeError: Cannot read property \'ES2016\' of undefined\\n    at Object.twoslasher (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:820:29)\\n    at /home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3798:29\\n    at Array.map (<anonymous>)\\n    at Object.runTwoslashRuns (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:3764:43)\\n    at run (/home/runner/work/_actions/microsoft/TypeScript-Twoslash-Repro-Action/master/dist/index.js:1301:43)\\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\\n```\\n\\n","time":1,"label":"Nightly","commentID":"MDEyOklzc3VlQ29tbWVudDczODk1NzI4NA==","state":0,"description":"<a href=\'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957284\'>Comment</a> by @Igorbek</a>"}],"commentID":"MDEyOklzc3VlQ29tbWVudDczMzg1Njc3OA==","typescriptNightlyVersion":"4.0.0-dev.20200705","typescriptSHA":"9a5c0074aa64f2a85b425b0e5e6d67c473113693"} %%% --->',
        id: 'MDEyOklzc3VlQ29tbWVudDczMzg1Njc3OA==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-733856778',
        author: {login: 'typescript-bot'}
      },
      {
        body: "Here's the problem, but without control flow involved:\r\n```ts repro\r\ninterface A { x: number }\r\n\r\ndeclare function isA(a: unknown): a is A;\r\n\r\ntype FunctionsObj<T> = {\r\n    [K in keyof T]: () => unknown\r\n}\r\n\r\nfunction g<\r\n    T extends FunctionsObj<T>,\r\n    M extends keyof T\r\n>(a2: ReturnType<T[M]>, x: A) {\r\n    x = a2; // shouldn't be allowed, but is\r\n}\r\n```\r\nThis is a bug in our subtyping rules, not control flow (which would undoubtedly be easier to fix).\r\n\r\n@typescript-bot run repros",
        id: 'MDEyOklzc3VlQ29tbWVudDczODk1NzI4NA==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957284',
        author: {login: 'weswigham'}
      },
      {
        body: "Heya @weswigham, I've started to run the code sample repros for you. [Here's the link to my best guess at the log](https://github.com/microsoft/TypeScript/actions/runs/401332121).",
        id: 'MDEyOklzc3VlQ29tbWVudDczODk1NzM5Mw==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738957393',
        author: {login: 'typescript-bot'}
      },
      {
        body: 'Looks like the root cause is our change in 4.1 to `isDeeplyNestedType` - it is now erroneously flagging a target side of the comparison, which doesn\'t change, as "deeply nested". Since the `source` side of the relation goes through about 6 transforms with the `target` side remaining unchanged, both sides get flagged as "deeply nesting", resulting in a `Maybe` result which eventually allows the assignment. I think this can be remedied by having separate source/target stack depths, so we don\'t increase the `target` stack depth when we\'re only transforming the `source` for a comparison.',
        id: 'MDEyOklzc3VlQ29tbWVudDczODk2ODA0OQ==',
        url: 'https://github.com/microsoft/TypeScript/issues/41617#issuecomment-738968049',
        author: {login: 'weswigham'}
      }
    ]
  }
}
