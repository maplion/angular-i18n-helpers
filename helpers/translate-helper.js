const translateWithGoogle = async (text, target) => {
    let translation;
    return await new Promise(resolve => {
        const googleTranslate = require('./google-translate').default;
        const translateClient = googleTranslate.getClient();
        googleTranslate.translate(translateClient, text, target)
            .then(result => {
                // console.log(result);
                translation = result;
                resolve();
            });
    }).then(() => {
        return translation;
    });
}

const translateWithAws = async (text, target) => {
    let translation;
    return await new Promise(resolve => {
        const awsTranslate = require('./aws-translate').default;
        const client = awsTranslate.getClient();
        awsTranslate.translate(client, text, target)
            .then(result => {
                // console.log(result);
                translation = result;
                resolve();
            }).catch(error => {
                console.log('ERROR: ', error.message, error);
            });
    }).then(() => {
        return translation;
    }).catch(error => {
        console.log('ERROR: ', error.message, error);
    });
}

const translate = async (text, target, translator) => {
    switch (translator) {
        case 'google':
            return translateWithGoogle(text, target);
        case 'aws':
            return translateWithAws(text, target);
    }
}

module.exports = {
    translate
}
