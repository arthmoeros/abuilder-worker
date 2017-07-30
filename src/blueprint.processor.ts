import * as fs from "fs";
import * as shelljs from "shelljs";
import { TemplateProcessor } from "@artifacter/template-engine";
import { ObjectPropertyLocator } from "@artifacter/common";
import { configurationsFolder } from "./paths";

const blueprintsPath = configurationsFolder+"blueprint";
const templatesPath = configurationsFolder+"blueprint-material";
/**
 * @class BlueprintProcessor
 * @see npm @artifacter/worker
 * @see also the abblueprint.schema.json file
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class manages the template processors and packages a outputs in a temporary
 * folder the generated artifacts.
 * 
 * It makes use of a JSON file as a "tasked script" for to-be generated artifacts,
 * this file is called the "blueprint"
 * 
 */
export class BlueprintProcessor {

    /**
     * Reference to the json 
     */
    private blueprint: any;

    /**
     * Path to the templates folder to use
     */
    private templatesFolder: string;

    /**
     * Path to the temporary working folder where to store generated artifacts
     */
    private workingFolder: string;

    /**
     * Creates a BlueprintProcessor availale to run, it loads the blueprint tasked script
     * and underlying task into memory, if it can't find either of those it will
     * throw an Error
     * 
     * @param blueprint Blueprint's name
     * @param task task to use in the blueprint
     * @param workingFolder Path to the temporary working folder to store generated artifacts
     */
    constructor(blueprint: string, task: string, workingFolder: string) {
        if (!fs.existsSync(blueprintsPath + "/" + blueprint + ".json")) {
            throw new Error("Couldn't find a blueprint file at location: " + blueprintsPath + "/" + blueprint + ".json");
        }
        let blueprintFile: Buffer = fs.readFileSync(blueprintsPath + "/" + blueprint + ".json");
        this.blueprint = JSON.parse(blueprintFile.toString())[task];
        if (this.blueprint == null) {
            throw new Error("Couldn't find a task named '" + task + "' at the blueprint " + blueprint + ".json");
        }
        this.workingFolder = workingFolder;
        this.templatesFolder = templatesPath + "/" + blueprint;
    }

    /**
     * Runs the Blueprint, it will execute the blueprint tasked script's task
     * 
     * @param request values request to use with the blueprint
     */
    public run(request: {}) {
        this.blueprint.rootContents.forEach(element => {
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
                throw new Error("Invalid element found in rootContents of blueprint file: " + element);
            }
        });
    }

    /**
     * Uses the template engine for artifact target name resolution
     * @param element folder, atmpl or static from the blueprint
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

    /**
     * Process a foreach element, it will process a single contained element (atmpl, static or folder)
     * including its iterated item in a copied request object
     * @param request values request
     * @param foreach foreach element
     * @param targetpath target path where to write the generated artifact
     */
    private processForeach(request: {}, foreach: any, targetpath: string) {
        let expression: RegExpExecArray = /([A-Za-z0-9]+) +in +([A-Za-z0-9.]+)/.exec(foreach.expression);
        if (expression == null) {
            throw new Error(`Invalid expression in foreach found in running task: ${foreach.expression}`);
        }
        let list: any[] = ObjectPropertyLocator.lookup(request, expression[2]);
        if(request[expression[1]] != null){
            throw new Error(`foreach names its iterated item ${expression[1]}, but the request body already has a property with that name, fix the configuration and use another name on the foreach expression`);
        }
        let requestCopy: {} = JSON.parse(JSON.stringify(request));
        list.forEach(item => {
            requestCopy[expression[1]] = item;
            if (foreach.folder) {
                if (foreach.folder.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.folder.includeif, requestCopy)) {
                        return;
                    }
                }
                this.processFolder(requestCopy, foreach.folder, targetpath);
            } else if (foreach.atmpl) {
                if (foreach.atmpl.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.atmpl.includeif, requestCopy)) {
                        return;
                    }
                }
                this.processAtmpl(requestCopy, foreach.atmpl, targetpath);
            } else if (foreach.static) {
                if (foreach.static.includeif) {
                    if (!TemplateProcessor.evaluateBoolean(foreach.static.includeif, requestCopy)) {
                        return;
                    }
                }
                this.processStatic(requestCopy, foreach.static, targetpath);
            } else {
                throw new Error(`foreach with expression ${foreach.expression} does not have a valid inner element (atmpl|static|folder) in task ${request['$blueprint']}:${request['$task']}`);
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
                    throw new Error("Invalid element found in contents for folder " + folder.name + " in blueprint file: " + element);
                }
            });

        }
    }
}