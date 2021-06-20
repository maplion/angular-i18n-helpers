const {
    TranslateClient,
    TranslateTextCommand
} = require("@aws-sdk/client-translate");

const getClient = () => {
    const client = new TranslateClient({
        region: "us-east-1",
    });
    return client;
}

// Translates some text into the Language of choice
const translate = async (client, text, target) => {
    console.log('TEXT :', text);
    console.log('TEXT :', text);
    console.log('TEXT :', text);
    console.log('TEXT :', text);
    console.log('TEXT :', text);
    if (!text[0]) {
        return ' ';
    }
    let translation;
    const params = {
        SourceLanguageCode: 'en',
        TargetLanguageCode: target,
        Text: text[0]
    }
    const command = new TranslateTextCommand(params);
    return await new Promise(resolve => {
        client.send(command)
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

module.exports = {
    getClient,
    translate
}
