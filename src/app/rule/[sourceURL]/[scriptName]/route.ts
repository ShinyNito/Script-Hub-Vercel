import { NextRequest } from 'next/server';
import { fetchBody, istrue } from '@/app/utils/utils';
import build from 'next/dist/build';

//构建不支持的规则
function buildOthersStr(others: string[]) {
  let othersStr = '';
  if (others.length > 0) {
    othersStr = "\n#不支持的规则:\n";
  }
  // 循环构建
  others.forEach((item) => {
    othersStr += `#${item}\n`;
  });
  return othersStr;
}

//buildoutRulesStr
function buildoutRulesStr(outRules: string[]) {
  let outRulesStr = '';
  if (outRules.length > 0) {
    outRulesStr = "\n#已排除规则:\n";
  }
  // 循环构建
  outRules.forEach((item) => {
    outRulesStr += `#${item}\n`;
  });
  return outRulesStr;
}

// buildRulesStr
function buildRulesStr(ruleSetStr: string, ruleSetNum: number, notSupportNum:number , outRulesNum :number, othersStr: string, outRulesStr : string) {
  //
  
  // 获取target-前的字符串
  return `
#规则数量:${ruleSetNum} 
#不支持的规则数量:${notSupportNum}
#已排除的规则数量:${outRulesNum}${othersStr}${outRulesStr}
#-----------------以下为解析后的规则-----------------#
${ruleSetStr}
  `
}


