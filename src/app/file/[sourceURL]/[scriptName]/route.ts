import { NextRequest } from 'next/server';
import  {istrue, fetchBody}  from '@/app/utils/utils';



function pieceHn(arr: any[], isStashiOS: boolean) {
  if (!isStashiOS) {
    return arr.join(',');
  } else if (isStashiOS) {
    return arr.join(`"\n    - "`);
  }
  return "";
};

//获取mock参数
function getMockInfo(x: string, mark: string, y: number) {
  const noteK = /^#/.test(x) ? "#" : "";
  let mockPtn = "";
  let mockUrl = "";
  let mockHeader = "";
  if (/url +echo-response /.test(x)) {
    x = x.replace(/ {2,}/g, " ");
    mockPtn = x.split(" url ")[0];
    mockUrl = x.split(" echo-response ")[2];
    mockHeader = '&contentType=' + encodeURIComponent(x.split(" echo-response ")[1]);
  };
  if (/ data *= *"/.test(x)) {
    mockPtn = x.replace(/ {2,}/g, " ").split(" data=")[0].replace(/^#|"/g, "");
    mockUrl = x.split(' data="')[1].split('"')[0];
    / header="/.test(x) ? mockHeader = x.split(' header="')[1].split('"')[0] : mockHeader = "";
  }
  return { mark, "noteK": noteK, "mockptn": mockPtn, "mockurl": mockUrl, "mockheader": mockHeader, "mocknum": y }
};//获取Mock参数

let binaryInfo: { url: string, binarymode: any }[] = [];
async function isBinaryMode(url: string, name: string) {
  if (/proto/i.test(name)) {
    return true;
  } else if (/(?:tieba|youtube|bili|spotify)/i.test(name)) {
    if (binaryInfo.some(item => item.url === url)) {
      for (let i = 0; i < binaryInfo.length; i++) {
        if (binaryInfo[i].url === url) {
          return binaryInfo[i].binarymode;
        }
      }
    } else {
      const res = await fetchBody(url);
      if (res == undefined || res == null) {
        return false;
      } else if (res.includes(".bodyBytes")) {
        binaryInfo.push({ "url": url, "binarymode": "true" });
        return true;
      } else {
        binaryInfo.push({ "url": url, "binarymode": "" });
        return false;
      }
    }
  } else { return false }
};

function isJsCon(x: string, arr: string[]) {
  if (arr != null) {
    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i];
      if (x.indexOf(elem) != -1) { return true };
    }
  }
  return false;
}

function toJsc(jsurl: string, jscStatus: boolean, jsc2Status: boolean, jsfrom: string, jsPre: string, jsSuf: string) {
  if (jscStatus == true || jsc2Status == true) {
    const jsFileName = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.'));
    return jsurl = jsPre + encodeURIComponent(jsurl) + jsSuf.replace(/_yuliu_/, jsFileName).replace(/_js_from_/, jsfrom);
  } 
  return jsurl
};

//script
function getJsInfo(x: string, regx: RegExp, jsRegx: RegExp) {
  if (regx.test(x)) {
    return x.split(regx)[1].split(jsRegx)[0].replace(/^"(.+)"$/, "$1");
  } else { return "" }
};



function getHn(x: string) {
  const arr = [];
  let hnBox2 = x.replace(/ |%.+%/g, "").split("=")[1].split(/,/);
  for (let i = 0; i < hnBox2.length; i++) {
    arr.push(hnBox2[i]);
  };
  return arr;
};

