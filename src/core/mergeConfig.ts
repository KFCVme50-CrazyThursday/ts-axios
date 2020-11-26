import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'

const strats = Object.create(null)

// 如果自定义配置中定义了某个属性，就采用自定义的，否则就用默认配置。
function defaultStrate(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

// 针对 'url', 'params', 'data' 直接取传入的
function fromVal2Strate(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}
const strateKeysFromVal2 = ['url', 'params', 'data']
strateKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strate
})

function deepMergeStrate(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}

const strateKeysDeepMerge = ['headers']
strateKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrate
})

// config1 为默认的 config ，2 为传入的
export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }
  const config = Object.create(null) // 承接合并的结果

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrate
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
