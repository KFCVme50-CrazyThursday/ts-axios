import axios from '../../src/index'
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
