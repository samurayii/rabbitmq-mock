import { EventEmitter } from "events";
import { IInput, IInputConfig, IInputMessage } from "./interfaces";
import { connect, Connection, Channel, Message} from "amqplib";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";
import { v4 as uuid } from "uuid";
import { Codec, ICodec } from "../codec"; 

export * from "./interfaces";

export class Input extends EventEmitter implements IInput {

    private _running_flag: boolean
    private _reconnect_flag: boolean;
    private _close_connection_flag: boolean;
    private _channel: Channel;
    private _connection: Connection;
    private _message_list: {
        [key: string]: Message
    }
    private readonly _codec: ICodec

    constructor (
        private readonly _name: string,
        private readonly _config: IInputConfig,
        private readonly _logger: ILogger
    ) {
        super();

        this._running_flag = false;
        this._message_list = {};
        this._codec = new Codec(this._name, this._config.codec, this._logger);

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

    get queue (): string {
        return this._config.queue.name;
    }
    get pattern (): string {
        return this._config.queue.pattern;
    }
    get codec (): string {
        return this._config.codec;
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

        this._logger.info(`[Mock:${chalk.cyan(this._name)}:input] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}`, "dev");

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

            this._logger.info(`[Mock:${chalk.cyan(this._name)}:input] Creation of connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} ${chalk.green("succeeded")}`, "dev");

            connection.createChannel().then( (channel) => {

                this._logger.info(`[Mock:${chalk.cyan(this._name)}:input] Creation of channel to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} ${chalk.green("succeeded")}`, "dev");

                channel.prefetch(this._config.parallel);

                connection.on("error", (error) => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Problem in connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`);
                        this._reconnect();
                    }
                });

                connection.on("close", () => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} closed`);
                        this._reconnect();
                    }
                });

                channel.on("error", (error) => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Channel problem in connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`);
                        this._reconnect();
                    }
                });

                channel.on("close", () => {
                    if (this._reconnect_flag === false && this._close_connection_flag === false) {
                        this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Connection channel to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} closed`);
                        this._reconnect();
                    }
                });

                this._channel = channel;
                this._connection = connection;

                this._close_connection_flag = false;


                this._channel.assertQueue(this._config.queue.name, this._config.queue.options).then( () => {

                    if (this._config.exchange !== undefined) {
        
                        this._logger.log(`[Mock:${chalk.cyan(this._name)}:input] Binding queue ${chalk.grey(this._config.queue.name)} to exchange ${chalk.grey(this._config.exchange.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}`);
        
                        this._channel.assertExchange(this._config.exchange.name, this._config.exchange.type, this._config.exchange.options).then( () => {
        
                            this._channel.bindQueue(this._config.queue.name, this._config.exchange.name, this._config.queue.pattern).then( () => {
                                
                                this._logger.log(`[Mock:${chalk.cyan(this._name)}:input] Queue ${chalk.grey(this._config.queue.name)} binded to exchange ${chalk.grey(this._config.exchange.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}`);
        
                                this._consume();
        
                            }).catch( (error) => {
                                this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Binding queue ${chalk.grey(this._config.queue.name)} to exchange ${chalk.grey(this._config.exchange.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`);
                                this._logger.log(error);
                                this._reconnect();
                            });
        
                        }).catch( (error) => {
                            this._logger.error(chalk.red(`[Mock:${chalk.cyan(this._name)}:input] Creating exchange ${chalk.grey(this._config.exchange.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`));
                            this._logger.log(error);
                            this._reconnect();
                        });
        
                    } else {
                        this._consume();
                    }
        
                }).catch( (error) => {
                    console.error(chalk.red(`Error creating queue ${chalk.grey(this._config.queue.name)} on rabbitmq server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`));
                    console.error(chalk.red(error));
                    this._reconnect();
                });

            }).catch( (error) => {

                this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Connection creation to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed. ${error}`);
                this._logger.log(error.stack, "debug");
                this._reconnect();

            });

        }).catch( (error) => {

            this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed. ${error}`);
            this._logger.log(error.stack, "debug");
            this._reconnect();

        });

    }

    _consume (): void {

        this._channel.consume(this._config.queue.name, (message: Message) => {
                    
            try {
              
                const id = uuid();
                const input_message: IInputMessage = {
                    id: id,
                    message: this._codec.decode(message)
                };

                if (this._config.fast_ack === true) {
                    this._channel.nack(message, false, false);
                } else {
                    this._message_list[id] = message;
                }

                this.emit("message", input_message);

            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Error parsing message. ${error.message}`);
                this._logger.log(error.stack);
            }

        }, { consumerTag: uuid() }).then( () => {

            this._logger.log(`[Mock:${chalk.cyan(this._name)}:input] Created subscription to queue ${chalk.grey(this._config.queue.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}`);

        }).catch( (error) => {

            this._logger.error(chalk.red(`[Mock:${chalk.cyan(this._name)}:input] Error creating subscription to queue ${chalk.grey(this._config.queue.name)} on server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)}. ${error}`));
            this._logger.error(chalk.red(error));
            this._reconnect();

        });

    }

    _reconnect(): void {

        if (this._reconnect_flag === false) {

            this._logger.log(`[Mock:${chalk.cyan(this._name)}:input] Connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} will be recreated in ${this._config.reconnect_interval} seconds`);

            this._reconnect_flag = true;

            try {
                this._connection.close();
            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Close connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed.`);
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

            try {
                this._connection.close();
            } catch (error) {
                this._logger.error(`[Mock:${chalk.cyan(this._name)}:input] Close connection to server ${chalk.grey(this._config.host)}:${chalk.grey(this._config.port)} failed.`);
            }
    
            this._channel = undefined;
            this._connection = undefined;

        }

    }

    resolve (id_message: string): void {

        if (this._message_list[id_message] !== undefined) {

            const server_message = this._message_list[id_message];

            this._channel.nack(server_message, false, false);

            delete this._message_list[id_message];

        }

    }

    reject (id_message: string): void {

        if (this._message_list[id_message]) {

            const server_message = this._message_list[id_message];

            this._channel.reject(server_message);

            delete this._message_list[id_message];

        }

    }

}