#!/usr/bin/env node
import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";
import "./http";
import { Mocks } from "./lib/mocks";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);

Singleton("config", config);
Singleton(Logger.name, logger);

const api_server = new KoaD(config.api, "api-server");
const mocks = new Mocks(config.mock, logger);

Singleton(Mocks.name, mocks);

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;

        await mocks.run();

        await api_server.listen( () => {
            logger.info(`[api-server] listening on network interface ${api_server.config.listening}${api_server.prefix}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.log(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", async () => {
    logger.log("Termination signal received");
    await mocks.close();
    process.exit();
});