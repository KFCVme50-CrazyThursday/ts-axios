# ts-axios

使用 TypeScript 从零实现一个 axios

## Features

- 在浏览器端使用 XMLHttpRequest 对象通讯
- 支持 Promise API
- 支持请求和响应的拦截器
- 支持请求数据和响应数据的转换
- 支持请求的取消
- JSON 数据的自动转换
- 客户端防止 XSS

## Usage

```javascript
const axios = require('axios')

axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 's',
    lastName: 'q'
  }
})
```

## 扩展接口还没写

2020/11/22 go on 先熟悉下之前写的代码再把 git 配置下
扩展接口

- axios.request(config)

- axios.get(url[, config])

- axios.delete(url[, config])

- axios.head(url[, config])

- axios.options(url[, config])

- axios.post(url[, data[, config]])

- axios.put(url[, data[, config]])

- axios.patch(url[, data[, config]])

## 函数重载

- 支持传入多个参数： 修改 AxiosInstaance 类型，修改该 request 函数

  1. 只穿一个对象参数时候
  2. 传入两个参数

```javascript
axios({
  url: '/extend/post1',
  method: 'post',
  data: { msg: 'go to sleep' }
})

// or

axios('/extend/post1', {
  method: 'post',
  data: { msg: 'go to sleep' }
})
```

## 返回数据支持泛型 extend 下 test 方法

## 拦截器

- 使用 promise 实现链式调用
- 可以添加多个拦截器的，拦截器的执行顺序是链式依次执行的方式。请求拦截器 resolve 函数处理的是 config 对象，而相应拦截器 resolve 函数处理的是 response 对象。
- 对于 request 拦截器，后添加的拦截器会在请求前的过程中先执行；
- 对于 response 拦截器，先添加的拦截器会在响应后先执行。
- 支持删除某个拦截器

```javascript
// 添加一个请求拦截起
axios.interceptors.request.use(
  function(config) {
    // do something before request
    return config
  },
  function(error) {
    // 处理请求错误
    return Promise.reject(error)
  }
)

// 添加一个响应拦截起
axios.interceptors.response.use(
  function(res) {
    // 处理响应数据
    return res
  },
  function(err) {
    // chuli xiangyingcuowu
    return Promise.reject(err)
  }
)
```

```javascript
axios.interceptors.request.use(config => {
  config.headers.test += '1'
  return config
})
axios.interceptors.request.use(config => {
  config.headers.test += '2'
  return config
})
// delete one interceptors
const myInterceptor = axios.interceptors.request.use(function() {
  /* do something*/
}) // 返回一个拦截器的id
axios.interceptors.request.eject(myInterceptor)
```

## 默认配置与合并

## 请求与相应配置优化

- transformRequest
- transformResponse

## axios.create

create a new instance of axios with a custom config.

- 创建一个新的 axios 实例，防止修改了 axios 的默认配置会影响所有的请求
- 可以同时传入新的配置和默认配置合并，并做为新的默认配置。

```javascript
const instance = axios.create({
  transformRequest: [(function(data) {
    return qs.stringify(data)
  }), ...(axios.defaults.transformRequest as AxiosTransformer[])],
  transformResponse: [...(axios.defaults.transformResponse as AxiosTransformer[]), function(data) {
    if (typeof data === 'object') {
      data.b = 2
    }
    return data
  }]
})
```

## 取消功能

前端搜索框输入搜索，除了使用 debounce 外，假如后端服务响应很慢，这个时候大于了 debounce 时间，那么可能就会导致后搜索的内容先与前搜索的内容返回，导致数据紊乱。
假如前面的请求还没有响应，就把前面的请求取消。这样就能解决这个问题

You can cancel a request using a cancel token.
You can create a cancel token using the CancelToken.source factory as shown below:

```javascript
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios
  .get('/user/12345', {
    cancelToken: source.token
  })
  .catch(function(thrown) {
    if (axios.isCancel(thrown)) {
      console.log('Request canceled', thrown.message)
    } else {
      // handle error
    }
  })

axios.post(
  '/user/12345',
  {
    name: 'new name'
  },
  {
    cancelToken: source.token
  }
)

// cancel the request (the message parameter is optional)
source.cancel('Operation canceled by the user.')
```

You can also create a cancel token by passing an executor function to the CancelToken constructor:

```javascript
const CancelToken = axios.CancelToken
let cancel

axios.get('/user/12345', {
  cancelToken: new CancelToken(function executor(c) {
    // An executor function receives a cancel function as a parameter
    cancel = c
  })
})

// cancel the request
cancel()
```

**实现方案**：

- 请求配置 cancelToken 属性，然后在外部调用 cancel 方法
- 请求是异步过程，最终会执行 xhr.send 方法，xhr 对象提供 abort 方法，可以把请求取消
- 执行 cancel 方法时候，插入一段代码去触发 xhr.abort 方法
  - 利用 promise 实现异步分离，在 cancelToken 中保存一个 pending 状态的 promise，当执行 cancel 方法时候，能访问到该 promise 对象，把它从 pending 状态变成 resolved 状态，这样我们就可以在 then 函数中去实现取消请求的逻辑

```javascript
if (cancelToken) {
  cancelToken.promise.then(reason => {
    request.abort()
    reject(reason)
  })
}
```

## 更多功能

- withCredentials
  - 在解决跨域请求后，发送请求是不携带 cookie 的，通过设置 xhr 对象的 withCredentials 为 true 即可
- XSRF 防御：有多种方式防止，比如验证请求的 Referer,但 referer 是可以伪造的，相对来说验证 token 更稳妥
  - 服务端要求请求每次都包含一个 token，由服务端生成，并通过 set-cookie 的方式种到客户端，每次发送请求时取出这个 token 并验证
  - 从 cookie 中读取对应的 token 值，然后添加到请求 headers 中。允许用户配置 xsrfCookieName 和 xsrfHeaderName，其中 xsrfCookieName 表示存储 token 的 cookie 名称，xsrfHeaderName 表示请求 headers 中 token 对应的 header 名称。

```javascript
axios
  .get('/more/get', {
    xsrfCookieName: 'XSRF-TOKEN', // default
    xsrfHeaderName: 'X-XSRF-TOKEN' // default
  })
  .then(res => {
    console.log(res)
  })
```

- 上传下载进度监控
  - 使用 xhr 提供了一个 progress 事件 与 upload.onprogress。但次事件并不能确切的监听到上传下载进度，在前端页面只能提供一个漂亮的进度条，毕竟数据的上传是相互的，前端上传了并不代表服务器就成功接收了。

```javascript
axios.get('/more/get', {
  onDownloadProgress(progressEvent) {
    // 监听下载进度
  }
})

axios.post('/more/post', {
  onUploadProgress(progressEvent) {
    // 监听上传进度
  }
})
```

## 单元测试
