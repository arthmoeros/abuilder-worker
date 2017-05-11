import * as fs from "fs";
import * as shelljs from "shelljs";
import { TemplateProcessor } from "@artifacter/template-engine";

const generatorsPath = "./config/generator";
const templatesPath = "./config/atmpl";
/**
 * @class GeneratorProcessor
 * @see npm @artifacter/worker
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
                this.processFolder(map, element.folder, ".");
            } else if (element.atmpl) {
                if (element.atmpl.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, map)) {
                        return;
                    }
                }
                this.processAtmpl(map, element.atmpl, ".");
            } else if (element.static) {
                if (element.static.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, map)) {
                        return;
                    }
                }
                this.processStatic(map, element.static, ".");
            } else {
                throw new Error("Invalid element found in rootContents of generator file: " + element);
            }
        });
    }

    /**
     * Uses the template engine for artifact target name resolution
     * @param element folder, atmpl or static from the generator
     * @param map values map
     */
    private resolveFilename(element: any, map: Map<string, string>) {
        if (element.targetName) {
            let nameProcessor: TemplateProcessor = new TemplateProcessor(element.targetName, true);
            return nameProcessor.run(map);
        } else {
            throw new Error("targetName not provided for element "+element);
        }
    }

    /**
     * Processes a static element
     * @param map values map
     * @param staticType  static element
     * @param targetpath target path where to copy the static element
     */
    private processStatic(map: Map<string, string>, staticType: any, targetpath: string) {
        let filename: string = this.resolveFilename(staticType, map);
        let fileContents: string = fs.readFileSync(this.templatesFolder + "/" + staticType.location).toString();

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    /**
     * Process an atmpl element
     * @param map values map
     * @param atmpl atmpl element
     * @param targetpath target path where to write the generated artifact
     */
    private processAtmpl(map: Map<string, string>, atmpl: any, targetpath: string) {
        let atmplProcessor: TemplateProcessor = new TemplateProcessor(this.templatesFolder + "/" + atmpl.location, fs.readFileSync(this.templatesFolder + "/" + atmpl.location));

        if(atmpl.parameters != null){
            atmplProcessor.setTemplateParameters(atmpl.parameters);
        }
        let filename: string = this.resolveFilename(atmpl, map);
        let fileContents: string = atmplProcessor.run(map);

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    /**
     * Process a folder element, it also processes inner elements (atmpl, static, sub-folders)
     * @param map values map
     * @param folder folder element
     * @param tmplpath path where the folder is located in the templates folder
     * @param targetpath target path where to make the folder into the generated artifacts
     */
    private processFolder(map: Map<string, string>, folder: any, targetpath: string) {
        let folderName: string = this.resolveFilename(folder, map);

        shelljs.mkdir('-p', this.workingFolder + "/" + targetpath + "/" + folderName);
        if (folder.contents) {
            folder.contents.forEach(element => {
                if (element.folder) {
                    if (element.folder.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.folder.includeif, map)) {
                            return;
                        }
                    }
                    this.processFolder(map, element.folder, targetpath + "/" + folderName);
                } else if (element.atmpl) {
                    if (element.atmpl.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, map)) {
                            return;
                        }
                    }
                    this.processAtmpl(map, element.atmpl, targetpath + "/" + folderName);
                } else if (element.static) {
                    if (element.static.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.static.includeif, map)) {
                            return;
                        }
                    }
                    this.processStatic(map, element.static, targetpath + "/" + folderName);
                } else {
                    throw new Error("Invalid element found in contents for folder " + folder.name + " in generator file: " + element);
                }
            });

        }
    }
}