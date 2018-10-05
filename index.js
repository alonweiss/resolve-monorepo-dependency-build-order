const BuildOrderResolverTool = require('./build-resolver-tool').BuildOrderResolverTool;
const rootDir = process.argv[2];
if (!rootDir) {
    console.error("Root directory argument is required");
    process.exit(1);
}

const prefix = process.argv[3];
if (!prefix){
    console.error("project prefix argument is required");
    process.exit(1);
}

const dirtyProjects = process.argv.slice(4);
if (!dirtyProjects){
    console.error("dirtyProjects not specified, nothing to build");
    process.exit(0);
}

new BuildOrderResolverTool().resolveBuildOrderForDir(rootDir, prefix, dirtyProjects, (err, buildOrder) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    buildOrder.forEach((projects, idx) => {
        console.log('Pass #' + (idx + 1) + ': build projects ' + projects.join(','));
    });

    process.exit(0);
});