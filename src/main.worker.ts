import * as fs from "fs-extra";
import * as uuid from "uuid/v1";
import * as zipFolder from "folder-zip-sync";
import * as shelljs from "shelljs";

import { GeneratorProcessor } from "./generator.processor";

const tmpFilesFolder: string = "./tmp/";
/**
 * @class MainWorker
 * @version 0.9.0
 * @see npm @ab/worker
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
	public run(generator: string, formFunction: string, map: Map<string, string>): Buffer {
		let tmpFolder: string = this.generateTmpDir();
		try {
			new GeneratorProcessor(generator, formFunction, tmpFolder).run(map);
			zipFolder(tmpFolder, tmpFolder + "_zip/out.zip");

			let zipFile: Buffer = fs.readFileSync(tmpFolder + "_zip/out.zip");
			return zipFile;
		} catch (error) {
			throw error;
		} finally {
			shelljs.rm("-rf", tmpFolder);
			shelljs.rm("-rf", tmpFolder + "_zip");
		}
	}

	/**
	 * Generates temporary folders for generated artifacts and zip file
	 */
	private generateTmpDir(): string {
		let dirName: string = uuid();
		fs.mkdirSync(tmpFilesFolder + dirName);
		fs.mkdirSync(tmpFilesFolder + dirName + "_zip");
		return tmpFilesFolder + dirName;
	}
}