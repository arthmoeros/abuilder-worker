import * as fs from "fs";
import { TemplateProcessor, MappedExpression } from "@ab/template-processor";

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
        instance.templatesFolder = templatesPath + "/" + generatorComponent;

        return instance;
    }

    public run(map: Map<string, string>) {
        this.generator.rootContents.forEach(element => {
            if (element.folder) {
                if (element.folder.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.folder.includeif, map)) {
                        return;
                    }
                }
                this.processFolder(map, element.folder, ".", ".");
            } else if (element.abtmpl) {
                if (element.abtmpl.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.abtmpl.includeif, map)) {
                        return;
                    }
                }
                this.processAbtmpl(map, element.abtmpl, ".", ".");
            } else if (element.static) {
                if (element.static.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.abtmpl.includeif, map)) {
                        return;
                    }
                }
                this.processStatic(map, element.static, ".", ".");
            } else {
                throw new Error("Invalid element found in rootContents of generator file: " + element);
            }
        });
    }

    private resolveFilename(element: any, map: Map<string, string>) {
        if (element.targetTmplName) {
            let nameProcessor: TemplateProcessor = new TemplateProcessor(element.targetTmplName);
            return nameProcessor.run(map);
        } else {
            return element.targetname;
        }
    }

    private processStatic(map: Map<string, string>, staticType: any, tmplpath: string, targetpath: string) {
        let filename: string = this.resolveFilename(staticType, map);
        let fileContents: string = fs.readFileSync(this.templatesFolder + "/" + tmplpath + "/" + staticType.name).toString();

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    private processAbtmpl(map: Map<string, string>, abtmpl: any, tmplpath: string, targetpath: string) {
        let abtmplProcessor: TemplateProcessor = new TemplateProcessor(this.templatesFolder + "/" + tmplpath + "/" + abtmpl.name, fs.readFileSync(this.templatesFolder + "/" + tmplpath + "/" + abtmpl.name));

        let filename: string = this.resolveFilename(abtmpl, map);
        let fileContents: string = abtmplProcessor.run(map);

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    private processFolder(map: Map<string, string>, folder: any, tmplpath: string, targetpath: string) {
        let folderName: string = this.resolveFilename(folder, map);

        fs.mkdirSync(this.workingFolder + "/" + targetpath + "/" + folderName);
        console.log(folder);
        if (folder.contents) {
            folder.contents.forEach(element => {
                if (element.folder) {
                    if (element.folder.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.folder.includeif, map)) {
                            return;
                        }
                    }
                    this.processFolder(map, element.folder, tmplpath + "/" + folder.name, targetpath + "/" + folderName);
                } else if (element.abtmpl) {
                    if (element.abtmpl.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.abtmpl.includeif, map)) {
                            return;
                        }
                    }
                    this.processAbtmpl(map, element.abtmpl, tmplpath + "/" + folder.name, targetpath + "/" + folderName);
                } else if (element.static) {
                    if (element.static.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.static.includeif, map)) {
                            return;
                        }
                    }
                    this.processStatic(map, element.static, tmplpath + "/" + folder.name, targetpath + "/" + folderName);
                } else {
                    throw new Error("Invalid element found in contents of folder " + tmplpath + "/" + folder.name + " in generator file: " + element);
                }
            });

        }
    }
}