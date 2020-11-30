import cookie from '../../src/helpers/cookie'

describe('helpers/cookie', () => {
  test('should read cookies', () => {
    document.cookie = 'name=sq'
    expect(cookie.read('name')).toBe('sq')
  })
  test('should return null if cookie name is not exist', () => {
    document.cookie = 'name=ax'
    expect(cookie.read('age')).toBeNull()
  })
})
