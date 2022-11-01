import axios, { AxiosRequestConfig } from 'axios';
import { GenericFriendlyError } from '../utils/errors';
import { LoggingService } from './logger';

class MyHeaders {
  private _headers: Map<string, string[]>;
  private _normalizedNames: Map<string, string>;

  constructor() {
    this._headers = new Map();
    this._normalizedNames = new Map();
  }

  append(name: string, value: string | string[]) {
    const existingValues = this.getAll(name);
    if (!existingValues) {
      this.set(name, value);
    } else {
      this.set(name, value, existingValues);
    }
  }

  delete(name: string) {
    const lcName = name.toLowerCase();
    this._normalizedNames.delete(lcName);
    this._headers.delete(lcName);
  }

  get(name: string) {
    const values = this.getAll(name);
    if (values === null) {
      return null;
    }
    return values.length > 1 ? values : values[0];
  }

  has(name: string) {
    return this._headers.has(name.toLowerCase());
  }

  keys() {
    return Array.from(this._normalizedNames.values());
  }

  values() {
    return Array.from(this._headers.values());
  }

  private uniq(a: string[]) {
    return Array.from(new Set(a));
  }

  toJSON() {
    const serialized: { [header: string]: string } = {};
    this._headers.forEach((values, name) => {
      const split: string[] = [];
      values.forEach((v) => {
        split.push(...v.split(','));
      });
      const _name = this._normalizedNames.get(name);
      if (_name && split.length) {
        serialized[_name] = split.length > 1 ? split[0] : split[0];
      }
    });
    return serialized;
  }

  toArrayResult() {
    const obj = this.toJSON();
    const result: string[][] = [];
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (Array.isArray(val)) {
        val.forEach((val2) => {
          result.push([key, val2]);
        });
      } else {
        result.push([key, val]);
      }
    });
    return result;
  }

  private getAll(name: string) {
    return this.has(name) ? this._headers.get(name.toLowerCase()) || null : null;
  }

  private set(name: string, value: string | string[], oldValues?: string[]) {
    let _values: string[] = Array.isArray(value) ? [...value] : [value];
    if (oldValues) {
      _values = [..._values, ...oldValues];
    }
    _values = this.uniq(_values);
    this._headers.set(name.toLowerCase(), _values);
    this.setNormalizedName(name);
  }

  private setNormalizedName(name: string) {
    const lcName = name.toLowerCase();
    if (!this._normalizedNames.has(lcName)) {
      this._normalizedNames.set(lcName, name);
    }
  }
}

class HttpServiceBase {
  async post<T>({
    url,
    data,
    params,
    headers
  }: {
    url: string;
    data: any;
    params?: Record<string, string | number | boolean>;
    headers?: string[][];
  }) {
    try {
      const optionsData: AxiosRequestConfig = {};

      const appHeaders = new MyHeaders();
      appHeaders.append('Content-Type', 'application/json; charset=UTF-8');
      appHeaders.append('Accept', 'application/json');

      if (headers?.length) {
        for (const header of headers) {
          appHeaders.append(header[0], header[1]);
        }
      }
      optionsData.headers = appHeaders.toJSON();

      if (params) {
        optionsData.params = params;
      }

      LoggingService.info({ HTTP_TASK: 'Calling endpoint'.toUpperCase(), url, params });
      const resultData = await axios.post<T>(url, data, optionsData);

      return resultData?.data;
    } catch (error) {
      LoggingService.info({ HTTP_ERROR_TASK: 'Error Calling endpoint'.toUpperCase(), url, params });
      const errorObjectData = this.getAxiosError(error);
      const maxError = errorObjectData?.data;
      if (maxError?.message && typeof maxError.message === 'string') {
        throw GenericFriendlyError.create(maxError.message);
      }
      throw error;
    }
  }

  async put<T>({
    url,
    data,
    params,
    headers
  }: {
    url: string;
    data: any;
    params?: Record<string, string | number | boolean>;
    headers?: string[][];
  }) {
    try {
      const optionsData: AxiosRequestConfig = {};

      const appHeaders = new MyHeaders();
      appHeaders.append('Content-Type', 'application/json; charset=UTF-8');
      appHeaders.append('Accept', 'application/json');

      if (headers?.length) {
        for (const header of headers) {
          appHeaders.append(header[0], header[1]);
        }
      }
      optionsData.headers = appHeaders.toJSON();

      if (params) {
        optionsData.params = params;
      }

      LoggingService.info({ HTTP_TASK: 'Calling endpoint'.toUpperCase(), url, params });
      const resultData = await axios.put<T>(url, data, optionsData);

      return resultData?.data;
    } catch (error) {
      LoggingService.info({ HTTP_ERROR_TASK: 'Error Calling endpoint'.toUpperCase(), url, params });
      const errorObjectData = this.getAxiosError(error);
      const maxError = errorObjectData?.data;
      if (maxError?.message && typeof maxError.message === 'string') {
        throw GenericFriendlyError.create(maxError.message);
      }
      throw error;
    }
  }

  async get<T>({
    url,
    params,
    headers
  }: {
    url: string;
    params?: Record<string, string | number | boolean>;
    headers?: string[][];
  }) {
    try {
      const optionsData: AxiosRequestConfig = {};

      const appHeaders = new MyHeaders();
      appHeaders.append('Content-Type', 'application/json; charset=UTF-8');
      appHeaders.append('Accept', 'application/json');

      if (headers && headers.length) {
        for (const header of headers) {
          appHeaders.append(header[0], header[1]);
        }
      }
      optionsData.headers = appHeaders.toJSON();

      if (params) {
        optionsData.params = params;
      }

      LoggingService.info({ HTTP_TASK: 'Calling endpoint'.toUpperCase(), url, params });
      const resultData = await axios.get<T>(url, optionsData);

      return resultData?.data;
    } catch (error) {
      LoggingService.info({ HTTP_ERROR_TASK: 'Error Calling endpoint'.toUpperCase(), url, params });
      const errorObjectData = this.getAxiosError(error);
      const maxError = errorObjectData?.data;
      if (maxError?.message && typeof maxError.message === 'string') {
        throw GenericFriendlyError.create(maxError.message);
      }
      throw error;
    }
  }

  private getAxiosError<T = any>(err: any) {
    if (err?.response) {
      const { data, status, statusText, headers } = err.response;
      if (data && status) {
        return {
          data: data as T,
          status,
          statusText,
          headers
        };
      }
    } else if (err?.request) {
      console.log({ requestErr: err?.request });
    } else {
      console.log('Error', err?.message);
    }
    return null;
  }
}

export const HttpService = new HttpServiceBase();
