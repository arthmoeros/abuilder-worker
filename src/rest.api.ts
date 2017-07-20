import { RestService, RestMethod, ContentType } from "@artifacter/common";
import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as shelljs from "shelljs";

import { MainWorker, tmpFilesFolder, configurationsFolder } from "./main.worker";
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

	private static readonly

	/**
	 * Requests an artifact generation and responds synchronously with an uuid
	 * to retrieve the generated artifacts
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.POST,
		resource: "/artifacts",
		requestContentType: ContentType.applicationJson,
		responseContentType: ContentType.applicationJson
	})
	public createArtifact(req: Request, res: Response, next: NextFunction) {
		let generatorName: string = req.body["$generator"];
		let task: string = req.body["$task"];
		if (ServerConfig.readConfig.debugInputMaps) {
			console.log("[DEBUG] Got input map with following values:");
			console.log(req.body);
		}
		let worker: MainWorker = new MainWorker();
		let tmpName: string = worker.run(generatorName, task, req.body);
		res.setHeader("Location", "/artifacts/" + tmpName);
		res.status(201);
		res.end();
	}

	/**
	 * Retrieves a generated artifacts file using an uuid, once is retrieved it expires
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.GET,
		resource: "/artifacts/:uuid",
		requestContentType: ContentType.urlEncoded,
		responseContentType: ContentType.applicationZip
	})
	public getArtifact(req: Request, res: Response, next: NextFunction) {
		let uuid: string = req.params['uuid'];
		if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid)) {
			res.sendStatus(400);
			res.end();
			return;
		}

		if (!fs.existsSync(tmpFilesFolder + "/" + uuid + ".zip")) {
			res.sendStatus(404);
			res.end();
			return;
		}

		let zipFile: Buffer = fs.readFileSync(tmpFilesFolder + "/" + uuid + ".zip");

		shelljs.rm("-f", tmpFilesFolder + "/" + uuid + ".zip");

		res.setHeader('Content-disposition', 'attachment; filename=generatedArtifacts.zip');
		res.send(200);
		res.end(zipFile);
	}

	/**
	 * Retrieves a list of available configurations for Artifacter
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.GET,
		resource: "/configurations",
		requestContentType: ContentType.urlEncoded,
		responseContentType: ContentType.applicationJson
	})
	public getConfigurations(req: Request, res: Response, next: NextFunction) {
		let configList: string[] = fs.readdirSync(configurationsFolder);
		let response: string[] = [];
		configList.forEach(config => {
			let jsonIndex: number = config.indexOf(".json");
			if (jsonIndex == -1) {
				return;
			}
			response.push(config.substring(0, jsonIndex));
		});
		if (response.length == 0) {
			res.status(404);
			res.end();
			return
		}
		res.status(200);
		res.end(JSON.stringify(response));
	}

	/**
	 * Retrieves a specific configuration for Artifacter with the id provided
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method: RestMethod.GET,
		resource: "/configurations/:id",
		requestContentType: ContentType.urlEncoded,
		responseContentType: ContentType.applicationJson
	})
	public getConfiguration(req: Request, res: Response, next: NextFunction) {
		let id: string = req.params['id'];
		if(/[/\\]/.test(id)){
			res.status(400);
			res.end("I see what are you doing, it's not going to work :)");
			return;
		}
		if (id != null) {
			if (!fs.existsSync(configurationsFolder + id + ".json")) {
				res.status(404);
				res.end();
				return;
			}
			let configuration: string = fs.readFileSync(configurationsFolder + id + ".json").toString();
			res.status(200);
			res.end(configuration);
		} else {
			res.status(400);
			res.end();
		}
	}

}