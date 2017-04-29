import * as fs from "fs";
import { TemplateProcessor } from "abuilder-template-processor";

const generatorsPath = "./config/abgenerator";
const templatesPath = "./config/abtmpl";
export class GeneratorProcessor {

    private generator: any;
    private templatesFolder: string;
    private workingFolder: string;

    private constructor() {

    }

    public static find(generatorComponent: string, formFunction: string, workingFolder: string): GeneratorProcessor {
        if (!fs.existsSync(generatorsPath + "/" + generatorComponent + ".json")) {
            throw new Error("Couldn't find a generator file at location: " + generatorsPath + "/" + generatorComponent + ".json");
        }
        let generatorFile: Buffer = fs.readFileSync(generatorsPath + "/" + generatorComponent + ".json");
        let instance: GeneratorProcessor = new GeneratorProcessor();
        instance.generator = JSON.parse(generatorFile.toString())[formFunction];
        instance.workingFolder = workingFolder;
        instance.templatesFolder = templatesPath+"/"+generatorComponent;

        return instance;
    }

    public run(map: Map<string,string>){
        this.generator.rootContents.forEach(element => {
            if(element.folder){
                this.processFolder(map, element.folder, ".", ".");
            }else if(element.abtmpl){
                this.processAbtmpl(map, element.abtmpl, ".", ".");
            }else{
                throw new Error("Invalid element found in rootContents of generator file: "+element);
            }
        });
    }

    private processAbtmpl(map: Map<string,string>, abtmpl: any, tmplpath: string, targetpath: string){
        let nameProcessor: TemplateProcessor = new TemplateProcessor(abtmpl.tmplname);
        let abtmplProcessor: TemplateProcessor = new TemplateProcessor(this.templatesFolder+"/"+tmplpath+"/"+abtmpl.filename, fs.readFileSync(this.templatesFolder+"/"+tmplpath+"/"+abtmpl.filename));
        
        let filename: string = nameProcessor.run(map);
        let fileContents: string = abtmplProcessor.run(map);

        fs.writeFileSync(this.workingFolder+"/"+targetpath+"/"+filename, fileContents);
    }

    private processFolder(map: Map<string,string>, folder: any, tmplpath: string, targetpath: string){
        let nameProcessor: TemplateProcessor = new TemplateProcessor(folder.tmplname);

        let folderName: string = nameProcessor.run(map);

        fs.mkdirSync(this.workingFolder+"/"+targetpath+"/"+folderName);

        folder.contents.forEach(element => {
            if(element.folder){
                this.processFolder(map, element.folder, tmplpath+"/"+folder.name, targetpath+"/"+folderName);
            }else if(element.abtmpl){
                this.processAbtmpl(map, element.abtmpl, tmplpath+"/"+folder.name, targetpath+"/"+folderName);
            }else{
                throw new Error("Invalid element found in contents of folder "+tmplpath+"/"+folder.name+" in generator file: "+element);
            }
        });

    }
}