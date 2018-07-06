const fs = require('file-system');
const xml2js = require('xml2js');

let sourceMessagesFile;
let targetMessagesFile;

// Create parse object
const parser = new xml2js.Parser();

async function syncTranslateFiles(sourcePath, targetPath) {
    let targetMessagesFile;
    return await new Promise(resolve => {
        fs.readFile(__dirname + sourcePath, async function (err, sourceData) {
            await parser.parseString(sourceData, async function (err2, result) {
                sourceMessagesFile = JSON.parse(JSON.stringify(result));
                const sourceMessagesFileTransUnit = sourceMessagesFile.xliff.file[0].body[0]['trans-unit'];
                let targetMessagesFileTransUnit;
                await fs.readFile(__dirname + targetPath, async function (err3, targetData) {
                    await parser.parseString(targetData, async function (err4, result2) {
                        targetMessagesFile = JSON.parse(JSON.stringify(result2));
                        targetMessagesFileTransUnit = targetMessagesFile.xliff.file[0].body[0]['trans-unit']
    
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
                        await targetMessagesFileTransUnit.forEach(async function (item, index) {
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
                        })
    
                        // For verifying xml changes
                        // const builder = new xml2js.Builder();
                        // xmlFile = builder.buildObject(targetMessagesFile);
                        // console.log(xmlFile);
                        // return targetMessagesFile;
                        resolve();
                    });
                });
            });
        });
    }).then(() => {
        return targetMessagesFile;
    });
}

module.exports = {
    syncTranslateFiles
}