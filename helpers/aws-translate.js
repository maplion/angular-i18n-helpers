const AWS = require('aws-sdk');
const translate = new AWS.Translate();

export const getClient = async () => {
    const client = new TranslateClient({
        region: "us-east-1"
    });
    return client;
}

// Translates some text into the Language of choice
export const translate = async (translateClient, text, target) => {
    let translation;
    const params = {
        SourceLanguageCode: 'en',
        TargetLanguageCode: target,
        TerminologyNames: [],
        Text: text
    }
    const command = new CreateParallelDataCommand(params);
    return await new Promise(resolve => {
        translateClient.send(command)
            .then(
                (data) => {
                    console.log(data);
                    translation = data;
                    resolve();
                },
                (error) => {
                    console.log(error, error.stack);
                }
            ).catch(error => {
                console.log('ERROR: ', error.message, error);
            });
    }).then(() => {
        return translation;
    }).catch(error => {
        console.log('ERROR: ', error.message, error);
    });
}
