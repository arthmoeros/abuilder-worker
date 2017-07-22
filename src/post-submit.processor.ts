import { ObjectPropertyLocator } from "@artifacter/common";
import * as fs from "fs";

import { StringOperation } from "./string-operation";
import { configurationsFolder } from "./paths";

/**
 * @class PostSubmitProcessor
 * Runs the Declared Post Processors, after a submitted request is recieved
 */
export class PostSubmitProcessor{

    public static run(requestBody: any){
        let configuration = PostSubmitProcessor.locateConfiguration(requestBody.$configuration);
        let declaredPostProcessors = PostSubmitProcessor.locateForm(configuration, requestBody.$task).$declaredPostProcessors;
        for(let key in declaredPostProcessors){
            let value: string = ObjectPropertyLocator.lookup(requestBody, key);
            if(value == null){
                continue;
            }
            let postProcessors: string[] = declaredPostProcessors[key];
            if(postProcessors == null){
                continue;
            }
            postProcessors.forEach(processor => {
                let operation: string[] = processor.split(".");
                if(operation[0] == "string"){
                    value = new StringOperation(operation[1]).run(value);
                }
            });
            ObjectPropertyLocator.lookup(requestBody, key, value);
        }
    }

    private static locateConfiguration(configuration: string): any{
        return JSON.parse(fs.readFileSync(`${configurationsFolder}/configuration/${configuration}.json`).toString());
    }

    private static locateForm(configuration: any, task: string): any{
        let foundForm = null;
        console.log(configuration);
        configuration.$forms.forEach(form => {
            if(form.$requestSchema.$task == task){
                foundForm = form;
                return false;
            }
        });
        if(foundForm == null){
            throw new Error(`Task ${task} was not found in the specified configuration`);
        }
        return foundForm;
    }
}