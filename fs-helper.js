const fs = require('fs');
//Recursively and asynchronously walks a folder, calling fileCallback for each file found. Finally it calls finallyCallback()
//Adapted from https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search to cut down on dependencies, so npm install is not required to use this tool
//there are plenty of npm packages to do this 
exports.walkFilesRecursively = function walkFilesRecursively(dir, fileCallback, finallyCallback) {
    fs.readdir(dir, function (err, list) {
        if (err) return finallyCallback(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return finallyCallback(null);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walkFilesRecursively(file, fileCallback, function (err, res) {
                        next();
                    });
                } else {
                    fileCallback(file, function (err) {
                        if (err) return finallyCallback(err);
                        next();
                    });
                }
            });
        })();
    });
};