/**
 * Possible Http verb values.
 */
export type HttpVerb =
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
export const HttpVerbs: Record<string, HttpVerb> = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  CONNECT: 'CONNECT',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  ALL: '*',
}
