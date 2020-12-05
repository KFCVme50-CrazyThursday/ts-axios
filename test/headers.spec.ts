import axios from '../src/index'
import { getAjaxRequest } from './helper'

// 测试 headers 是否存在某个 header name 下的某个值。
function testHeaderValue(headers: any, key: string, val?: string): void {
  let found = false
  for (let k in headers) {
    if (k.toLowerCase() === key.toLowerCase()) {
      found = true
      expect(headers[k]).toBe(val)
      break
    }
  }
  if (!found) {
    if (typeof val === 'undefined') {
      expect(headers.hasOwnProperty(key)).toBeFalsy()
    } else {
      throw new Error(key + 'was not found in headers')
    }
  }
}

describe('headers', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })

  test('should use default common headers', () => {
    const headers = axios.defaults.headers.common
    axios('/foo')
    return getAjaxRequest().then(res => {
      for (let key in headers) {
        if (headers.hasOwnProperty(key)) {
          expect(res.requestHeaders[key]).toEqual(headers[key])
        }
      }
    })
  })
  test('should add extra headers for post', () => {
    axios.post('/foo', 'name=sq')
    return getAjaxRequest().then(res => {
      testHeaderValue(res.requestHeaders, 'Content-Type', 'application/x-www-form-urlencoded')
    })
  })
  test('should user application/json when posting an object', () => {
    axios.post('/foo/bar', {
      name: 'sq',
      age: 18
    })
    return getAjaxRequest().then(res => {
      testHeaderValue(res.requestHeaders, 'Content-Type', 'application/json;charset=utf-8')
    })
  })

  test('should remove content-type if data is empty', () => {
    axios.post('/foo')
    return getAjaxRequest().then(res => {
      testHeaderValue(res.requestHeaders, 'Content-Type', undefined)
    })
  })

  it('should preserve content-type if data is false', () => {
    axios.post('/foo', false)
    return getAjaxRequest().then(res => {
      testHeaderValue(res.requestHeaders, 'Content-Type', 'application/x-www-form-urlencoded')
    })
  })

  test('should remove Content-Type if data is formdata', () => {
    const data = new FormData()
    data.append('foo', 'bat')
    axios.post('foo', data)
    return getAjaxRequest().then(res => {
      testHeaderValue(res.requestHeaders, 'Content-Type', undefined)
    })
  })
})
