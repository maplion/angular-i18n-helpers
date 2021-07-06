# Angular i18n Creation and Maintenance Helper
This is a helper developed with the intent of making Angular 6 i18n a bit less tedious until they come up with their own, better solution(s) (which may or may not already exist, but I couldn't find them and I didn't have time to wait).

## What this Helper Addresses
After learning how to use i18n, I found some issues that made the process tedious for real-world use:
1. During creation, the manual copying of the `messages.xlf` to the `messages.<language>.xlf` and then going through each <source> tag, making a copy, changing the name of the `<source>` to `<target>` became painful.
2. Additionally, if one wanted a placeholder generated by Google Translate, the source content had to be copied into Google Translate, translated, and copied back to the `<target>` tag; additionally painful.
3. Creating a separate file to send off to a translating service with untranslated or blank targets to avoid confusion was annoying if I had already accomplished the above.
4. Keeping your source file synced with your translated files was tedious, especially if you messaged up a tag (e.g. forget an @@ so it isn't a persistent tag).  This first puts into your target file the missing sources and then removes from your target file the sources that are not in your messages.xlf.

## Additional gotchas addressed
1. There were a lot of whitespace issues appearing in `<source>` and `<target>` tags; this trims and flattens the `<source>` and `<target>` tags.
2. Currently, if your source text has return values, those get carried over in the translation (i.e. `<target></target>`) and when
the line is replaced, it ends up with a lot of &nbsp; spacing in between all areas where there was a line break.
3. Interpolated values are ignored (not fully tested, but it works for my purposes at the moment).

## Who this was made for
This was developed with my needs in mind, but could be developed for general public use with some additional features (you can fork it and make it your own, or help improve this, but at least it gives a head start).

## Assumptions
This is designed with a few assumptions in mind:
1. You're using standard messages.xlf files and following the i18n standards given here: https://angular.io/guide/i18n
2. That your i18n tags are on the inner-most tags surrounding only text (no html included in your messages.xlf output; Note: interpolations are okay).
3. That you'll want two separate output files: one for a translator and one for development purposes (placeholders).
4. That you'll use the Google Translate API and already have a project set up as described here: https://cloud.google.com/translate/docs/reference/libraries#client-libraries-resources-nodejs
5. This is intended to be run from within an existing project.  For example, the helpers folder is expected to be at the same level as (a sibling to) your locale folder, wherever it exists.
6. This assumes that anything with a `<target>` tag has already been translated and they are ignored.
7. That you are utilizing @@ persistence tags. 
8. It is assumed that the developer file is in the locale folder and that the files for translators are in the files-for-translation folder.
9. An equivalent version setup is used as the following (`ng version` at the time of this posting):
10. It is assumed that you have already copied your `messages.xlf` file to the language file of your choice (e.g. `messages.xlf` => `messages.fr-CA.xlf`).  This is currently required to work on the first run.
```
Angular CLI: 6.0.8
Node: 8.11.3
OS: win32 x64
Angular: 6.0.5
... animations, common, compiler, compiler-cli, core, forms
... http, language-service, platform-browser
... platform-browser-dynamic, router

Package                           Version
-----------------------------------------------------------
@angular-devkit/architect         0.6.8
@angular-devkit/build-angular     0.6.8
@angular-devkit/build-optimizer   0.6.8
@angular-devkit/core              0.6.8
@angular-devkit/schematics        0.6.8
@angular/cli                      6.0.8
@ngtools/webpack                  6.0.8
@schematics/angular               0.6.8
@schematics/update                0.6.8
rxjs                              6.2.1
typescript                        2.7.2
webpack                           4.8.3
```

## Usage Directions
1. If you haven't already, set up a Google Translate API Project: https://cloud.google.com/translate/docs/reference/libraries#client-libraries-resources-nodejs
2. When setting up the Google Translate API Project, you should receive a json file; rename it to `google-translate-credentials.json` and overwrite the placeholder in the files that you have downloaded from this project.
3. Copy the private_key_id (or Project Key) from the file and put it in the google-translate.js file in place of YOUR_PROJECT_ID (`const projectId = 'YOUR_PROJECT_ID'`).
4. Install Google Translate: `npm install @google-cloud/translate --save-dev`
5. Install xml2js: `npm install xml2js --save-dev`
6. Install file-system: `npm install file-system --save-dev`
7. Generate a messages.xlf file using `ng xi18n --output-path <path to locale folder>` if starting a new translation or point to an existing language file after copying over the additional translations from the messages.xlf
8. Set your local environment variable to access Google Translate: (e.g. Git Bash or Linux: `export GOOGLE_APPLICATION_CREDENTIALS="/c/git/myProject/src/i18n/helpers/google-translate-credentials.json"`)
9. Run the javascript file using: `node src/i18n/helpers/xlf-helper.js <target-language-code> [language messages.<language>.xlf file]` [Note: it defaults to french (i.e. `fr`) if you don't provide any language code]. Example: `node src/i18n/helpers/xlf-helper.js fr messages.fr-CA.xlf`.
10. Note, you can batch multiple languages by adding something like the following to your package.json scripts section:
`"i18n": "ng xi18n --output-path i18n/locale && node src/i18n/helpers/xlf-helper.js fr messages.fr-FR.xlf && node src/i18n/helpers/xlf-helper.js fr messages.fr-CA.xlf && node src/i18n/helpers/xlf-helper.js es messages.es-MX.xlf",`
and then typing `npm run i18n` whenever you wish to run it.
## Things I hope to add
1. Fix it so that multiple interpolations within a single tag are supported.
2. Make it so if files don't exist, they care copied automatically on first run.
3. Add better error-handling.

