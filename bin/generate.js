'use strict;'
function Generate(language,awsProfile,region,autoTranslate){
    this.language=language;
    this.awsProfile=awsProfile;
    this.region=region;
    this.autoTranslate=autoTranslate
}

function updateLanguageFile(){
    console.log("updateLanguageFile-->",this);
}

function newLanguageFile(){
    console.log(this);
}

Generate.prototype.start=function(){
    updateLanguageFile.call(this)
}

module.exports= Generate;