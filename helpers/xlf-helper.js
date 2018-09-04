// eyes is for display purposes only
// const inspect = require('eyes').inspector({
//     maxLength: false
// })
const fs = require('file-system');
const xml2js = require('xml2js');
const translate = require('./translate-helper');
const xlfDiff = require('./xlf-diff');

const defaultTarget = 'fr';
const defaultMessagesXlfFile = 'messages.xlf';
const defaultDeveloperXlfFilePath = '/../locale/';
const defaultTranslatorXlfFilePath = '/../files-for-translation/';
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

syncFiles().then(jsonObject => {
    const jsonFileForTranslators = JSON.parse(JSON.stringify(jsonObject));
    const jsonFileForDevelopment = JSON.parse(JSON.stringify(jsonObject));

    // Write out intermediate json file
    // fs.writeFile(__dirname + '/../locale/test.json', jsonString, function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }

    //     console.log('The file was saved!');
    //     console.log('Done');
    // });

    // Create Translator File
    createTranslatorFile(jsonFileForTranslators).then(() => {
        // Write out file for development with Google-translated targets on sources without a target
        const transUnit = jsonFileForDevelopment.xliff.file[0].body[0]['trans-unit'];
        createDeveloperFile(transUnit, target).then(() => {
            // Create builder instance
            const builder = new xml2js.Builder();
            // Write file for translators with empty targets
            let xmlFileForTranslators = builder.buildObject(jsonFileForTranslators);
            xmlFileForTranslators = fixInterpolationLessAndGreaterThans(xmlFileForTranslators);
            writeTranslationFile(defaultTranslatorXlfFilePath, xmlFileForTranslators, target);

            // Write file for development with Google-Translated elements
            let xmlFileForDevelopment = builder.buildObject(jsonFileForDevelopment);
            xmlFileForDevelopment = fixInterpolationLessAndGreaterThans(xmlFileForDevelopment);
            writeTranslationFile(defaultDeveloperXlfFilePath, xmlFileForDevelopment, target);
        });
    });
});

async function syncFiles() {
    return await xlfDiff.syncTranslateFiles(defaultDeveloperXlfFilePath + defaultMessagesXlfFile, defaultDeveloperXlfFilePath + xlfFile);
}

async function writeTranslationFile(relativePath, xml, target) {
    // Only write a new locale file if not updating an existing
    let filePath;
    if (xlfFile === defaultMessagesXlfFile) {
        filePath = relativePath + 'messages.' + target + '.xlf';
    } else {
        filePath = relativePath + xlfFile;
    }
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
            // Properties with interpolations
            if (transUnit[i].source[0]._) {
                // console.log(`${i} -> ${transUnit[i].source[0]._}`);
                // Clean empty space in source
                transUnit[i]['source'][0]._ = trimAndRemoveNewLines(transUnit[i]['source'][0]._)
                // If there is no target, add one and translate it; otherwise, clean empty space
                if (!transUnit[i]['target']) {
                    transUnit[i]['target'] = transUnit[i].source[0];
                    await translate.translate([transUnit[i].source[0]._], target)
                        .then(result => {
                            transUnit[i]['target']._ = trimAndRemoveNewLines(result);
                            // Reset Interpolations
                            transUnit[i] = reinjectInterpolations(transUnit[i]);
                        });
                    // console.log(`Created target for: ${transUnit[i].source[0]._}`)
                } else {
                    transUnit[i]['target'][0]._ = trimAndRemoveNewLines(transUnit[i]['target'][0]._)
                    // Reset Interpolations
                    transUnit[i] = reinjectInterpolations(transUnit[i]);
                }
                // Properties with no tags
            } else {
                // console.log(`${i} -> ${transUnit[i].source}`);
                transUnit[i]['source'][0] = trimAndRemoveNewLines(transUnit[i]['source'][0])
                if (!transUnit[i]['target']) {
                    await translate.translate(transUnit[i].source, target)
                        .then(result => {
                            transUnit[i]['target'] = trimAndRemoveNewLines(result);
                        });
                    // console.log(`Created target for: ${transUnit[i].source}`)
                } else {
                    transUnit[i]['target'][0] = trimAndRemoveNewLines(transUnit[i]['target'][0])
                }
            }
        }
    }
}

async function createTranslatorFile(jsonFileForTranslators) {
    // Write out file for translators with targets filled with English on sources without a target
    // Note: translates english to english just for ease of implementation; can be adjusted later.
    const transUnit = jsonFileForTranslators.xliff.file[0].body[0]['trans-unit'];
    await createDeveloperFile(transUnit, 'en');
}

function createBlankTranslatorFile(jsonFileForTranslators) {
    // Write out file for translators with empty targets on sources without a target
    const transUnit = jsonFileForTranslators.xliff.file[0].body[0]['trans-unit'];
    for (const i in transUnit) {
        if (transUnit.hasOwnProperty(i)) {
            if (transUnit[i].source[0]._) {
                // console.log(`${i} -> ${transUnit[i].source[0]._}`);
                if (!transUnit[i]['target']) {
                    transUnit[i]['target'] = transUnit[i].source[0];
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
}

function trimAndRemoveNewLines(inputString) {
    let temp = [];
    inputString.split('\n').forEach(element => {
        temp.push(element.trim());
    });
    return temp.join(' ');
}

function reinjectInterpolations(transUnit) {
    transUnit['source'] = replaceInterpolationTag(transUnit['source'])
    transUnit['target'] = replaceInterpolationTag(transUnit['target'])
    return transUnit;
}

function replaceInterpolationTag(transUnitPartialObject) {
    const equivText = transUnitPartialObject[0]['x'][0]['$']['equiv-text'];
    const interpolation = `<x id="INTERPOLATION" equiv-text="${equivText}"/>`
    transUnitPartialObject[0] = transUnitPartialObject[0]._.replace('~~', interpolation);
    return transUnitPartialObject;
}

// The replaceInterpolationTag less than and greater than get converted into &lt; and &gt;
// This is a regex function to replace them all with actual < and >
function fixInterpolationLessAndGreaterThans(xmlFile) {
    return xmlFile.split('&lt;').join('<').split('&gt;').join('>');
}