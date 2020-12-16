import { ICodecDecodeMessage } from "../codec";

export interface IRouteConfig {
    route: {
        description: string
        headers: string[]
        properties: string[]
        body: string[]
    }
    body: IDestination
}

export interface IDestination {
    destination: string
    type: string
    routing_key: string
    handler: string | string[]
    clone_headers: boolean
    clone_properties: boolean
    headers?: {
        [key: string]: string
    }
    properties?: {
        [key: string]: string
    }
    content: {
        file?: {
            path: string
            type: string
        }
        text?: string
        json?: {
            [key: string]: unknown
        }
    }
}

export interface IRouter {
    get: (message: ICodecDecodeMessage) => IDestination
}

export interface IRoute {
    check: (message: ICodecDecodeMessage) => boolean
    get: () => IDestination
    readonly description: string
    readonly id: string
}