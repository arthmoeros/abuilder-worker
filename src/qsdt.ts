import * as fs from "fs";
import * as shelljs from "shelljs";

import { tmpFilesFolder, configurationsFolder } from "./paths";
import { MainWorker } from "./main.worker";
import { PostSubmitProcessor } from "./post-submit.processor";
import { BlueprintManager, FormManager } from '@qsdt/common';
import { ManagerLocator } from "./manager.locator";

/**
 * @class QSDT
 * 
 * This class provides all four available operations on QSDT, if it is required
 * to handle artifact generation programmaticly, it can be done using an instance
 * of this class.
 */
export class QSDT {

    private managerLocator: ManagerLocator = new ManagerLocator();

    /**
     * Requests an artifact generation, it requires a valid Request Object to work,
     * when the request is done, an UUID number is returned to request the resulting
     * artifacts from the generation.
     * @param request Request Object based on an existing configuration
     */
    public async requestArtifactGeneration(request: any): Promise<string> {
        let blueprintName: string = request["$blueprint"];
        let task: string = request["$task"];
        if (blueprintName == null || task == null) {
            throw new Error("400 Request Object is not valid");
        }
        let formConfiguration = JSON.parse(await this.getForm(request.$configuration));
        PostSubmitProcessor.run(request, formConfiguration);
        let worker: MainWorker = new MainWorker();
        return worker.run(blueprintName, task, request);
    }

    /**
     * Retrieves the generated artifacts in a ZIP file, this file is stored temporarily,
     * once is retrieved it is deleted.
     * @param uuid Identifier for the generated artifacts
     */
    public getGeneratedArtifacts(uuid: string): Buffer {
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid)) {
            throw new Error("400 UUID Invalid Format");
        }

        if (!fs.existsSync(tmpFilesFolder + "/" + uuid + ".zip")) {
            throw new Error("404 Artifacts not found");
        }

        let zipFile: Buffer = fs.readFileSync(tmpFilesFolder + "/" + uuid + ".zip");
        shelljs.rm("-f", tmpFilesFolder + "/" + uuid + ".zip");
        return zipFile;
    }

    /**
     * Retrieves a list of presumably valid form configuration ids on the configuration path
     * of QSDT
     */
    public async getForms(): Promise<string[]> {
        let configList: string[] = fs.readdirSync(configurationsFolder + "form/");
        let response: string[] = await this.managerLocator.getFormManager().getFormsIndex();
        if (response.length == 0) {
            throw new Error("404 No form configurations found");
        }
        return response;
    }

    /**
     * Retrieves the contents of a identified form configuration file on QSDT
     * @param id configuration identifier
     */
    public async getForm(id: string): Promise<string> {
        return this.managerLocator.getFormManager().getForm(id);
    }

}