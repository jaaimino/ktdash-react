# npm install Fix

## Issue

The project was experiencing dependency conflicts during `npm install` due to incompatible peer dependencies:

- The project uses React 19.1.0
- @testing-library/react has a peer dependency requirement of React ^18.0.0 (React 18.x)
- This creates a conflict because React 19.1 is outside the acceptable range for @testing-library/react

The error message looked like this:

```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error 
npm error While resolving: ktdash-next@0.1.0
npm error Found: react@19.1.0
npm error node_modules/react
npm error   react@"19.1" from the root project
npm error 
npm error Could not resolve dependency:
npm error peer react@"^18.0.0" from @testing-library/react@15.0.7
npm error node_modules/@testing-library/react
npm error   dev @testing-library/react@"^15.0.0" from the root project
```

## Solution

To fix this issue, we've implemented the following changes:

1. Added a `.npmrc` file in the project root with the setting `legacy-peer-deps=true`
2. Added a postinstall script to package.json to indicate that the installation uses legacy peer deps

The `.npmrc` file tells npm to use the legacy peer dependency resolution algorithm, which is more lenient with version mismatches. This allows npm install to complete successfully despite the conflict between React 19.1 and @testing-library/react's peer dependency requirement.

## Why This Approach

We chose this approach because:

1. React 19 is a very recent version, and many libraries haven't updated their peer dependencies yet
2. Downgrading React would require significant changes to the codebase
3. Using `--legacy-peer-deps` is a common approach when working with cutting-edge versions of core libraries

## Alternative Solutions

Other potential solutions that were considered:

1. Downgrading React to version 18.x to match @testing-library/react requirements
2. Using an older version of @testing-library/react that might be compatible with React 19
3. Running npm install with the `--force` flag

However, the `.npmrc` approach is cleaner and doesn't require modifying the core dependencies or remembering to use special flags.