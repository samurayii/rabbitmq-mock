import { Message } from "amqplib";

export interface ICodecDecodeMessage {
    headers: {
        [key: string]: string
    }
    properties: {
        [key: string]: string
    }
    body: unknown
}


export interface ICodec {
    decode: (message: Message) => ICodecDecodeMessage
    readonly type: string
}

export interface IConverter {
    convert: (message: Message) => unknown
    readonly type: string
}