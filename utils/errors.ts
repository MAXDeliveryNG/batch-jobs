import { injectable } from 'inversify';
import validator from 'validator';
import { DateService } from '../services/date-service';
import { formatObjectionErrors } from './objection-error-handler';

export enum HTTPStatus {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  OK = 200,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
  VALIDATION_ERROR = 422,
  UNAUTHORIZED_ERROR = 401,
  PERMISSION_ERROR = 403
}

@injectable()
export class FriendlyErrorUtil {
  private readonly ERROR_PREFIX = '::VEHICLE_SERVICE_KNOWN_ERROR::';

  protected createFriendlyError(message: string) {
    return new Error(`${this.ERROR_PREFIX}${message}`);
  }

  protected getFriendlyErrorMessage(err: any): {
    message?: string;
    code?: string;
    httpStatus?: number;
  } {
    let message: string = '';
    if (!err) {
      return { message };
    }

    if (err instanceof GenericFriendlyError) {
      return {
        message: err.message
      };
    }

    const objectionError = formatObjectionErrors(err);
    if (objectionError) {
      return { message: objectionError };
    }

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    if (message?.includes(this.ERROR_PREFIX)) {
      message = message
        .split(this.ERROR_PREFIX)
        .filter((x) => x)
        .join('');
      return {
        message
      };
    }
    return {
      message: ''
    };
  }

  protected validateRequiredString(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === 'string')) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join('; ')}.`);
    }
  }

  protected validateRequiredUUID(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && validator.isUUID(value))) {
        console.log({ uuid: value });
        errors.push(`${key} MUST be valid uuid`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join('; ')}.`);
    }
  }

  protected validateRequiredNumber(keyValueValidates: { [key: string]: number }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(!isNaN(Number(value)) && typeof value === 'number')) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join('; ')}.`);
    }
  }

  protected validateRequiredDayStamp_YYYY_MM_DD(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!DateService.isValidFormat_YYYY_MM_DD(value)) {
        errors.push(`${key} is required and must be valid date format: YYYY-MM-DD`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join('; ')}.`);
    }
  }
}

export type IGenericFriendlyErrorParams = {
  error: string | Error;
  httpStatus?: number;
  code?: string | number;
  subject?: string;
};

function resolveErrorParams({
  errorOption,
  httpStatusX,
  codeX
}: {
  errorOption: IGenericFriendlyErrorParams | string | Error;
  httpStatusX?: number;
  codeX?: string | number;
}) {
  let message: string = 'Unknown Error';
  let httpStatus: number = httpStatusX || 500;
  let code: string | number = codeX || 'E000';
  if (typeof errorOption === 'string') {
    message = errorOption;
  } else if (errorOption instanceof Error) {
    message = errorOption.message;
  } else if (typeof errorOption === 'object') {
    if (errorOption.error instanceof Error) {
      message = errorOption.error.message;
    } else if (typeof errorOption.error === 'string') {
      message = errorOption.error;
    }
    if (errorOption?.httpStatus) {
      httpStatus = errorOption?.httpStatus;
    }
    if (errorOption?.code) {
      code = errorOption?.code;
    }
    if (errorOption?.subject) {
      message = `${errorOption.subject}:: ${message}`;
    }
  }
  return { httpStatus, message, code };
}

export class GenericFriendlyError extends Error {
  readonly httpStatus: number;
  readonly code: string | number;

  constructor(errorOption: IGenericFriendlyErrorParams | string | Error, httpStatus?: number, code?: string | number) {
    super(resolveErrorParams({ errorOption }).message);
    const { httpStatus: status01, code: code01 } = resolveErrorParams({
      errorOption,
      httpStatusX: httpStatus,
      codeX: code
    });
    this.httpStatus = status01;
    this.code = code01;
  }

  static fromError({ error, httpStatus, code }: IGenericFriendlyErrorParams) {
    return new GenericFriendlyError({ error, httpStatus, code });
  }

  static create(msg: string, httpStatus = HTTPStatus.BAD_REQUEST) {
    return new GenericFriendlyError(msg, httpStatus);
  }

  static throwNew(msg: string, httpStatus: HTTPStatus) {
    throw new GenericFriendlyError(msg, httpStatus);
  }

  static createUnAuthorizedError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.UNAUTHORIZED_ERROR);
  }

  static createBadRequestError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.BAD_REQUEST);
  }

  static createNotFoundError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.NOT_FOUND);
  }
}
