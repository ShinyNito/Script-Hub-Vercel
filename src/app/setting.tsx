import { useReducer, useEffect, useMemo, useState } from "react";
import AutoExpandingTextarea from "@/components/AutoExpandingTextarea";
import { Accordion, AccordionItem, Checkbox, Select, SelectItem } from "@nextui-org/react";
import React from "react";

//来源类型
const sourceTypes = [
    { id: 1, name: 'QX 重写', value: 'qx-rewrite' },
    { id: 2, name: 'Surge 模块', value: 'surge-module' },
    { id: 3, name: 'Loon 插件', value: 'loon-plugin' },
    { id: 4, name: '规则集', value: "rule-set" },
    { id: 5, name: 'QX 专属脚本', value: "qx-script" },
    { id: 6, name: '纯文本', value: "plain-text" },
];

type State = {
    source: string;
    sourceType: string;
    targetType: string;
    scriptConversion1: string;
    scriptConversion2: string;
    scriptConversion1All: boolean;
    scriptConversion2All: boolean;
    compatibilityOnly: boolean;
    fileName: string;
    keepRewrite: string;
    excludeRewrite: string;
    syncMitmHostsToHttpEngine: boolean;
    removeCommentedRewrite: boolean;
    keepMapLocalHeader: boolean;
    gitHubToJsDelivr: boolean;
    keepRule: string;
    excludeRule: string;
    addMitmHosts: string;
    removeMitmHosts: string;
    modifyCron: string;
    modifyCronexp: string;
    modifyArg: string;
    modifyArgv: string;
    ipRuleNoResolve: boolean;
    sniExtendedMatching: string;
    alwaysDoneResponse: boolean;
    compatibilityOnlyAll: boolean;
};

type Action =
    | { type: "setSource"; payload: string }
    | { type: "setSourceType"; payload: string }
    | { type: "setTargetType"; payload: string }
    | { type: "setScriptConversion1"; payload: string }
    | { type: "setScriptConversion2"; payload: string }
    | { type: "setScriptConversion1All"; payload: boolean }
    | { type: "setScriptConversion2All"; payload: boolean }
    | { type: "setCompatibilityOnly"; payload: boolean }
    | { type: "setFileName"; payload: string }
    | { type: "setKeepRewrite"; payload: string }
    | { type: "setExcludeRewrite"; payload: string }
    | { type: "setSyncMitmHostsToHttpEngine"; payload: boolean }
    | { type: "setRemoveCommentedRewrite"; payload: boolean }
    | { type: "setKeepMapLocalHeader"; payload: boolean }
    | { type: "setGitHubToJsDelivr"; payload: boolean }
    | { type: "setKeepRule"; payload: string }
    | { type: "setExcludeRule"; payload: string }
    | { type: "setAddMitmHosts"; payload: string }
    | { type: "setRemoveMitmHosts"; payload: string }
    | { type: "setModifyCron"; payload: string }
    | { type: "setModifyCronexp"; payload: string }
    | { type: "setModifyArg"; payload: string }
    | { type: "setModifyArgv"; payload: string }
    | { type: "setIpRuleNoResolve"; payload: boolean }
    | { type: "setSniExtendedMatching"; payload: string }
    | { type: "setAlwaysDoneResponse"; payload: boolean }
    | { type: "setCompatibilityOnlyAll"; payload: boolean };
;

//state别名
const StateAlias = {
    "sourceType": "type",
    "targetType": "target",
    "keepRewrite": "y",
    "keepRule": "y",
    "excludeRewrite": "x",
    "excludeRule": "x",
    "syncMitmHostsToHttpEngine": "syncMitm",
    "removeCommentedRewrite": "del",
    "keepMapLocalHeader": "keepHeader",
    "gitHubToJsDelivr": "jsDelivr",
    "addMitmHosts": "hnadd",
    "removeMitmHosts": "hndel",
    "modifyCron": "cron",
    "modifyCronexp": "cronexp",
    "modifyArg": "arg",
    "modifyArgv": "argv",
    "ipRuleNoResolve": "nore",
    "sniExtendedMatching": "sni",
    "scriptConversion1": "jsc",
    "scriptConversion2": "jsc2",
    "compatibilityOnly": "compatibilityOnly",
    'alwaysDoneResponse': 'wrap_response',
}

