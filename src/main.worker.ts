import * as archiver from "archiver";
import * as fs from "fs-extra";
import * as uuid from "uuid/v1";
import * as shelljs from "shelljs";
import { Archiver } from "archiver";

const tmpFilesFolder: string = __dirname + "/../tmp/";
export class MainWorker {

	public run(generatorKey: string, generatorComponent: string, formFunction: string, map: Map<string, string>, callback: any) {
		var generator = require("../config/abgenerator/" + generatorComponent);
		let tmpFolder: string = this.generateTmpDir();
		eval("generator." + formFunction + "(generatorKey, tmpFolder, map)");

		let archive: Archiver = archiver.create("zip");
		var output = fs.createWriteStream(tmpFolder + "_zip/out.zip");
		
		archive.on("end", function(){
			console.log("Se cerró la wea");
			let zipFile = fs.readFileSync(tmpFolder + "_zip/out.zip");
			fs.emptyDirSync(tmpFolder);
			fs.unlinkSync(tmpFolder + "_zip/out.zip");
			fs.rmdirSync(tmpFolder);
			callback(zipFile);
		});
		archive.directory(tmpFolder, "");
		archive.pipe(output);
		archive.finalize();
	}

	private generateTmpDir(): string {
		let dirName: string = uuid();
		fs.mkdirSync(tmpFilesFolder + dirName);
		fs.mkdirSync(tmpFilesFolder + dirName + "_zip");
		return tmpFilesFolder + dirName;
	}
}