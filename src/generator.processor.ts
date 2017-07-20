import * as fs from "fs";
import * as shelljs from "shelljs";
import { TemplateProcessor } from "@artifacter/template-engine";
import { ObjectPropertyLocator } from "@artifacter/common";

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
     * and underlying task into memory, if it can't find either of those it will
     * throw an Error
     * 
     * @param generator Generator's name
     * @param task task to use in the generator
     * @param workingFolder Path to the temporary working folder to store generated artifacts
     */
    constructor(generator: string, task: string, workingFolder: string) {
        if (!fs.existsSync(generatorsPath + "/" + generator + ".json")) {
            throw new Error("Couldn't find a generator file at location: " + generatorsPath + "/" + generator + ".json");
        }
        let generatorFile: Buffer = fs.readFileSync(generatorsPath + "/" + generator + ".json");
        this.generator = JSON.parse(generatorFile.toString())[task];
        if (this.generator == null) {
            throw new Error("Couldn't find a task named '" + task + "' at the generator " + generator + ".json");
        }
        this.workingFolder = workingFolder;
        this.templatesFolder = templatesPath + "/" + generator;
    }

    /**
     * Runs the Generator, it will execute the generator tasked script's task
     * 
     * @param request values request to use with the generator
     */
    public run(request: {}) {
        this.generator.rootContents.forEach(element => {
            if (element.folder) {
                if (element.folder.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.folder.includeif, request)) {
                        return;
                    }
                }
                this.processFolder(request, element.folder, ".");
            } else if (element.atmpl) {
                if (element.atmpl.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, request)) {
                        return;
                    }
                }
                this.processAtmpl(request, element.atmpl, ".");
            } else if (element.static) {
                if (element.static.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, request)) {
                        return;
                    }
                }
                this.processStatic(request, element.static, ".");
            } else if (element.foreach) {
                if (element.foreach.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(element.foreach.includeif, request)) {
                        return;
                    }
                }
                this.processForeach(request, element.foreach, ".");
            } else {
                throw new Error("Invalid element found in rootContents of generator file: " + element);
            }
        });
    }

    /**
     * Uses the template engine for artifact target name resolution
     * @param element folder, atmpl or static from the generator
     * @param request values request
     */
    private resolveFilename(element: any, request: {}) {
        if (element.targetName) {
            let nameProcessor: TemplateProcessor = new TemplateProcessor(null, element.targetName, true);
            return nameProcessor.run(request);
        } else {
            throw new Error("targetName not provided for element " + element);
        }
    }

    /**
     * Processes a static element
     * @param request values request
     * @param staticType  static element
     * @param targetpath target path where to copy the static element
     */
    private processStatic(request: {}, staticType: any, targetpath: string) {
        let filename: string = this.resolveFilename(staticType, request);
        let fileContents: string = fs.readFileSync(this.templatesFolder + "/" + staticType.location).toString();

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    /**
     * Process an atmpl element
     * @param request values request
     * @param atmpl atmpl element
     * @param targetpath target path where to write the generated artifact
     */
    private processAtmpl(request: {}, atmpl: any, targetpath: string) {
        let atmplProcessor: TemplateProcessor = new TemplateProcessor(this.templatesFolder + "/" + atmpl.location, fs.readFileSync(this.templatesFolder + "/" + atmpl.location));

        if (atmpl.parameters != null) {
            atmplProcessor.setTemplateParameters(atmpl.parameters);
        }
        let filename: string = this.resolveFilename(atmpl, request);
        let fileContents: string = atmplProcessor.run(request);

        fs.writeFileSync(this.workingFolder + "/" + targetpath + "/" + filename, fileContents);
    }

    private processForeach(request: {}, foreach: any, targetpath: string) {
        let expression: RegExpExecArray = /([A-Za-z0-9]+) +in +([A-Za-z0-9.]+)/.exec(foreach.expression);
        if (expression == null) {
            throw new Error(`Invalid expression in foreach found in running task: ${foreach.expression}`);
        }

        let list: any[] = ObjectPropertyLocator.lookup(request, expression[2]);
        let requestCopy: {} = JSON.parse(JSON.stringify(request));
        list.forEach(item => {
            requestCopy[expression[1]] = item;
            if (foreach.folder) {
                if (foreach.folder.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.folder.includeif, request)) {
                        return;
                    }
                }
                this.processFolder(request, foreach.folder, targetpath);
            } else if (foreach.atmpl) {
                if (foreach.atmpl.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.atmpl.includeif, request)) {
                        return;
                    }
                }
                this.processAtmpl(request, foreach.atmpl, targetpath);
            } else if (foreach.static) {
                if (foreach.static.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.static.includeif, request)) {
                        return;
                    }
                }
                this.processStatic(request, foreach.static, targetpath);
            } else {
                throw new Error(`foreach with expression ${foreach.expression} does not have a valid inner element (atmpl|static|folder) in task ${request['$generator']}:${request['$task']}`);
            }
        });

    }

    /**
     * Process a folder element, it also processes inner elements (atmpl, static, sub-folders)
     * @param request values request
     * @param folder folder element
     * @param tmplpath path where the folder is located in the templates folder
     * @param targetpath target path where to make the folder into the generated artifacts
     */
    private processFolder(request: {}, folder: any, targetpath: string) {
        let folderName: string = this.resolveFilename(folder, request);

        shelljs.mkdir('-p', this.workingFolder + "/" + targetpath + "/" + folderName);
        if (folder.contents) {
            folder.contents.forEach(element => {
                if (element.folder) {
                    if (element.folder.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.folder.includeif, request)) {
                            return;
                        }
                    }
                    this.processFolder(request, element.folder, targetpath + "/" + folderName);
                } else if (element.atmpl) {
                    if (element.atmpl.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.atmpl.includeif, request)) {
                            return;
                        }
                    }
                    this.processAtmpl(request, element.atmpl, targetpath + "/" + folderName);
                } else if (element.static) {
                    if (element.static.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.static.includeif, request)) {
                            return;
                        }
                    }
                    this.processStatic(request, element.static, targetpath + "/" + folderName);
                } else if (element.foreach) {
                    if (element.foreach.includeif) {
                        if (!TemplateProcessor.evaluateBoolean(element.foreach.includeif, request)) {
                            return;
                        }
                    }
                    this.processForeach(request, element.foreach, targetpath + "/" + folderName);
                } else {
                    throw new Error("Invalid element found in contents for folder " + folder.name + " in generator file: " + element);
                }
            });

        }
    }
}