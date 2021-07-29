'use strict;'

const xliffParser = require('./xliff-parser');
const common = require('./common');
const constants = require('./constants')
const CustomTable = require('./table')
const {
    trimAndRemoveNewLines,
    addBlankTargets
} = require('./xlf-helper')
const {
    getClient,
    translate
} = require('./aws-translate')

function Generate(language, awsProfile, region, autoTranslate, inputSrcFile) {
    this.customTable = new CustomTable(['Action', 'Message'], [50, 50])
    this.language = language;
    this.awsProfile = awsProfile;
    this.region = region;
    this.displayTableData = [];
    this.autoTranslate = autoTranslate;
    this.targetLanguage = region ? `${language}-${region}` : language;
    this.inputSrcFile = inputSrcFile || constants.ROOT_TRANSLATION_FILEPATH;
    this.srcJsonData = null;
    this.translationOutDir = constants.TRANSLATED_FILE_DIR;
    let filename = `${constants.TRANSLATION_FILE_NAME_PREFIX}.${language}`;
    if (region) {
        filename += `-${region}`;
    }
    filename += `.${constants.TRANSLATION_FILE_NAME_EXT}`;
    this.translationFilePath = `${this.translationOutDir}/${filename}`;
    this.officialFilePath = `src/locale/official/${filename}`;
    this.developmentFilePath = `src/locale/development/${filename}`;
    // console.log(this.customTable)
    this.customTable.pushToTable({
        'Ready for dev file ': [this.developmentFilePath]
    })
    this.customTable.pushToTable({
        'File for translation ': [this.translationFilePath]
    })
}
async function checkOfficialExist() {
    return common.checkFileExists(this.officialFilePath)
}
async function updateLanguageFile() {
    // console.log('updateLanguageFile-->',this);
    let officialJsonData = await parseXlifSrc(this.officialFilePath);
    let officialTransUnits = officialJsonData['xliff']['file']['body']['trans-unit'];
    let srcTransUnit = this.srcJsonData['xliff']['file']['body']['trans-unit'];
    // console.log('srcTransUnit count-->',srcTransUnit.length)
    // console.log('officialTransUnits count-->',officialTransUnits.length)
    officialTransUnits = findNewlyAddedKeys.call(this, srcTransUnit, officialTransUnits);
    officialTransUnits = removeOrphanKeys.call(this, srcTransUnit, officialTransUnits);
    officialJsonData['xliff']['file']['body']['trans-unit'] = officialTransUnits;
    const xliffData = xliffParser.createXliff(officialJsonData);
    await common.fileWriter(this.translationFilePath, xliffData)

}

function findNewlyAddedKeys(srcTransUnit, officialTransUnits) {
    let newKeys = []
    let newKeyTable = new CustomTable(['S.No.', '@id', 'Source', 'Target'], [10, 40, 50, 50])
    // console.log(srcTransUnit[0])
    srcTransUnit.forEach((trans) => {
        trans.source = trimAndRemoveNewLines(trans.source)
        let indexInOfficial = officialTransUnits.findIndex(officialTrans => officialTrans['@id'] === trans['@id']);
        if (indexInOfficial === -1) {
            newKeys.push(trans)
            let row = {};
            if (!trans.target) {
                trans.target = 'NEED TO TRANSLATE';
            }
            row[`${newKeys.length}`] = [trans['@id'], trans.source, trans.target]
            newKeyTable.pushToTable(row)
        }
    });
    newKeyTable.show('Newly Added Keys');
    this.customTable.pushToTable({
        'Number of removed Keys': [newKeys.length]
    })
    // console.log('newly added keys count-->',newKeys.length)
    // console.log('newly added keys-->',JSON.stringify(newKeys))
    officialTransUnits = officialTransUnits.concat(newKeys)
    return officialTransUnits
}

function removeOrphanKeys(srcTransUnit, officialTransUnits) {
    let existingKeys = [];
    let removedKeys = [];
    let removedKeysTable = new CustomTable(['S.No.', '@id', 'Source', 'Target'], [10, 40, 50, 50])
    officialTransUnits.forEach(trans => {
        let indexInOfficial = srcTransUnit.findIndex(srcTrans => srcTrans['@id'] === trans['@id']);
        if (indexInOfficial > -1) {
            existingKeys.push(trans)
        } else {
            removedKeys.push(trans)
            let row = {};
            row[`${removedKeys.length}`] = [trans['@id'], trans['source'], trans['target']]
            removedKeysTable.pushToTable(row)
        }
    });
    removedKeysTable.show('Removed Keys');
    this.customTable.pushToTable({
        'Number of removed Keys': [removedKeys.length]
    })
    // console.log('removed keys count-->',removedKeys.length)
    // console.log('removed keys-->',removedKeys)
    // // console.log('removed keys-->',newKeys)
    return existingKeys;
}

async function parseXlifSrc(inputSrcFile) {
    const xml = await common.fileReader(inputSrcFile)
    return xliffParser.xliff2Json(xml)
}
async function newLanguageFile() {
    try {
        let targetJsonData = JSON.parse(JSON.stringify(this.srcJsonData));
        targetJsonData['xliff']['file']['@target-language'] = this.targetLanguage

        const xliffData = xliffParser.createXliff(targetJsonData);
        await common.fileWriter(this.translationFilePath, xliffData)
        // target-language='fr'
        // // console.log('xml-->',xml)

        // // console.log('jsonData-->',jsonData);
    } catch (err) {
        throw err;
    }
}

async function autoTranslate(translationReadyJson) {
    const client = getClient(this.awsProfile);
    let translatedUnits = translationReadyJson['xliff']['file']['body']['trans-unit'];
    let autoTranslateCount = 0;
    translatedUnits = await Promise.all(translatedUnits.map(async transUnit => {
        if (transUnit.target &&
            Object.keys(transUnit.target).length === 0 &&
            transUnit.target.constructor === Object) {
            autoTranslateCount++;
            // console.log('transUnit.target-->',JSON.stringify(transUnit))
            transUnit.target = (await translate(client, transUnit.source, this.language))['TranslatedText']
            return transUnit;
        } else {
            return transUnit;
        }
    }));
    this.customTable.pushToTable({
        'Number of Auto translated Keys': [autoTranslateCount]
    })
    translationReadyJson['xliff']['file']['body']['trans-unit'] = translatedUnits
    return translationReadyJson;
    // const key in translationReadyJson['xliff']['file']['trans-unit']
}

Generate.prototype.start = async function () {
    try {
        this.srcJsonData = await parseXlifSrc(this.inputSrcFile);
        addBlankTargets(this.srcJsonData);
        const officialExist = await checkOfficialExist.call(this);
        // console.log('officialExist-->',officialExist)
        this.customTable.pushToTable({
            'Is Offical translation exist ?': [officialExist ? 'Yes' : 'No']
        })
        if (officialExist) {
            this.customTable.pushToTable({
                'Official source path ': [this.officialFilePath]
            })
            await updateLanguageFile.call(this);
        } else {
            await newLanguageFile.call(this);
        }
        let translationReadyJson = await parseXlifSrc(this.translationFilePath);
        // // console.log('autoTranslate-->',translationReadyJson)
        if (this.autoTranslate === 'on') {
            // console.log('enter in if--->');
            translationReadyJson = await autoTranslate.call(this, translationReadyJson);
        }
        const xliffData = xliffParser.createXliff(translationReadyJson);
        await common.fileWriter(this.developmentFilePath, xliffData)
        this.customTable.show('Over all status of task')
        // // console.log('this.srcJsonData--->',this.srcJsonData)
    } catch (err) {
        throw err;
    }

}

module.exports = Generate;