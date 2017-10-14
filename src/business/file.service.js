let fs = require('fs');
let path = require('path');

let xfilter = (directory, options) => {
    xstat(directory).then((stats) => {
        let isFile = stats.isFile();
        console.log(`The path is ${directory}`, `It's ${isFile ? '' : 'not'} a file`);
    })
};

let xstat = (directory) => {
    return new Promise((resolve, reject) => {
        path.normalize(directory);
        fs.stat(directory, (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        },(err)=>{
            console.error(err.message);
        })
    })
};

let xfile = {
    filter: xfilter
};

module.exports = xfile;