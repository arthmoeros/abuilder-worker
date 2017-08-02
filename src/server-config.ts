import * as fs from "fs";
import * as col from "colors/safe";
import { configurationsFolder } from "./paths";

export class ServerConfig {

    /**
     * Server config JSON @see ./config/server-config.json
     */
    private static readonly config: any = ServerConfig.initConfig();

    private static initConfig(): any {
        console.info(col.gray("Reading configuration located at " + configurationsFolder + "/server-config.json"));
        return JSON.parse(fs.readFileSync(configurationsFolder + "/server-config.json").toString());
    }

    public static get readConfig(): any {
        return ServerConfig.config;
    }
}