import { MainWorker } from "./main.worker";
import { Archiver } from "archiver";
import * as fs from "fs";

var main = new MainWorker();
let map: Map<string,string> = new Map<string,string>();
map.set("a","1");
map.set("v","2");
map.set("d","3");
//let zipFile: Buffer = main.run("","sample-arch-osb-gen.component","generateSampleArchOSB1",map);
main.run("","sample-arch-osb-gen.component","generateSampleArchOSB1",map, function(zipfile){
	console.log(zipfile);
});