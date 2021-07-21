#!/usr/bin/env node
'use strict;'

const [,,...args]=process.argv
const yargs = require("yargs/yargs");
const Generate= require('./generate')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
  .command('generate', 'fetch the contents of the URL', () => {}, (argv) => {
    console.info(argv)
    //language,awsProfile,region,autoTranslate
    const generate=new Generate(argv.language,argv.awsProfile,argv.region,argv.autoTranslate)
    generate.start();
  })
  .option("l", { alias: "language", describe: "The language of the file that needs to be generated, in lowercase ISO format.  Example: 'fr' for French", type: "string", demandOption: true })
  .option("r", { alias: "region", describe: `The region of the file that needs to be generated, in lowercase ISO format. This is optional as some languages don't have regions.  Example: 'fr' for France`, type: "string", demandOption: false })
  .option("auto-translate", {  describe: `This flag is used when you want the auto translation via aws service.
  Before using this service please insure that your aws account is activated and configured.
  It only trnaslate to that language that which are available in aws service`, type: "string", demandOption: false })
  .option("aws-profile", { describe: `The stage is the environment for which you want to parse language file.
  Example:
      --aws-profile <your-profile-name> \t take account detail from listed profile, By default it takes the default porfile of your system`, type: "string", demandOption: false })
  .argv

// yargs(hideBin(process.argv))
//   .command('serve [port]', 'start the server', (yargs) => {
//     return yargs
//       .positional('port', {
//         describe: 'port to bind on',
//         default: 5000
//       })
//   }, (argv) => {
//     if (argv.verbose) console.info(`start server on :${argv.port}`)
//     serve(argv.port)
//   })
//   .option('verbose', {
//     alias: 'v',
//     type: 'boolean',
//     description: 'Run with verbose logging'
//   })
//   .argv

// const options = yargs
//  .usage("Usage: -n <name>")
//  .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
//  .argv;

// yargs.command({
//     command: 'add',
//     describe: 'Adds two number',
//     builder: {
//         firstNumber: {
//             describe: 'First Number',
//             demandOption: true,  // Required
//             type: 'number'     
//         },
//         secondNumber: {  
//             describe: 'Second Number',
//             demandOption: true,
//             type: 'number'
//         }
//     },
  
//     // Function for your command
//     handler(argv) {
//         console.log("Result:", 
//             (argv.firstNumber+argv.secondNumber))
//     }
// })

// const greeting = `Hello, ${options.name}!`;

// console.log(greeting);


//  console.log(`Hello world ${args}`);