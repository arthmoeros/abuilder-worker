import "reflect-metadata";

export class Annotation {
	public static readonly RestMethod: string = "RestMethod:path";
	public static readonly RestRequestType: string = "RestResponseType:requestContentType";
	public static readonly RestResponseType: string = "RestResponseType:responseContentType";
}

export function RestMethod(path){
	return Reflect.metadata(Annotation.RestMethod, path);
}

export function RestRequestType(requestContentType){
	return Reflect.metadata(Annotation.RestRequestType, requestContentType);
}

export function RestResponseType(responseContentType){
	return Reflect.metadata(Annotation.RestResponseType, responseContentType);
}