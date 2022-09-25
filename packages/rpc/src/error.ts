import { RPCErrorCodes } from './typings/types.js';

export class RPCError extends Error {
	public code: RPCErrorCodes;

	public override message: string = '';

	public override get name() {
		return `RpcError${RPCErrorCodes[this.code]}`;
	}

	public constructor(errorCode: RPCErrorCodes, message?: string, options?: ErrorOptions) {
		super(message, options);

		this.code = errorCode;
		this.message = message ?? this.message;
	}
}