export async function GET(request: NextRequest, { params }: { params: { sourceURL: string, scriptName: string } }) {
  const { sourceURL } = params;
  // 解析查询字符串
  const { searchParams } = request.nextUrl;

  const req = sourceURL;
  const reqArr = [req];
  const target = searchParams.get('target') ?? 'surge-rule-set';
  let bodyBox = [];
  const strY = searchParams.get("y") ?? "";
  const Rin0 = strY == "" ? [] : strY.split("+");
  const strX = searchParams.get("x") ?? "";
  const Rout0 = strX == "" ? [] : strX.split("+");
  const ipNoResolve = istrue(searchParams.get('nore'));
  const sniStr = searchParams.get("sni") ?? "";
  const sni = sniStr == "" ? [] : sniStr.split("+");
  let body = "";
  for (let i = 0; i < reqArr.length; i++) {
    body = await fetchBody(reqArr[i]);
    if (body.match(/^(?:\s)*\/\*[\s\S]*?(?:\r|\n)\s*\*+\//)) {
      const bodyMatch = body.match(/^(?:\n|\r)*\/\*([\s\S]*?)(?:\r|\n)\s*\*+\//)
      if (bodyMatch !== null) {
        body = bodyMatch[1];
        bodyBox.push(body);
      }
    } else {
      bodyBox.push(body)
    }
  };


  let others: any[] = [];       //不支持的规则
  let ruleSet = [];      //解析过后的规则
  let domainSet = [];    //域名集
  let outRules: any[] = [];     //被排除的规则

  let noResolve          //ip规则是否开启不解析域名
  let ruleType           //规则类型
  let ruleValue          //规则
  let bodyMatch = body.match(/[^\r\n]+/g);
  if (bodyMatch !== null) {
    for await (let [_, x] of bodyMatch.entries()) {
      x = x.replace(/^payload:/, '').replace(/^ *(#|;|\/\/)/, '#').replace(/ *- /, '').replace(/(^[^#].+)\x20+\/\/.+/, '$1').replace(/(\{[0-9]+)\,([0-9]*\})/g, '$1t&zd;$2').replace(/(^[^U].*(\[|=|{|\\|\/.*\.js).*)/i, "").replace(/'|"/g, "").replace(/^(\.|\*|\+)\.?/, "DOMAIN-SUFFIX,");
      if (!x.match(/^ *#/) && !x.match(/,/) && x != "") {
        if (x.search(/[0-9]\/[0-9]/) != -1) {
          x = "IP-CIDR," + x;
        } else if (x.search(/([0-9]|[a-z]):([0-9]|[a-z])/) != -1) {
          x = "IP-CIDR6," + x;
        } else {
          x = "DOMAIN," + x;
        }
      }
      if (Rin0 != null) {
        for (let i = 0; i < Rin0.length; i++) {
          const elem = Rin0[i];
          if (x.indexOf(elem) != -1) {
            x = x.replace(/^#/, "")
          };
        };
      };

      //增加注释
      if (Rout0.length !== 0) {
        for (let i = 0; i < Rout0.length; i++) {
          const elem = Rout0[i];
          if (x.indexOf(elem) != -1) {
            x = x.replace(/(.+)/, ";#$1")
          };
        };
      };

      //ip规则不解析域名
      if (ipNoResolve === true && x.match(/^ip6?-[ca]/i) != null) {
        x = x + ",no-resolve";
      }

      //sni嗅探
      if (sni.length !== 0) {
        for (let i = 0; i < sni.length; i++) {
          const elem = sni[i];
          if (x.indexOf(elem) != -1 && x.search(/^ip6?-[ca]/i) == -1) {
            x = x + ",extended-matching";
          };
        };
      };

      x = x.replace(/^#.+/, '').replace(/^host-wildcard/i, 'HO-ST-WILDCARD').replace(/^host/i, 'DOMAIN').replace(/^dest-port/i, 'DST-PORT').replace(/^ip6-cidr/i, 'IP-CIDR6')
      switch (target) {
        case "stash-rule-set":
        case "stash-domain-set":
        case "stash-domain-set2":
          if (x.match(/^;#/)) {
            outRules.push(x.replace(/^;#/, "").replace(/^HO-ST/i, 'HOST'))
          } else if (x.match(/^(HO-ST|U|PROTOCOL|OR|AND|NOT)/i)) {

            others.push(x.replace(/^HO-ST/i, 'HOST'))

          } else if (x != "") {

            noResolve = x.replace(/\x20/g, "").match(/,no-resolve/i) ? ",no-resolve" : '';
            if (x.match(/^PROCESS/i)) {
              ruleType = x.split(",")[1].match("/") ? "PROCESS-PATH" : "PROCESS-NAME";
            } else {
              ruleType = x.replace(/\x20/g, "").split(",")[0].toUpperCase();
            };

            ruleValue = x.split(/ *, */)[1];

            ruleSet.push(
              `  - ${ruleType},${ruleValue}${noResolve}`
            )
          };
          break;
        case "loon-rule-set":
          if (x.match(/^;#/)) {

            outRules.push(x.replace(/^;#/, "").replace(/^HO-ST/i, 'HOST'))
          } else if (x.match(/^(HO-ST|DST-PORT|PROTOCOL|PROCESS-NAME|OR|AND|NOT)/i)) {
            others.push(x.replace(/^HO-ST/i, 'HOST'))

          } else if (x != "") {

            noResolve = x.replace(/\x20/g, "").match(/,no-resolve/i) ? ",no-resolve" : '';

            ruleType = x.split(/ *, */)[0].toUpperCase();

            ruleValue = x.split(/ *, */)[1];

            ruleSet.push(
              `${ruleType},${ruleValue}${noResolve}`
            )
          }
          break;
        case "shadowrocket-rule-set":
        case "surge-domain-set":
        case "surge-domain-set2":
        case "surge-rule-set":
          if (x.match(/^;#/)) {

            outRules.push(x.replace(/^;#/, "").replace(/^HO-ST/i, 'HOST'))
          } else if (x.match(/^HO-ST/i)) {

            others.push(x.replace(/^HO-ST/i, 'HOST'))

          } else if (x.match(/^(OR|AND|NOT)/i)) {
            ruleSet.push(x);
          } else if (x != "") {

            noResolve = x.replace(/\x20/g, "").match(/,no-resolve/i) ? ",no-resolve" : '';
            const dSni = x.replace(/\x20/g, "").match(/,extended-matching/i) ? ",extended-matching" : '';

            ruleType = x.split(/ *, */)[0].toUpperCase().replace(/^PROCESS-PATH/i, "PROCESS-NAME");

            if (target == "surge-rule-set") {
              ruleType = ruleType.replace(/^DST-PORT/i, "DEST-PORT");
            };
            ruleValue = x.split(/ *, */)[1];
            ruleSet.push(`${ruleType},${ruleValue}${noResolve}${dSni}`)
          }
          break;
        default:
          return new Response("error", { status: 500 });
      }
    }
  }

  let ruleNum = ruleSet.length;
  let notSupport = others.length;
  let outRuleNum = outRules.length;
  let domainNum = 0;
  let ruleNum2 = 0;
  const othersStr = buildOthersStr(others);
  const outRulesStr = buildoutRulesStr(outRules)
  let ruleSetStr = "";
  switch (target) {
    case "stash-rule-set":
      if (ruleSet.length === 0) {
        return new Response("error", { status: 404 });
      }
      ruleSetStr = buildRulesStr(`\n\npayload:\n${ruleSet.join("\n")}`, ruleNum, notSupport, outRuleNum, othersStr, outRulesStr);
      break;
    //isSurgeiOS || isShadowrocket || isLooniOS
    case "surge-rule-set":
    case "shadowrocket-rule-set":
    case "loon-rule-set":
      if (ruleSet.length ===0) {
        return new Response("error", { status: 404 });
      }
      ruleSetStr = buildRulesStr(ruleSet.join("\n"), ruleNum, notSupport, outRuleNum, othersStr, outRulesStr);
      break
      //isSurgedomainset || isSurgedomainset2
    case "surge-domain-set":
    case "surge-domain-set2":
      domainSet = ruleSet.filter((ruleSet) => ruleSet.search(/^DOMAIN(,|-SUFFIX)/) != -1);
      ruleSet = ruleSet.filter((ruleSet) => ruleSet.search(/^DOMAIN(,|-SUFFIX)/) == -1);
      ruleNum2 = ruleSet.length;
      domainNum = domainSet.length;
      if (target == "surge-domain-set") {
        if (ruleSet.length === 0) {
          return new Response("error", { status: 404 });
        }
        ruleSetStr = buildRulesStr(domainSet.join("\n").replace(/^DOMAIN,/mg, "").replace(/^DOMAIN-SUFFIX,/mg, "."), ruleNum, notSupport, outRuleNum,  othersStr, outRulesStr);
      } else {
        if (ruleSet.length === 0) {
          return new Response("error", { status: 404 });
        }
        ruleSetStr = buildRulesStr(ruleSet.join("\n"), ruleNum, notSupport, outRuleNum, othersStr, outRulesStr);
      };
      break;
    //isStashdomainset || isStashdomainset2
    case "stash-domain-set":
    case "stash-domain-set2":
      domainSet = ruleSet.filter((ruleSet) => ruleSet.search(/  - DOMAIN(,|-SUFFIX)/) != -1);
      ruleSet = ruleSet.filter((ruleSet) => ruleSet.search(/  - DOMAIN(,|-SUFFIX)/) == -1);
      ruleNum2 = ruleSet.length;
      domainNum = domainSet.length;
      if (target == "stash-domain-set") {
        if (domainSet.length === 0) {
          return new Response("error", { status: 404 });
        }
        ruleSetStr = domainSet.join("\n").replace(/  - DOMAIN,/mg, "").replace(/  - DOMAIN-SUFFIX,/mg, ".").replace(/^([^,]*),?.*/mig, "$1");
      } else {
        if (ruleSet.length === 0) {
          return new Response("error", { status: 404 });
        }
        ruleSetStr = buildRulesStr(`\npayload:\n${ruleSet.join("\n")}`, ruleNum, notSupport, outRuleNum, othersStr, outRulesStr);
      };
      break;
  }
  body = `${ruleSetStr}`.replace(/t&zd;/g, ',').replace(/ ;#/g, " ");
  return new Response(body);

}