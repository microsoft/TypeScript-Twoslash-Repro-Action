
## Twoslash Verify GitHub Action

Runs as a part of a nightly task in GitHub's CI. This action will:

- Looks through all issues which have a specific label (default: `"Valid Repro"`)
- Uses extracts code samples in the issue from markdown in the body and comments (codeblocks with `repro`)
- Loops through the code samples with 
- Leave / Updates a comment on the state of all the different results from the twoslash sample

## Codebase

All of the code lives in `src`, and the filenames are decided so that they represent the passage of data through the pipeline. 
So if its at the top alphabetically, then it's at the top of the process.

## To Work On This

Install the dependencies  
```bash
yarn
```

Build the typescript and package it for distribution
```bash
$ yarn build && yarn pack
```

Run the tests :heavy_check_mark:  
```bash
$ yarn test

 PASS  src/__tests__/issuesToTwoslashRuns.test.ts
  ✓ NOOPs with no issues (5ms)
  ...
```

## Change action.yml

The action.yml contains defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
