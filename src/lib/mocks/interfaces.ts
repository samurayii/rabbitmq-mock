import { IMock } from "../mock/interfaces";

export interface IMocks {
    run: () => Promise<void>
    close: () => Promise<void>
    exist: (mock_name: string) => boolean
    get: (mock_name: string) => IMock
    readonly list: string[]
}