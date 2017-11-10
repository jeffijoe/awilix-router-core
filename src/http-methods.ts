/**
 * Possible Http method values.
 */
export type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'PATCH'
  | '*'

/**
 * Http methods.
 */
export const HttpMethods: Record<string, HttpMethod> = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  CONNECT: 'CONNECT',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  ALL: '*'
}
