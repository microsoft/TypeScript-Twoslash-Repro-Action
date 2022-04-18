
## Twoslash Verify GitHub Action

Runs as a part of a nightly task in GitHub's CI. This action will:

- Download the last 5 major releases of TypeScript
- Looks through all issues which have a specific label (default: `"Has Repro"`)
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

## To publish

Actions are run from GitHub repos so we will check-in the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
yarn build
yarn deploy
git add dist
git commit -a -m "prod dependencies"
git push
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

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
