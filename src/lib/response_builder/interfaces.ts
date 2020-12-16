import { IHandlers } from "../handlers";
import { ICodecDecodeMessage } from "../codec";
import { IDestination } from "../router";

export interface IResponseBuilder {
    build: (destination: IDestination, message: ICodecDecodeMessage, state: IState, handlers: IHandlers) => IResultMessage
}

export interface IResultMessage {
    headers: {
        [key: string]: string
    }
    properties: {
        [key: string]: string
    }
    destination?: string
    type?: string
    routing_key?: string
    body: unknown
}

export interface IState {
    [key: string]: unknown
}