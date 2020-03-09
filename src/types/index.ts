export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

export interface AxiosRequestConfig {
  url: string
  method?: Method // HTTP 方法；
  data?: any //post、patch 等类型请求的数据，放到 request body 中的
  params?: any //params 是 get、head 等类型请求的数据，拼接到 url 的 query string 中的。
  headers?: any
}
