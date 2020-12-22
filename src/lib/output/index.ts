import { EventEmitter } from "events";
import { IOutput, IOutputConfig } from "./interfaces";
import { connect, Connection, Channel } from "amqplib";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";
import { IResultMessage } from "../response_builder";

export * from "./interfaces";

type TRabbitmqOptions = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [key: string]: string | object
    headers?: {
        [key: string]: string
    }
}

export class Output extends EventEmitter implements IOutput {

    private _running_flag: boolean
    private _reconnect_flag: boolean;
    private _close_connection_flag: boolean;
    private _push_flag: boolean;
    private _channel: Channel;
    private _connection: Connection;

    constructor (
        private readonly _name: string,
        private readonly _config: IOutputConfig,
        private readonly _logger: ILogger
    ) {
        super();

        this._running_flag = false;

        if (this._config.url !== undefined) {

            const arg = this._config.url.match(/((.+)\:(.+)@|)([-a-zA-Z0-9_.]{1,256})\:*([0-9]{1,5}|)/);

            if (arg) {
    
                if (arg[2]) {
                    this._config.user = arg[2];
                }
    
                if (arg[3]) {
                    this._config.password = arg[3];
                }
                
                if (arg[4]) {
                    this._config.host = arg[4];
                }
                
                if (arg[5] && arg[5] !== "") {
                    this._config.port = parseInt(arg[5]);
                }
    
            }
        }

    }

    async run (): Promise<void> {

        if (this._running_flag === true) {
            return;
        }

        this._running_flag = true;

        this._createChannel();

        return;
    }

    async close (): Promise<void> {

        if (this._running_flag === false) {
            return;
        }

        this._disconnect();

        this._running_flag = false;

        return;
    }

    _createChannel(): void {

        this._logger.info(`[Mock:${chalk.cyan(this._name)}:output] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}`, "dev");

        this._reconnect_flag = false;

        connect({
            protocol: "amqp",
            hostname: this._config.host,
            port: this._config.port,
            username: this._config.user,
            password: this._config.password,
            vhost: this._config.v_host,
            heartbeat: this._config.heartbeat
        }).then( (connection) => {

            this._logger.info(`[Mock:${chalk.cyan(this._name)}:output] Creation of connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} ${chalk.green("succeeded")}`, "dev");

            connection.createChannel().then( (channel) => {

                this._logger.info(`[Mock:${chalk.cyan(this._name)}:output] Creation of channel to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} ${chalk.green("succeeded")}`, "dev");

                connection.on("error", (error) => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Problem in connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`);
                        this._reconnect();
                    }
                });

                connection.on("close", () => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} closed`);
                        this._reconnect();
                    }
                });

                channel.on("error", (error) => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Channel problem in connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`);
                        this._reconnect();
                    }
                });

                channel.on("close", () => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Connection channel to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} closed`);
                        this._reconnect();
                    }
                });

                this._channel = channel;
                this._connection = connection;

                this._close_connection_flag = false;
                this._push_flag = true;

                

            }).catch( (error) => {

                this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Connection creation to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed. ${error}`);
                this._logger.log(error.stack, "debug");
                this._reconnect();

            });

        }).catch( (error) => {

            this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed. ${error}`);
            this._logger.log(error.stack, "debug");
            this._reconnect();

        });

    }

    _reconnect(): void {

        if (this._reconnect_flag === false) {

            this._logger.log(`[Mock:${chalk.cyan(this._name)}:output] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} will be recreated in ${this._config.reconnect_interval} seconds`);

            this._reconnect_flag = true;
            this._push_flag = false;

            try {
                this._connection.close();
            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Close connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed.`);
            }

            this._channel = undefined;
            this._connection = undefined;

            setTimeout( () => {
                this._createChannel();
            }, this._config.reconnect_interval*1000);

        }

    }

    _disconnect(): void {

        if (this._close_connection_flag === false) {

            this._close_connection_flag = true;
            this._push_flag = false;

            try {
                this._connection.close();
            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Close connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed.`);
            }
    
            this._channel = undefined;
            this._connection = undefined;

        }

    }

    push (message: IResultMessage): void {
        
        if (this._push_flag === true) {

            const options: TRabbitmqOptions = {};

            let destination = this._config.default.destination;
            let routing_key = this._config.default.routing_key;
            let type = this._config.default.type;

            if (message.destination !== undefined) {
                destination = message.destination;
            }

            if (message.routing_key !== undefined) {
                routing_key = message.routing_key;
            }

            if (message.type !== undefined) {
                type = message.type;
            }

            for (const key in this._config.default.options) {
                options[key] = this._config.default.options[key];
            }

            for (const key in message.properties) {
                options[key] = message.properties[key];
            }

            options.headers = {};

            for (const key in message.headers) {
                options.headers[key] = message.headers[key];
            }

            try {   

                if (typeof message.body === "object") {
                    message.body = JSON.stringify(message.body);
                }

                if (type === "exchange") {
            
                    try {
                        this._channel.publish(destination, routing_key, Buffer.from(`${message.body}`), options);
                        this._logger.log(`[Mock:${chalk.cyan(this._name)}:output] message sended to exchange ${chalk.gray(destination)}`, "dev");
                    } catch (error) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Sending message to exchange ${chalk.gray(destination)}. ${error.message}`);
                        this._logger.log(error.stack, "debug");
                    }
        
                } else {
                    
                    try {
                        this._channel.sendToQueue(destination, Buffer.from(`${message.body}`), options);
                        this._logger.log(`[Mock:${chalk.cyan(this._name)}:output] message sended to queue ${chalk.gray(destination)}`, "dev");
                    } catch (error) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Sending message to queue ${chalk.gray(destination)}. ${error.message}`);
                        this._logger.log(error.stack, "debug");
                    }
        
                }

            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Send message. ${error.message}`);
                this._logger.log(error.stack);
            }

        } else {
            this._logger.error(`[Mock:${chalk.cyan(this._name)}:output] Impossible send message`);
        }

        return;

    }
    
}