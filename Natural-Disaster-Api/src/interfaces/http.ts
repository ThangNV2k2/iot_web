import { StatusCodes } from "http-status-codes";

export interface IResponse<T = null> {
  message: string;
  data?: T;
}

export interface IErrorResponse<T = undefined> {
  message: string;
  details: T;
  code: string | number;
}

export class HttpError<T = undefined> extends Error {
  code?: number;
  details?: T;

  constructor(
    e: string | Error | unknown,
    code: number = StatusCodes.INTERNAL_SERVER_ERROR,
    details?: T
  ) {
    if (e instanceof Error) {
      super(e.message);
    } else if (typeof e === "string") {
      super(e);
    } else{
      super('Some thing error')
    }
    this.code = code;
    this.details = details;
  }

  toObject() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}