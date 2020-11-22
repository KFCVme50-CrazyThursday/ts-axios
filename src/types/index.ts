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
  // 定义请求接口
  url?: string
  method?: Method // HTTP 方法；
  data?: any // post、patch 等类型请求的数据，放到 request body 中的
  params?: any // params 是 get、head 等类型请求的数据，拼接到 url 的 query string 中的。
  headers?: any
  responseType?: XMLHttpRequestResponseType
  // 对于一个 AJAX 请求的 response，我们是可以指定它的响应的数据类型的，
  // 通过设置 XMLHttpRequest 对象的 responseType 属性
  timeout?: number
}
// 定义返回数据接口类型
export interface AxiosResponse {
  data: any // 服务端返回的数据
  status: number // HTTP 状态码
  statusText: string // 状态消息
  headers: any // 响应头
  config: AxiosRequestConfig // 请求配置
  request: any // XMLHttpRequest对象实例
}

export interface AxiosPromise extends Promise<AxiosResponse> {}

export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean
}

export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise
  get(url: string, config?: AxiosRequestConfig): AxiosPromise
  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
  delete(url: string, config?: AxiosRequestConfig): AxiosPromise
  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
  head(url: string, config?: AxiosRequestConfig): AxiosPromise
  options(url: string, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise

  (url: string, config?: AxiosRequestConfig): AxiosPromise
}
