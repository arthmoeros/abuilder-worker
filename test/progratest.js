const Artifacter = require('./../src/artifacter').Artifacter;
const fs = require('fs');

const api = new Artifacter();

const forms = api.getForms();
console.log(forms);

const form = api.getForm(forms[0]);
console.log(form);

const artifactsId = api.requestArtifactGeneration(JSON.parse(fs.readFileSync(__dirname+'/request.json').toString()));
console.log(artifactsId);

const buff = api.getGeneratedArtifacts(artifactsId);
console.log(buff);