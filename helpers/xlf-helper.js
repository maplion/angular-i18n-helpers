// eyes is for display purposes only
// const inspect = require('eyes').inspector({
//     maxLength: false
// })
const fs = require('fs');
const xml2js = require('xml2js');
const translate = require('./translate-helper');

const defaultTarget = 'fr';
const defaultMessagesXlfFile = '/../locale/messages.xlf';
let xlfFile;
let target;

// Get commandline arguments and/or set defaults
if (!process.argv[2]) {
    target = defaultTarget;
} else {
    target = process.argv[2];
}

if (!process.argv[3]) {
    xlfFile = defaultMessagesXlfFile;
} else {
    xlfFile = process.argv[3];
}

// Create parse object
const parser = new xml2js.Parser();

// Parse XML to JSON and Update JSON with appropriate targets targets
fs.readFile(__dirname + xlfFile, function (err, data) {
    parser.parseString(data, function (err, result) {
        // Print the xmlFileForTranslators to console
        // console.log(inspect(result, false, null))
        jsonString = JSON.stringify(result);
        jsonFileForTranslators = JSON.parse(jsonString);
        jsonFileForDevelopment = JSON.parse(jsonString);

        // Write out intermediate json file
        // fs.writeFile(__dirname + '/../locale/test.json', jsonString, function (err) {
        //     if (err) {
        //         return console.log(err);
        //     }

        //     console.log('The file was saved!');
        //     console.log('Done');
        // });

        // Write out file for translators with empty targets on sources without a target
        let transUnit = jsonFileForTranslators.xliff.file[0].body[0]['trans-unit']
        for (const i in transUnit) {
            if (transUnit.hasOwnProperty(i)) {
                if (transUnit[i].source[0]._) {
                    // console.log(`${i} -> ${transUnit[i].source[0]._}`);
                    if (!transUnit[i]['target']) {
                        transUnit[i]['target'] = {
                            ...transUnit[i].source[0]
                        };
                        transUnit[i]['target']._ = ' ';
                        // console.log(`Created target for: ${transUnit[i].source[0]._}`)
                    }
                } else {
                    // console.log(`${i} -> ${transUnit[i].source}`);
                    if (!transUnit[i]['target']) {
                        transUnit[i]['target'] = ' ';
                        // console.log(`Created target for: ${transUnit[i].source}`)
                    }
                }
            }
        }

        // Write out file for development with Google-translated targets on sources without a target
        transUnit = jsonFileForDevelopment.xliff.file[0].body[0]['trans-unit']
        createDeveloperFile(transUnit, target).then(() => {
            // Create builder instance
            const builder = new xml2js.Builder();
            // Write file for translators with empty targets
            const xmlFileForTranslators = builder.buildObject(jsonFileForTranslators);
            writeTranslationFile('/../files-for-translation/messages.', xmlFileForTranslators, target);

            // Write file for development with Google-Translated elements
            const xmlFileForDevelopment = builder.buildObject(jsonFileForDevelopment);
            writeTranslationFile('/../locale/messages.', xmlFileForDevelopment, target);
        });
    });
});

async function writeTranslationFile(relativePath, xml, target) {
    const filePath = relativePath + target + '.xlf';
    fs.writeFile(__dirname + filePath, xml, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log('The ' + filePath + ' was saved!');
    });
}

async function createDeveloperFile(transUnit, target) {
    for (const i in transUnit) {
        if (transUnit.hasOwnProperty(i)) {
            if (transUnit[i].source[0]._) {
                // console.log(`${i} -> ${transUnit[i].source[0]._}`);
                if (!transUnit[i]['target']) {
                    transUnit[i]['target'] = { ...transUnit[i].source[0]
                    };
                    await translate.translate([transUnit[i].source[0]._], target)
                        .then(result => {
                            let temp = [];
                            result.split('\n').forEach(element => {
                                temp.push(element.trim());
                            });
                            transUnit[i]['target']._ = temp.join(' ');
                        });
                    // console.log(`Created target for: ${transUnit[i].source[0]._}`)
                }
            } else {
                // console.log(`${i} -> ${transUnit[i].source}`);
                if (!transUnit[i]['target']) {
                    await translate.translate(transUnit[i].source, target)
                        .then(result => {
                            let temp = [];
                            result.split('\n').forEach(element => {
                                temp.push(element.trim());
                            });
                            transUnit[i]['target'] = temp.join(' ');
                        });
                    // console.log(`Created target for: ${transUnit[i].source}`)
                }
            }
        }
    }
}
