import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import { IMocks, Mocks } from "../../lib/mocks";
import * as chalk from "chalk";

@Controller("/v1/mocks", "api-server")
export class RouteMocks {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _mocks: IMocks = <IMocks>Catalog(Mocks)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/", "api-server")
    async list (ctx: Context): Promise<void> {

        const result = this._mocks.list;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

}