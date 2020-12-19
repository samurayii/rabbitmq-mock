import { IInput, IInputMessage, Input } from "../input";
import { IMock, IMockConfig, IMockInfo } from "./interfaces";
import { ILogger } from "logger-flx";
import { IRouter } from "../router/interfaces";
import { Router } from "../router";
import { IResponseBuilder, IState, ResponseBuilder } from "../response_builder";
import { IOutput, Output } from "../output";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import jtomler from "jtomler";
import { Handlers, IHandlers } from "../handlers";

const getFilesList = (folder: string, files_list: string[]  = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.(json|yml|toml)$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

export * from "./interfaces";

export class Mock implements IMock {
    
    private readonly _input: IInput
    private readonly _output: IOutput
    private readonly _router: IRouter
    private readonly _response_builder: IResponseBuilder
    private readonly _handlers: IHandlers
    private _running_flag: boolean
    private _current_state: IState
    private _snapshot_state: IState
    
    constructor (
        private readonly _config: IMockConfig,
        private readonly _logger: ILogger
    ) {

        this._current_state = {};
        this._snapshot_state = {};
        this._running_flag = false;

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

        this._router = new Router(this._config.routes_path, this._logger);
        this._response_builder = new ResponseBuilder(this._config.name, this._logger);

        this._input = new Input(this._config.name, {
            reconnect_interval: this._config.reconnect_interval,
            v_host: this._config.v_host,
            heartbeat: this._config.heartbeat,
            url: this._config.url,
            user: this._config.user,
            password: this._config.password,
            host: this._config.host,
            port: this._config.port,
            ...this._config.input
        }, this._logger);

        this._output = new Output(this._config.name, {
            reconnect_interval: this._config.reconnect_interval,
            v_host: this._config.v_host,
            heartbeat: this._config.heartbeat,
            url: this._config.url,
            user: this._config.user,
            password: this._config.password,
            host: this._config.host,
            port: this._config.port,
            ...this._config.output
        }, this._logger);

        this._input.on("message", (message: IInputMessage) => {

            this._logger.log(`[Mock:${chalk.cyan(this._config.name)}] >> received message:`, "debug");
            this._logger.log(message.message, "debug");

            const destination_config = this._router.get(message.message);
            
            if (destination_config !== undefined) {

                try {
                    
                    const result_message = this._response_builder.build(destination_config, message.message, this._current_state, this._handlers);

                    this._output.push(result_message);

                    this._logger.log(`[Mock:${chalk.cyan(this._config.name)}] << sended message:`, "debug");
                    this._logger.log(result_message, "debug");

                } catch (error) {
                    this._logger.error(`[Mock:${chalk.cyan(this._config.name)}] Response building. ${error}`);
                    this._logger.log(error.stack, "debug");
                }

            }

            this._input.resolve(message.id);

        });

        if (this._config.state_path !== undefined) {

            const full_state_path = path.resolve(process.cwd(), this._config.state_path);

            if (fs.existsSync(full_state_path) === false) {
                this._logger.error(`[Mock:${chalk.cyan(this._config.name)}] State path ${chalk.grey(full_state_path)} not found`);
                process.exit(1);
            }

            const stat = fs.statSync(full_state_path);

            if (stat.isDirectory() === true) {

                const files = getFilesList(full_state_path);

                for (const file_path of files) {

                    const state = <IState>jtomler(file_path);

                    this._logger.log(`[Mock:${chalk.cyan(this._config.name)}] State file ${chalk.grey(file_path)} loaded`, "dev");

                    for (const key in state) {
                        this._current_state[key] = state[key];
                    }

                }
            }

            if (stat.isFile() === true) {
                this._snapshot_state = <IState>jtomler(full_state_path);
                this.reset();
                this._logger.log(`[Mock:${chalk.cyan(this._config.name)}] State file ${chalk.grey(full_state_path)} loaded`, "dev");
            }

        }

        this._handlers = new Handlers(this._config.name, this._config.handlers_path, this._logger);

    }

    get name (): string {
        return this._config.name;
    }

    get thread (): string {
        return this._config.thread;
    }

    get enable (): boolean {
        return this._config.enable;
    }

    get info (): IMockInfo {
        return {
            enable: this._config.enable,
            name: this._config.name
        };
    }

    get state (): IState {
        return this._current_state;
    }

    get handlers (): string[] {
        return Object.keys(this._handlers.list);
    }

    reset (): void {
        this._current_state = JSON.parse(JSON.stringify(this._snapshot_state));
    }

    changeState (state: IState): IState {
        
        for (const key in state) {
            this._current_state[key] = state[key];
        }

        return this._current_state;
    }

    deleteState (state_list: string[]): IState {
        
        for (const key of state_list) {
            delete this._current_state[key];
        }

        return this._current_state;
    }

    async run (): Promise<void> {

        if (this._config.enable === false || this._running_flag === true) {
            return;
        }

        this._running_flag = true;

        this._input.run();
        this._output.run();

        return;
    }

    async close (): Promise<void> {

        if (this._config.enable === false || this._running_flag === false) {
            return;
        }

        this._input.close();
        this._output.close();

        this._running_flag = false;

        return;
    }
}