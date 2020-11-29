import axios, { AxiosError } from '../../src/index'
import NProgress from 'nprogress'

// document.cookie = 'a=b'

// axios.get('/more/get').then(res => {
//   console.log(res)
// })

// axios.post('http://127.0.0.1:8088/more/server2', {}, {
//   withCredentials: true
// }).then(res => {
//   console.log(res)
// })

// const instance = axios.create({
//   xsrfCookieName: 'XSRF-TOKEN-D',
//   xsrfHeaderName: 'X-XSRF-TOKEN-D'
// })

// instance.get('/more/get').then(res => {
//   console.log(res)
// })

const instance1 = axios.create()

function calculatePercentage(loaded: number, total: number) {
  return Math.floor(loaded * 1.0) / total
}

function loadProgressBar() {

  const setupStartProgress = () => {
    instance1.interceptors.request.use(config => {
      NProgress.start()
      return config
    })
  }

  const setupUpdateProgress = () => {
    const update = (e: ProgressEvent) => {
      console.log(42, e)
      NProgress.set(calculatePercentage(e.loaded, e.total))
    }
    instance1.defaults.onDownloadProgress = update
    instance1.defaults.onUploadProgress = update
  }

  const setupStopProgress = () => {
    instance1.interceptors.response.use(response => {
      NProgress.done()
      return response
    }, error => {
      NProgress.done()
      return Promise.reject(error)
    })
  }

  setupStartProgress()
  setupUpdateProgress()
  setupStopProgress()

}

loadProgressBar()

const downloadEl = document.getElementById('download')

downloadEl!.addEventListener('click', e => {
  instance1.get('https://cn.vuejs.org/images/logo.png')
})

const uploadEl = document.getElementById('upload')

uploadEl!.addEventListener('click', e => {
  const data = new FormData()
  const fileEl = document.getElementById('file') as HTMLInputElement
  console.log(fileEl)
  if (fileEl.files) {
    data.append('file', fileEl.files[0])

    instance1.post('/more/upload', data)
  }
})


axios.post('/more/post', {
  a: 1
}, {
  auth: {
    username: "sq",
    password: '123456'
  }
}).then(res => {
  console.log(90, res)
})

axios.get('/more/304').then(res => {
  console.log(res)
}).catch((e: AxiosError) => {
  console.log(e.message)
})

axios.get('/more/304', {
  validateStatus(status) {
    return status >= 200 && status < 400
  }
}).then(res => {
  console.log(res)
}).catch((e: AxiosError) => {
  console.log(e.message)
})

// 自定义参数解析
const qs = require('qs')
axios.get('/more/get', {
  params: new URLSearchParams('a=b&c=d')
}).then(res => {
  console.log(res)
})

axios.get('/more/get', {
  params: {
    a: 1,
    b: 2,
    c: ['a', 'b', 'c']
  }
}).then(res => {
  console.log(res)
})

const instance2 = axios.create({
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'brackets' })
  }
})

instance2.get('/more/get', {
  params: {
    a: 1,
    b: 2,
    c: ['a', 'b', 'c']
  }
}).then(res => {
  console.log(res)
})

const instance3 = axios.create({
  baseURL: 'https://cn.vuejs.org/'
})

instance3.get('/images/imooc-sponsor2.png')

instance3.get('https://cn.vuejs.org/images/logo.png')


function getA() {
  return axios.get('/more/A')
}

function getB() {
  return axios.get('/more/B')
}

axios.all([getA(), getB()])
  .then(axios.spread(function (resA, resB) {
    console.log(resA.data)
    console.log(resB.data)
  }))


axios.all([getA(), getB()])
  .then(([resA, resB]) => {
    console.log(resA.data)
    console.log(resB.data)
  })

const fakeConfig = {
  baseURL: 'https://www.baidu.com/',
  url: '/user/12345',
  params: {
    idClient: 1,
    idTest: 2,
    testString: 'thisIsATest'
  }
}
console.log(187, axios.getUri(fakeConfig))
