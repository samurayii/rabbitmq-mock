import { Message } from "amqplib";
import { IConverter } from "../interfaces";

export class CodecText implements IConverter {

    private readonly _type: string = "text"

    get type (): string {
        return this._type;
    }
    
    convert (message: Message): unknown {
        return message.content.toString();
    }

}