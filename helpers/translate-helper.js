const googleTranslate = require('./google-translate');
const translateClient = googleTranslate.getClient();

async function translate(text, target) {
    return await googleTranslate.translate(translateClient, text, target)
        .then(translation => {
            // console.log(translation);
            return translation;
        });
}

module.exports = {
    translate
}
