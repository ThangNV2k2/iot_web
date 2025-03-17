import { HttpError, IErrorResponse } from "../interfaces";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandler = (
  err: HttpError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.toObject());
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message,
  } as IErrorResponse);
};

export default errorHandler;