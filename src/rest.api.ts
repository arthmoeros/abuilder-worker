import { RestService, RestMethod, ContentType } from "@artifacter/common";
import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as shelljs from "shelljs";

import { MainWorker, tmpFilesFolder } from "./main.worker";
import { ServerConfig } from "./server-config";

/**
 * @class RestApi
 * @see npm @artifacter/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class defines the methods available as a REST API, each method for this
 * purpose must be decorated with @RestService
 * 
 */
export class RestApi {

	/**
	 * Requests an artifact generation and responds synchronously with an uuid
	 * to retrieve the generated artifacts
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.POST,
		resource: "/artifactGenerationRequest",
		requestContentType: ContentType.applicationJson,
		responseContentType: ContentType.applicationJson
	})
	public postArtifactGenerationRequest(req: Request, res: Response, next: NextFunction) {
		let generatorName: string = req.body.generator;
		let formFunction: string = req.body.formFunction;
		let map: Map<string, string> = new Map<string, string>();
		for (var key in req.body.map) {
			map.set(key, req.body.map[key]);
		}
		if (ServerConfig.readConfig.debugInputMaps) {
			console.log("[DEBUG] Got input map with following values:");
			console.log(map);
		}
		let worker: MainWorker = new MainWorker();
		let tmpName: string = worker.run(generatorName, formFunction, map);

		let jsonResponse: any = {};
		jsonResponse.artifactsUUID = tmpName;

		res.end(JSON.stringify(jsonResponse));
	}

	/**
	 * Retrieves a generated artifacts file using a uuid, once is retrieved it expires
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.GET,
		resource: "/generatedArtifacts",
		requestContentType: ContentType.urlEncoded,
		responseContentType: ContentType.applicationZip
	})
	public getGeneratedArtifacts(req: Request, res: Response, next: NextFunction) {
		let uuid: string = req.query['uuid'];
		if(!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid)){
			res.sendStatus(403);
			res.end();
			return;
		}

		if(!fs.existsSync(tmpFilesFolder + "/" + uuid + ".zip")){
			res.sendStatus(410);
			res.end();
			return;
		}

		let zipFile: Buffer = fs.readFileSync(tmpFilesFolder + "/" + uuid + ".zip");

		shelljs.rm("-f", tmpFilesFolder + "/" + uuid + ".zip");

		res.setHeader('Content-disposition', 'attachment; filename=generatedArtifacts.zip');
		res.end(zipFile);
	}

}