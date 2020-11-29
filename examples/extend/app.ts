import axios from '../../src/index'
// import { ResponseData } from './interface';

// axios({
//   url: '/extend/post',
//   method: 'post',
//   data: {
//     msg: 'hello world'
//   }
// })
// axios('/extend/post', {
//   method: 'post',
//   data: {
//     msg: 'hello world'
//   }
// })

// axios.request({
//   url: '/extend/post1',
//   method: 'post',
//   data: {
//     msg: 'hi, sq'
//   }
// })

// axios.request({
//   url: '/extend/post2',
//   method: 'post',
//   data: {
//     msg: 'hi, sq'
//   }
// })

// axios.get('/extend/get')

// axios.options('/extend/options')

// axios.delete('/extend/delete')

// axios.head('/extend/head')

// axios.post('/extend/post', { msg: 'post' })

// axios.put('/extend/put1', { msg: 'put' }).then(res => {
//   console.log(res)
// })

// axios.patch('/extend/patch', { msg: 'patch' })

// 请求接口数据
interface ResponseData<T = any> {
  code: number
  result: T
  message: string
}

interface User {
  name: string
  age: number
}


function getUser<T>(name: string, age: number) {
  return axios.get<ResponseData<T>>('/extend/user', { params: { name, age } })
    .then(res => res.data)
    .catch(err => console.error(err))
}

async function test() {
  const user = await getUser<User>('sq', 24)
  if (user) {
    console.log(user)
  }
}

test()
