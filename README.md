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

- http 授权
  - HTTP 协议中的 [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) 请求 header 会包含服务器用于验证用户代理身份的凭证，通常会在服务器返回 401 Unauthorized 状态码以及 WWW-Authenticate 消息头之后在后续请求中发送此消息头。
  - axios 库也允许在请求配置中配置 `auth` 属性，`auth` 是一个对象结构，包含 `username` 和 `password` 2 个属性。一旦用户在请求的时候配置这俩属性，我们就会自动往 HTTP 的 请求 header 中添加 `Authorization` 属性，它的值为 `Basic 加密串`。这里的加密串是 `username:password` base64 加密后的结果。

```javascript
axios
  .post(
    '/more/post',
    {
      a: 1
    },
    {
      auth: {
        username: 'Yee',
        password: '123456'
      }
    }
  )
  .then(res => {
    console.log(res)
  })
```

- 自定义 status
  - 之前 `ts-axios` 在处理响应结果的时候，认为 HTTP [status](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status) 在 200 和 300 之间是一个合法值，在这个区间之外则创建一个错误。有些时候我们想自定义这个规则，比如认为 304 也是一个合法的状态码，所以我们希望 `ts-axios` 能提供一个配置，允许我们自定义合法状态码规则，在请求配置中添加一个 validateStatus 函数，它可以根据参数 status 来自定义合法状态码的规则。。

```javascript
axios
  .get('/more/304', {
    validateStatus(status) {
      return status >= 200 && status < 400
    }
  })
  .then(res => {
    console.log(res)
  })
  .catch((e: AxiosError) => {
    console.log(e.message)
  })
```

- 自定义参数序列化
  对 请求的 url 参数进行处理时候会解析传入的 params 对象，根据一定的规则把它解析成字符串，然后添加在 url 后面。 axios 库的默认解析规则对一些特殊的字符串不转义，比如 @ + 等。在请求配置中配置 paramsSerializer 函数来自定义参数的解析规则，该函数接受 params 参数，返回值作为解析后的结果

```javascript
axios
  .get('/more/get', {
    params: {
      a: 1,
      b: 2,
      c: ['a', 'b', 'c']
    },
    paramsSerializer(params) {
      return qs.stringify(params, { arrayFormat: 'brackets' })
    }
  })
  .then(res => {
    console.log(res)
  })
```

- baseURL 配置

```javascript
const instance = axios.create({
  baseURL: 'https://some-domain.com/api'
})

instance.get('/get')

instance.post('/post')
```

- 方法扩展
  - axios.all axios.spread : 使用 Promise.all 实现
  - 通过 axios.Axios 对外暴露了 Axios 类
  - getUri 返回 url

```javascript
function getUserAccount() {
  return axios.get('/user/12345')
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions')
}

axios.all([getUserAccount(), getUserPermissions()]).then(
  axios.spread(function(acct, perms) {
    // Both requests are now complete
  })
)

Promise.all([getUserAccount(), getUserPermissions()])
  .then(([acct,perms]) {
    // Both requests are now complete
  }));

const fakeConfig = {
  baseURL: 'https://www.baidu.com/',
  url: '/user/12345',
  params: {
    idClient: 1,
    idTest: 2,
    testString: 'thisIsATest'
  }
}
console.log(axios.getUri(fakeConfig))
// https://www.baidu.com/user/12345?idClient=1&idTest=2&testString=thisIsATest
```

## 单元测试
