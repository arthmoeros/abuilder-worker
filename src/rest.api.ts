import { RestService, RestMethod, ContentType } from "@artifacter/common";

import { MainWorker } from "./main.worker";
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
	 * Requests an artifact generation and responds synchronously with a zip file
	 * containing the result of the generation.
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestService({
		method : RestMethod.POST,
		resource : "/artifactGenerationRequest",
		requestContentType : ContentType.applicationJson,
		responseContentType : ContentType.applicationZip
	})
	public requestArtifactGeneration(req, res, next) {
		let generatorName: string = req.body.generator;
		let formFunction: string = req.body.formFunction;
		let map: Map<string, string> = new Map<string, string>();
		for (var key in req.body.map) {
			map.set(key, req.body.map[key]);
		}
		if(ServerConfig.readConfig.debugInputMaps){
			console.log("[DEBUG] Got input map with following values:");
			console.log(map);
		}
		let worker: MainWorker = new MainWorker();
		let zipFile: Buffer = worker.run(generatorName, formFunction, map);

		res.end(zipFile);
	}

}