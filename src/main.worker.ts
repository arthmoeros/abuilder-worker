import * as fs from "fs-extra";
import * as uuid from "uuid/v1";
import * as zipFolder from "folder-zip-sync";
import * as shelljs from "shelljs";

import { BlueprintProcessor } from "./blueprint.processor";
import { tmpFilesFolder, configurationsFolder } from "./paths";

/**
 * @class MainWorker
 * @see npm @qsdt/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class runs the Blueprint Processor through a temporary working folder, and
 * manages its posterior deletion, returning a Buffer containing the zip result of
 * the artifact generation.
 * 
 */
export class MainWorker {

	/**
	 * Runs the worker, it creates the temporary working folder, and packages
	 * the generated artifacts into a zip file. It also handles the deletion
	 * of temporary files created during its execution.
	 * 
     * @param blueprint Blueprint's name
     * @param task task to use in the blueprint
     * @param workingFolder Path to the temporary working folder to store generated artifacts
	 */
	public run(blueprint: string, task: string, request: {}): string {
		let tmpName: string = uuid();
		let tmpFolder: string = this.generateTmpDir(tmpName);
		try {
			new BlueprintProcessor(blueprint, task, tmpFolder).run(request);
			zipFolder(tmpFolder, tmpFolder + ".zip");
			return tmpName;
		} catch (error) {
			throw error;
		} finally {
			shelljs.rm("-rf", tmpFolder);
		}
	}

	/**
	 * Generates temporary folders for generated artifacts and zip file
	 */
	private generateTmpDir(dirName: string): string {
		fs.mkdirSync(tmpFilesFolder + dirName);
		return tmpFilesFolder + dirName;
	}
}