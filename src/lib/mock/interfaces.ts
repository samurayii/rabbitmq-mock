import { IInputConfig } from "../input";
import { IOutputConfig } from "../output";
import { IState } from "../response_builder";

export interface IMockConfig {
    name: string
    enable: boolean
    thread: string
    reconnect_interval: number
    url: string
    user: string
    password: string
    host: string
    port: number
    heartbeat: number
    v_host: string
    routes_path: string
    handlers_path: string
    state_path: string
    input: IInputConfig
    output: IOutputConfig
}

export interface IMock {
    run: () => Promise<void>
    close: () => Promise<void>
    reset: () => void
    changeState: (state: IState) => IState
    deleteState: (state: string[]) => IState
    readonly info: IMockInfo
    readonly name: string
    readonly thread: string
    readonly enable: boolean
    readonly handlers: string[]
    readonly state: IState
}

export interface IMockInfo {
    name: string
    enable: boolean
}

