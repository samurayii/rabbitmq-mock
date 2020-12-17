import * as fs from "fs";
import * as path from "path";
import * as route_schema from "./lib/route_schema.json";
import * as chalk from "chalk";
import * as Ajv from "ajv";
import jtomler from "jtomler";
import json_from_schema from "json-from-default-schema";
import { ILogger } from "logger-flx";
import { Route } from "./lib/route";
import { IDestination, IRoute, IRouteConfig, IRouter } from "./interfaces";
import { ICodecDecodeMessage } from "../codec";

export * from "./interfaces";

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


export class Router implements IRouter {

    private _routes_list: {
        [key: string]: IRoute
    }

    constructor (
        folder: string,
        private readonly _logger: ILogger
    ) {

        this._routes_list = {};

        const full_folder_path = path.resolve(process.cwd(), folder);

        if (!fs.existsSync(full_folder_path)) {
            fs.mkdirSync(full_folder_path, {
                recursive: true
            });
            this._logger.log(`Routes folder ${chalk.grey(full_folder_path)} created`, "dev");
        }

        const files_list = getFilesList(full_folder_path);

        for (const full_file_path of files_list) {

            try {

                const id = full_file_path.replace(full_folder_path, "").replace(/(\\|\/)/, "");
                const route_config: IRouteConfig = <IRouteConfig>json_from_schema(jtomler(full_file_path), route_schema);

                const ajv_item = new Ajv();
                const validate = ajv_item.compile(route_schema);

                if (!validate(route_config)) {
                    this._logger.error(chalk.red(`[ERROR] Route file ${chalk.grey(full_file_path)} parsing error. Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`));
                    continue;
                }

                const route = new Route(id, route_config);

                this._routes_list[id] = route;

                this._logger.log(`Route ${chalk.grey(route.id)} loaded`, "dev");

            } catch (error) {
                this._logger.error(chalk.red(`[ERROR] Route file ${chalk.grey(full_file_path)} loading error. ${error.message}`));
                this._logger.log(error.stack);
            }

        }

    }

    get (message: ICodecDecodeMessage): IDestination {
        
        for (const id in this._routes_list) {

            const route = this._routes_list[id];

            if (route.check(message) === true) {

                return route.get();
            }

        }

    }

}