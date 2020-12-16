import { ICodecDecodeMessage } from "../codec";
import { IState } from "../response_builder";
import { IResultMessage } from "../response_builder";

export interface IHandlers {
    get: (handler_name: string) => IHandler
    exist: (handler_name: string) => boolean
    readonly list: string[]
}

export interface IHandler {
    readonly id: string
    exec: (result_message: IResultMessage, original_message: ICodecDecodeMessage, current_stage: IState) => void
}