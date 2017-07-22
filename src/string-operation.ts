import { StringContainer } from "@artifacter/common";

/**
 * @class StringOperation
 * 
 * Runs a defined String Operation for use with post processors
 */
export class StringOperation {

    private operation: Function;

    constructor(stringOperation: string){
        this.operation = this[stringOperation];
    }

    public run(inputStr: string): string{
        return this.operation(inputStr);
    }

    private allLowerCase(str: string): string {
        return str.toLowerCase();
    }

    private allUpperCase(str: string): string {
        return str.toUpperCase();
    }

    private startWithUpperCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    private startWithLowerCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.substr(1);
    }

    private blanksToCamelCase(str: string): string {
        let words: string[] = str.split(" ");
        if (words.length <= 1) {
            return str;
        } else {
            let camelCase: StringContainer = new StringContainer();
            let firstLoop: boolean = true;
            words.forEach(word => {
                if (firstLoop) {
                    camelCase.append(word);
                    firstLoop = false;
                } else {
                    camelCase.append(this.startWithUpperCase(word));
                }
            });
            return camelCase.toString();
        }
    }

}