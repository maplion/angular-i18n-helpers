const translateWithGoogle = async (text, target) => {
    let translation;
    return await new Promise(async (resolve) => {
        await import('./google-translate.js')
            .then(googleTranslate => {
                const translateClient = googleTranslate.getClient();
                googleTranslate.translate(translateClient, text, target)
                    .then(result => {
                        // console.log(result);
                        translation = result;
                        resolve();
                    });
            }).catch(error => {
                console.log('ERROR: ', error.message, error);
            });
    }).then(() => {
        return translation;
    });
}

const translateWithAws = async (text, target) => {
    let translation;
    return await new Promise(async (resolve) => {
        await import('../bin/aws-translate.js')
            .then(awsTranslate => {
                const client = awsTranslate.getClient();
                awsTranslate.translate(client, text, target)
                    .then(result => {
                        // console.log(result);
                        translation = result;
                        resolve();
                    }).catch(error => {
                        console.log('ERROR: ', error.message, error);
                    });
            }).catch(error => {
                console.log('ERROR: ', error.message, error);
            });
    }).then(() => {
        return translation;
    }).catch(error => {
        console.log('ERROR: ', error.message, error);
    });
}

const getTranslation = async (text, target, translator) => {
    switch (translator) {
        case 'google':
            return translateWithGoogle(text, target);
        case 'aws':
            return translateWithAws(text, target);
    }
}

module.exports = {
    getTranslation
}
