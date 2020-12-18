import { Message } from "amqplib";
import { IConverter } from "../interfaces";

export class CodecBuffer implements IConverter {

    private readonly _type: string = "buffer"

    get type (): string {
        return this._type;
    }
    
    convert (message: Message): unknown {
        return message.content;
    }

}