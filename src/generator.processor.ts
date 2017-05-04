import * as fs from "fs";
import { TemplateProcessor, MappedExpression } from "@ab/template-processor";

const generatorsPath = "./config/abgenerator";
const templatesPath = "./config/abtmpl";
/**
 * @class GeneratorProcessor
 * @see npm @ab/worker
 * @see also the abgenerator.schema.json file
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class manages the template processors and packages a outputs in a temporary
 * folder the generated artifacts.
 * 
 * It makes use of a JSON file as a "tasked script" for to-be generated artifacts,
 * this file is called the "generator"
 * 
 */
export class GeneratorProcessor {

    /**
     * Reference to the json 
     */
    private generator: any;

    /**
     * Path to the templates folder to use
     */
    private templatesFolder: string;

    /**
     * Path to the temporary working folder where to store generated artifacts
     */
    private workingFolder: string;

    /**
     * Creates a GeneratorProcessor availale to run, it loads the generator tasked script
     * and underlying formFunction into memory, if it can't find either of those it will
     * throw an Error
     * 
     * @param generator Generator's name
     * @param formFunction FormFunction to use in the generator
     * @param workingFolder Path to the temporary working folder to store generated artifacts
     */
    constructor(generator: string, formFunction: string, workingFolder: string) {
        if (!fs.existsSync(generatorsPath + "/" + generator + ".json")) {
            throw new Error("Couldn't find a generator file at location: " + generatorsPath + "/" + generator + ".json");
        }
        let generatorFile: Buffer = fs.readFileSync(generatorsPath + "/" + generator + ".json");
        this.generator = JSON.parse(generatorFile.toString())[formFunction];
        if(this.generator == null){
            throw new Error("Couldn't find a FormFunction named '"+formFunction+"' at the generator "+ generator +".json");
        }
        this.workingFolder = workingFolder;
        this.templatesFolder = templatesPath + "/" + generator;
    }

    /**
     * Runs the Generator, it will execute the generator tasked script's formFunction
     * 
     * @param map values map to use with the generator
     */
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