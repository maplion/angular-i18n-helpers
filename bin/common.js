'use strict;'
const fs = require('fs');
const path = require('path');
const checkFileExists = async (filePath) => {
    return new Promise((resolve) => {
        fs.access(filePath, fs.F_OK, (err) => {
            if (err) {
                console.error(err)
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })

}
const createDir = async (pathname) => {
    const __dirname = path.resolve();
    pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
    return new Promise((resolve) => {
        fs.mkdir(path.resolve(__dirname, pathname), {
            recursive: true
        }, e => {
            if (e) {
                throw e;
            } else {
                resolve(true);
            }
        });
    })
}

const fileWriter = async (filepath, inputData) => {
    await createDir(filepath)
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, inputData, function (err, data) {
            if (err)
                reject(err)
            else
                resolve(data);
        });
    })
}
const fileReader = async (filepath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', function (err, data) {
            if (err)
                reject(err)
            else
                resolve(data);
        });
    })
}

module.exports = {
    createDir,
    fileWriter,
    fileReader,
    checkFileExists
}