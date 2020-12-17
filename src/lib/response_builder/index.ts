import * as fs from "fs";
import * as path from "path";
import { ILogger } from "logger-flx";
import { ICodecDecodeMessage } from "../codec";
import { IDestination } from "../router";
import { IResponseBuilder, IResultMessage, IState } from "./interfaces";
import * as handlebars from "handlebars";
import { IHandlers } from "../handlers";
import * as chalk from "chalk";

export * from "./interfaces";

type THandlebarsContext = {
    destination?: string
    type?: string
    routing_key?: string
    handler: string | string[]
    headers: {
        [key: string]: string
    }
    properties: {
        [key: string]: string
    }
    body?: unknown
    state: IState
}

export class ResponseBuilder implements IResponseBuilder {

    constructor (
        private readonly _name: string,
        private readonly _logger: ILogger
    ) {}

    build (destination: IDestination, message: ICodecDecodeMessage, state: IState, handlers: IHandlers): IResultMessage {
/*
console.log("response build -----");
console.log("destination:");
console.log(JSON.stringify(destination, null, 2));
console.log("message:");
console.log(JSON.stringify(message, null, 2));
console.log("--------");
*/
        const result_message: IResultMessage = {
            headers: {},
            properties: {},
            body: ""
        };

        const handlebars_context: THandlebarsContext = {
            destination: destination.destination,
            type: destination.type,
            routing_key: destination.routing_key,
            headers: message.headers,
            properties: message.properties,
            handler: destination.handler,
            state: state
        };

        if (destination.destination !== undefined) {
            handlebars_context.destination = destination.destination;
        }

        if (destination.type !== undefined) {
            handlebars_context.type = destination.type;
        }

        if (destination.routing_key !== undefined) {
            handlebars_context.routing_key = destination.routing_key;
        }

        if (Buffer.isBuffer(message.body) === false) {
            handlebars_context.body = message.body;
        }

        if (destination.clone_headers === true) {
            result_message.headers = JSON.parse(JSON.stringify(message.headers));
        }

        if (destination.headers !== undefined) {
            for (const key in destination.headers) {
                result_message.headers[key] = destination.headers[key];
            }
        }

        if (destination.clone_properties === true) {
            result_message.properties = JSON.parse(JSON.stringify(message.properties));
        }

        if (destination.properties !== undefined) {
            for (const key in destination.properties) {
                result_message.properties[key] = destination.properties[key];
            }
        }
         
        if (destination.content.text !== undefined) {
            result_message.body = `${destination.content.text}`;
        }

        if (destination.content.json !== undefined) {

            if (typeof destination.content.json === "object") {
                result_message.body = JSON.parse(JSON.stringify(destination.content.json));
            } else {
                result_message.body = JSON.parse(`${destination.content.json}`);
            }

        }

        if (destination.content.file !== undefined) {

            const full_file_path = path.resolve(process.cwd(), destination.content.file.path);

            if (destination.content.file.type === "buffer") {
                result_message.body = fs.readFileSync(full_file_path);
            }
    
            if (destination.content.file.type !== "json") {
                result_message.body = JSON.parse(fs.readFileSync(full_file_path).toString());
            }
    
            if (destination.content.file.type !== "text") {
                result_message.body = fs.readFileSync(full_file_path).toString();
            }

        }

        if (typeof result_message.body === "object") {
            const template = handlebars.compile(JSON.stringify(result_message.body));
            result_message.body = template(handlebars_context);
        }

        if (typeof result_message.body === "string" || typeof result_message.body === "number") {
            const template = handlebars.compile(`${result_message.body}`);
            result_message.body = template(handlebars_context);
        }

        const headers_template = handlebars.compile(JSON.stringify(result_message.headers));
        const properties_template = handlebars.compile(JSON.stringify(result_message.properties));
        
        result_message.headers = JSON.parse(headers_template(handlebars_context));
        result_message.properties = JSON.parse(properties_template(handlebars_context));

        if (destination.destination !== undefined) {
            const template = handlebars.compile(result_message.destination);
            result_message.destination = template(handlebars_context);
        }

        if (destination.type !== undefined) {
            const template = handlebars.compile(result_message.type);
            result_message.type = template(handlebars_context);
        }

        if (destination.routing_key !== undefined) {
            const template = handlebars.compile(result_message.routing_key);
            result_message.routing_key = template(handlebars_context);
        }

        if (typeof destination.handler === "string") {
            destination.handler = [destination.handler];
        }

        for (const handler_name of destination.handler) {

            if (handlers.exist(handler_name) === false) {

                this._logger.error(`[Mock:${chalk.cyan(this._name)}] Handler ${chalk.gray(handler_name)} not found`);
                
            } else {
                
                const handler = handlers.get(handler_name);
    
                handler.exec(result_message, message, state);
    
            }

        }

/*
        console.log("response build (result) -----");
        console.log("original message:");
        console.log(JSON.stringify(message, null, 2));
        console.log("result message:");
        console.log(JSON.stringify(result_message, null, 2));
        console.log("--------");
*/
        return result_message;

    }

}