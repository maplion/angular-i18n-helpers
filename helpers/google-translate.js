// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

function getClient() {
    // Your Google Cloud Platform project ID
    const projectId = 'bac76e25e74d770f7bcb42110d91af6d25f37125';

    // Instantiates a client
    const translate = new Translate({
        projectId: projectId,
    });

    return translate;
}

// Translates some text into the Language of choice
async function translate(translator, text, target) {
    let translation;
    return await new Promise(resolve => {
        translator.translate(text, target)
            .then(results => {
                translation = results[0][0];
                // console.log(`Text: ${text}`);
                // console.log(`Translation: ${translation}`);
                resolve();
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }).then(() => {
        return translation;
    });
}

module.exports = {
    translate,
    getClient
}
