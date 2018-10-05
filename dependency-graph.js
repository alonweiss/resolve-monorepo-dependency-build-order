/**
 * A dependency graph for projects
 * Every project node has a name, a dirty flag, and a list of dependencies (internally, a reverse list of dependencies is maintained)
 */
class DependencyGraph {
    constructor() {
        this.nodesLookup = {};
    }

    /**
     * Adds a new node to the dependency graph
     * @param name Project name (e.g. @myOrg/a)
     * @param isDirty boolean true/false indicating whether the project is dirty and requires rebuilding
     * @param dependenciesArray list of projets that this project depends on
     */
     addNode(name, isDirty, dependenciesArray) {
        var existingNode = this.nodesLookup[name];
        if (!existingNode) {
            existingNode = this.nodesLookup[name] = {
                name: name,
                depended: {},
                dependsOn: {}
            }
        }
        if (isDirty) {
            existingNode.isDirty = true;
        }
        if (dependenciesArray) {
            dependenciesArray.forEach((depName) => {
                const depNode = this.addNode(depName);
                depNode.depended[name] = existingNode;
                existingNode.dependsOn[depName] = depNode;
            });
        }

        return this.nodesLookup[name];
    }

    /**
     * Returns the number of nodes in the graph
     */
    getNodeCount() {
        return Object.keys(this.nodesLookup).length;
    }

    /**
     * Removes all project that have no dependencies
     * Returns only project names for removed projects that are dirty and requires rebuilding
     */
    popNodesWithoutDependencies() {
        const nodesToReturn = [];
        //Pass 1 - find nodes without dependencies
        for (const nodeName in this.nodesLookup) {
            const node = this.nodesLookup[nodeName];
            if (Object.keys(node.dependsOn).length == 0) {
                nodesToReturn.push(node);
            }
        }

        //Pass 2, remove the returned node from their dependent nodes
        nodesToReturn.forEach((node) => {
            for (const dependedNodeName in node.depended) {
                const dependedNode = node.depended[dependedNodeName];
                if (node.isDirty) {
                    dependedNode.isDirty = true; //Propagate dirty flag to dependent projects
                }
                delete dependedNode.dependsOn[node.name];
            }
            delete this.nodesLookup[node.name];
        });

        const filteredNodesToReturn = nodesToReturn.filter(t => t.isDirty).map(t => t.name); //Return only dirty projects' names
        return filteredNodesToReturn;
    }
}

exports.DependencyGraph = DependencyGraph;