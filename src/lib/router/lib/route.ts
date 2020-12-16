import { ICodecDecodeMessage } from "../../codec";
import { IDestination, IRoute, IRouteConfig } from "../interfaces";

type TJson = {
    [key: string]: string
}

export class Route implements IRoute {

    constructor (
        private readonly _id: string,
        private readonly _config: IRouteConfig
    ) {}

    get description (): string {
        return this._config.route.description;
    }
    get id (): string {
        return this._id;
    }

    check (message: ICodecDecodeMessage): boolean {
    
        for (const item of this._config.route.headers) {   

            const key = item.split("=", 1)[0].replace(/^\^/i, "");
            const value = item.replace(`${key}`, "").replace("=", "").replace(/^\^/i, "");
            const invert_flag = /^\^/i.test(item);

            if (invert_flag === true) {

                if (message.headers[key] !== undefined) {

                    if (value === undefined || value === "") {
                        return false;
                    }
                    
                    if (message.headers[key] === value) {
                        return false;
                    }

                }

            } else {

                if (message.headers[key] === undefined) {
                    return false;
                }

                if (value !== undefined && value !== "") {
                    if (message.headers[key] !== value) {
                        return false;
                    }
                }

            }

        }

        for (const item of this._config.route.properties) {   

            const key = item.split("=", 1)[0].replace(/^\^/i, "");
            const value = item.replace(`${key}`, "").replace("=", "").replace(/^\^/i, "");
            const invert_flag = /^\^/i.test(item);

            if (invert_flag === true) {

                if (message.properties[key] !== undefined) {

                    if (value === undefined || value === "") {
                        return false;
                    }
                    
                    if (message.properties[key] === value) {
                        return false;
                    }

                }

            } else {

                if (message.properties[key] === undefined) {
                    return false;
                }

                if (value !== undefined && value !== "") {
                    if (message.properties[key] !== value) {
                        return false;
                    }
                }

            }

        }

        if (typeof message.body === "object" && Array.isArray(message.body) === false) {

            for (const item of this._config.route.body) {   

                const key = item.split("=", 1)[0].replace(/^\^/i, "");
                const value = item.replace(`${key}`, "").replace("=", "").replace(/^\^/i, "");
                const invert_flag = /^\^/i.test(item);
                const body: TJson = <TJson>message.body;
    
                if (invert_flag === true) {
    
                    if (body[key] !== undefined) {
    
                        if (value === undefined || value === "") {
                            return false;
                        }
                        
                        if (body[key] === value) {
                            return false;
                        }
    
                    }
    
                } else {
    
                    if (body[key] === undefined) {
                        return false;
                    }
    
                    if (value !== undefined && value !== "") {
                        if (body[key] !== value) {
                            return false;
                        }
                    }
    
                }
    
            }

        }

        if (typeof message.body !== "object" && this._config.route.body.length > 0) {
            return false;
        }

        return true;

    }

    get (): IDestination {
        return this._config.body;
    }

}