import { ICodec, ICodecDecodeMessage, IConverter } from "./interfaces";
import { CodecJson } from "./lib/codec_json";
import { CodecBuffer } from "./lib/codec_buffer";
import { CodecText } from "./lib/codec_text";
import { Message } from "amqplib";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";

export * from "./interfaces";

export class Codec implements ICodec {

    private readonly _codec:  IConverter

    constructor (
        private readonly _name: string,
        private readonly _type: string,
        private readonly _logger: ILogger
    ) {

        if (this._type === "buffer") {
            this._codec = new CodecBuffer();
        }

        if (this._type === "text") {
            this._codec = new CodecText();
        }

        if (this._type === "json") {
            this._codec = new CodecJson();
        }

        if (this._codec === undefined) {
            this._logger.error(`[Mock:${chalk.cyan(this._name)}] Codec ${this._type} not supported`);
            process.exit(1);
        }

    }

    get type (): string {
        return this._codec.type;
    }

    decode (message: Message): ICodecDecodeMessage {
        
        const result_message: ICodecDecodeMessage = {
            properties: {},
            headers: {},
            body: this._codec.convert(message)
        };

        if (typeof message.properties === "object") {

            const message_properties = JSON.parse(JSON.stringify(message.properties));

            if (typeof message_properties.headers === "object") {
                result_message.headers = message_properties.headers;
            }

            delete message_properties.headers;

            for (const key in message_properties) {
                result_message.properties[key] = message_properties[key];
            }

        }

        return result_message;

    }

}