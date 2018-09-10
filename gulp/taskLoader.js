const { gulp } = global.akqa;
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, 'tasks/');

const parsedFiles = [];


function loadAndParseTaskFile(file) {
    const allTasks = {};

    const resolvedPath = path.resolve(baseDir, file);

    const isDir = fs.lstatSync(resolvedPath).isDirectory();

    if (!isDir) {
        if (parsedFiles.indexOf(file) === -1) {
            parsedFiles.push(file);
            const baseName = path.basename(file, path.extname(file));
            const data = require(resolvedPath);

            if (typeof data === "function") {
                allTasks[baseName] = data;
            }

            else if (typeof data === "object") {
                Object.keys(data).forEach(taskName => allTasks[taskName] = data[taskName]);
            }
        }

        Object.keys(allTasks).forEach(key => gulp.task(key, allTasks[key]));
    }
}


function loadAllTaskFiles() {
    const files = fs.readdirSync(baseDir);
    files.forEach(file => loadAndParseTaskFile(file));
}



function loader(specificTask = null) {
    if (!specificTask) {
        loadAllTaskFiles();
    } else {
        loadAndParseTaskFile(path.resolve(baseDir, `${specificTask}.js`));
    }
}



module.exports = loader;
