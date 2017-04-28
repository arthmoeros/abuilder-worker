import * as fs from "fs";

export function generateSampleArchOSB1(generatorKey: string, tmpFolder: string, map: Map<string,string>){
	fs.writeFileSync(tmpFolder+"/test.txt", "sadfsa df sadf ads f asd f sdaf");
}