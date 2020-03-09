import { AxiosRequestConfig } from './types'

export default function xhr(config: AxiosRequestConfig) {
  const { data = null, url, method = 'get',headers } = config

  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true)

  Object.keys(headers).forEach(name => {
    if (data === null && name.toLowerCase() === 'content-type') {
      delete headers[name]  //传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的
    } else {
      request.setRequestHeader(name, headers[name])
    }
  })

  request.send(data)
}
