import { IResultMessage } from "../response_builder";

export interface IOutputConfig {
    reconnect_interval: number
    url: string
    host: string
    user: string
    password: string
    port: number
    v_host: string
    heartbeat: number
    default: {
        destination: string
        routing_key: string
        type: string
        options: {
            [key: string]: string
        }
    } 
}

export interface IOutput {
    run: () => Promise<void>
    close: () => Promise<void>
    push: (message: IResultMessage) => void
}