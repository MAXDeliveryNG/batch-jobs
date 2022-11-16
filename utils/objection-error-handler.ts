import {
  ValidationError,
  NotFoundError,
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
} from 'objection';
import { Response } from 'express';

export function formatObjectionErrors(err: Error): string | null {
  if (err instanceof ValidationError) {
    switch (err.type) {
      case 'ModelValidation':
        return err.message;
      case 'RelationExpression':
        return `Data Relation error occured`;
    }
  }
  if (err instanceof UniqueViolationError) {
    return `Unique key for: ${err.columns[0]}, violated.`;
  }
  if (err instanceof DataError) {
    return `Data format error occured`;
  }
  if (err instanceof ForeignKeyViolationError) {
    return `Foreign key violation occured.`;
  }
  if (err instanceof NotNullViolationError) {
    return `Value for: ${err.column}, cannot be null.`;
  }
  if (err instanceof ConstraintViolationError) {
    return `Data constraint violated`;
  }
  return null;
}

// In this example `res` is an express response object.
export function errorHandler(err: Error, res: Response) {
  if (err instanceof ValidationError) {
    switch (err.type) {
      case 'ModelValidation':
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: err.data,
        });
        break;
      case 'RelationExpression':
        res.status(400).send({
          message: err.message,
          type: 'RelationExpression',
          data: {},
        });
        break;
      case 'UnallowedRelation':
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: {},
        });
        break;
      case 'InvalidGraph':
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: {},
        });
        break;
        case 'NotFoundError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'ConstraintViolationError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'UniqueViolationError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'NotNullViolationError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'ForeignKeyViolationError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'CheckViolationError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'DataError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        case 'DBError':
          res.status(400).send({
            message: err.message,
            type: err.type,
            data: {},
          });
          break;
        default:
        res.status(400).send({
          message: err.message,
          type: 'UnknownValidationError',
          data: {},
        });
        break;
    }
  } 
}

/*
export type IErrorObject = {
  name: 'ValidationError';
  type: 'ModelValidation';
  data: {
    name: [
      {
        message: 'should NOT be shorter than 3 characters';
        keyword: 'minLength';
        params: {
          limit: 3;
        };
      },
    ];
  };
  statusCode: 400;
};
*/
