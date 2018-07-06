const googleTranslate = require('./google-translate');
const translateClient = googleTranslate.getClient();

async function translate(text, target) {
    let translation;
    return await new Promise(resolve => {
        googleTranslate.translate(translateClient, text, target)
            .then(result => {
                // console.log(translation);
                translation = result;
                resolve();
            });
    }).then(() => {
        return translation;
    });
}

module.exports = {
    translate
}
