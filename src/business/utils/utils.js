let fs = require('fs');
let path = require('path');
let glob = require("glob");
let moment = require("moment");

let xfilter = (directory, options) => {
    return statp(directory)
        .then((stats) => {
            let isFile = stats.isFile();
            return readdirp(directory);
        })
        .then(() => {
            if (options.name) {
                let globPattern = path.join(directory, options.name);
                return globp(globPattern);
            } else {
                return Promise.resolve(directory);
            }
        })
        // filter file name
        .then((filterResult) => {
            if (typeof filterResult === 'string') {
                return readdirp(filterResult).then((fileList) => {
                    return filterFileByOptions(fileList, options);
                })
            } else {
                return filterFileByOptions(filterResult, options);
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};

let filterFileByOptions = (fileList, xFilterOptions) => {
    let finalList = [];
    let options = xFilterOptions ? Object.assign({}, xFilterOptions) : {};
    let promiseList = [];

    // update options by user input
    options = fileFilterOptionsOptimize(options);

    for (let file of fileList) {
        promiseList.push(statp(file).then((stat) => {
            let pass = true;

            //check mtime
            if (options.mtime) {
                let mtimeOperator = ['+', '-'].indexOf(options.mtime.substr(0, 1)) > -1 ? options.mtime.substr(0, 1) : '=',
                    targetTime = moment(`${moment().year()}-${moment().month()}-${moment().date()}`).subtract(['+', '-'].indexOf(options.mtime.substr(0, 1)) > -1 ? options.mtime.substr(1) : options.mtime, 'days'),
                    momentMTime = `${stat.mtime.getFullYear()}-${stat.mtime.getMonth()}-${stat.mtime.getDate()}`;

                switch (mtimeOperator) {
                    case '+':
                        if (!moment(momentMTime).isBefore(targetTime)) pass = false;
                        break;
                    case '-':
                        if (!moment(momentMTime).isAfter(targetTime)) pass = false;
                        break;
                    case '=':
                        if (!moment(momentMTime).isSame(targetTime)) pass = false;
                        break;
                    default:
                }
            }

            if (pass) {
                finalList.push(file);
            }
        }))
    }

    return Promise.all(promiseList).then(() => {
        return finalList;
    })
};

let fileFilterOptionsOptimize = (filterOptions) => {
    // check mtime
    if (filterOptions.mtime && !parseInt(filterOptions.mtime)) {
        throw ("The value of mtime is wrong.You should give some value like \"+1\" or \"-1\"");
    }

    if (filterOptions.name && typeof filterOptions.name !== 'string') {
        throw ("The value of name should be a string");
    }

    let sizePatt = new RegExp(/[+|-]?[0-9]*[k|m]?$/g);
    if (filterOptions.size && !sizePatt.test(filterOptions.size)) {
        throw ('The value of size is not right. Please check instruction to continue.')
    }

    if (filterOptions.text && typeof filterOptions.text !== 'string') {
        throw ("The value of text should be a string");
    }

    return filterOptions;
};

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

let globp = (pattern, options) => {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err, files) => {
            if (err) reject(err);
            resolve(files);
        })
    })
};

let xfile = {
    filter: xfilter,
    readdir: readdirp,
};

module.exports = xfile;