let fs = require('fs');
let path = require('path');

let xfilter = (directory, options) => {
    return statp(directory)
        .then((stats) => {
            let isFile = stats.isFile();
            // console.log(`The path is ${directory}`, `It's ${isFile ? '' : 'not'} a file`);
            return readdirp(directory);
        })
        .then((files)=>{
            return Promise.resolve(files);
        })
        .catch((err)=>{
            return Promise.reject(err);
        })
};

let statp = (directory,options) => {
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

let readdirp = (directory,options)=>{
    return new Promise((resolve, reject)=>{
        fs.readdir(directory,options,(err, files)=>{
            if(err) reject(err);
            resolve(files);
        });

    });
};

let xfile = {
    filter: xfilter,
    readdir:readdirp,
};

module.exports = xfile;