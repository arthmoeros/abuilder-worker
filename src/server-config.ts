import * as fs from "fs";
import * as col from "colors/safe";

export class ServerConfig {
    
    /**
     * Server config JSON @see ./config/server-config.json
     */
    private static readonly config: any = ServerConfig.initConfig();

    private static initConfig(): any {
        console.info(col.gray("Reading configuration located at " + __dirname + "/../config/server-config.json"));
        return JSON.parse(fs.readFileSync(__dirname + "/../config/server-config.json").toString());
    }

    public static get readConfig(): any {
        return ServerConfig.config;
    }
}