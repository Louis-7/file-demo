let path = require("path");
let moment = require("moment");
let utils = require("../utils/utils");

let filter = (directory, options) => {
    return utils.statp(directory)
    // check if user given path is a directory
        .then((stats) => {
            if (stats.isFile()) {
                throw ('Path is wrong, only directory accept.')
            }
        })
        // if name field is given by user, call glob to list all match files.
        .then(() => {
            if (options.name) {
                let globPattern = path.join(directory, options.name);
                return utils.globp(globPattern)
            } else {
                return Promise.resolve(directory);
            }
        })
        // filter file name
        .then((filterResult) => {
            if (typeof filterResult === 'string') {
                return utils.readdirp(filterResult).then((fileList) => {
                    fileList = fileList.map(x => path.join(directory, x));
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
    // make sure options are correct
    options = fileFilterOptionsOptimize(options);

    for (let file of fileList) {
        promiseList.push(utils.statp(file)
            .then((stat) => {
                let pass = true;

                // check if it's a file
                if (stat.isDirectory()) pass = false;

                //check mtime
                if (options.mtime && pass) {
                    let mtimeOperator = ['+', '-'].indexOf(options.mtime.substr(0, 1)) > -1 ? options.mtime.substr(0, 1) : '=', // greater or less
                        pastDays = parseInt(['+', '-'].indexOf(options.mtime.substr(0, 1)) > -1 ? options.mtime.substr(1) : options.mtime), // how many days
                        targetTime = moment(`${moment().year()}-${moment().month()}-${moment().date()}`, 'YYYY-M-D').subtract(pastDays, 'days'), // target day
                        momentMTime = `${stat.mtime.getFullYear()}-${stat.mtime.getMonth()}-${stat.mtime.getDate()}`; // convert mtime to moment object

                    // compare time
                    switch (mtimeOperator) {
                        case '+':
                            if (!moment(momentMTime, 'YYYY-M-D').isBefore(targetTime)) pass = false;
                            break;
                        case '-':
                            if (!moment(momentMTime, 'YYYY-M-D').isAfter(targetTime)) pass = false;
                            break;
                        case '=':
                            if (!moment(momentMTime, 'YYYY-M-D').isSame(targetTime)) pass = false;
                            break;
                        default:
                            throw 'Operator for mtime is not right'
                    }
                }

                // check size
                if (options.size && pass) {
                    let sizeOperator = ['+', '-'].indexOf(options.size.substr(0, 1)) > -1 ? options.size.substr(0, 1) : '=', //greater or less
                        sizeUnit = ['k', 'm'].indexOf(options.size.substr(-1, 1)) > -1 ? options.size.substr(-1, 1) : 'k', // unit
                        fileSize = formatSize(options.size, sizeUnit); // file size

                    // compare file size
                    switch (sizeOperator) {
                        case '+':
                            if (stat.size <= fileSize) pass = false;
                            break;
                        case '-':
                            if (~stat.size >= fileSize) pass = false;
                            break;
                        case '=':
                            // TODO compare in KB level
                            let cActualValue = Math.round(stat.size / 1024),
                                cRealValue = Math.round(fileSize / 1024);
                            if (cActualValue !== cRealValue) pass = false;
                            break;
                        default:
                            throw 'Operator for file is not right'
                    }
                }

                return pass;
            })
            //check file content
            .then((filePass) => {
                if (filePass && options.text) {
                    return utils.readFilep(file).then((content) => {
                        if (content.indexOf(options.text) > -1) {
                            finalList.push(file);
                        }
                    })
                } else if (filePass) {
                    finalList.push(file);
                }
            }))
    }

    return Promise.all(promiseList).then(() => {
        return finalList.map(x => path.basename(x));
    })
};

let formatSize = (size, unit) => {
    let havePreFix = ['+', '-'].indexOf(size.substr(0, 1)) > -1,
        havePostFix = ['k', 'm'].indexOf(size.substr(-1, 1)) > -1;

    if (havePreFix) size = size.substr(1);
    if (havePostFix) size = size.substr(-1);

    size = parseInt(size);

    // convert mb to b
    // convert kb to b
    if (unit === 'm') {
        size *= 1024 * 1024;
    } else {
        size *= 1024;
    }

    return size;
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
    if (filterOptions.size) filterOptions.size.toLowerCase();

    if (filterOptions.text && typeof filterOptions.text !== 'string') {
        throw ("The value of text should be a string");
    }

    return filterOptions;
};

xfile = {
    filter: filter
};

module.exports = xfile;