# resolve-monorepo-dependency-build-order
Resolves nodejs project build order, when they all coexist in the same monorepo

## Usage
`node index.js [root dir] [common projects prefix] [dirty project 1] <[dirty project 2]...>`
* root dir - path to the monorepo's root directory
* common projects prefix - a prefix that differenciates your org's projects from open-source projects
* dirty projects are full package names of projects that are determined to be modified and needs to be rebuilt (using git history for example).

### Example
Consider the following project dependency graph:
* A has no dependencies
* B depends on A,C
* C has no dependencies
* D has no dependencies
* E depends on B

Running
~~~~
node index.js ./test/dummyData @myOrg/ @myOrg/c @myOrg/d
~~~~
will print:
~~~~
	Pass #1: build projects @myOrg/c,@myOrg/d
	Pass #2: build projects @myOrg/b
	Pass #3: build projects @myOrg/e
~~~~

Note: 
* @myOrg/a will not be built since it wasn't dirty
* @myOrg/b will be built since it dependes on @myOrg/c which was dirty
* @myOrg/c will be built since it was said to be dirty
* @myOrg/d will be built since it was said to be dirty
* @myOrg/e will be built  since it dependes on @myOrg/b which was dirty

