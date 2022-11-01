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
      default:
        res.status(400).send({
          message: err.message,
          type: 'UnknownValidationError',
          data: {},
        });
        break;
    }
  } else if (err instanceof NotFoundError) {
    res.status(404).send({
      message: err.message,
      type: 'NotFound',
      data: {},
    });
  } else if (err instanceof ConstraintViolationError) {
    res.status(404).send({
      message: err.message,
      type: 'NotFound',
      data: {},
    });
  } else if (err instanceof UniqueViolationError) {
    res.status(409).send({
      message: err.message,
      type: 'UniqueViolation',
      data: {
        columns: err.columns,
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof NotNullViolationError) {
    res.status(400).send({
      message: err.message,
      type: 'NotNullViolation',
      data: {
        column: err.column,
        table: err.table,
      },
    });
  } else if (err instanceof ForeignKeyViolationError) {
    res.status(409).send({
      message: err.message,
      type: 'ForeignKeyViolation',
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof CheckViolationError) {
    res.status(400).send({
      message: err.message,
      type: 'CheckViolation',
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof DataError) {
    res.status(400).send({
      message: err.message,
      type: 'InvalidData',
      data: {},
    });
  } else if (err instanceof DBError) {
    res.status(500).send({
      message: err.message,
      type: 'UnknownDatabaseError',
      data: {},
    });
  } else {
    res.status(500).send({
      message: err.message,
      type: 'UnknownError',
      data: {},
    });
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
