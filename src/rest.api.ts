import { RestMethod, RestRequestType, RestResponseType } from "@ab/common";

import { MainWorker } from "./main.worker";

/**
 * @class RestApi
 * @see npm @ab/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class defines the methods available as a REST API, each method for this
 * purpose must be decorated with @RestMethod, @RestRequestType and @RestResponseType
 * 
 */
export class RestApi {

	/**
	 * Requests an artifact generations and responds synchronously with a zip file
	 * containing the result of the generation.
	 * @param req 
	 * @param res 
	 * @param next 
	 */
	@RestMethod("/requestArtifactGeneration")
	@RestRequestType("application/json")
	@RestResponseType("application/zip")
	public requestArtifactGeneration(req, res, next) {
		let generatorName: string = req.body.generator;
		let formFunction: string = req.body.formFunction;
		let map: Map<string, string> = new Map<string, string>();
		for (var key in req.body.map) {
			map.set(key, req.body.map[key]);
		}
		let worker: MainWorker = new MainWorker();
		let zipFile: Buffer = worker.run(generatorName, formFunction, map);

		res.end(zipFile);
	}

}