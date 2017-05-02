import * as fs from "fs-extra";
import * as uuid from "uuid/v1";
import * as zipFolder from "folder-zip-sync";
import * as shelljs from "shelljs";

import { GeneratorProcessor } from "./generator.processor";

const tmpFilesFolder: string = "./tmp/";
export class MainWorker {

	public run(generator: string, formFunction: string, map: Map<string, string>): Buffer {
		let tmpFolder: string = this.generateTmpDir();
		try {
			GeneratorProcessor.find(generator, formFunction, tmpFolder).run(map);
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

	private generateTmpDir(): string {
		let dirName: string = uuid();
		fs.mkdirSync(tmpFilesFolder + dirName);
		fs.mkdirSync(tmpFilesFolder + dirName + "_zip");
		return tmpFilesFolder + dirName;
	}
}