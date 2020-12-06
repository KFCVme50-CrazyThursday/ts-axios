(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.axios = factory());
}(this, (function () { 'use strict';

  var toString = Object.prototype.toString;
  function isDate(val) {
      return toString.call(val) === '[object Date]';
  }
  function isPlainObject(val) {
      return toString.call(val) === '[object Object]';
  }
  // 混合对象实现 将from上的属性扩展到to中，包括原型上的属性
  function extend(to, from) {
      for (var key in from) {
          to[key] = from[key];
      }
      return to;
  }
  function deepMerge() {
      var objs = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          objs[_i] = arguments[_i];
      }
      var result = Object.create(null);
      objs.forEach(function (obj) {
          if (obj) {
              Object.keys(obj).forEach(function (key) {
                  var val = obj[key];
                  if (isPlainObject(val)) {
                      if (isPlainObject(result[key])) {
                          result[key] = deepMerge(result[key], val);
                      }
                      else {
                          result[key] = deepMerge({}, val);
                      }
                  }
                  else {
                      result[key] = val;
                  }
              });
          }
      });
      return result;
  }
  function isFormData(val) {
      return typeof val !== 'undefined' && val instanceof FormData;
  }

  function normalizeHeaderName(headers, normalizedName) {
      if (!headers) {
          return;
      }
      Object.keys(headers).forEach(function (name) {
          if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
              headers[normalizedName] = headers[name];
              delete headers[name];
          }
      });
  }
  function processHeaders(headers, data) {
      normalizeHeaderName(headers, 'Content-Type');
      if (isPlainObject(data)) {
          if (headers && !headers['Content-Type']) {
              headers['Content-Type'] = 'application/json;charset=utf-8';
          }
      }
      return headers;
  }
  // 将返回的headers字符串格式化成对象形式
  function parseHeaders(headers) {
      var parsed = Object.create(null);
      if (!headers) {
          return parsed;
      }
      headers.split('\r\n').forEach(function (line) {
          var _a = line.split(':'), key = _a[0], vals = _a.slice(1);
          key = key.trim().toLowerCase();
          if (!key) {
              return;
          }
          var val = vals.join(':').trim();
          parsed[key] = val;
      });
      return parsed;
  }
  // flatten headers
  function flattenHeaders(headers, method) {
      if (!headers) {
          return headers;
      }
      headers = deepMerge(headers.common || {}, headers[method] || {}, headers);
      var methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];
      methodsToDelete.forEach(function (method) {
          delete headers[method];
      });
      return headers;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var AxiosError = /** @class */ (function (_super) {
      __extends(AxiosError, _super);
      function AxiosError(message, config, code, request, response) {
          var _this = _super.call(this, message) || this;
          _this.config = config;
          _this.code = code;
          _this.request = request;
          _this.response = response;
          _this.isAxiosError = true;
          Object.setPrototypeOf(_this, AxiosError.prototype);
          return _this;
      }
      return AxiosError;
  }(Error));
  function createError(message, config, code, request, response) {
      var error = new AxiosError(message, config, code, request, response);
      return error;
  }

  function encode(val) {
      return encodeURIComponent(val)
          .replace(/%40/g, '@')
          .replace(/%3A/gi, ':')
          .replace(/%24/g, '$')
          .replace(/%2C/gi, ',')
          .replace(/%20/g, '+')
          .replace(/%5B/gi, '[')
          .replace(/%5D/gi, ']');
  }
  function buildURL(url, params, paramsSerializer) {
      if (!params) {
          return url;
      }
      var serializedParams;
      if (paramsSerializer) {
          serializedParams = paramsSerializer(params);
      }
      else if (isURLSearchParams(params)) {
          serializedParams = params.toString();
      }
      else {
          var parts_1 = [];
          Object.keys(params).forEach(function (key) {
              var val = params[key];
              if (val === null || typeof val === 'undefined') {
                  return;
              }
              var values;
              if (Array.isArray(val)) {
                  values = val;
                  key += '[]';
              }
              else {
                  values = [val];
              }
              values.forEach(function (val) {
                  if (isDate(val)) {
                      val = val.toISOString();
                  }
                  else if (isPlainObject(val)) {
                      val = JSON.stringify(val);
                  }
                  parts_1.push(encode(key) + "=" + encode(val));
              });
          });
          serializedParams = parts_1.join('&');
      }
      if (serializedParams) {
          var markIndex = url.indexOf('#');
          if (markIndex !== -1) {
              url = url.slice(0, markIndex);
          }
          url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }
      return url;
  }
  function isURLSameOrigin(requestURL) {
      var parsedOrigin = resolveURL(requestURL);
      return (parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host);
  }
  var urlParsingNode = document.createElement('a');
  var currentOrigin = resolveURL(window.location.href);
  // 同域名的判断主要利用了一个技巧，创建一个 a 标签的 DOM，
  // 然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host。
  // 当前页面的 url 和请求的 url 都通过这种方式获取，然后对比它们的 protocol 和 host 是否相同即可。
  function resolveURL(url) {
      urlParsingNode.setAttribute('href', url);
      var protocol = urlParsingNode.protocol, host = urlParsingNode.host;
      return {
          protocol: protocol,
          host: host
      };
  }
  function isURLSearchParams(val) {
      return typeof val !== 'undefined' && val instanceof URLSearchParams;
  }
  function isAbsoluteURL(url) {
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  }
  function combineURL(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
  }

  var cookie = {
      read: function (name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return match ? decodeURIComponent(match[3]) : null;
      }
  };

  function xhr(config) {
      return new Promise(function (resolve, reject) {
          var _a = config.data, data = _a === void 0 ? null : _a, url = config.url, _b = config.method, method = _b === void 0 ? 'get' : _b, _c = config.headers, headers = _c === void 0 ? {} : _c, responseType = config.responseType, timeout = config.timeout, cancelToken = config.cancelToken, withCredentials = config.withCredentials, xsrfCookieName = config.xsrfCookieName, xsrfHeaderName = config.xsrfHeaderName, onDownloadProgress = config.onDownloadProgress, onUploadProgress = config.onUploadProgress, auth = config.auth, validateStatus = config.validateStatus;
          // 创建 xhr 实例
          var request = new XMLHttpRequest();
          // 初始化
          request.open(method.toUpperCase(), url, true);
          // 配置对象
          configureRequest();
          // 添加事件与处理函数
          addEvents();
          // 处理请求头
          processHeaders$$1();
          // 处理请求取消逻辑
          processCancel();
          // 发送请求
          request.send(data);
          function configureRequest() {
              if (responseType) {
                  request.responseType = responseType;
              }
              if (timeout) {
                  request.timeout = timeout;
              }
              if (withCredentials) {
                  request.withCredentials = true;
              }
          }
          function addEvents() {
              request.onreadystatechange = function handleLoad() {
                  if (request.readyState !== 4) {
                      return;
                  }
                  if (request.status === 0) {
                      return;
                  }
                  // const responseHeaders = request.getAllResponseHeaders()
                  var responseHeaders = parseHeaders(request.getAllResponseHeaders());
                  var responseData = responseType && responseType !== 'text' ? request.response : request.responseText;
                  var response = {
                      data: responseData,
                      status: request.status,
                      statusText: request.statusText,
                      headers: responseHeaders,
                      config: config,
                      request: request
                  };
                  handleResponse(response);
              };
              request.onerror = function handleError() {
                  reject(createError('Network Error', config, null, request));
              };
              request.ontimeout = function handleTimeout() {
                  reject(createError("Timeout of " + config.timeout + " ms exceeded", config, 'ECONNABORTED', request));
              };
              if (onDownloadProgress) {
                  request.onprogress = onDownloadProgress;
              }
              if (onUploadProgress) {
                  request.upload.onprogress = onUploadProgress;
              }
          }
          function processHeaders$$1() {
              // 当请求的数据是 formdata 类型时候，主动删除 headers 中的 Content-Type 字段
              // 浏览器会自动设置，通过 formData 上传时，浏览器会自动把 content-type 设置为 multipart/form-data
              if (isFormData(data)) {
                  delete headers['Content-Type'];
              }
              if ((withCredentials || isURLSameOrigin(url)) && xsrfCookieName) {
                  var xsrfValue = cookie.read(xsrfCookieName);
                  if (xsrfValue) {
                      headers[xsrfHeaderName] = xsrfValue;
                  }
              }
              if (auth) {
                  // btoa 创建一个 base-64 编码的字符串
                  headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password);
              }
              Object.keys(headers).forEach(function (name) {
                  if (data === null && name.toLowerCase() === 'content-type') {
                      delete headers[name]; // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的
                  }
                  else {
                      request.setRequestHeader(name, headers[name]);
                  }
              });
          }
          function processCancel() {
              // CancelToken存在取消请求
              if (cancelToken) {
                  cancelToken.promise
                      .then(function (reason) {
                      request.abort();
                      reject(reason);
                  })
                      .catch(
                  /* istanbul ignore next */
                  function () {
                      // do nothing
                  });
              }
          }
          function handleResponse(response) {
              if (!validateStatus || validateStatus(response.status)) {
                  resolve(response);
              }
              else {
                  reject(createError("Request failed with status code " + response.status, config, null, request, response));
              }
          }
      });
  }

  function transformRequest(data) {
      if (isPlainObject(data)) {
          return JSON.stringify(data);
      }
      return data;
  }
  function transformResponse(data) {
      if (typeof data === 'string') {
          try {
              data = JSON.parse(data);
          }
          catch (e) {
              // do something ...
          }
      }
      return data;
  }

  function transform(data, headers, fns) {
      if (!fns) {
          return data;
      }
      if (!Array.isArray(fns)) {
          fns = [fns];
      }
      fns.forEach(function (fn) {
          data = fn(data, headers);
      });
      return data;
  }

  function dispatchRequest(config) {
      // 发送请求前检查 cancelToken 是否已经使用过了
      throwIfCancellationRequested(config);
      processConfig(config);
      return xhr(config).then(function (res) {
          return transformResponseData(res);
      }, function (e) {
          if (e && e.response) {
              e.response = transformResponseData(e.response);
          }
          return Promise.reject(e);
      });
  }
  function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
          config.cancelToken.throwIfRequested();
      }
  }
  // function axios(config: AxiosRequestConfig): AxiosPromise {
  //   // TODO 处理参数
  //   processConfig(config)
  //   return xhr(config).then(res => {
  //     return transformResponseData(res)
  //   })
  // }
  function processConfig(config) {
      config.url = transformUrl(config);
      // config.headers = transformHeaders(config)
      // config.data = transformRequestData(config) // string 参数
      config.data = transform(config.data, config.headers, config.transformRequest);
      // flatten headers
      config.headers = flattenHeaders(config.headers, config.method);
  }
  function transformUrl(config) {
      var url = config.url, params = config.params, paramsSerializer = config.paramsSerializer, baseURL = config.baseURL;
      if (baseURL && !isAbsoluteURL(url)) {
          url = combineURL(baseURL, url);
      }
      return buildURL(url, params, paramsSerializer);
  }
  function transformResponseData(res) {
      // res.data = transformResponse(res.data)
      res.data = transform(res.data, res.headers, res.config.transformResponse);
      return res;
  }

  // 拦截器
  var InterceptorManager = /** @class */ (function () {
      function InterceptorManager() {
          this.interceptors = [];
      }
      InterceptorManager.prototype.use = function (resolved, rejected) {
          this.interceptors.push({
              resolved: resolved,
              rejected: rejected
          });
          return this.interceptors.length - 1; // 返回拦截器id
      };
      InterceptorManager.prototype.forEach = function (fn) {
          this.interceptors.forEach(function (interceptor) {
              if (interceptor !== null) {
                  fn(interceptor);
              }
          });
      };
      InterceptorManager.prototype.eject = function (id) {
          if (this.interceptors[id]) {
              this.interceptors[id] = null;
          }
      };
      return InterceptorManager;
  }());

  var strats = Object.create(null);
  // 如果自定义配置中定义了某个属性，就采用自定义的，否则就用默认配置。
  function defaultStrate(val1, val2) {
      return typeof val2 !== 'undefined' ? val2 : val1;
  }
  // 针对 'url', 'params', 'data' 直接取传入的
  function fromVal2Strate(val1, val2) {
      if (typeof val2 !== 'undefined') {
          return val2;
      }
  }
  var strateKeysFromVal2 = ['url', 'params', 'data'];
  strateKeysFromVal2.forEach(function (key) {
      strats[key] = fromVal2Strate;
  });
  function deepMergeStrate(val1, val2) {
      if (isPlainObject(val2)) {
          return deepMerge(val1, val2);
      }
      else if (typeof val2 !== 'undefined') {
          return val2;
      }
      else if (isPlainObject(val1)) {
          return deepMerge(val1);
      }
      else {
          return val1;
      }
  }
  var strateKeysDeepMerge = ['headers', 'auth'];
  // const strateKeysDeepMerge = ['headers']
  strateKeysDeepMerge.forEach(function (key) {
      strats[key] = deepMergeStrate;
  });
  // config1 为默认的 config ，2 为传入的
  function mergeConfig(config1, config2) {
      if (!config2) {
          config2 = {};
      }
      var config = Object.create(null); // 承接合并的结果
      for (var key in config2) {
          mergeField(key);
      }
      for (var key in config1) {
          if (!config2[key]) {
              mergeField(key);
          }
      }
      function mergeField(key) {
          var strat = strats[key] || defaultStrate;
          config[key] = strat(config1[key], config2[key]);
      }
      return config;
  }

  var Axios = /** @class */ (function () {
      function Axios(initConfig) {
          this.defaults = initConfig;
          this.interceptors = {
              request: new InterceptorManager(),
              response: new InterceptorManager()
          };
      }
      Axios.prototype.request = function (url, config) {
          // 函数重载：支持一个参数 or 两个
          if (typeof url === 'string') {
              if (!config) {
                  config = {};
              }
              config.url = url;
          }
          else {
              config = url;
          }
          // 发送请求前合并config
          config = mergeConfig(this.defaults, config);
          config.method = config.method.toLowerCase();
          // 拦截处理
          var chain = [
              {
                  resolved: dispatchRequest,
                  rejected: undefined
              }
          ];
          this.interceptors.request.forEach(function (interceptor) {
              chain.unshift(interceptor);
          });
          this.interceptors.response.forEach(function (interceptor) {
              chain.push(interceptor);
          });
          var promise = Promise.resolve(config);
          while (chain.length) {
              var _a = chain.shift(), resolved = _a.resolved, rejected = _a.rejected;
              promise = promise.then(resolved, rejected);
          }
          return promise;
          // return dispatchRequest(config)
      };
      Axios.prototype.get = function (url, config) {
          return this._requestMethodWithoutData('get', url, config);
      };
      Axios.prototype.head = function (url, config) {
          return this._requestMethodWithoutData('head', url, config);
      };
      Axios.prototype.options = function (url, config) {
          return this._requestMethodWithoutData('options', url, config);
      };
      Axios.prototype.delete = function (url, config) {
          return this._requestMethodWithoutData('delete', url, config);
      };
      Axios.prototype.post = function (url, data, config) {
          return this._requestMethodWithData('post', url, data, config);
      };
      Axios.prototype.put = function (url, data, config) {
          return this._requestMethodWithData('put', url, data, config);
      };
      Axios.prototype.patch = function (url, data, config) {
          return this._requestMethodWithData('patch', url, data, config);
      };
      Axios.prototype.getUri = function (config) {
          config = mergeConfig(this.defaults, config);
          return transformUrl(config);
      };
      Axios.prototype._requestMethodWithData = function (method, url, data, config) {
          return this.request(Object.assign(config || {}, {
              method: method,
              url: url,
              data: data
          }));
      };
      Axios.prototype._requestMethodWithoutData = function (method, url, config) {
          return this.request(Object.assign(config || {}, {
              method: method,
              url: url
          }));
      };
      return Axios;
  }());

  var defaults = {
      method: 'get',
      timeout: 0,
      headers: {
          common: {
              Accept: 'application/json,text/plain,*/*'
          }
      },
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      transformRequest: [
          function (data, headers) {
              processHeaders(headers, data);
              return transformRequest(data);
          }
      ],
      transformResponse: [
          function (data) {
              return transformResponse(data);
          }
      ],
      validateStatus: function (status) {
          return status >= 200 && status < 300;
      }
  };
  var methodsNoData = ['delete', 'get', 'head', 'options'];
  methodsNoData.forEach(function (method) {
      defaults.headers[method] = {};
  });
  var methodsWithData = ['post', 'put', 'patch'];
  methodsWithData.forEach(function (method) {
      defaults.headers[method] = {
          'Content-Type': 'application/x-www-form-urlencoded'
      };
  });

  var Cancel = /** @class */ (function () {
      function Cancel(message) {
          this.message = message;
      }
      return Cancel;
  }());
  function isCancel(value) {
      return value instanceof Cancel;
  }

  var CancelToken = /** @class */ (function () {
      function CancelToken(executor) {
          var _this = this;
          var resolvePromise;
          this.promise = new Promise(function (resolve) {
              resolvePromise = resolve;
          });
          executor(function (message) {
              if (_this.reason) {
                  return;
              }
              _this.reason = new Cancel(message);
              resolvePromise(_this.reason);
          });
      }
      CancelToken.source = function () {
          var cancel;
          var token = new CancelToken(function (c) {
              cancel = c;
          });
          return {
              cancel: cancel,
              token: token
          };
      };
      // 判断是否使用过 使用过抛出异常
      CancelToken.prototype.throwIfRequested = function () {
          if (this.reason) {
              throw this.reason;
          }
      };
      return CancelToken;
  }());

  function createInstance(config) {
      var context = new Axios(config);
      var instance = Axios.prototype.request.bind(context);
      extend(instance, context);
      return instance;
  }
  var axios = createInstance(defaults);
  axios.create = function create(config) {
      return createInstance(mergeConfig(defaults, config));
  };
  axios.CancelToken = CancelToken;
  axios.Cancel = Cancel;
  axios.isCancel = isCancel;
  axios.all = function all(promises) {
      return Promise.all(promises);
  };
  axios.spread = function spread(callback) {
      return function wrap(arr) {
          return callback.apply(null, arr);
      };
  };
  axios.Axios = Axios;

  return axios;

})));
//# sourceMappingURL=axios.umd.js.map
