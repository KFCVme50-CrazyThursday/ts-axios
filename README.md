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
