const fs = require('fs');
const path = require('path');
const walkFilesRecursively = require('./fs-helper').walkFilesRecursively;
const DependencyGraph = require('./dependency-graph').DependencyGraph;

class BuildOrderResolverTool {
    resolveBuildOrderForDir(rootDir, prefix, dirtyProjectsArray, callback) {
        const dirtyProjectsLookup = {};
        dirtyProjectsArray.forEach(dirtyProject => {
            dirtyProjectsLookup[dirtyProject] = true;
        })
        const graph = new DependencyGraph();
        walkFilesRecursively(rootDir, (file, callback) => {
            if (path.basename(file) != 'package.json') return callback();                            //We only care for package.json
            if (path.dirname(file).split(/[/\\]/).indexOf('node_modules') > -1) return callback();   //We don't want to process the node_modules folders
            fs.readFile(file, (err, buf) => {
                if (err) return callback(err);
                try {
                    const packageJson = JSON.parse(buf.toString());
                    const projectName = packageJson.name;
                    if (projectName.indexOf(prefix) != 0) return callback(); //Skip projects without required prefix
                    const isDirty = dirtyProjectsLookup[projectName];
                    const dependencies = [];
                    if (packageJson.dependencies) {
                        for (var depName in packageJson.dependencies) {
                            if (depName.indexOf(prefix) == 0)
                                dependencies.push(depName);
                        }
                    }
                    graph.addNode(projectName, isDirty, dependencies);
                    callback();
                } catch (err) {
                    return callback(err);
                }
            });
        }, (err) => {
            if (err) return callback(err);
            //Graph fully built, now construct build order and return
            return callback(null, this._resolveBuildOrderFromGraph(graph));
        });
    }

    _resolveBuildOrderFromGraph(graph) {
        const buildOrder = [];
        do {
            const nodes = graph.popNodesWithoutDependencies(); //Grab all nodes that don't have any pending dependencies
            if (!nodes.length && graph.getNodeCount() == 0) break; //No more items
            if (nodes.length) {
                buildOrder.push(nodes);
            }
        } while (true);
        return buildOrder;
    }
}

exports.BuildOrderResolverTool = BuildOrderResolverTool;