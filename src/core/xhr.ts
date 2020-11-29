import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
// import { resolve } from 'url'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,

      onDownloadProgress,
      onUploadProgress,

      auth
    } = config
    // 创建 xhr 实例
    const request = new XMLHttpRequest()
    // 初始化
    request.open(method.toUpperCase(), url!, true)
    // 配置对象
    configureRequest()
    // 添加事件与处理函数
    addEvents()
    // 处理请求头
    processHeaders()
    // 处理请求取消逻辑
    processCancel()
    // 发送请求
    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = true
      }
    }

    function addEvents(): void {
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) {
          return
        }

        if (request.status === 0) {
          return
        }

        // const responseHeaders = request.getAllResponseHeaders()
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        const responseData =
          responseType && responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }

      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request))
      }

      request.ontimeout = function handleTimeout() {
        reject(
          createError(`Timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', request)
        )
      }

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      // 当请求的数据是 formdata 类型时候，主动删除 headers 中的 Content-Type 字段
      // 浏览器会自动设置，通过 formData 上传时，浏览器会自动把 content-type 设置为 multipart/form-data
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          headers[xsrfHeaderName!] = xsrfValue
        }
      }

      if (auth) {
        // btoa 创建一个 base-64 编码的字符串
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name] // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    function processCancel(): void {
      // CancelToken存在取消请求
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