//目标类型

export default function Setting({ onUrlChange }: { onUrlChange: (url: string) => void }) {

    const initialState: State = {
        source: "",
        sourceType: "",
        targetType: "",
        scriptConversion1: "",
        scriptConversion2: "",
        scriptConversion1All: false,
        scriptConversion2All: false,
        compatibilityOnly: false,
        fileName: "",
        keepRewrite: "",
        excludeRewrite: "",
        syncMitmHostsToHttpEngine: false,
        removeCommentedRewrite: false,
        keepMapLocalHeader: false,
        gitHubToJsDelivr: false,
        keepRule: "",
        excludeRule: "",
        addMitmHosts: "",
        removeMitmHosts: "",
        modifyCron: "",
        modifyCronexp: "",
        modifyArg: "",
        modifyArgv: "",
        ipRuleNoResolve: false,
        sniExtendedMatching: "",
        alwaysDoneResponse: false,
        compatibilityOnlyAll: false,
    };
    function reducer(state: State, action: Action): State {
        switch (action.type) {
            case 'setSource':
                return { ...state, source: action.payload };
            case 'setSourceType':
                return { ...state, sourceType: action.payload };
            case 'setTargetType':
                return { ...state, targetType: action.payload };
            case 'setScriptConversion1':
                return { ...state, scriptConversion1: action.payload };
            case 'setScriptConversion2':
                return { ...state, scriptConversion2: action.payload };
            case 'setScriptConversion1All':
                return { ...state, scriptConversion1All: action.payload };
            case 'setScriptConversion2All':
                return { ...state, scriptConversion2All: action.payload };
            case 'setCompatibilityOnly':
                return { ...state, compatibilityOnly: action.payload };
            case 'setFileName':
                return { ...state, fileName: action.payload };
            case 'setKeepRewrite':
                return { ...state, keepRewrite: action.payload };
            case 'setExcludeRewrite':
                return { ...state, excludeRewrite: action.payload };
            case 'setSyncMitmHostsToHttpEngine':
                return { ...state, syncMitmHostsToHttpEngine: action.payload };
            case 'setRemoveCommentedRewrite':
                return { ...state, removeCommentedRewrite: action.payload };
            case 'setKeepMapLocalHeader':
                return { ...state, keepMapLocalHeader: action.payload };
            case 'setGitHubToJsDelivr':
                return { ...state, gitHubToJsDelivr: action.payload };
            case 'setKeepRule':
                return { ...state, keepRule: action.payload };
            case 'setExcludeRule':
                return { ...state, excludeRule: action.payload };
            case 'setAddMitmHosts':
                return { ...state, addMitmHosts: action.payload };
            case 'setRemoveMitmHosts':
                return { ...state, removeMitmHosts: action.payload };
            case 'setModifyCron':
                return { ...state, modifyCron: action.payload };
            case 'setModifyCronexp':
                return { ...state, modifyCronexp: action.payload };
            case 'setModifyArg':
                return { ...state, modifyArg: action.payload };
            case 'setModifyArgv':
                return { ...state, modifyArgv: action.payload };
            case 'setIpRuleNoResolve':
                return { ...state, ipRuleNoResolve: action.payload };
            case 'setSniExtendedMatching':
                return { ...state, sniExtendedMatching: action.payload };
            case 'setAlwaysDoneResponse':
                return { ...state, alwaysDoneResponse: action.payload };
            case 'setCompatibilityOnlyAll':
                return { ...state, compatibilityOnlyAll: action.payload };
            default:
                return state;
        }


    }
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => {
        const result: { [key: string]: string } = {};
        for (const key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const element = state[key as keyof State];
                const alias: string = StateAlias[key as keyof typeof StateAlias];
                if (alias && element) {
                    result[alias] = typeof element === "boolean" ? element.toString() : element;
                }
            }
        }
        if (state.scriptConversion1All) {
            result["jsc"] = ".";
        }
        if (state.scriptConversion2All) {
            result["jsc2"] = ".";
        }
        // 如果没有目标类型，就不要传递了
        if (state.targetType === "") {
            return
        }
        // 如果没有来源地址，就不要传递了
        if (state.source === "") {
            return
        }
        const params = new URLSearchParams(result);
        // 如果params为空，就不要传递了
        if (params.toString()) {
            let finalFileName = state.fileName;
            // 如果finalFileName为空，从来源地址中取
            if (finalFileName === "") {
                const fileNamePattern = /([^\/]+)(?=\.[^\.]+$)/;
                const fileNameResult = fileNamePattern.exec(state.source);
                if (fileNameResult === null) {
                    return
                }
                finalFileName = fileNameResult[1];
            }
            switch (state.targetType) {
                case "surge-module":
                case "shadowrocket-module":
                    finalFileName += ".sgmodule";
                    break;
                case "stash-stoverride":
                    finalFileName += ".stoverride";
                    break;
                case "loon-plugin":
                    finalFileName += ".plugin";
                    break;
                case "rule-set":
                    finalFileName += ".list";
                    break;

            }
            // 获取当前的domain
            //如果不是rule-set
            if (state.sourceType === "rule-set") {
                onUrlChange(`${location.origin}/rule/${encodeURIComponent(state.source)}/${finalFileName}?${params.toString()}`);
            } else {
                onUrlChange(`${location.origin}/file/${encodeURIComponent(state.source)}/${finalFileName}?${params.toString()}`);
            }
        }
    }, [state, onUrlChange]);

    const targetTypeOptions = useMemo(() => {
        switch (state.sourceType) {
            case 'qx-rewrite':
            case 'surge-module':
            case 'loon-plugin':
            case 'plain-text':
                return [
                    { label: "Surge模块", value: "surge-module", description: "Surge模块" },
                    { label: "Stash覆写", value: "stash-stoverride", description: "Stash覆写" },
                    { label: "Loon插件", value: "loon-plugin", description: "Loon模块插件" },
                    { label: "规则集", value: "rule-set", description: "规则集" },
                    { label: "纯文本", value: "plain-text", description: "纯文本" },
                ]
            case 'rule-set':
                return [
                    { label: "Loon规则集", value: "loon-rule-set", description: "Surge规则集" },
                    { label: "shadowrocket规则集", value: "shadowrocket-rule-set", description: "Loon规则集" },
                    // surge-rule-set
                    { label: "Surge规则集", value: "surge-rule-set", description: "Surge规则集" },
                    // 域名规则集(surge)
                    { label: "域名规则集", value: "surge-domain-set", description: "域名规则集" },
                    // 无法转换为域名集的剩余规则(Surge) surge-domain-set2
                    { label: "无法转换为域名集的剩余规则(Surge)", value: "surge-domain-set2", description: "无法转换为域名集的剩余规则" },
                    //规则集(Stash)
                    { label: "规则集(Stash)", value: "stash-rule-set", description: "规则集(Stash)" },
                    //域名集²(Stash)
                    { label: "域名集²(Stash)", value: "stash-domain-set", description: "域名集²(Stash)" },
                    //无法转换为域名集²的剩余规则集(Stash)
                    { label: "无法转换为域名集²的剩余规则集(Stash)", value: "stash-domain-set2", description: "无法转换为域名集²的剩余规则集(Stash)" },
                ];
            case 'qx-script':
                return [ /* ... */];
            default:
                return [
                    // surge-scrip (Surge 脚本(兼容))
                    { label: "Surge 脚本(兼容)", value: "surge-script", description: "Surge 脚本(兼容)" },
                ];
        }
    }, [
        state.sourceType
    ]);

    // 来源地址
    const setSource = (payload: string) => {
        dispatch({ type: "setSource", payload })
    };
    // 来源类型
    const setSourceType = (payload: string) => {
        dispatch({ type: "setSourceType", payload });
    };
    // 监听目标类型选项
    useEffect(() => {
        setTargetType("")
    }, [targetTypeOptions])
    // 目标类型
    const setTargetType = (payload: string) => dispatch({ type: "setTargetType", payload });
    // 脚本转换1
    const setScriptConversion1 = (payload: string) => dispatch({ type: "setScriptConversion1", payload });
    // 脚本转换2
    const setScriptConversion2 = (payload: string) => dispatch({ type: "setScriptConversion2", payload });
    // 脚本转换1 全部转换
    const setScriptConversion1All = (payload: boolean) => dispatch({ type: "setScriptConversion1All", payload });
    // 脚本转换2 全部转换
    const setScriptConversion2All = (payload: boolean) => dispatch({ type: "setScriptConversion2All", payload });
    // 脚本转换 兼容性转换
    const setCompatibilityOnly = (payload: boolean) => dispatch({ type: "setCompatibilityOnly", payload });
    // 文件名
    const setFileName = (payload: string) => dispatch({ type: "setFileName", payload });
    // 保留重写
    const setKeepRewrite = (payload: string) => dispatch({ type: "setKeepRewrite", payload });
    // 排除重写
    const setExcludeRewrite = (payload: string) => dispatch({ type: "setExcludeRewrite", payload });
    // 将 MitM 主机名同步至 force-http-engine-hosts
    const setSyncMitmHostsToHttpEngine = (payload: boolean) => dispatch({ type: "setSyncMitmHostsToHttpEngine", payload });
    // 从转换结果中剔除被注释的重写
    const setRemoveCommentedRewrite = (payload: boolean) => dispatch({ type: "setRemoveCommentedRewrite", payload });
    // 保留 Map Local/echo-response 中的 header/content-type(占用内存多 但响应快)
    const setKeepMapLocalHeader = (payload: boolean) => dispatch({ type: "setKeepMapLocalHeader", payload });
    // GitHub 转 jsDelivr(修复 content-type)
    const setGitHubToJsDelivr = (payload: boolean) => dispatch({ type: "setGitHubToJsDelivr", payload });
    // 保留规则
    const setKeepRule = (payload: string) => dispatch({ type: "setKeepRule", payload });
    // 排除规则
    const setExcludeRule = (payload: string) => dispatch({ type: "setExcludeRule", payload });
    // 添加 MitM 主机名
    const setAddMitmHosts = (payload: string) => dispatch({ type: "setAddMitmHosts", payload });
    // 移除 MitM 主机名
    const setRemoveMitmHosts = (payload: string) => dispatch({ type: "setRemoveMitmHosts", payload });
    // 修改 Cron
    const setModifyCron = (payload: string) => dispatch({ type: "setModifyCron", payload });
    // 修改 Cronexp
    const setModifyCronexp = (payload: string) => dispatch({ type: "setModifyCronexp", payload });
    // 修改 Arg
    const setModifyArg = (payload: string) => dispatch({ type: "setModifyArg", payload });
    // 修改 Argv
    const setModifyArgv = (payload: string) => dispatch({ type: "setModifyArgv", payload });
    // IP 规则不解析
    const setIpRuleNoResolve = (payload: boolean) => dispatch({ type: "setIpRuleNoResolve", payload });
    // SNI 扩展匹配
    const setSniExtendedMatching = (payload: string) => dispatch({ type: "setSniExtendedMatching", payload });
    // 总是在 $done(response) 里包一个 response
    const setAlwaysDoneResponse = (payload: boolean) => dispatch({ type: "setAlwaysDoneResponse", payload });
    // 兼容性转换 全部转换
    const setCompatibilityOnlyAll = (payload: boolean) => dispatch({ type: "setCompatibilityOnlyAll", payload });

    //IP 规则开启不解析域名(即 no-resolve)
    const noResolve = (

        <Checkbox
            className="block"
            isSelected={state.ipRuleNoResolve}
            onValueChange={(value) => {
                setIpRuleNoResolve(value)
            }}
        >
            IP 规则开启不解析域名(即 no-resolve)
        </Checkbox>
    )
    //总是在 $done(response) 里包一个 response
    const alwaysDoneResponse = (
        <Checkbox
            className="block"
            isSelected={state.alwaysDoneResponse}
            onValueChange={setAlwaysDoneResponse}
        >
            总是在 $done(response) 里包一个 response
        </Checkbox>
    )

    //兼容性转换 全部转换
    const compatibilityOnlyAll = (
        <Checkbox
            className="block"
            isSelected={state.compatibilityOnlyAll}
            onValueChange={setCompatibilityOnlyAll}
        >
            兼容性转换 全部转换
        </Checkbox>
    )

    // 启动脚本转换
    const scriptConversion = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem
                key="2"
                aria-label="启用脚本转换"
                title="启用脚本转换"
            >
                <Accordion
                    variant="splitted" isCompact className="mt-2 px-0"
                >
                    <AccordionItem
                        key="1"
                        aria-label="启用脚本转换1"
                        title="启用脚本转换1"
                    >
                        <div>
                            根据关键词为脚本启用脚本转换(多关键词以{`"+"`}分隔，主要用途 将使用了QX独有api的脚本转换为通用脚本，谨慎开启，大部分脚本本身就通用，无差别启用，只会徒增功耗)
                        </div>
                        <AutoExpandingTextarea
                            value={state.scriptConversion1}
                            onChange={setScriptConversion1}
                        />
                        {/* 全部转换 */}
                        <Checkbox
                            className="block"
                            checked={state.scriptConversion1All}
                            onChange={(e) => setScriptConversion1All(e.target.checked)}

                        >全部转换</Checkbox>
                        {/* 仅进行兼容性转换 */}
                        <Checkbox
                            className="block"
                            checked={state.compatibilityOnly}
                            onChange={(e) => setCompatibilityOnly(e.target.checked)}
                        >仅进行兼容性转换</Checkbox>
                    </AccordionItem>
                    <AccordionItem
                        key="2"
                        aria-label="启用脚本转换2"
                        title="启用脚本转换2"
                    >
                        <div>
                            根据关键词为脚本启用脚本转换(与 启用脚本转换 1 的区别: 总是会在$done(body)里包一个response)
                        </div>
                        <AutoExpandingTextarea
                            value={state.scriptConversion2}
                            onChange={setScriptConversion2}
                        />
                        {/* 全部转换 */}
                        <Checkbox
                            className="block"
                            checked={state.scriptConversion2All}
                            onChange={(e) => setScriptConversion2All(e.target.checked)}
                        >
                            全部转换
                        </Checkbox>
                        {/* 仅进行兼容性转换 */}
                        <Checkbox
                             className="block"
                            checked={state.compatibilityOnly}
                            onChange={(e) => setCompatibilityOnly(e.target.checked)}
                        > 仅进行兼容性转换</Checkbox>
                    </AccordionItem>
                </Accordion>
            </AccordionItem>
        </Accordion>
    )

    //重写相关
    const rewriteRelated = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem key="3" aria-label="重写相关" title="重写相关">
                <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
                    <AccordionItem
                        key="1"
                        aria-label="保留重写"
                        title="保留重写"
                    >
                        <span>根据关键词保留重写(即去掉注释符#) 多关键词以{"" + ""}分隔</span>
                        <AutoExpandingTextarea
                            value={state.keepRewrite}
                            onChange={setKeepRewrite}
                        >
                        </AutoExpandingTextarea>
                    </AccordionItem>
                    <AccordionItem
                        key="2"
                        className="my-2"
                        aria-label="排除重写"
                        title="排除重写"
                    >
                        <div>
                            根据关键词排除重写(即添加注释符#) 多关键词以{"" + ""}分隔
                        </div>
                        <AutoExpandingTextarea
                            value={state.excludeRewrite}
                            onChange={setExcludeRewrite}
                        ></AutoExpandingTextarea>
                    </AccordionItem>
                </Accordion>
                {/* 将 MitM 主机名同步至 force-http-engine-hosts */}
                <Checkbox
                  className="block"
                    checked={state.syncMitmHostsToHttpEngine}
                    onChange={(e) => setSyncMitmHostsToHttpEngine(e.target.checked)}
                >
                    将 MitM 主机名同步至 force-http-engine-hosts
                </Checkbox>
                {/* 从转换结果中剔除被注释的重写 */}
                <Checkbox
                   className="block"
                    checked={state.removeCommentedRewrite}
                    onChange={(e) => setRemoveCommentedRewrite(e.target.checked)}
                >
                    从转换结果中剔除被注释的重写
                </Checkbox>
                {/* 保留 Map Local/echo-response 中的 header/content-type(占用内存多 但响应快) */}
                <Checkbox
                 className="block"
                    checked={state.keepMapLocalHeader}
                    onChange={(e) => setKeepMapLocalHeader(e.target.checked)}
                >
                    保留 Map Local/echo-response 中的 header/content-type(占用内存多 但响应快)
                </Checkbox>
                {/* GitHub 转 jsDelivr(修复 content-type) */}
                <Checkbox
                  className="block"
                    checked={state.gitHubToJsDelivr}
                    onChange={(e) => setGitHubToJsDelivr(e.target.checked)}
                >
                    GitHub 转 jsDelivr(修复 content-type)</Checkbox>
            </AccordionItem>
        </Accordion>

    )

    //规则相关
    const ruleRelated = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem key="3" aria-label="规则相关" title="规则相关">
                <Accordion variant="splitted" isCompact className="mt-2 px-0" >
                    <AccordionItem key="1" aria-label="保留规则" title="保留规则">
                        <span>根据关键词保留规则(即去掉注释符#) 多关键词以{"" + ""}分隔</span>
                        <AutoExpandingTextarea
                            value={state.keepRule}
                            onChange={setKeepRule}
                        />

                    </AccordionItem>
                    <AccordionItem key="2" aria-label="排除规则" title="排除规则">
                        <div>
                            根据关键词排除规则(即添加注释符#) 多关键词以{"" + ""}分隔
                        </div>
                        <AutoExpandingTextarea
                            value={state.excludeRule}
                            onChange={setExcludeRule}
                        />
                    </AccordionItem>
                </Accordion>
            </AccordionItem>
        </Accordion>
    )

    //修改 MITM 主机名
    const modifyMitmHosts = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem key="4" aria-label="修改 MITM 主机名" title="修改 MITM 主机名">
                <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
                    <AccordionItem key="1" aria-label="添加 MITM 主机名" title="添加 MITM 主机名">
                        <span>添加 MITM 主机名 多主机名以{'","'}分隔</span>
                        <AutoExpandingTextarea
                            value={state.addMitmHosts}
                            onChange={setAddMitmHosts}
                        />
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="移除 MITM 主机名" title="移除 MITM 主机名">
                        <div>
                            从已有MITM主机名中删除主机名 多主机名以{'","'}分隔(需要传入完整主机名)
                        </div>
                        <AutoExpandingTextarea
                            value={state.removeMitmHosts}
                            onChange={setRemoveMitmHosts}
                        />
                    </AccordionItem>
                </Accordion>
            </AccordionItem>
        </Accordion>
    )

    //修改定时任务
    const modifyCron = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem key="5" aria-label="修改定时任务" title="修改定时任务">
                <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
                    <AccordionItem key="1" aria-label="修改定时任务(cron)" title="修改定时任务(cron)">
                        <span>根据关键词锁定cron脚本配合参数cronexp= 修改定时任务的cron表达式 多关键词用{"" + ""}分隔，cron=传入了几项，cronexp=也必须对应传入几项。 cron表达式中空格可用{'"."'}或{'"%20"'}替代</span>
                        <AutoExpandingTextarea
                            value={state.modifyCron}
                            onChange={setModifyCron}
                        />
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="修改定时任务(cronexp)" title="修改定时任务(cronexp)">
                        <span>见 cron= 参数说明</span>
                        <AutoExpandingTextarea
                            value={state.modifyCronexp}
                            onChange={setModifyCronexp}
                        />
                    </AccordionItem>
                </Accordion>
            </AccordionItem>
        </Accordion>
    )

    //修改参数
    const modifyArg = (

        <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
            <AccordionItem key="6" aria-label="修改参数" title="修改参数" >
                <Accordion variant="splitted" isCompact className="mt-2 px-0" selectionMode="multiple">
                    <AccordionItem key="1" aria-label="修改参数(arg)" title="修改参数(arg)">
                        <span>arg= 根据关键词锁定脚本配合参数argv= 修改argument=的值 多关键词用{"" + ""}分隔，arg=传入了几项，argv=也必须对应传入几项。 argument中 {"" + ""}必须用{'"t;add;"'}替代。</span>
                        <AutoExpandingTextarea
                            value={state.modifyArg}
                            onChange={setModifyArg}
                        />
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="修改参数(argv)" title="修改参数(argv)">
                        <span>见 arg= 参数说明</span>
                        <AutoExpandingTextarea
                            value={state.modifyArgv}
                            onChange={setModifyArgv}
                        />
                    </AccordionItem>
                </Accordion>
            </AccordionItem>
        </Accordion>
    )

    //SNI 扩展匹配(extended-matching)
    const SNIExtended = (
        <Accordion variant="splitted" isCompact className="my-2 px-0" selectionMode="multiple" >
            <AccordionItem key="7" aria-label="SNI 扩展匹配(extended-matching)" title="SNI 扩展匹配(extended-matching)">
                <div>
                    根据关键词开启 Surge 的 SNI 扩展匹配(extended-matching) 多关键词以{`{""+""}`}分隔
                </div>
                <AutoExpandingTextarea
                    value={state.sniExtendedMatching}
                    onChange={setSniExtendedMatching}
                />
            </AccordionItem>
        </Accordion>
    )
    const fileName = (
        <Accordion variant="splitted" isCompact className="mt-2 px-0" >
            <AccordionItem
                key="1"
                aria-label="启用脚本转移"
                title="文件名"
            >
                <AutoExpandingTextarea
                    value={state.fileName}
                    onChange={setFileName}
                />

            </AccordionItem>
        </Accordion>
    )

    const [accordionChildren, setAccordionChildren] = useState<JSX.Element[]>([
        scriptConversion,
        fileName,
        rewriteRelated,
        modifyMitmHosts,
        modifyCron,
        modifyArg,
        SNIExtended,
    ]);


    useEffect(() => {
        let children: JSX.Element[] = [];
        if (state.sourceType !== "rule-set") {
            children = [
                scriptConversion,
                fileName,
                rewriteRelated,
                modifyMitmHosts,
                modifyCron,
                modifyArg,
                SNIExtended,
            ];
        } else {
            children.push(
                fileName,
                ruleRelated
            );
        }
        setAccordionChildren(children);
    }, [state.sourceType]);
    return (
        <div className="overflow-auto  h-full  ">
            <div className="ring-1 ring-gray-300 p-4 ">
                {/* 来源地址 */}
                <div className="col-span-full">
                    <AutoExpandingTextarea
                        label="来源地址"
                        value={state.source}
                        onChange={setSource}
                    />
                </div>
                {/* 来源地址 ListBox */}
                <div className="col-span-full pt-2">
                    <Select
                        label="来源类型"
                        placeholder="请选择来源类型"
                        labelPlacement="outside"
                        value={state.sourceType}
                        className="w-full"
                        onChange={(e) => {
                            setSourceType(e.target.value as string);
                        }}
                    >
                        {sourceTypes.map((animal) => (
                            <SelectItem key={animal.value} value={animal.value}>
                                {animal.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                {
                    state.sourceType &&
                    <div className="col-span-full pt-2">
                        <Select
                            label="目标类型"
                            placeholder="请选择目标类型"
                            labelPlacement="outside"
                            value={state.targetType}
                            onChange={(e) => {
                                setTargetType(e.target.value as string);
                            }}
                        >
                            {targetTypeOptions.map((animal) => (
                                <SelectItem key={animal.value} value={animal.value}>
                                    {animal.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                }
                {fileName}
                <>
                    {
                        (() => {
                            if (state.sourceType === "rule-set") {
                                return (
                                    <>
                                        {ruleRelated}
                                        {noResolve}
                                    </>
                                )
                            } else {
                                return (
                                    <>
                                        {scriptConversion}
                                        {rewriteRelated}
                                        {modifyMitmHosts}
                                        {modifyCron}
                                        {modifyArg}
                                        {SNIExtended}
                                        {noResolve}
                                        {alwaysDoneResponse}
                                        {compatibilityOnlyAll}
                                    </>
                                )
                            }
                        })()
                    }
                </>
            </div>
        </div>
    );
}
