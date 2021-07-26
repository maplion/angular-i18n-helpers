const {
    TranslateClient,
    TranslateTextCommand
} = require("@aws-sdk/client-translate");
const {fromIni} = require("@aws-sdk/credential-provider-ini");

const getClient = (profile) => {
    // console.log("profile-->",profile)
    let config={
        region: "us-east-1"
    }
    if(profile){
        // console.log("getClientgetClientgetClient-->",profile);
        config.credentials=fromIni({profile:profile})
    }
    const client = new TranslateClient(config);
    return client;
}

// Translates some text into the Language of choice
const translate = async (client, text, target) => {
    const params = {
        SourceLanguageCode: 'en',
        TargetLanguageCode: target,
        Text: text
    }
    const command = new TranslateTextCommand(params);
    return client.send(command)
    // return await new Promise(resolve => {
    //     client.send(command)
    //         .then(
    //             (data) => {
    //                 console.log(data);
    //                 translation = data;
    //                 resolve();
    //             },
    //             (error) => {
    //                 console.log(error, error.stack);
    //             }
    //         ).catch(error => {
    //             console.log('ERROR: ', error.message, error);
    //         });
    // }).then(() => {
    //     return translation;
    // }).catch(error => {
    //     console.log('ERROR: ', error.message, error);
    // });
}

module.exports = {
    getClient,
    translate
}
