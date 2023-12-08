import { NextRequest } from 'next/server';
import { istrue } from '@/app/utils/utils';

let jsDelivr: boolean;
let shouldRedirect: boolean;
let headers: { [key: string]: string };
const shouldFixCharset = true
const shouldFixLoonRedirectBody = true

function migratingFromGitHubToJsDelivr(url: string) {
    // 如果是jsdelivr的原始链接,直接返回
    if (url.startsWith('https://cdn.jsdelivr.net/')) {
        return url
    }

    // 提取Github仓库信息
    const match = url.match(/https:\/\/(raw.githubusercontent.com|github.com)\/([^/]+)\/([^/]+)\/?(.*)/)

    if (!match) {
        // 非Github链接,不做转换
        return url
    }

    const [, , user, repo, path] = match

    // 构建jsdelivr链接
    return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${path ? path : 'main'}`
}

async function httpGet(url: string, options: { binary: boolean } = { binary: false }, type: string = "") {
    const isBinary = options['binary'] || false;
    if (type === "mock") {
        // 302重定向
        return {
            body: '',
            contentType: '',
            status: 302,
            headers: {
                Location: url,
            },
            shouldCache: true,
        }
    }
    let bodyLength
    const response = await fetch(url)
    console.log(url);
    
    // 判断StatusCode
    const status = response.status
    const headers = response.headers
    const contentType = headers.get('content-type')
    let body: any;
    if (isBinary) {
        body = await response.arrayBuffer() || await response.text()
    } else {
      //  打印返回的内容
        body = await response.text() || await response.arrayBuffer()
    }
    if (body !== null && body !== undefined) {
        // 判断body的类型
        if (body instanceof ArrayBuffer) {
            bodyLength = body.byteLength
        } else if (typeof body === "string") {
            // 忽略错误
            // @ts-ignore
            bodyLength = body.length
        } else if (typeof body === 'object') {
            bodyLength = JSON.stringify(body).length
        } else {
            bodyLength = 0
        }
    }
    return { body, contentType, status, headers, shouldCache: typeof body === 'string' }

}

function redirect(url: string) {
    return {
        body: '',
        contentType: '',
        status: 302,
        headers: {
            Location: jsDelivr ? migratingFromGitHubToJsDelivr(url) : url,
        },
        shouldCache: true,
    }
}


function binArrayToStr(binArray: string | any[]) {
    var str = ''
    for (var i = 0; i < binArray.length; i++) {
        str += String.fromCharCode(parseInt(binArray[i]))
    }
    return str
}

function utf8ContentType(type: string) {
    if (shouldFixCharset && /^(text|application)\/.+/i.test(type) && !/;\s*?charset\s*?=\s*?/i.test(type)) {
        let newType = `${type}; charset=UTF-8`
        return newType
    }
    return type
}

export async function GET(request: NextRequest, { params }: { params: { sourceURL: string, scriptName: string } }) {

    const { sourceURL } = params;
    let url = sourceURL;
    // 解析查询字符串
    const { searchParams } = request.nextUrl;
    let rewriteName = params.scriptName.substring(params.scriptName.lastIndexOf('/') + 1);
    const type = searchParams.get('type');
    const target = searchParams.get('target');

    const keepHeader = istrue(searchParams.get('keepHeader'));
    const setHeader = searchParams.get('setHeader');
    const setContentType = searchParams.get('setContentType');
    const wrap_response = istrue(searchParams.get('wrap_response'));
    const compatibilityOnly = istrue(searchParams.get('compatibilityOnly'));

    let setHeaders: { [key: string]: string } = {};
    if (setHeader) {
        setHeader.split(/\s*\|\s*/g).forEach(i => {
            if (/.+:.+/.test(i)) {
                const kv = i.split(/\s*\:\s*/)
                if (kv.length === 2) {
                    setHeaders[kv[0]] = kv[1]
                }
            }
        })
    }

    let prefix = `
// 转换时间: ${new Date().toLocaleString('zh')}
// 兼容性转换
if (typeof $request !== 'undefined') {
  const lowerCaseRequestHeaders = Object.fromEntries(
    Object.entries($request.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  $request.headers = new Proxy(lowerCaseRequestHeaders, {
    get: function (target, propKey, receiver) {
      return Reflect.get(target, propKey.toLowerCase(), receiver);
    },
    set: function (target, propKey, value, receiver) {
      return Reflect.set(target, propKey.toLowerCase(), value, receiver);
    },
  });
}
if (typeof $response !== 'undefined') {
  const lowerCaseResponseHeaders = Object.fromEntries(
    Object.entries($response.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  $response.headers = new Proxy(lowerCaseResponseHeaders, {
    get: function (target, propKey, receiver) {
      return Reflect.get(target, propKey.toLowerCase(), receiver);
    },
    set: function (target, propKey, value, receiver) {
      return Reflect.set(target, propKey.toLowerCase(), value, receiver);
    },
  });
}
`

    const qxMock = `
// QX 相关
var setInterval = () => {}
var clearInterval = () => {}
var $task = {
  fetch: url => {
    return new Promise((resolve, reject) => {
      if (url.method == 'POST') {
        $httpClient.post(url, (error, response, data) => {
          if (response) {
            response.body = data
            resolve(response, {
              error: error,
            })
          } else {
            resolve(null, {
              error: error,
            })
          }
        })
      } else {
        $httpClient.get(url, (error, response, data) => {
          if (response) {
            response.body = data
            resolve(response, {
              error: error,
            })
          } else {
            resolve(null, {
              error: error,
            })
          }
        })
      }
    })
  },
}

var $prefs = {
  valueForKey: key => {
    return $persistentStore.read(key)
  },
  setValueForKey: (val, key) => {
    return $persistentStore.write(val, key)
  },
}

var $notify = (title = '', subt = '', desc = '', opts) => {
  const toEnvOpts = (rawopts) => {
    if (!rawopts) return rawopts 
    if (typeof rawopts === 'string') {
      if ('undefined' !== typeof $loon) return rawopts
      else if('undefined' !== typeof $rocket) return rawopts
      else return { url: rawopts }
    } else if (typeof rawopts === 'object') {
      if ('undefined' !== typeof $loon) {
        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
        return { openUrl, mediaUrl }
      } else {
        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
        if('undefined' !== typeof $rocket) return openUrl
        return { url: openUrl }
      }
    } else {
      return undefined
    }
  }
  console.log(title, subt, desc, toEnvOpts(opts))
  $notification.post(title, subt, desc, toEnvOpts(opts))
}
var _scriptSonverterOriginalDone = $done
var _scriptSonverterDone = (val = {}) => {
  let result
  if (
    (typeof $request !== 'undefined' &&
    typeof val === 'object' &&
    typeof val.status !== 'undefined' &&
    typeof val.headers !== 'undefined' &&
    typeof val.body !== 'undefined') || ${wrap_response || false}
  ) {
    try {
      for (const part of val?.status?.split(' ')) {
        const statusCode = parseInt(part, 10)
        if (!isNaN(statusCode)) {
          val.status = statusCode
          break
        }
      }
    } catch (e) {}
    if (!val.status) {
      val.status = 200
    }
    if (!val.headers) {
      val.headers = {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      }
    }
    result = { response: val }
  } else {
    result = val
  }
  console.log('$done')
  try {
    console.log(JSON.stringify(result))
  } catch (e) {
    console.log(result)
  }
  _scriptSonverterOriginalDone(result)
}
var window = globalThis
window.$done = _scriptSonverterDone
var global = globalThis
global.$done = _scriptSonverterDone
`

    let body
    let res
    let status
    let contentType
    let shouldCache
    if (!compatibilityOnly && type === 'qx-script') {
        prefix = `${prefix}\n${qxMock}`
    }
    //查找内容
    if (type === 'mock') {
        if (keepHeader) {
            res = await httpGet(url, { 'binary': true }, type)
        } else {
            shouldRedirect = true
            res = redirect(url)
        }
    } else {
        res = await httpGet(url)
    }

    body = res.body
    status = res.status
    // 根据res.headers复制
    for (let key in res.headers) {
        if (res.headers.hasOwnProperty(key)) {
            headers[key] = (res.headers as any)[key];
        }
    }
    contentType = res.contentType
    shouldCache = res.shouldCache
    if (type === 'qx-script' || compatibilityOnly) {
        // 如果是body不是字符串,则转换为字符串
        if (typeof body !== 'string') {
            body = binArrayToStr(body)
        }
        body = `${prefix}\n${compatibilityOnly ? body : body.replace(/\$done\(/g, '_scriptSonverterDone(')}`
    }
    status = status ?? 200

    if (!shouldRedirect && Object.keys(setHeaders).length > 0) {
        headers = setHeaders
    } else {
        headers = {
            ...headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        }

        if (target === 'plain-text' || rewriteName.endsWith('.txt')) {
            if (headers['Content-Type']) {
                headers['Content-Type'] = 'text/plain; charset=utf-8'
            } else {
                headers['content-type'] = 'text/plain; charset=utf-8'
            }
        }
        if (setContentType) {
            if (headers['Content-Type']) {
                headers['Content-Type'] = setContentType
            } else {
                headers['content-type'] = setContentType
            }
        }
    }

    if (headers['Content-Type']) {
        headers['Content-Type'] = utf8ContentType(headers['Content-Type'])
    } else if (headers['content-type']) {
        headers['content-type'] = utf8ContentType(headers['content-type'])
    }
    const targetApp = target ?? 'surge'
    if (shouldFixLoonRedirectBody && /^3\d{2}$/.test(status.toString()) && targetApp.startsWith('loon') && (body == null || body == '' || body.length === 0)) {
        body = 'loon'
    }

    if (type === 'mock') {
        const scriptBody =
            typeof body === 'string'
                ? `
    // 转换时间: ${new Date().toLocaleString('zh')}
    let done = $done
    
    let result = {
      response: {
          status: ${status},
          body: ${JSON.stringify(body)},
          headers: ${JSON.stringify(headers)},
        },
    }
    done(result)`
                : `
    // 转换时间: ${new Date().toLocaleString('zh')}
    function strToArray(str) {
      var ret = new Uint8Array(str.length)
      for (var i = 0; i < str.length; i++) {
        ret[i] = str.charCodeAt(i)
      }
      return ret
    }
    
    let done = $done
    let result = {
      response: {
          status: ${status},
          headers: ${JSON.stringify(headers)},
          body: strToArray(${JSON.stringify(binArrayToStr(body))}),
        },
    }
    done(result)
          `
        headers = {
            'Content-Type': 'text/plain; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        }
        body = scriptBody
        status = 200
    }

    delete headers['content-length']
    delete headers['Content-Length']
    delete headers['content-encoding']
    delete headers['Content-Encoding']

    return new Response(body, {
        status,
        headers,
    });
}