import { ILogger } from "logger-flx";
import { IHandler, IHandlers } from "./interfaces";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { Handler } from "./lib/handler";

export * from "./interfaces";

const getFilesList = (folder: string, files_list: string[]  = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.js$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

export class Handlers implements IHandlers {

    private readonly _handlers_list: {
        [key: string]: IHandler
    }

    constructor (
        name: string,
        folder: string,
        private readonly _logger: ILogger
    ) {

        this._handlers_list = {};

        const full_folder_path = path.resolve(process.cwd(), folder);

        if (fs.existsSync(full_folder_path) === false) {
            fs.mkdirSync(full_folder_path, {
                recursive: true
            });
            this._logger.log(`Handlers folder ${chalk.grey(full_folder_path)} created`, "dev");
        }

        const handlers_file_path_list = getFilesList(full_folder_path);

        for (const handler_file_path of handlers_file_path_list) {

            const id = handler_file_path.replace(full_folder_path, "").replace(/^(\/|\\)/gi, "").replace(/\.js$/gi, "");
            const handler = new Handler(id, handler_file_path);

            this._handlers_list[id] = handler;

            this._logger.log(`[Mock:${chalk.cyan(name)}] Handler file ${chalk.grey(handler_file_path)} loaded. Id: ${chalk.grey(id)}`, "dev");

        }

    }

    get list (): string[] {
        return Object.keys(this._handlers_list);
    }

    exist (handler_name: string): boolean {
        if (this._handlers_list[handler_name] === undefined) {
            return false;
        }
        return true;
    }

    get (handler_name: string): IHandler {
        if (this._handlers_list[handler_name] !== undefined) {
            return this._handlers_list[handler_name];
        }
    }

}