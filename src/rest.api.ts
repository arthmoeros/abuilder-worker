import { MainWorker } from "./main.worker";
import { RestMethod, RestRequestType, RestResponseType } from "./metadata-definitions";


/**
 * @class WorkerHttpApiServer
 * @version 0.9.0
 * @see npm @ab/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This singleton class starts up a express server, serving the REST api
 * to request artifact generation to the Worker
 * 
 */
export class RestApi {

	private datito: string = "" ;

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