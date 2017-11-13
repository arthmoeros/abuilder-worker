const QSDT = require('./../src/qsdt').QSDT;
const fs = require('fs');

const api = new QSDT();

async function wrapper(){
    const forms = await api.getForms();
    console.log(forms);
    
    const form = await api.getForm(forms[0]);
    console.log(form);
    try{

        const artifactsId = await api.requestArtifactGeneration(JSON.parse(fs.readFileSync(__dirname+'/request.json').toString()));
        console.log(artifactsId);
        
        const buff = api.getGeneratedArtifacts(artifactsId);
        console.log(buff);
    }catch (err){
        console.log(err);
    }
}

wrapper();