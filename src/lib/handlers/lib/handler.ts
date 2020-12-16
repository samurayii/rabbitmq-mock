import { ICodecDecodeMessage } from "../../codec";
import { IState, IResultMessage } from "../../response_builder";
import { IHandler } from "../interfaces";

export class Handler implements IHandler {

    // eslint-disable-next-line @typescript-eslint/ban-types
    private _handler: Function

    constructor (
        private readonly _id: string,
        file_path: string
    ) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        import(file_path).then( (handler: Function) => {
            this._handler = handler;
        });
    }

    get id (): string {
        return this._id;
    }

    exec (result_message: IResultMessage, original_message: ICodecDecodeMessage, current_stage: IState): void {
        this._handler(result_message, original_message, current_stage);
    }

}