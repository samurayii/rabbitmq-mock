import { IApiServerConfig } from "../http";
import { ILoggerConfig } from "logger-flx";
import { IAuthorizationConfig } from "./authorization";
import { IMockConfig } from "./mock";

export interface IAppConfig {
    logger: ILoggerConfig
    api: IApiServerConfig
    authorization: IAuthorizationConfig
    mock: IMockConfig[]
}