#!/usr/bin/env node

'use strict;'

const [, , ...args] = process.argv
const yargs = require("yargs/yargs");
const Generate = require('./generate')
const {
    hideBin
} = require('yargs/helpers')

yargs(hideBin(process.argv))
    .command('generate', 'fetch the contents of the URL', () => {}, async (argv) => {
        // console.info(argv)
        //language,awsProfile,region,autoTranslate
        const generate = new Generate(argv.language, argv.awsProfile, argv.region, argv.autoTranslate, argv.inputSrcFile)
        await generate.start();
    })
    .option("l", {
        alias: "language",
        describe: "The language of the file that needs to be generated, in lowercase ISO format.  Example: 'fr' for French",
        type: "string",
        demandOption: true
    })
    .option("r", {
        alias: "region",
        describe: `The region of the file that needs to be generated, in lowercase ISO format. This is optional as some languages don't have regions.  Example: 'fr' for France`,
        type: "string",
        demandOption: false
    })
    .option("auto-translate", {
        describe: `This flag is used when you want the auto translation via aws service.
  Before using this service please insure that your aws account is activated and configured.
  It only trnaslate to that language that which are available in aws service`,
        type: "string",
        demandOption: false
    })
    .option("input-src-file", {
        describe: `This flag is used when you want the auto translation via aws service.
  Before using this service please insure that your aws account is activated and configured.
  It only trnaslate to that language that which are available in aws service`,
        type: "string",
        demandOption: false
    })
    .option("aws-profile", {
        describe: `AWS profile on your environment.
  Example:
      --aws-profile <your-profile-name> \t take account detail from listed profile, By default it takes the default porfile of your system`,
        type: "string",
        demandOption: false
    })
    .argv

process.on('uncaughtException', function (err) {
    // console.log('Caught exception: ' + err);
    console.log('*********** TASK EXECUTION IS ABORTED ************');
    console.error(err)
});