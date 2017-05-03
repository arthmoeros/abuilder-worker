import { Application, Router } from "express";
import { Annotation } from "@ab/common";

import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as cors from "cors";
import * as fs from "fs";

import { RestApi } from "./rest.api";

/**
 * @class WorkerHttpApiServer
 * @version 0.9.0
 * @see npm @ab/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This singleton class starts up a nodejs express server, serving the REST api available
 * to request artifact generation to the Worker
 * 
 */
export class RestExpressServer {

    /**
     * Singleton instance
     */
    private static readonly instance: RestExpressServer = new RestExpressServer();

    public static start() {
    }

    /**
     * Express.js reference
     */
    private expressApp: Application;

    /**
     * Node server reference
     */
    private server;

    /**
     * Server config JSON @see ./config/server-config.json
     */
    private config: any;

    /**
     * Creates the singleton
     */
    private constructor() {
        this.config = JSON.parse(fs.readFileSync(__dirname+"/../config/server-config.json").toString());

        this.expressApp = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.expressApp.set("port", this.config.listenPort);
        this.server = http.createServer(this.expressApp);
        this.server.listen(this.config.listenPort);
        console.info("Server started - listening to port "+this.config.listenPort);
    }

    /**
     * Setups de Middleware, CORS uses allowed hosts to invoke this API
     */
    private setupMiddleware() {
        this.expressApp.use(cors(this.config.corsOptions));
        this.expressApp.use(logger("dev"));
    }

    /**
     * Sets the routes using the decorators @RestMethod, @RestRequestType and @RestResponseType
     * on the methods contained into the RestApi class
     */
    private setupRoutes() {
        let router: Router = express.Router();
        let restApi: RestApi = new RestApi();
        let members: string[] = Object.getOwnPropertyNames(RestApi.prototype);

        members.forEach(member => {
            if (typeof restApi[member] == "function") {
                let restMethod = Reflect.getMetadata(Annotation.RestMethod, restApi, member);
                let reqType = Reflect.getMetadata(Annotation.RestRequestType, restApi, member);
                let resType = Reflect.getMetadata(Annotation.RestResponseType, restApi, member);
                if(restMethod){
                    if(!reqType && !resType){
                        console.warn("WARNING: method "+member+" is annotated with @RestMethod but it doesn't define @RestRequestType and @RestResponseType, this method will be skipped");
                    }else{
                        router.post(restMethod, this.resolveBodyParser(reqType), (req, res, next) => {
                            res.contentType(resType);
                            eval("restApi."+member+"(req,res,next);");
                        })
                    }
                }
            }
        });
        this.expressApp.use(router);
    }

    private resolveBodyParser(contentType: string) : express.RequestHandler{
        if(contentType == "application/json"){
            return bodyParser.json();
        }else if(contentType == "text/plain"){
            return bodyParser.text();
        }else if(contentType == "application/x-www-form-urlencoded"){
            return bodyParser.urlencoded();
        }else{
            return bodyParser.raw();
        }
    }

}