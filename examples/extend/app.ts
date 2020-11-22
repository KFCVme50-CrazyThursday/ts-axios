import axios from '../../src/index'

axios({
  url: '/extend/post',
  method: 'post',
  data: {
    msg: 'hello world'
  }
})
axios('/extend/post',{
  method: 'post',
  data: {
    msg: 'hello world'
  }
})

axios.request({
  url: '/extend/post1',
  method: 'post',
  data: {
    msg: 'hi, sq'
  }
})

axios.request({
  url: '/extend/post2',
  method: 'post',
  data: {
    msg: 'hi, sq'
  }
})

axios.get('/extend/get')

axios.options('/extend/options')

axios.delete('/extend/delete')

axios.head('/extend/head')

axios.post('/extend/post', { msg: 'post' })

axios.put('/extend/put1', { msg: 'put' }).then(res => {
  console.log(res)
})

axios.patch('/extend/patch', { msg: 'patch' })
