// import { MainWorker } from "./main.worker";
// import { GeneratorProcessor } from "./generator.processor";
// import * as util from "util";
// import * as fs from "fs";

// var main = new MainWorker();
// let map: Map<string,string> = new Map<string,string>();
// map.set("a","1");
// map.set("b","2");
// map.set("c","3");
// let zipFile: Buffer = main.run("sample-arch-osb-gen","generateSampleArchOSB1",map);

import { WorkerHttpApiServer } from "./worker.http.api.server";

WorkerHttpApiServer.start();