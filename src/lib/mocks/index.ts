import { ILogger } from "logger-flx";
import { Mock } from "../mock";
import { IMock, IMockConfig } from "../mock/interfaces";
import { IMocks } from "./interfaces";

export * from "./interfaces";

export class Mocks implements IMocks {

    private readonly _mock_list: {
        [key: string]: IMock
    }

    constructor (
        private readonly _config: IMockConfig[],
        private readonly _logger: ILogger
    ) {

        this._mock_list = {};

        for (const mock_config of this._config) {
            
            const mock = new Mock(mock_config, this._logger);
            const id = mock.name;
            
            this._mock_list[id] = mock;

        }

    }

    get list (): string[] {
        return Object.keys(this._mock_list);
    }

    exist (mock_name: string): boolean {
        if (this._mock_list[mock_name] === undefined) {
            return false;
        }
        return true;
    }

    get (mock_name: string): IMock {
        if (this._mock_list[mock_name] !== undefined) {
            return this._mock_list[mock_name];
        }
    }

    async run (): Promise<void> {

        for (const id in this._mock_list) {
            const mock = this._mock_list[id];
            mock.run();
        }

    }

    async close (): Promise<void> {

        for (const id in this._mock_list) {
            const mock = this._mock_list[id];
            mock.close();
        }

    }

}