//reject
function rw_reject(x: string, mark: string) {
  const noteK = /^#/.test(x) ? "#" : "";
  const rwPtn = x.replace(/^#/, "").split(" ")[0];
  const rwMatch = x.match(/reject(-\w+)?$/i);
  if (rwMatch === null) {
    return;
  }
  const rwType = rwMatch[0].toLowerCase();
  return { mark, "noteK": noteK, "rwptn": rwPtn, "rwvalue": "-", "rwtype": rwType }
};

//名字简介解析
function getModInfo(x: string, box: { a: string, b: string }[]) {
  x = x.replace(/ *= */, '=');
  let a = "";
  let b = "";
  if (/^#!.+=.+/.test(x)) {
    // a = x.replace(/^#!/, "").match(/.+?=/)[0]; 修改
    let aReplaceRes = x.replace(/^#!/, "")
    if (aReplaceRes !== null) {
      // 在进行匹配
      let aMatchRes = aReplaceRes.match(/.+?=/)
      if (aMatchRes !== null) {
        a = aMatchRes[0]
      }
    }
    b = x.replace(/^#!/, "").replace(a, "");

  }
  box.push({ a, b });
};

//getQxReInfo
function getQxReInfo(x: string, y: number, mark: string) {
  const noteK = /^#/.test(x) ? '#' : '';
  const retype = / url *request-/i.test(x) ? 'request' : 'response';
  const jstype = 'http-' + retype;
  const hdorbd = / url *re[^ ]+?-header /i.test(x) ? 'header' : 'body';
  const breakpoint = retype + '-' + hdorbd;
  const reptn = x.split(/ *url *re/)[0].replace(/^#/, '');
  const jsname = /body/.test(hdorbd) ? 'replaceBody' : 'replaceHeader';
  const jsurl = /header/.test(hdorbd) ? 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js' : 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js';
  const rearg1 = x.split(breakpoint)[1].trim().replace(/^"(.+)"$/, "$1");
  const rearg2 = x.split(breakpoint)[2].trim().replace(/^"(.+)"$/, "$1");
  const jsarg = rearg1 + '->' + rearg2;
  const rebody = /body/.test(hdorbd) ? 'true' : '';
  const size = /body/.test(hdorbd) ? '3145728' : '';
  return { mark, "noteK": noteK, "jsname": jsname, "jstype": jstype, jsptn: reptn, "jsurl": jsurl, "rebody": rebody, "size": size, "timeout": "30", "jsarg": jsarg, "num": y }
};


export async function GET(request: NextRequest, { params }: { params: { sourceURL: string, scriptName: string } }) {
  const { sourceURL } = params;
  // 解析查询字符串
  const { searchParams } = request.nextUrl;
  // 目标应用
  const targetApp = searchParams.get('target');
  if (!targetApp) {
    // 直接返回404
    return new Response('Not Found', { status: 404 });
  }
  // 是否转换成 Surge 脚本
  const isSurgeiOS = targetApp == "surge-module";
  // 是否转换成 statsh 脚本
  const isStashiOS = targetApp === "stash-stoverride";
  // 是否转换成 Loon 脚本
  const isLooniOS = targetApp == "loon-plugin";
  // 是否转换成 shadowrocket 脚本
  const isShadowrocket = targetApp == "shadowrocket-module";
  let reqArr = sourceURL.match("%F0%9F%98%82") ? sourceURL.split("%F0%9F%98%82") : [sourceURL];

  let nName = searchParams.get('n')?.split('+') ?? null;
  const Pin0 = searchParams.get('y')?.split('+') ?? null;
  const Pout0 = searchParams.get('x')?.split('+') ?? null;
  const hnAdd = searchParams.get('hnadd')?.split(/ *, */) ?? null;
  const hnDel = searchParams.get('hndel')?.split(/ *, */) ?? null;
  const synMitm = istrue(searchParams.get('synMitm'));
  const delNoteSc = istrue(searchParams.get('del'));
  const nCron = searchParams.get('cron')?.split('+') ?? null;
  const nCronExp = searchParams.get('cronexp')?.replace(/\./g, ' ').split('+') ?? [];
  const nArgTarget = searchParams.get('arg')?.split('+') ?? null;
  const nArg = searchParams.get('argv')?.split('+') ?? [];
  const nTilesTarget = searchParams.get('tiles')?.split('+') ?? null;
  const nTilesColor = searchParams.get('tcolor')?.split('+') ?? [];
  const nPolicy = searchParams.get('policy');
  const jsConverter = searchParams.get('jsc')?.split('+') ?? null;
  const jsConverter2 = searchParams.get('jsc2')?.split('+') ?? null;
  const compatibilityOnly = istrue(searchParams.get('compatibilityOnly'));
  const keepHeader = istrue(searchParams.get('keepHeader'));
  const jsDelivr = istrue(searchParams.get('jsDelivr'));
  const localText = searchParams.get('localtext') ? "\n" + searchParams.get('localtext') : "";
  const ipNoResolve = istrue(searchParams.get('nore'));
  const sni = searchParams.get('sni')?.split('+') ?? null;

  const sufkeepHeader = keepHeader ? '&keepHeader=true' : '';
  const sufjsDelivr = jsDelivr ? '&jsDelivr=true' : '';

  let rewriteName = params.scriptName.substring(params.scriptName.lastIndexOf('/') + 1).split('.')[0];
  let name = "";
  let desc = "";
  let icon = "";

  //修改名字和简介
  if (nName === null) {
    name = rewriteName;
    desc = name;
  } else {
    name = nName[0] != "" ? nName[0] : rewriteName;
    desc = nName[1] != undefined ? nName[1] : name;
  };

  let modInfoBackup = "";
  if (isLooniOS) modInfoBackup = `#!name=${name}
#!desc=${desc}
${icon}`;
  if (isSurgeiOS || isShadowrocket) modInfoBackup = `#!name=${name}
#!desc=${desc}`;
  if (isStashiOS) modInfoBackup = `name: "${name}"
desc: "${desc}"`;

  //信息中转站
  let bodyBox = [];      //存储待转换的内容
  let otherRule = [];    //不支持的规则&脚本
  let inBox = [];        //被释放的重写或规则
  let outBox = [];       //被排除的重写或规则
  let modInfoBox: { a: string, b: string }[] = [];   //模块简介等信息
  let modInputBox: { a: string, b: string }[] = [];  //loon插件的可交互按钮
  let hostBox: any[] = [];      //host
  let ruleBox = [];      //规则
  let rwBox: any[] = [];        //重写
  let rwhdBox = [];      //HeaderRewrite
  let jsBox: any[] = [];        //脚本
  let mockBox: any[] = [];      //MapLocal或echo-response
  let hnBox: any[] = [];        //MITM主机名
  let fheBox: any[] = [];       //force-http-engine
  let skipBox: any[] = [];      //skip-ip
  let realBox: any[] = [];      //real-ip

  //待输出
  let modInfo = [];      //模块简介
  let httpFrame = [];    //Stash的http:父框架
  let tiles = [];        //磁贴覆写
  let General = [];
  let Panel = [];
  let host = [];
  let rules = [];
  let URLRewrite = [];
  let HeaderRewrite: any[] = [];
  let MapLocal = [];
  let script = [];
  let cron = [];
  let providers = [];

  hnBox = hnAdd != null ? hnAdd : [];
  const jsRegx = /[=,] *(?:script-path|pattern|timeout|argument|script-update-interval|requires-body|max-size|ability|binary-body-mode|cronexpr?|wake-system|enabled?|tag|type|img-url|debug|event-name|desc) *=/;
  let binaryInfo = [];

  //获取脚本内容
  let scriptContent = await fetch(sourceURL).then((res) => res.text());
  let matchResult = scriptContent.match(/^(?:\n|\r)*\/\*([\s\S]*?)(?:\r|\n)\s*\*+\//);
  if (matchResult !== null) {
    scriptContent = matchResult[1];
    bodyBox.push(scriptContent);
  } else {
    bodyBox.push(scriptContent);
  }

  let scriptContentResult = scriptContent.match(/[^\r\n]+/g);
  if (scriptContentResult !== null) {
    for await (var [y, x] of scriptContentResult.entries()) {
      //简单处理方便后续操作
      x = x.replace(/^ *(#|;|\/\/) */, '#').replace(/\x20.+url-and-header\x20/, ' url ').replace(/(^[^#].+)\x20+\/\/.+/, "$1");

      //去掉注释
      if (Pin0 != null) {
        for (let i = 0; i < Pin0.length; i++) {
          const elem = Pin0[i];
          if (x.indexOf(elem) != -1 && /^#/.test(x)) {
            x = x.replace(/^#/, "")
            inBox.push(x);
          };
        };
      }

      //增加注释
      if (Pout0 != null) {
        for (let i = 0; i < Pout0.length; i++) {
          const elem = Pout0[i];
          if (x.indexOf(elem) != -1 && x.search(/^(hostname|force-http-engine-hosts|skip-proxy|always-real-ip|real-ip) *=/) == -1 && !/^#/.test(x)) {
            x = "#" + x;
            outBox.push(x);
          };
        };//循环结束
      };//增加注释结束

      //剔除被注释的重写
      if (delNoteSc === true && x.match(/^#/) && x.indexOf("#!") == -1) {
        x = "";
      };

      //sni嗅探
      if (sni != null) {
        for (let i = 0; i < sni.length; i++) {
          const elem = sni[i];
          if (x.indexOf(elem) != -1 && /^(DOMAIN|RULE-SET)/i.test(x) && !/, *extended-matching/i.test(x)) {
            x = x + ",extended-matching";
          };
        };//循环结束
      };//启用sni嗅探结束

      //ip规则不解析域名
      if (ipNoResolve === true) {
        if (/^(?:ip-[ca]|RULE-SET)/i.test(x) && !/, *no-resolve/.test(x)) {
          x = x + ",no-resolve";
        };
      }

      let jscStatus = false;
      let jsc2Status = false;

      if (jsConverter != null) {
        jscStatus = isJsCon(x, jsConverter);
      }
      if (jsConverter2 != null) {
        jsc2Status = isJsCon(x, jsConverter2);
      }
      if (jsc2Status) {
        jscStatus = false;
      }

      let jsPre = "";
      let jsSuf = "";
      let jsTarget = targetApp?.split("-")[0];

      if (jscStatus == true || jsc2Status == true) {
        // 当前URL
        const domain = request.nextUrl.origin;
        jsPre = `${domain}/convert/`;
      };
      //todo 脚本转换
      if (jscStatus == true) {
        jsSuf = `/_yuliu_.js?type=_js_from_-script&target=${jsTarget}-script`;
      } else if (jsc2Status == true) {
        jsSuf = `/_yuliu_.js?type=_js_from_-script&target=${jsTarget}-script&wrap_response=true`;
      };

      if (compatibilityOnly == true && (jscStatus == true || jsc2Status == true)) {
        jsSuf = jsSuf + "&compatibilityOnly=true"
      };

      //模块信息 
      if (/^#!.+?= *$/.test(x)) { } else if (isLooniOS && /^#!(?:select|input) *= *.+/.test(x)) {
        getModInfo(x, modInputBox);
      } else if (reqArr.length > 1 && /^#!(?:name|desc|date) *=.+/.test(x) && (isSurgeiOS || isShadowrocket || isStashiOS)) {
        getModInfo(x, modInfoBox);
      } else if (reqArr.length == 1 && /^#!(?:name|desc|date|system) *=.+/.test(x) && (isSurgeiOS || isShadowrocket || isStashiOS)) {
        getModInfo(x, modInfoBox);
      } else if (isLooniOS && /^#!.+?=.+/.test(x)) {
        getModInfo(x, modInfoBox);
      };

      //hostname
      if (/^hostname *=.+/.test(x)) {
        hnBox = hnBox.concat(getHn(x));
      }

      if (/^force-http-engine-hosts *=.+/.test(x)) {
        fheBox = fheBox.concat(getHn(x));
      }

      if (/^skip-proxy *=.+/.test(x)) {
        skipBox = skipBox.concat(getHn(x));
      };

      if (/^(?:always-)?real-ip *=.+/.test(x)) {
        realBox = realBox.concat(getHn(x));
      };

      //reject 解析
      // 如果是 reject 或 reject
      if (/^#?(?!DOMAIN.*? *,|IP-CIDR6? *,|IP-ASN *,|OR *,|AND *,|NOT *,|USER-AGENT *,|URL-REGEX *,|RULE-SET *,|DE?ST-PORT *,|PROTOCOL *,).+reject(?:-\w+)?$/i.test(x)) {
        let mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        if (rw_reject(x, mark) != undefined) {
          rwBox.push(rw_reject(x, mark));
        }
      }
      //重定向 解析
      if (/(?: (?:302|307|header)(?:$| )|url 30(?:2|7) )/.test(x)) {
        let mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        if (rw_reject(x, mark) != undefined) {
          rwBox.push(rw_reject(x, mark));
        }
      }
      //header rewrite 解析

      if (/ header-(?:del|add|replace|replace-regex) /.test(x)) {
        let mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        rwhdBox.push(mark, x);
      };

      //(request|response)-(header|body) 解析
      if (/ url *(?:request|response)-(?:header|body) /i.test(x)) {
        let mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        jsBox.push(getQxReInfo(x, y, mark));
      };

      //rule解析
      if (/^#?(?:domain(?:-suffix|-keyword|-set)?|ip-cidr6?|ip-asn|rule-set|user-agent|url-regex|de?st-port|and|not|or|protocol) *,.+/i.test(x)) {
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        x = x.replace(/ /g, "");
        const noteK = /^#/.test(x) ? "#" : "";
        const ruletype = x.split(/ *, */)[0].replace(/^#/, "");
        const rulenore = /,no-resolve/.test(x) ? ",no-resolve" : "";
        const rulesni = /,extended-matching/.test(x) ? ",extended-matching" : "";
        const rulePandV = x.replace(/^#/, '').replace(ruletype, '').replace(rulenore, '').replace(rulesni, '').replace(/^,/, '');
        let rulepolicy = rulePandV.substring(rulePandV.lastIndexOf(',') + 1);
        rulepolicy = /\)|\}/.test(rulepolicy) ? "" : rulepolicy;
        const rulevalue = rulePandV.replace(rulepolicy, '').replace(/,$/, '').replace(/"/g, '');

        let modistatus = "yes";
        if (nPolicy != null && !/direct|reject/.test(rulepolicy) && !isLooniOS) {
          rulepolicy = nPolicy;
        } else {
          modistatus = "no";
        }
        ruleBox.push({ mark, noteK, ruletype, rulevalue, rulepolicy, rulenore, rulesni, "ori": x, modistatus })
      }

      //host解析
      if (/^#?(?:\*|localhost|[-*?0-9a-z]+\.[-*.?0-9a-z]+) *= *(?:sever *: *|script *: *)?[^ ,]+$/g.test(x)) {
        const noteK = /^#/.test(x) ? "#" : "";
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        const hostdomain = x.split(/ *= */)[0];
        const hostvalue = x.split(/ *= */)[1];
        hostBox.push({ mark, noteK, hostdomain, hostvalue, "ori": x })
      };

      //脚本 解析
      if (/script-path *=.+/.test(x)) {
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        const noteK = /^#/.test(x) ? "#" : "";
        let jsUrl = getJsInfo(x, /script-path *= */, jsRegx);
        const jsName = /[=,] *type *= */.test(x) ? x.split(/ *=/)[0].replace(/^#/, "") : /, *tag *= */.test(x) ? getJsInfo(x, /, *tag *= */, jsRegx) : jsUrl.substring(jsUrl.lastIndexOf('/') + 1, jsUrl.lastIndexOf('.')) + "_" + y;
        console.log(jsName);
        const jsfrom = "surge";
        jsUrl = toJsc(jsUrl, jscStatus, jsc2Status, jsfrom, jsPre, jsSuf);
        const jsType = /[=,] *type *= */.test(x) ? getJsInfo(x, /[=,] *type *=/, jsRegx) : x.split(/ +/)[0].replace(/^#/, "");
        const eventName = getJsInfo(x, /[=, ] *event-name *= */, jsRegx);
        const size = getJsInfo(x, /[=, ] *max-size *= */, jsRegx);
        const proto = getJsInfo(x, /[=, ] *binary-body-mode *= */, jsRegx);
        const jsPtn = /[=,] *pattern *= */.test(x) ? getJsInfo(x, /[=,] *pattern *= */, jsRegx).replace(/"/g, '') : x.split(/ +/)[1];
        let jsArg = getJsInfo(x, /[=, ] *argument *= */, jsRegx);
        const reBody = getJsInfo(x, /[=, ] *requires-body *= */, jsRegx);
        const wakeSys = getJsInfo(x, /[=, ] *wake-system *= */, jsRegx);
        let cronExp = getJsInfo(x, /[=, ] *cronexpr? *= */, jsRegx);
        const ability = getJsInfo(x, /[=, ] *ability *= */, jsRegx);
        const updateTime = getJsInfo(x, /[=, ] *script-update-interval *= */, jsRegx);
        const timeOut = getJsInfo(x, /[=, ] *timeout *= */, jsRegx);
        const tilesIcon = (jsType == "generic" && /icon=/.test(x)) ? x.split("icon=")[1].split("&")[0] : "";
        let tilesColor = (jsType == "generic" && /icon-color=/.test(x)) ? x.split("icon-color=")[1].split("&")[0] : "";
        if (nTilesTarget != null) {
          for (let i = 0; i < nTilesTarget.length; i++) {
            const elem = nTilesTarget[i];
            if (x.indexOf(elem) != -1) {
              tilesColor = nTilesColor[i].replace(/@/g, "#");
            };
          };
        };

        if (nArgTarget != null) {
          for (let i = 0; i < nArgTarget.length; i++) {
            const elem = nArgTarget[i];
            if (x.indexOf(elem) != -1) {
              jsArg = nArg[i].replace(/t;amp;/g, "&").replace(/t;add;/g, "+");
            };
          };
        };

        if (nCron != null) {
          for (let i = 0; i < nCron.length; i++) {
            const elem = nCron[i];
            if (x.indexOf(elem) != -1) {
              cronExp = nCronExp[i];
            };
          };
        };
        jsBox.push({ mark, "noteK": noteK, "jsname": jsName, "jstype": jsType, "jsptn": jsPtn, "jsurl": jsUrl, "rebody": reBody, "proto": proto, "size": size, "ability": ability, "updatetime": updateTime, "timeout": timeOut, "jsarg": jsArg, "cronexp": cronExp, "wakesys": wakeSys, "tilesicon": tilesIcon, "tilescolor": tilesColor, "eventname": eventName, "ori": x, "num": y })

      };//脚本解析结束

      //qx脚本解析
      if (/ url +script-/.test(x)) {
        x = x.replace(/ {2,}/g, " ");
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        const noteK = /^#/.test(x) ? "#" : "";
        const jsType = x.match(' url script-response') ? 'http-response' : 'http-request';
        const urlInNum = x.split(" ").indexOf("url");
        const jsPtn = x.split(" ")[urlInNum - 1].replace(/^#/, "");
        let jsUrl = x.split(" ")[urlInNum + 2];
        const jsfrom = "qx";
        const jsName = jsUrl.substring(jsUrl.lastIndexOf('/') + 1, jsUrl.lastIndexOf('.'));
        let jsArg = "";
        jsUrl = toJsc(jsUrl, jscStatus, jsc2Status, jsfrom, jsPre, jsSuf);
        const reBody = x.match(/ script[^ ]*(-body|-analyze)/) ? 'true' : '';
        const size = x.match(/ script[^ ]*(-body|-analyze)/) ? '-1' : '';
        const proto = await isBinaryMode(jsUrl, jsName);

        if (nArgTarget != null) {
          for (let i = 0; i < nArgTarget.length; i++) {
            const elem = nArgTarget[i];
            if (x.indexOf(elem) != -1) {
              jsArg = nArg[i].replace(/t;amp;/g, "&").replace(/t;add;/g, "+");
            };
          };
        };
        jsBox.push({ mark, "noteK": noteK, "jsname": jsName, "jstype": jsType, "jsptn": jsPtn, "jsurl": jsUrl, "rebody": reBody, "proto": proto, "size": size, "timeout": "60", "jsarg": jsArg, "ori": x, "num": y })
      }

      //qx cron脚本解析
      if (/[^ ]+ +[^u ]+ +[^ ]+ +[^ ]+ +[^ ]+ +([^ ]+ +)?(https?|ftp|file):\/\//.test(x)) {
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        const noteK = /^#/.test(x) ? "#" : "";
        let cronExp = x.replace(/ {2,}/g, " ").split(/\x20(https?|ftp|file)/)[0].replace(/^#/, '');
        let jsUrl = x.replace(/^#/, "")
          .replace(/\x20{2,}/g, " ")
          .replace(cronExp, "")
          .split(/ *, */)[0]
          .trim();
        const jsName = jsUrl.substring(jsUrl.lastIndexOf('/') + 1, jsUrl.lastIndexOf('.'));
        const jsfrom = "qx";
        jsUrl = toJsc(jsUrl, jscStatus, jsc2Status, jsfrom, jsPre, jsSuf);
        let jsArg = "";

        if (nCron != null) {
          for (let i = 0; i < nCron.length; i++) {
            const elem = nCron[i];
            if (x.indexOf(elem) != -1) {
              cronExp = nCronExp[i];
            };
          };
        };

        if (nArgTarget != null) {
          for (let i = 0; i < nArgTarget.length; i++) {
            const elem = nArgTarget[i];
            if (x.indexOf(elem) != -1) {
              jsArg = nArg[i].replace(/t;amp;/g, "&").replace(/t;add;/g, "+");
            };
          };
        };
        jsBox.push({ mark, "noteK": noteK, "jsname": jsName, "jstype": "cron", "cronexp": cronExp, "jsurl": jsUrl, "wakesys": "1", "timeout": "60", "jsarg": jsArg, "ori": x, "num": y })

      }

      //mock 解析
      if (/url +echo-response | data *= *"/.test(x)) {
        const mark = scriptContent[y - 1]?.match(/^#/) ? scriptContent[y - 1] : "";
        mockBox.push(getMockInfo(x, mark, y));
      };



    }
  }

  //去重
  let obj: { [key: string]: any } = {};
  inBox = Array.from(new Set(inBox));

  outBox = Array.from(new Set(outBox));

  hnBox = Array.from(new Set(hnBox));

  fheBox = Array.from(new Set(fheBox));

  skipBox = Array.from(new Set(skipBox));

  realBox = Array.from(new Set(realBox));

  ruleBox = Array.from(new Set(ruleBox));

  modInfoBox = modInfoBox.reduce<{ a: string; b: string; }[]>((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.a] ? '' : obj[next.a] = curr.push(next);
    return curr;
  }, []);

  modInputBox = modInputBox.reduce<{ a: string; b: string; }[]>((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.a + next.b] ? '' : obj[next.a + next.b] = curr.push(next);
    return curr;
  }, []);

  hostBox = hostBox.reduce<{}[]>((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.hostdomain] ? '' : obj[next.hostdomain] = curr.push(next);
    return curr;
  }, []);

  rwBox = rwBox.reduce<{}[]>((curr, next) => {
    if (next) {
      obj[next.rwptn] ? '' : obj[next.rwptn] = curr.push(next);
    }
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    return curr;
  }, []);

  jsBox = jsBox.reduce<{}[]>((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.jstype + next.jsptn + next.jsurl] ? '' : obj[next.jstype + next.jsptn + next.jsurl] = curr.push(next);
    return curr;
  }, []);

  mockBox = mockBox.reduce<{}[]>((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.mockptn] ? '' : obj[next.mockptn] === curr.push(next);
    return curr;
  }, []);//去重结束

  //mitm删除主机名
  if (hnDel != null && hnBox.length != 0) hnBox = hnBox.filter(function (item) {
    return hnDel.indexOf(item) == -1
  });
  const hnBoxStr = pieceHn(hnBox, isStashiOS);
  const fheBoxStr = pieceHn(fheBox, isStashiOS);
  const skipBoxStr = pieceHn(skipBox, isStashiOS);
  const realBoxStr = pieceHn(realBox, isStashiOS);
  if (synMitm) {
    fheBox = hnBox;
  }

  //模块信息输出
  switch (targetApp) {
    case "surge-module":
    case "shadowrocket-module":
    case "loon-plugin":
      for (let i = 0; i < modInfoBox.length; i++) {
        let info = "#!" + modInfoBox[i].a + modInfoBox[i].b;
        if (nName != null && /#!name *=/.test(info)) {
          info = "#!name=" + name
        };
        if (nName != null && /#!desc *=/.test(info)) {
          info = "#!desc=" + desc
        };
        modInfo.push(info);
      };//for

      for (let i = 0; i < modInputBox.length; i++) {
        let info = "#!" + modInputBox[i].a + modInputBox[i].b;
        modInfo.push(info);
      };//for
      break;

    case "stash-stoverride":
      for (let i = 0; i < modInfoBox.length; i++) {
        let info = modInfoBox[i].a.replace(/ *= */, '') + ': "' + modInfoBox[i].b + '"';
        if (nName != null && /^name: *"/.test(info)) {
          info = 'name: "' + name + '"'
        };
        if (nName != null && /^desc: *"/.test(info)) {
          info = 'desc: "' + desc + '"'
        };
        modInfo.push(info);
      };//for
      break;
  };//模块信息输出结束

  //rule输出 switch不适合
  for (let i = 0; i < ruleBox.length; i++) {
    const noteK = ruleBox[i].noteK ? "#" : "";
    const mark = ruleBox[i].mark ? ruleBox[i].mark + "\n" : "";
    let noteKn8 = "\n#        ";
    let noteKn6 = "\n#      ";
    let noteKn4 = "\n#    ";
    let noteK4 = "#    ";
    let noteK2 = "#  ";
    let Urx2Reject = "";
    if (noteK != "#" && isStashiOS) {
      noteKn8 = "\n        ";
      noteKn6 = "\n      ";
      noteKn4 = "\n    ";
      noteK4 = "    ";
      noteK2 = "  ";
    }
    let ruletype = ruleBox[i].ruletype.toUpperCase();
    let rulevalue = ruleBox[i].rulevalue ? ruleBox[i].rulevalue : "";
    let rulepolicy = ruleBox[i].rulepolicy ? ruleBox[i].rulepolicy : "";
    rulepolicy = /direct|reject/i.test(rulepolicy) ? rulepolicy.toUpperCase() : rulepolicy;
    let rulenore = ruleBox[i].rulenore ? ruleBox[i].rulenore : "";
    let rulesni = ruleBox[i].rulesni ? ruleBox[i].rulesni : "";
    rulesni = isLooniOS || isStashiOS ? "" : rulesni;
    let modistatus = ruleBox[i].modistatus;
    if (/de?st-port/i.test(ruletype)) {
      ruletype = isSurgeiOS ? "DEST-PORT" : "DST-PORT";
    };
    if (/reject-video/i.test(rulepolicy) && !isLooniOS) {
      rulepolicy = "REJECT-TINYGIF";
    };
    if (/reject-tinygif|reject-no-dorp/i.test(rulepolicy) && isLooniOS) {
      rulepolicy = "REJECT-IMG";
    };
    if (/reject-(?:dict|array|img)/i.test(rulepolicy) && isSurgeiOS) {
      rulepolicy = "REJECT-TINYGIF"
    };
    if (/reject-/i.test(rulepolicy) && !/url-regex/i.test(ruletype) && isStashiOS) {
      rulepolicy = "REJECT";
    };

    if (rulevalue == "" || rulepolicy == "") {
      otherRule.push(ruleBox[i].ori)
    } else if (/proxy/i.test(rulepolicy) && modistatus == "no" && (isSurgeiOS || isStashiOS || isShadowrocket)) {
      otherRule.push(ruleBox[i].ori)
    } else if (/^(?:and|or|not|protocol|domain-set|rule-set)$/i.test(ruletype) && isSurgeiOS) {
      rules.push(mark + noteK + ruletype + "," + rulevalue + "," + rulepolicy + rulenore + rulesni)
    } else if (/^(?:and|or|not|domain-set|rule-set)$/i.test(ruletype) && isShadowrocket) {
      rules.push(mark + noteK + ruletype + "," + rulevalue + "," + rulepolicy + rulenore + rulesni)
    } else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|user-agent|url-regex)/i.test(ruletype) && !isStashiOS) {
      rulevalue = /,/.test(rulevalue) ? '"' + rulevalue + '"' : rulevalue;
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni)
    } else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|de?st-port)/i.test(ruletype) && isStashiOS) {
      rules.push(mark + noteK2 + '- ' + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore)
    } else if (/de?st-port/.test(ruletype) && (isSurgeiOS && isShadowrocket)) { rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy) } else if (/url-regex/i.test(ruletype) && isStashiOS && /reject/i.test(rulepolicy)) {
      if (/DICT/i.test(rulepolicy)) {
        Urx2Reject = '-dict';
      } else if (/ARRAY/i.test(rulepolicy)) {
        Urx2Reject = '-array';
      } else if (/DROP|video/i.test(rulepolicy)) {
        Urx2Reject = '-200';
      } else if (/IMG$|TINYGIF$/i.test(rulepolicy)) {
        Urx2Reject = '-img';
      } else if (/REJECT$/i.test(rulepolicy)) {
        Urx2Reject = '';
      };

      URLRewrite.push(mark + noteK4 + '- >-' + noteKn6 + rulevalue + ' - reject' + Urx2Reject)
    } else {
      otherRule.push(ruleBox[i].ori)
    };
  }

  //reject redirect 输出
  switch (targetApp) {
    case "loon-plugin":
    case "shadowrocket-module":
      for (let i = 0; i < rwBox.length; i++) {
        let noteK = rwBox[i].noteK ? "#" : "";
        const mark = rwBox[i].mark ? rwBox[i].mark + "\n" : "";
        URLRewrite.push(mark + noteK + rwBox[i].rwptn + " " + rwBox[i].rwvalue + " " + rwBox[i].rwtype.replace(/-video|-tinygif/, "-img"))
      };
      break;

    case "stash-stoverride":
      for (let i = 0; i < rwBox.length; i++) {
        const mark = rwBox[i].mark ? rwBox[i].mark + "\n" : "";
        let noteKn8 = "\n#        ";
        let noteKn6 = "\n#      ";
        let noteKn4 = "\n#    ";
        let noteK4 = "#    ";
        let noteK2 = "#  ";
        if (rwBox[i].noteK != "#") {
          noteKn8 = "\n        ";
          noteKn6 = "\n      ";
          noteKn4 = "\n    ";
          noteK4 = "    ";
          noteK2 = "  ";
        } else { };
        URLRewrite.push(mark + noteK4 + "- >-" + noteKn6 + rwBox[i].rwptn + " " + rwBox[i].rwvalue + " " + rwBox[i].rwtype.replace(/-video|-tinygif/, "-img"))
      };
      break;

    case "surge-module":
      for (let i = 0; i < rwBox.length; i++) {
        rwBox[i].noteK = rwBox[i].noteK ? "#" : "";
        const mark = rwBox[i].mark ? rwBox[i].mark + "\n" : "";
        if (/(?:reject|302|307|header)$/.test(rwBox[i].rwtype)) {
          URLRewrite.push(mark + rwBox[i].noteK + rwBox[i].rwptn + " " + rwBox[i].rwvalue + " " + rwBox[i].rwtype)
        };
        if (/reject-dict/.test(rwBox[i].rwtype)) {
          MapLocal.push(mark + rwBox[i].noteK + rwBox[i].rwptn + ' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-dict.json"')
        };
        if (/reject-array/.test(rwBox[i].rwtype)) {
          MapLocal.push(mark + rwBox[i].noteK + rwBox[i].rwptn + ' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-array.json"')
        };
        if (/reject-200/.test(rwBox[i].rwtype)) {
          MapLocal.push(mark + rwBox[i].noteK + rwBox[i].rwptn + ' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-200.txt"')
        };
        if (/reject-(?:img|tinygif|video)/.test(rwBox[i].rwtype)) {
          MapLocal.push(mark + rwBox[i].noteK + rwBox[i].rwptn + ' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-img.gif"')
        };
      }
      break;
  }

  //headerRewrite输出
  switch (targetApp) {
    case "surge-module":
      HeaderRewrite = rwhdBox;
      break;

    case "loon-plugin":
      for (let i = 0; i < rwhdBox.length; i++) {
        URLRewrite.push(rwhdBox[i].replace(/^(#)?http-(?:request|response) */, "$1"));
      };//for
      break;

    case "stash-stoverride":
      for (let i = 0; i < rwhdBox.length; i++) {
        let noteKn8 = "\n#        ";
        let noteKn6 = "\n#      ";
        let noteKn4 = "\n#    ";
        let noteK4 = "#    ";
        let noteK2 = "#  ";
        if (!/^#/.test(rwhdBox[i])) {
          noteKn8 = "\n        ";
          noteKn6 = "\n      ";
          noteKn4 = "\n    ";
          noteK4 = "    ";
          noteK2 = "  ";
        }
        const hdtype = /^#?http-response /.test(rwhdBox[i]) ? ' response-' : ' request-';
        HeaderRewrite.push(`${noteK4}- >-${noteKn6}` + rwhdBox[i].replace(/^#?http-(?:request|response) */, "").replace(/ header-/, hdtype));
      };//for
      break;
  }

  //host输出
  for (let i = 0; i < hostBox.length; i++) {
    let noteK = hostBox[i].noteK ? "#" : "";
    const mark = hostBox[i].mark ? hostBox[i].mark + "\n" : "";
    const hostdomain = hostBox[i].hostdomain;
    const hostvalue = hostBox[i].hostvalue;
    if (isStashiOS) {
      otherRule.push(hostBox[i].ori)
    } else if (isLooniOS && /script *: */.test(hostvalue)) {
      otherRule.push(hostBox[i].ori)
    } else {
      host.push(mark + noteK + hostdomain + ' = ' + hostvalue)
    };
  };//for

  //script输出
  switch (targetApp) {
    case "surge-module":
    case "shadowrocket-module":
    case "loon-plugin":
      for (let i = 0; i < jsBox.length; i++) {
        const noteK = jsBox[i].noteK ? "#" : "";
        const mark = jsBox[i].mark ? jsBox[i].mark + "\n" : "";
        let jstype = jsBox[i].jstype;
        let jsptn = /generic|event|dns|rule|network-changed/.test(jstype) ? "" : jsBox[i].jsptn;
        jsptn = isLooniOS && jsptn ? " " + jsptn : jsptn;
        if (/,/.test(jsptn) && isSurgeiOS) {
          jsptn = '"' + jsptn + '"'
        };
        if ((isSurgeiOS || isShadowrocket) && jsptn != "") {
          jsptn = ', pattern=' + jsptn
        };
        const jsname = jsBox[i].jsname + "_" + i;
        const eventname = jsBox[i].eventname ? ', event-name=' + jsBox[i].eventname : ', event-name=network-changed';
        jstype = isLooniOS && /event/.test(jstype) ? 'network-changed' : !isLooniOS && /network-changed/.test(jstype) ? 'event' : jstype;
        const jsurl = jsBox[i].jsurl;
        const rebody = jsBox[i].rebody ? ", requires-body=" + istrue(jsBox[i].rebody) : "";
        const proto = jsBox[i].proto ? ", binary-body-mode=" + istrue(jsBox[i].proto) : "";
        const size = jsBox[i].size ? ", max-size=" + jsBox[i].size : "";
        const ability = jsBox[i].ability ? ", ability=" + jsBox[i].ability : "";
        const updatetime = jsBox[i].updatetime ? ", script-update-interval=" + jsBox[i].updatetime : "";
        const cronexp = jsBox[i].cronexp;
        const wakesys = jsBox[i].wakesys ? ", wake-system=" + jsBox[i].wakesys : "";
        const timeout = jsBox[i].timeout ? ", timeout=" + jsBox[i].timeout : "";
        let jsarg = jsBox[i].jsarg ? jsBox[i].jsarg : "";
        if (jsarg != "" && /,/.test(jsarg)) {
          jsarg = ', argument="' + jsarg + '"'
        };
        if (jsarg != "" && !/,/.test(jsarg)) {

          jsarg = ', argument=' + jsarg
        };

        if (/generic/.test(jstype) && isShadowrocket) {
          otherRule.push(jsBox[i].ori);
        } else if (/request|response|network-changed|generic/.test(jstype) && isLooniOS) {
          script.push(mark + noteK + jstype + jsptn + " script-path=" + jsurl + rebody + proto + timeout + ", tag=" + jsname + jsarg);
        } else if (/request|response|generic/.test(jstype) && (isSurgeiOS || isShadowrocket)) {
          script.push(mark + noteK + jsname + " = type=" + jstype + jsptn + ", script-path=" + jsurl + rebody + proto + size + ability + updatetime + timeout + jsarg);
        } else if (jstype == "event" && (isSurgeiOS || isShadowrocket)) {
          script.push(mark + noteK + jsname + " = type=" + jstype + eventname + ", script-path=" + jsurl + ability + updatetime + timeout + jsarg);
        } else if (jstype == "cron" && (isSurgeiOS || isShadowrocket)) {
          script.push(mark + noteK + jsname + ' = type=' + jstype + ', cronexp="' + cronexp + '"' + ', script-path=' + jsurl + updatetime + timeout + wakesys + jsarg);
        } else if (jstype == "cron" && isLooniOS) {
          script.push(mark + noteK + jstype + ' "' + cronexp + '"' + " script-path=" + jsurl + timeout + ', tag=' + jsname + jsarg);
        } else if (/dns|rule/.test(jstype) && (isSurgeiOS || isShadowrocket)) {
          script.push(mark + noteK + jsname + " = type=" + jstype + ", script-path=" + jsurl + updatetime + timeout + jsarg)
        } else {
          otherRule.push(jsBox[i].ori)
        };

        if (isSurgeiOS && jstype == "generic") {
          Panel.push(jsname + " = script-name=" + jsname + ", update-interval=3600")
        };
      };//for
      break;

    case "stash-stoverride":
      //处理脚本名字
      let urlMap: any = {};

      for (let i = 0; i < jsBox.length; i++) {
        let url = jsBox[i].jsurl;
        jsBox[i].jsname = jsBox[i].jsname + '_' + jsBox[i].num;

        if (urlMap[url]) {
          jsBox[i].jsname = urlMap[url];
        } else {
          urlMap[url] = jsBox[i].jsname;
        }
      };

      for (let i = 0; i < jsBox.length; i++) {
        let noteKn8 = "\n#        ";
        let noteKn6 = "\n#      ";
        let noteKn4 = "\n#    ";
        let noteK4 = "#    ";
        let noteK2 = "#  ";
        if (jsBox[i].noteK != "#") {
          noteKn8 = "\n        ";
          noteKn6 = "\n      ";
          noteKn4 = "\n    ";
          noteK4 = "    ";
          noteK2 = "  ";
        }
        const jstype = jsBox[i].jstype.replace(/http-/, '');
        const mark = jsBox[i].mark ? jsBox[i].mark + "\n" : "";
        const jsptn = jsBox[i].jsptn;
        const jsname = jsBox[i].jsname;
        const jsurl = jsBox[i].jsurl;
        const rebody = jsBox[i].rebody ? noteKn6 + "require-body: " + istrue(jsBox[i].rebody) : "";
        const proto = jsBox[i].proto ? noteKn6 + "binary-mode: " + istrue(jsBox[i].proto) : "";
        const size = jsBox[i].size ? noteKn6 + "max-size: " + jsBox[i].size : "";
        const cronexp = jsBox[i].cronexp;
        const timeout = jsBox[i].timeout ? noteKn6 + "timeout: " + jsBox[i].timeout : "";
        let jsarg = jsBox[i].jsarg ? jsBox[i].jsarg : "";
        jsarg = jsarg && jstype == "generic" ? noteKn4 + "argument: |-" + noteKn6 + jsarg : jsarg && jstype != "generic" ? noteKn6 + "argument: |-" + noteKn8 + jsarg : "";
        const tilesicon = jsBox[i].tilesicon ? jsBox[i].tilesicon : "";
        const tilescolor = jsBox[i].tilescolor ? jsBox[i].tilescolor : "";

        if (/request|response/.test(jstype)) {
          script.push(mark + noteKn4 + '- match: ' + jsptn + noteKn6 + 'name: "' + jsname + '"' + noteKn6 + 'type: ' + jstype + rebody + size + proto + timeout + jsarg);
          providers.push(`${noteK2}"` + jsname + '":' + `${noteKn4}url: ` + jsurl + `${noteKn4}interval: 86400`);
        };
        if (jstype == "cron") {
          cron.push(mark + `${noteKn4}- name: "` + jsname + `"${noteKn6}cron: "` + cronexp + `"${timeout}` + jsarg);
          providers.push(`${noteK2}"` + jsname + '":' + `${noteKn4}url: ` + jsurl + `${noteKn4}interval: 86400`);
        };
        if (jstype == "generic") {
          tiles.push(
            mark + `${noteK2}- name: "${jsname}"${noteKn4}interval: 3600${noteKn4}title: "${jsname}"${noteKn4}icon: "${tilesicon}"${noteKn4}backgroundColor: "${tilescolor}"${noteKn4}timeout: 30${jsarg}`);
          providers.push(
            `${noteK2}"${jsname}":${noteKn4}url: ${jsurl}${noteKn4}interval: 86400`);
        };
        /event|rule|dns/i.test(jstype) && otherRule.push(jsBox[i].ori);
      };//for循环
      break;


  };//script输出结束

  //Mock输出
  switch (targetApp) {
    case "surge-module":
      for (let i = 0; i < mockBox.length; i++) {
        const noteK = mockBox[i].noteK ? "#" : "";
        const mark = mockBox[i].mark ? mockBox[i].mark + "\n" : "";
        const mockptn = mockBox[i].mockptn;
        const mockurl = mockBox[i].mockurl;
        const mockheader = keepHeader == true && mockBox[i].mockheader && !/&contentType=/.test(mockBox[i].mockheader) ? ' header="' + mockBox[i].mockheader + '"' : "";
        MapLocal.push(mark + noteK + mockptn + ' data="' + mockurl + '"' + mockheader)
      };//for
      break;

    case "shadowrocket-module":
    case "loon-plugin":
    case "stash-stoverride":
      for (let i = 0; i < mockBox.length; i++) {
        const noteK = mockBox[i].noteK ? "#" : "";
        const mark = mockBox[i].mark ? mockBox[i].mark + "\n" : "";
        let noteKn8 = "\n        ";
        let noteKn6 = "\n      ";
        let noteKn4 = "\n    ";
        let noteK4 = "#    ";
        let noteK2 = "#  ";
        if (isStashiOS && noteK != "#") {
          noteKn8 = "\n        ";
          noteKn6 = "\n      ";
          noteKn4 = "\n    ";
          noteK4 = "    ";
          noteK2 = "  ";
        }
        let mockptn = mockBox[i].mockptn;
        let mockurl = mockBox[i].mockurl;
        let mockheader = mockBox[i].mockheader ? mockBox[i].mockheader : "";
        let mfile = mockurl.substring(mockurl.lastIndexOf('/') + 1);
        let mfName = mockurl.substring(mockurl.lastIndexOf('/') + 1, mockurl.lastIndexOf('.'));
        let mocknum = mockBox[i].mocknum;
        let m2rType = "";
        if (/dict/i.test(mfName)) {
          m2rType = "-dict"
        } else if (/array/i.test(mfName)) {
          m2rType = "-array"
        }
        else if (/200|blank/i.test(mfName)) {
          m2rType = "-200"
        }
        else if (/img|tinygif/i.test(mfName)) {
          m2rType = "-img"
        }


        m2rType != null && !isStashiOS && URLRewrite.push(mark + noteK + mockptn + ' - reject' + m2rType);
        m2rType != null && isStashiOS && URLRewrite.push(mark + noteK4 + '- >-' + noteKn6 + mockptn + ' - reject' + m2rType);
        mockheader = m2rType == null && mockheader != "" && !/&contentType=/.test(mockheader) ? '&header=' + encodeURIComponent(mockheader) : m2rType == null && mockheader != "" && /&contentType=/.test(mockheader) ? mockheader : "";
        if (keepHeader == false) mockheader = "";

        mockurl = m2rType == null ? `http://script.hub/convert/_start_/${mockurl}/_end_/${mfile}?type=mock&target-app=${targetApp}${mockheader}${sufkeepHeader}${sufjsDelivr}` : "";

        if (isStashiOS && m2rType == null) {
          script.push(mark + `${noteK4}- match: ${mockptn}${noteKn6}name: "${mfName}_${mocknum}"${noteKn6}type: request${noteKn6}timeout: 60${noteKn6}binary-mode: true`)

          providers.push(`${noteK2}"${mfName}_${mocknum}":${noteKn4}url: ${mockurl}${noteKn4}interval: 86400`)
        };

        if ((isLooniOS || isShadowrocket) && m2rType == null) {
          script.push(mark + `${noteK}http-request ${mockptn} script-path=${mockurl}, timeout=60, tag=${mfName}`)
        };

      };//for

      break;
  }//Mock输出结束

  //输出内容
  switch (targetApp) {
    case "surge-module":
    case "shadowrocket-module":
    case "loon-plugin":
      //模块信息
      // 需要输出的内容
      let modInfoStr = "";
      if (modInfo.length != 0) {
        modInfoStr = modInfo.join("\n") + "\n";
      };
      if (modInfoStr == "") {
        modInfoStr = modInfoBackup
      }
      //rules 
      let rulesStr = "";
      if (rules.length != 0) {
        rulesStr = `[Rule]\n\n${rules.join("\n")}`;
      };
      //Panel
      let PanelStr = "";
      if (Panel.length != 0) {
        PanelStr = `[Panel]\n\n${Panel.join("\n")}`;
      };
      //URLRewrite
      let URLRewriteStr = "";
      if (URLRewrite.length != 0) {
        URLRewriteStr = `[URL Rewrite]\n\n${URLRewrite.join("\n")}`;
      };
      //HeaderRewrite
      let HeaderRewriteStr = "";
      if (HeaderRewrite.length != 0) {
        HeaderRewriteStr = `[Header Rewrite]\n\n${HeaderRewrite.join("\n")}`;
      };
      //MapLocal
      let MapLocalStr = "";
      if (MapLocal.length != 0) {
        MapLocalStr = `[Map Local]\n\n${MapLocal.join("\n")}`;
      };
      //host
      let hostStr = "";
      if (host.length != 0) {
        hostStr = `[Host]\n\n${host.join("\n")}`;
      };
      //script
      let scriptStr = "";
      if (script.length != 0) {
        scriptStr = `[Script]\n\n${script.join("\n")}`;
      };
      let MITM = "";
      let GeneralStr = "";
      // 这里还需要细分具体的目的类型
      if (isLooniOS) {
        //MITM
        if (hnBoxStr !== "") {
          MITM = "[MITM]\n\n" + hnBoxStr;
        }
        if (fheBoxStr !== "") {
          General.push('force-http-engine-hosts = %APPEND% ' + fheBoxStr)
        }
        //skipBox
        if (skipBoxStr !== "") {
          General.push('skip-proxy = %APPEND% ' + skipBoxStr)
        }
        //realBox
        if (realBoxStr !== "") {
          General.push('real-ip = %APPEND% ' + realBoxStr)
        }
        if (General.length > 0) {
          GeneralStr = `[General]\n\n${General.join("\n")}`;
        }
      } else if (isSurgeiOS || isShadowrocket) {
        //MITM
        if (hnBoxStr !== "") {
          MITM = "[MITM]\n\nhostname = %APPEND% " + hnBoxStr
        }
        if (fheBoxStr !== "") {
          General.push('force-http-engine-hosts = %APPEND% ' + fheBoxStr)
        }
        //skipBox
        if (skipBoxStr !== "") {
          General.push('skip-proxy = %APPEND% ' + skipBoxStr)
        }
        //realBox
        if (realBoxStr !== "") {
          General.push('always-real-ip = %APPEND% ' + realBoxStr)
        }
        if (General.length > 0) {
          GeneralStr = `[General]\n\n${General.join("\n")}`;
        }
      }
      let body = `${modInfoStr}

${GeneralStr}

${MITM}

${rulesStr}

${URLRewriteStr}

${HeaderRewriteStr}

${MapLocalStr}

${PanelStr}

${hostStr}

${scriptStr}
`.replace(/^(#.+\n)\n+(?!\[)/g, '$1')
        .replace(/\n{2,}/g, '\n\n')
      return new Response(body);
  }
  return new Response(skipBoxStr);
}
