// @ts-check

const path = require('path');
const { gitBisectTypeScript } = require('../lib/gitBisectTypeScript');

(async () => {
  console.log(await gitBisectTypeScript({
    workspace: path.join(__dirname, '../../TypeScript'),
    tag: 'repro',
  }, {
    body: `
      \`\`\`ts repro
// @module: commonjs

// @filename: enum.ts
export enum MyEnum {
  a = 0,
  b,
  c,
  d
}

// @showEmit
// @filename: index.ts
import { MyEnum as MyEnumFromModule } from "./enum"

enum MyEnum {
  a = MyEnumFromModule.a
}
      \`\`\`
    `,
    author: { login: 'andrewbranch' },
    id: 'IC_kwDOAT9aAc5BLGHO',
    comments: { nodes: [{
      author: { login: 'typescript-bot' },
      body: `<!--- TypeScriptBot %%% {"runs":[{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":949,"label":"4.2.2","requestCommentId":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"},{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":1034,"label":"4.3.2","commentID":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"},{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":1038,"label":"4.4.2","commentID":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"},{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":994,"label":"4.5.2","commentID":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"},{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nconst enum_1 = require(\\"./enum\\");\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":982,"label":"4.6.2","commentID":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"},{"fails":[],"assertions":[],"emit":"\\"use strict\\";\\nObject.defineProperty(exports, \\"__esModule\\", { value: true });\\nconst enum_1 = require(\\"./enum\\");\\nvar MyEnum;\\n(function (MyEnum) {\\n    MyEnum[MyEnum[\\"a\\"] = 0] = \\"a\\";\\n})(MyEnum || (MyEnum = {}));\\n","time":435,"label":"Nightly","commentID":"IC_kwDOAT9aAc5BLGHO","state":3,"description":"<a href='https://github.com/microsoft/TypeScript/issues/48124#issuecomment-1093427662'>Comment</a> by @andrewbranch</a>"}],"typescriptNightlyVersion":"4.5.2"} %%% --->`
    }] }
  }))
})();
