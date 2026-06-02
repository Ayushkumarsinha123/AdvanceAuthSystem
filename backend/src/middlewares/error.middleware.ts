import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import {env} from '../config/env.config.js'
import { AppError } from "../utils/AppError.js";

export const errorHandler : ErrorRequestHandler = (
  error : Error,
  req : Request,
  res : Response,
  next : NextFunction
) : void => {
  let statusCode = 500;
  let message = 'internal server error';
  let errors : any[] | undefined = undefined;

  // handle our custom operational errors

  if(error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // safely capture Zod validation failure globally
  if(error.name === 'ZodError') {
    statusCode = 400;
    message = 'validation failed';
    errors = (error as any).errors?.map((e: any) => ({
      field: e.path[1] || e.path[0],
      message: e.message,
    }));
  }

  if(statusCode === 500) {
    console.log('system breakdown', error);
  }

  res.status(statusCode).json({
    success : false,
    message,
    ...(errors && {errors}),
    ...(env.NODE_ENV === 'development' && {stack : error.stack}),
  });
};