'use strict;'
const {
    convert,
    create
} = require('xmlbuilder2');
const xliff2Json = (xmlData) => {
    try {
        return convert(xmlData, {
            format: "object"
        });
    } catch (error) {
        throw error
    }

}
const createXliff = (jsonData) => {
    try {
        const doc = create({
            version: '1.0',
            encoding: 'UTF-8'
        }, jsonData)
        const xml = doc.end({
            prettyPrint: true,
            allowEmptyTags: true
        })
        return xml;
    } catch (error) {
        throw error
    }
}

module.exports = {
    xliff2Json,
    createXliff
}