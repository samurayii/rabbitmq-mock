import { Message } from "amqplib";
import { IConverter } from "../interfaces";

export class CodecJson implements IConverter {

    private readonly _type: string = "json"

    get type (): string {
        return this._type;
    }
    
    convert (message: Message): unknown {
        return JSON.parse(message.content.toString());
    }

}