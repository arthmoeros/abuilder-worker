import * as fs from 'fs';
export const tmpFilesFolder: string = process.env.ARTIFACTER_TMP || __dirname + "/../tmp/";

let config = process.env.ARTIFACTER_CONFIG;
if (config != null && !fs.existsSync(config)) {
    console.log(`ARTIFACTER_CONFIG env path does not exists('${config}')`);
    console.log('If you are using a Docker Image, run it mounting this filesystem with your own configuration by adding this arg to the run command:');
    console.log(`-v <host-path>:${config}`);
    config = __dirname + "/../config/";
    console.log(`fallbacking to sample configuration '${config}'`);
} else if (config == null) {
    config = __dirname + "/../config/";
}
export const configurationsFolder: string = config;