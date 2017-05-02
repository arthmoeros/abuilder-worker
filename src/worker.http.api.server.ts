import { Application, Router } from "express";
import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as cors from "cors";
import { MainWorker } from "./main.worker";

export class WorkerHttpApiServer{

    private static readonly instance: WorkerHttpApiServer = new WorkerHttpApiServer();

    public static start(){
    }

    private expressApp: Application;
    private server;

    private constructor(){
        this.expressApp = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.expressApp.set("port", 8080);
        this.server = http.createServer(this.expressApp);
        this.server.listen(8080);
    }

    private setupMiddleware(){
        this.expressApp.use(cors());
        this.expressApp.use(logger("dev"));
    }

    private setupRoutes(){
        let router: Router = express.Router();

        router.post("/requestArtifactGeneration", bodyParser.json(), (req, res, next) => {
            let generatorName : string = req.body.generator;
            let formFunction : string = req.body.formFunction;
            let map : Map<string,string> = new Map<string,string>();
            for(var key in req.body.map){
                map.set(key, req.body.map[key]);
            }
            console.log(map);
            let worker : MainWorker = new MainWorker();
            let zipFile : Buffer = worker.run(generatorName, formFunction, map);
            
            res.contentType("application/zip");
            res.end(zipFile);
        });

        // router.post("/test", bodyParser.urlencoded(), (req,res,next) => {
        //     console.log(req.body);
        //     res.end();
        // });

        // router.post("/testJson",bodyParser.json(),(req,res,next) => {
        //     console.log(req.body);
        //     res.end();
        // });

        // router.post("/testText", bodyParser.text(), (req,res,next) => {
        //     console.log(req.body);
        //     res.end();
        // });

        // router.post("/testRaw", bodyParser.raw(), (req,res,next) => {
        //     console.log(req.body);
        //     res.end();
        // });
        this.expressApp.use(router);
    }
    
}