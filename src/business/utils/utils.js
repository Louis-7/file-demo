let fs = require("fs");
let path = require("path");
let glob = require("glob");

let statp = (directory, options) => {
    return new Promise((resolve, reject) => {
        path.normalize(directory);
        fs.stat(directory, (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        }, (err) => {
            console.error(err.message);
        })
    })
};

let readdirp = (directory, options) => {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, options, (err, files) => {
            if (err) reject(err);
            resolve(files);
        });

    });
};

let readFilep = (filePath, options) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, options, (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
};

let globp = (pattern, options) => {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err, files) => {
            if (err) reject(err);
            resolve(files);
        })
    })
};

let utils = {
    statp: statp,
    readdirp: readdirp,
    readFilep: readFilep,
    globp: globp,
};

module.exports = utils;