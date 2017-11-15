import { BlueprintManager, FormManager } from '@qsdt/common';

const QSDT_STORAGE_MANAGER = process.env.QSDT_STORAGE_MANAGER || "@qsdt/core-storage-fs";
export class ManagerLocator {

    public getBlueprintManager(): BlueprintManager {
        if(require(QSDT_STORAGE_MANAGER).StorageManagerProvider){
            return require(QSDT_STORAGE_MANAGER).StorageManagerProvider.getInstance().getBlueprintManager();
        }else{
            throw new Error(`Specified Storage Manager ${QSDT_STORAGE_MANAGER} does not export a valid StorageManagerProvider`);
        }
    }

    public getFormManager(): FormManager { 
        if(require(QSDT_STORAGE_MANAGER).StorageManagerProvider){
            return require(QSDT_STORAGE_MANAGER).StorageManagerProvider.getInstance().getFormManager();
        }else{
            throw new Error(`Specified Storage Manager ${QSDT_STORAGE_MANAGER} does not export a valid StorageManagerProvider`);
        }
    }

}