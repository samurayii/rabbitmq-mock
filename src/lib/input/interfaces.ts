import { EventEmitter } from "events";
import { ICodecDecodeMessage } from "../codec";

export interface IInputConfig {
    codec: string
    fast_ack: boolean
    reconnect_interval: number
    url: string
    user: string
    password: string
    host: string
    port: number
    v_host: string
    heartbeat: number
    parallel: number
    queue: {
        name: string
        pattern: string
        options: {
            [key: string]: string
        }
    }
    exchange?: {
        name: string
        type: string
        options: {
            [key: string]: string
        }
    }
}

export interface IInput extends EventEmitter {
    run: () => Promise<void>
    close: () => Promise<void>
    resolve: (id_message: string) => void
    reject: (id_message: string) => void
    readonly queue: string
    readonly pattern: string
    readonly codec: string
}

export interface IInputMessage {
    id: string
    message: ICodecDecodeMessage
}