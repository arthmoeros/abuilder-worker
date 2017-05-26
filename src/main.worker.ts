import * as fs from "fs-extra";
import * as uuid from "uuid/v1";
import * as zipFolder from "folder-zip-sync";
import * as shelljs from "shelljs";

import { GeneratorProcessor } from "./generator.processor";

export const tmpFilesFolder: string = "./tmp/";
/**
 * @class MainWorker
 * @see npm @artifacter/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class runs the Generator Processor through a temporary working folder, and
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
     * @param generator Generator's name
     * @param formFunction FormFunction to use in the generator
     * @param workingFolder Path to the temporary working folder to store generated artifacts
	 */
	public run(generator: string, formFunction: string, map: Map<string, string>): string {
		let tmpName: string = uuid();
		let tmpFolder: string = this.generateTmpDir(tmpName);
		try {
			new GeneratorProcessor(generator, formFunction, tmpFolder).run(map);
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