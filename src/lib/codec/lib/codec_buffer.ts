import { ICodec, ICodecDecodeMessage } from "../interfaces";
import { Message } from "amqplib";

export class CodecBuffer implements ICodec {

    private readonly _type: string = "buffer"

    get type (): string {
        return this._type;
    }
    
    decode (message: Message): ICodecDecodeMessage {

        const result_message: ICodecDecodeMessage = {
            properties: {},
            headers: {},
            body: message.content
        };

        const message_properties = JSON.parse(JSON.stringify(message.properties));

        result_message.headers = message_properties.headers;

        delete message_properties.headers;

        for (const key in message_properties) {
            result_message.properties[key] = message_properties[key];
        }

        return result_message;
    }

}