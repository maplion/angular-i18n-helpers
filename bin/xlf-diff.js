const fs = require('file-system');
const xml2js = require('xml2js');

let sourceMessagesFile;
let targetMessagesFile;

// Create parse object
const parser = new xml2js.Parser();

const syncTranslateFiles = async (sourcePath, targetPath) => {
    // console.log('SOURCE PATH: ', sourcePath);
    // console.log('TARGET PATH: ', targetPath);
    let targetMessagesFile;
    return await new Promise(resolve => {
        fs.readFile(__dirname + sourcePath, 'utf8', async (err, sourceData) => {
            // console.log('SOURCE DATA: ', sourceData);
            if (!sourceData) {
                throw Error('Source Data is missing or incorrect path to Source Data');
            }
            parser.parseString(sourceData, async (err2, result) => {
                sourceMessagesFile = JSON.parse(JSON.stringify(result));
                const sourceMessagesFileTransUnit = sourceMessagesFile.xliff.file[0].body[0]['trans-unit'];
                let targetMessagesFileTransUnit;
                await fs.readFile(__dirname + targetPath, 'utf8', async (err3, targetData) => {
                    targetData = tagInterpolations(targetData);
                    parser.parseString(targetData, async (err4, result2) => {
                        targetMessagesFile = JSON.parse(JSON.stringify(result2));
                        targetMessagesFileTransUnit = targetMessagesFile.xliff.file[0].body[0]['trans-unit'];

                        // Loop through each tag id and find tags that are missing in the target file
                        await sourceMessagesFileTransUnit.forEach(sourceElement => {
                            let idFound = false;
                            targetMessagesFileTransUnit.forEach(targetElement => {
                                if (sourceElement.$.id === targetElement.$.id) {
                                    idFound = true;
                                }
                            });
                            if (!idFound) {
                                console.log('Adding trans-unit to target: ' + sourceElement.$.id);
                                targetMessagesFileTransUnit.push(sourceElement);
                            }
                            idFound = false;
                        });

                        // Loop through in reverse to remove any tags that are no longer in the source file
                        await targetMessagesFileTransUnit.forEach(async (item, index) => {
                            let idFound = false;
                            await sourceMessagesFileTransUnit.forEach(sourceElement => {
                                if (item.$.id === sourceElement.$.id) {
                                    idFound = true;
                                }
                            });
                            if (!idFound) {
                                console.log('Removing trans-unit from target: ' + item.$.id);
                                targetMessagesFileTransUnit.splice(index, 1);
                            }
                            idFound = false;
                        });

                        // For verifying xml changes
                        // const builder = new xml2js.Builder();
                        // xmlFile = builder.buildObject(targetMessagesFile);
                        // console.log(xmlFile);
                        // return targetMessagesFile;
                        resolve();
                    });
                });
            })
        });
    }).then(() => {
        return targetMessagesFile;
    }).catch(error => {
        console.log('ERROR: ', error.message, error);
    });
}

const tagInterpolations = (sourceData) => {
    return sourceData?.split('<x id="INTERPOLATION"').join('~~<x id="INTERPOLATION"');
}

module.exports = {
    syncTranslateFiles
}
