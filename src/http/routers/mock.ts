import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get, Post } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import { IMocks, Mocks } from "../../lib/mocks";
import * as chalk from "chalk";
import Ajv from "ajv";

const post_state_schema = {
    type: "object"
};

const delete_state_schema = {
    type: "array",
    items: {
        type: "string",
        minLength: 0,
        maxLength: 256
    },
    minItems: 1
};

const ajv = new Ajv();
const validate_change_state = ajv.compile(post_state_schema);
const validate_delete_state = ajv.compile(delete_state_schema);

@Controller("/v1/mock", "api-server")
export class RouteMock {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _mocks: IMocks = <IMocks>Catalog(Mocks)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/:name/exist", "api-server")
    async exist (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        ctx.body = { 
            status: "success",
            data: list.includes(name)
        };
        
        ctx.status = 200;
    
    }

    @Get("/:name/info", "api-server")
    async info (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {
            const mock = this._mocks.get(name);
            ctx.body = { 
                status: "success",
                data: mock.info
            };
        }

        ctx.status = 200;
    
    }

    @Get("/:name/handlers", "api-server")
    async handlers (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {
            const mock = this._mocks.get(name);
            ctx.body = { 
                status: "success",
                data: mock.handlers
            };
        }

        ctx.status = 200;
    
    }

    @Get("/:name/state", "api-server")
    async state (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {
            const mock = this._mocks.get(name);
            ctx.body = { 
                status: "success",
                data: mock.state
            };
        }

        ctx.status = 200;
    
    }

    @Post("/:name/state/change", "api-server")
    async change_state (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {

            if (ctx.request.body === undefined) {
                throw new Error("Request body empty");
            }
    
            const valid = validate_change_state(ctx.request.body);
    
            if (!valid) {
                throw new Error(`Schema errors:\n${JSON.stringify(validate_change_state.errors, null, 2)}`);
            }

            const mock = this._mocks.get(name);
            
            mock.changeState(ctx.request.body);
            
            ctx.body = { 
                status: "success",
                data: mock.state
            };
        }

        ctx.status = 200;
    
    }

    @Post("/:name/state/delete", "api-server")
    async delete_state (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {

            if (ctx.request.body === undefined) {
                throw new Error("Request body empty");
            }
    
            const valid = validate_delete_state(ctx.request.body);
    
            if (!valid) {
                throw new Error(`Schema errors:\n${JSON.stringify(validate_delete_state.errors, null, 2)}`);
            }

            const mock = this._mocks.get(name);
            
            mock.deleteState(ctx.request.body);
            
            ctx.body = { 
                status: "success",
                data: mock.state
            };
        }

        ctx.status = 200;
    
    }

    @Get("/:name/reset", "api-server")
    async reset (ctx: Context): Promise<void> {

        const name = ctx.params.name;
        const list = this._mocks.list;

        if (list.includes(name) === false) {
            ctx.body = { 
                status: "fail",
                message: `Mock named "${name}" not found`
            };
        } else {
            
            const mock = this._mocks.get(name);

            mock.reset();

            ctx.body = { 
                status: "success",
                data: mock.state
            };
        }

        ctx.status = 200;
    
    }

}