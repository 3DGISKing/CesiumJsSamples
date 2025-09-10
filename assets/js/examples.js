import {
    d as a,
    r as l,
    g as e,
    s as n,
    o as s,
    c as i,
    b as t,
    x as c,
    a as o,
    w as r,
    l as d,
    h,
    F as p,
    n as m,
    y as g,
    t as u,
    j as v,
    z as C,
    k as f,
    B as I,
    m as w,
    v as k,
    p as A,
    e as x,
    _ as b,
    A as S,
    i as E,
    f as B,
    M as Q
} from "./index.js";
import { c as y, p as z } from "./api.js";
import { i as V } from "./vue-lazyload.esm.js";
import "./axios.js";
const j = (a) => (A("data-v-b6af7eca"), (a = a()), x(), a),
    M = { class: "example-page" },
    L = { class: "wrap" },
    U = { class: "search-left" },
    F = { class: "left-part_left" },
    H = { class: "search-select-type" },
    W = j(() => t("span", { class: "f-toe f-push-5-r" }, "技术栈", -1)),
    J = { class: "search-input" },
    D = v(
        '<div class="left-part_right" data-v-b6af7eca><a class="f-push-5-r" target="_black" href="https://www.npmjs.com/package/mars3d" data-v-b6af7eca><img alt="Npm version" src="https://img.shields.io/npm/v/mars3d.svg?style=flat&amp;logo=npm&amp;label=mars3d" data-v-b6af7eca></a><a target="_black" href="https://www.npmjs.com/package/mars3d-cesium" data-v-b6af7eca><img alt="Npm version" src="https://img.shields.io/npm/v/mars3d-cesium.svg?style=flat&amp;logo=npm&amp;label=cesium" data-v-b6af7eca></a></div>',
        1
    ),
    K = { class: "search-right" },
    Z = { class: "contain-links" },
    R = j(() => t("span", { class: "contain-links_span" }, "教程", -1)),
    T = j(() => t("span", { class: "contain-links_span" }, "定制", -1)),
    O = j(() => t("span", { class: "contain-links_span" }, "更多", -1)),
    G = j(() => t("div", { class: "sanjiao" }, null, -1)),
    _ = j(() => t("div", { class: "sanjiao-1" }, null, -1)),
    P = { class: "explain" },
    Y = j(() =>
        t(
            "div",
            { class: "explain-wrap" },
            [
                t("img", {
                    class: "sm-pic",
                    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAJkUlEQVR4Xu2cT4gWdRzGn58rHgyDspN46mBhfzAhxVPWMaqTBR2CJLqVQrqzrl3WQ8qu60HDWwejS1QSYZCX0k5CghmpYYFQqXVIAq09iLsToyi2rr6773xn9pmZz3sRZOY7z+/zfD+8++ruJtX12pU/oAE9p6QNyvWYpGWSltb1+I485y8lXVCuC9f/nNJFLdBnGkynOnL+8GOm8InTB47ki7RYmyRtlrS88ufxgJkInJb0hXJ9o6H0NYhmT6BaQXbl6zWgPZJWzz4SV1ZM4Lhy7ddQ+rDi57RifHWC3JDjSCsotfMQRTf7laWD7TxezKmqEWQ8X6kpFW/rvPwJfK6FelvvpAv+UetPGC/IaL5cSYel6x/EeTWDwK+a1OsaTkebEbe+lPGCjOW7JW2t7wg8KZDAm8rSB4HzGj8qVpCxvPgwfkzSosaT6eoBcu3QUBrp6vGnnztWkN35TuUaBm7DCSDJrQJjBRnLf5L0aMPXg/gFASS5vgdxgozmS5R0me1qEQEkCRRkT75CkzrbovXgKLyTBArCfwy2V6gOv5PEfYmFIO0VpMPvJAjS7rWOPV0H30kQJHaF2j+tY5IgSPtXOv6EHZIEQeLXpxsTOyIJgnRjnaef8hVJn5Q+egckQZDSW9LAAVlKGstfRpLe3SFIb0btu6IQpHghSc9uEaQnohZecFMQJOlZLoL0RNTCC24XBEnuWTCCtHD/ex5puiBIcldkCNJzm1p4wUyCIMmMRSNIC/e/55HuJgiS3IEOQXpuUwsvuJcgSPK/whGkhfvf80i9BEGSWwgRpOc2tfCC2QgSKUnSiAbTjiaSRJAmtlY282wFQRJ+orDsrjXy/rkI0nFJeAdp5IaXDD1XQTosCYKU3LVG3t6PIB2VBEEaueElQ/crSAclQZCSu9bI28sI0jFJEKSRG14ydFlBOiQJgpTctUbeHiFIRyRBkEZueMnQUYJ0QBIEKblrjbw9UpCWS4IgjdzwkqGjBWmxJAhSctcaeXsVgrRUEgRp5IaXDF2VIC2UBEFK7lojb69SkJZJgiCN3PCSoasWpEWSIEjJXWvk7df0kLanS5Vnj/q9W/P48yQIUvmWGD5gSk9qW/qxlmQNlwRBatkSu4dsUJYO1paqwZIgSG1bYvWgA8rSxloTRUlS8y/MRpBat8TmYZeUa5WG0vlaEzVQEgSpdUOsHjauLA3WnihKkqRXNZg+rjo/glRN2Hf+VUnrlKUTtUeMkmRAq7Ql/VBlfgSpkq7/7NPK0uPzEjNGkt8lrVGW/qzqDAhSFdnmzD2uLK2Zl7gxkhxSll6qKj+CVEW2WXOPalJvaDidqz12jCRvKUv7q8iOIFVQbebM4l+09mpC+zSSis8n9b3KSpJ0Rv9qrUbSP9GhESSaaPPnFR/aD0v6VFk6WdtxykqSa5uG0mh0XgSJJtqueVeU6w8lXazxWOv7fNZvktZGf2BHkD7b4DZLApuUpfcjkyFIJE1mzS+BpK80mJ6PDIEgkTSZNf8Egr+VH0Hmv1ISxBLYqCwdiBqJIFEkmeNC4KCytCEqDIJEkWSOC4FTytITUWEQJIokc1wI/K0sPRgVBkGiSDLHh8CE7tNImogIhCARFJnhRmCFsvRLRCgEiaDIDC8Ck3pWw+loRCgEiaDIDC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CCOLVB2nMCCCIWSHE8SKAIF59kMaMAIKYFUIcLwII4tUHacwIIIhZIcTxIoAgXn2QxowAgpgVQhwvAgji1QdpzAggiFkhxPEigCBefZDGjACCmBVCHC8CloLsyVdoUme9SJGmkwQG9Ii2pJ8jzp4ihlyfMZovUdLlsHkMgkC/BHLdr6F0pd/bb78vTpBi6lj+vaRVEcGYAYE+CZxUlp7q8947bosWZLuk96LCMQcCfRB4V1na2cd9M94SLchqScckLYoKyBwIzIHAVUnrlKUTc7jnnpfGCnLjy6zdkrZGBWQOBOZAYFxZGpzD9T0vjRdkNF+upG8lPdzz6VwAgTgC55TrGQ2l83EjpXhBinS78vUa0JHIoMyCwD0JBP7fx+3PqUaQ4gnj+dOa0nfUCoHKCSzQGm1Nx6t4TnWC3JBkpab0kaTiwzsvCEQTOKEFek1b05nowTfnVStI8ZSRfJEWa5OkzZKWV3UQ5naKQPE5Y68mtE8jqfiXq8pe1QtyM/rOfKkW6kVJL0haIWmZpKWVnYzBbSJwSdJFScW3j3ypazqk7an4u8pf/wF2I2oF8w2CdgAAAABJRU5ErkJggg=="
                }),
                t("div", { class: "sm" }, "说明"),
                t("div", { class: "line1" })
            ],
            -1
        )
    ),
    q = j(() => t("p", { class: "explain-text" }, "1. 名称内有 demo 的属于存在已知问题的示例，此处仅做演示", -1)),
    X = j(() =>
        t(
            "p",
            { class: "explain-text" },
            [
                g(" 2. 如果您访问体验当中发现bug问题或有好的建议，欢迎随时反馈给 "),
                t(
                    "a",
                    {
                        class: "color-blue",
                        href: "http://marsgis.cn/weixin.html",
                        target: "_blank"
                    },
                    "我们"
                ),
                g(". ")
            ],
            -1
        )
    ),
    N = j(() =>
        t(
            "p",
            { class: "explain-text" },
            [
                g(" 3. 如果缺少您想要的示例，可以整理需求发送邮件至 "),
                t(
                    "a",
                    {
                        class: "color-blue",
                        href: "mailto:wh@marsgis.cn",
                        rel: "nofollow"
                    },
                    "wh@marsgis.cn"
                )
            ],
            -1
        )
    ),
    $ = { class: "explain-text" },
    aa = j(() =>
        t(
            "a",
            { target: "_black", href: "https://github.com/marsgis/mars3d" },
            [
                t("img", {
                    alt: "GitHub stars",
                    src: "https://img.shields.io/github/stars/marsgis/mars3d?style=flat&logo=github"
                })
            ],
            -1
        )
    ),
    la = j(() =>
        t(
            "a",
            { target: "_black", href: "https://gitee.com/marsgis/mars3d" },
            [
                t("img", {
                    src: "https://gitee.com/marsgis/mars3d/badge/star.svg?theme=dark",
                    alt: "star"
                })
            ],
            -1
        )
    ),
    ea = j(() =>
        t(
            "a",
            { target: "_black", href: "https://www.npmjs.com/package/mars3d" },
            [
                t("img", {
                    alt: "Npm downloads",
                    src: "https://img.shields.io/npm/dt/mars3d?style=flat&logo=npm&label=下载量"
                })
            ],
            -1
        )
    ),
    na = { class: "explain-text" },
    sa = j(() => t("span", { class: "contain-links_span" }, "功能清单.txt", -1)),
    ia = j(() => t("span", { class: "contain-links_span" }, "功能清单.csv", -1)),
    ta = { class: "contain" },
    ca = { class: "contain-sidebar" },
    oa = ["onClick"],
    ra = { class: "name" },
    da = ["onClick"],
    ha = { class: "contain-count" },
    pa = { style: { color: "#008aff", "font-size": "18px" } },
    ma = { key: 0, class: "contain-example" },
    ga = ["id"],
    ua = { class: "title-box" },
    va = { class: "title" },
    Ca = j(() => t("div", { class: "line" }, null, -1)),
    fa = ["id"],
    Ia = ["id"],
    wa = { class: "list-chilidren" },
    ka = ["onClick"],
    Aa = { key: 0, title: "这是最近新加的功能", class: "newVer" },
    xa = ["title"],
    ba = ["innerHTML"],
    Sa = ["title"],
    Ea = { key: 1, class: "contain-example f-tac" },
    Ba = [
        j(() =>
            t(
                "div",
                { class: "no-message" },
                [
                    t("img", {
                        src: "/assets/png/nodata-O2W2KrqJ.png",
                        height: "236",
                        width: "328"
                    })
                ],
                -1
            )
        ),
        j(() => t("div", { class: "no-title" }, "暂无搜索内容", -1))
    ],
    Qa = b(
        a({
            __name: "content",
            setup(a) {
                const v = l({}),
                    A = l([]),
                    x = l([]),
                    b = l(0),
                    S = l("ex_0"),
                    E = l("ex_0_0");
                function B(a) {
                    setTimeout(() => {
                        const l = document.querySelector(`#${a}`);
                        l && l.parentNode && (l.parentNode.scrollTop = l.offsetTop - 130);
                    }, 50);
                }
                e(async () => {
                    let a = n("type");
                    (Qa.value = a || "vue"),
                        (v.value = ya.filter((a) => a.value === Qa.value)[0]),
                        v.value && (document.title = `(${v.value.label}) - ` + document.title);
                    const l = await y();
                    (b.value = l.count), (A.value = l.list), (x.value = l.list);
                    const e = window.location.hash;
                    e && ((S.value = e.replace("#/", "")), (E.value = S.value + "_0")), B(S.value);
                });
                const Q = () => {
                        (E.value = ""), (V.value = ""), j();
                    },
                    V = l(""),
                    j = () => {
                        if (!V.value) return void (x.value = A.value);
                        let a = z(V.value.toLowerCase(), { toneType: "none" }).replaceAll(" ", ""),
                            l = JSON.parse(JSON.stringify(A.value));
                        x.value = l.reduce((l, e) => {
                            if (e.children) {
                                let n = [];
                                return (
                                    e.children.forEach((l) => {
                                        if (l.children) {
                                            let e = [];
                                            l.children.forEach((l) => {
                                                -1 !== l.pinyin.search(a) && e.push(l);
                                            }),
                                                (l.children = e);
                                        }
                                        0 !== l.children.length && n.push(l);
                                    }),
                                    n.length ? l.concat(e) : l
                                );
                            }
                            return l;
                        }, []);
                    },
                    Qa = l("vue"),
                    ya = [
                        {
                            value: "vue",
                            label: "Vanilla JS",
                            icon: '<svg\n                    xmlns="http://www.w3.org/2000/svg"\n                    aria-hidden="true"\n                    role="img"\n                    width="1em"\n                    height="1em"\n                    preserveAspectRatio="xMidYMid meet"\n                    viewBox="0 0 32 32"\n                  >\n                    <path fill="#41b883" d="M24.4 3.925H30l-14 24.15L2 3.925h10.71l3.29 5.6l3.22-5.6Z" />\n                    <path fill="#41b883" d="m2 3.925l14 24.15l14-24.15h-5.6L16 18.415L7.53 3.925Z" />\n                    <path fill="#35495e" d="M7.53 3.925L16 18.485l8.4-14.56h-5.18L16 9.525l-3.29-5.6Z" />\n                  </svg>',
                            className: "bgstyle-vue",
                            github: "//github.com/marsgis/mars3d-vue-example",
                            url: "/doc.html",
                            hash: "project/example-vue"
                        },
                        {
                            value: "react",
                            label: "React版",
                            icon: '\n          <svg\n            xmlns="http://www.w3.org/2000/svg"\n            aria-hidden="true"\n            role="img"\n            style="vertical-align: -14px"\n            width="30px"\n            height="30px"\n            preserveAspectRatio="xMidYMid meet"\n            viewBox="0 0 32 32"\n          >\n            <circle cx="12" cy="11.245" r="1.785" fill="#8fe5fc" />\n            <path\n              fill="#8fe5fc"\n              d="m7.002 14.794l-.395-.101c-2.934-.741-4.617-2.001-4.617-3.452c0-1.452 1.684-2.711 4.617-3.452l.395-.1l.111.391a19.507 19.507 0 0 0 1.136 2.983l.085.178l-.085.178c-.46.963-.841 1.961-1.136 2.985l-.111.39zm-.577-6.095c-2.229.628-3.598 1.586-3.598 2.542c0 .954 1.368 1.913 3.598 2.54c.273-.868.603-1.717.985-2.54a20.356 20.356 0 0 1-.985-2.542zm10.572 6.095l-.11-.392a19.628 19.628 0 0 0-1.137-2.984l-.085-.177l.085-.179c.46-.961.839-1.96 1.137-2.984l.11-.39l.395.1c2.935.741 4.617 2 4.617 3.453c0 1.452-1.683 2.711-4.617 3.452l-.395.101zm-.41-3.553c.4.866.733 1.718.987 2.54c2.23-.627 3.599-1.586 3.599-2.54c0-.956-1.368-1.913-3.599-2.542a20.683 20.683 0 0 1-.987 2.542z"\n            />\n            <path\n              fill="#8fe5fc"\n              d="m6.419 8.695l-.11-.39c-.826-2.908-.576-4.991.687-5.717c1.235-.715 3.222.13 5.303 2.265l.284.292l-.284.291a19.718 19.718 0 0 0-2.02 2.474l-.113.162l-.196.016a19.646 19.646 0 0 0-3.157.509l-.394.098zm1.582-5.529c-.224 0-.422.049-.589.145c-.828.477-.974 2.138-.404 4.38c.891-.197 1.79-.338 2.696-.417a21.058 21.058 0 0 1 1.713-2.123c-1.303-1.267-2.533-1.985-3.416-1.985zm7.997 16.984c-1.188 0-2.714-.896-4.298-2.522l-.283-.291l.283-.29a19.827 19.827 0 0 0 2.021-2.477l.112-.16l.194-.019a19.473 19.473 0 0 0 3.158-.507l.395-.1l.111.391c.822 2.906.573 4.992-.688 5.718a1.978 1.978 0 0 1-1.005.257zm-3.415-2.82c1.302 1.267 2.533 1.986 3.415 1.986c.225 0 .423-.05.589-.145c.829-.478.976-2.142.404-4.384c-.89.198-1.79.34-2.698.419a20.526 20.526 0 0 1-1.71 2.124z"\n            />\n            <path\n              fill="#8fe5fc"\n              d="m17.58 8.695l-.395-.099a19.477 19.477 0 0 0-3.158-.509l-.194-.017l-.112-.162A19.551 19.551 0 0 0 11.7 5.434l-.283-.291l.283-.29c2.08-2.134 4.066-2.979 5.303-2.265c1.262.727 1.513 2.81.688 5.717l-.111.39zm-3.287-1.421c.954.085 1.858.228 2.698.417c.571-2.242.425-3.903-.404-4.381c-.824-.477-2.375.253-4.004 1.841c.616.67 1.188 1.378 1.71 2.123zM8.001 20.15a1.983 1.983 0 0 1-1.005-.257c-1.263-.726-1.513-2.811-.688-5.718l.108-.391l.395.1c.964.243 2.026.414 3.158.507l.194.019l.113.16c.604.878 1.28 1.707 2.02 2.477l.284.29l-.284.291c-1.583 1.627-3.109 2.522-4.295 2.522zm-.993-5.362c-.57 2.242-.424 3.906.404 4.384c.825.47 2.371-.255 4.005-1.842a21.17 21.17 0 0 1-1.713-2.123a20.692 20.692 0 0 1-2.696-.419z"\n            />\n            <path\n              fill="#8fe5fc"\n              d="M12 15.313c-.687 0-1.392-.029-2.1-.088l-.196-.017l-.113-.162a25.697 25.697 0 0 1-1.126-1.769a26.028 26.028 0 0 1-.971-1.859l-.084-.177l.084-.179c.299-.632.622-1.252.971-1.858c.347-.596.726-1.192 1.126-1.77l.113-.16l.196-.018a25.148 25.148 0 0 1 4.198 0l.194.019l.113.16a25.136 25.136 0 0 1 2.1 3.628l.083.179l-.083.177a24.742 24.742 0 0 1-2.1 3.628l-.113.162l-.194.017c-.706.057-1.412.087-2.098.087zm-1.834-.904c1.235.093 2.433.093 3.667 0a24.469 24.469 0 0 0 1.832-3.168a23.916 23.916 0 0 0-1.832-3.168a23.877 23.877 0 0 0-3.667 0a23.743 23.743 0 0 0-1.832 3.168a24.82 24.82 0 0 0 1.832 3.168z"\n            />\n          </svg>',
                            className: "bgstyle-react",
                            github: "//github.com/marsgis/mars3d-react-example",
                            url: "/doc.html",
                            hash: "project/example-react"
                        },
                        {
                            value: "es5",
                            label: "原生JS版",
                            icon: '\n          <svg\n            xmlns="http://www.w3.org/2000/svg"\n            aria-hidden="true"\n            role="img"\n            style="vertical-align: -0.125em"\n            width="1em"\n            height="1em"\n            preserveAspectRatio="xMidYMid meet"\n            viewBox="0 0 32 32"\n          >\n            <path fill="#e44f26" d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30L5.902 27.201z" />\n            <path fill="#f1662a" d="m16 27.858l8.17-2.265l1.922-21.532H16v23.797z" />\n            <path\n              fill="#ebebeb"\n              d="M16 13.407h-4.09l-.282-3.165H16V7.151H8.25l.074.83l.759 8.517H16v-3.091zm0 8.027l-.014.004l-3.442-.929l-.22-2.465H9.221l.433 4.852l6.332 1.758l.014-.004v-3.216z"\n            />\n            <path\n              fill="#fff"\n              d="M15.989 13.407v3.091h3.806l-.358 4.009l-3.448.93v3.216l6.337-1.757l.046-.522l.726-8.137l.076-.83h-7.185zm0-6.256v3.091h7.466l.062-.694l.141-1.567l.074-.83h-7.743z"\n            />\n          </svg>',
                            className: "bgstyle-es5",
                            github: "//github.com/marsgis/mars3d-es5-example",
                            url: "/doc.html",
                            hash: "project/example-es5"
                        }
                    ],
                    za = (a) => {
                        location.search = `?type=${Qa.value}`;
                    },
                    Va = l(!1),
                    ja = () => {
                        if (((Va.value = !Va.value), !Va.value)) return void (x.value = A.value);
                        let a = JSON.parse(JSON.stringify(A.value));
                        a.forEach((a) => {
                            if (a.children) {
                                let l = [];
                                a.children.forEach((a) => {
                                    if (a.children) {
                                        let l = [];
                                        a.children.forEach((a) => {
                                            a.new && l.push(a);
                                        }),
                                            (a.children = l);
                                    }
                                    0 !== a.children.length && l.push(a);
                                }),
                                    (a.children = l);
                            }
                        }),
                            (x.value = a);
                    },
                    Ma = (a) => {
                        C(a);
                    };
                function La(a) {
                    return `/example/thumbnail/${a.thumbnail || "map-options-basemaps.jpg"}`;
                }
                function Ua(a) {
                    const l = a.srcElement;
                    (l.src = "//cdn.marsgis.cn/mars3d-example/thumbnail/map-options-basemaps.jpg"), (l.onerror = null);
                }
                function Fa(a) {
                    return a.new;
                }
                const Ha = (a, l) => {
                    let e = new Blob([l]),
                        n = document.createElement("a");
                    (n.download = a),
                        (n.href = URL.createObjectURL(e)),
                        document.body.appendChild(n),
                        n.click(),
                        document.body.removeChild(n);
                };
                function Wa(a) {
                    let l = a.name;
                    if (-1 !== l.indexOf("Demo")) return !1;
                    const e = l.indexOf("(");
                    return -1 !== e && (l = l.substr(0, e)), l;
                }
                return (a, l) => {
                    const e = f("mars-select"),
                        n = f("mars-input"),
                        C = f("mars-icon"),
                        y = f("a-button"),
                        z = f("a-space"),
                        Ja = f("a-popover"),
                        Da = I("lazy");
                    return (
                        s(),
                        i("div", M, [
                            t("div", L, [
                                t(
                                    "div",
                                    { class: c("search-wrap " + v.value.className) },
                                    [
                                        t("div", U, [
                                            t("div", F, [
                                                t("div", H, [
                                                    W,
                                                    o(
                                                        e,
                                                        {
                                                            size: "small",
                                                            value: Qa.value,
                                                            "onUpdate:value": l[0] || (l[0] = (a) => (Qa.value = a)),
                                                            options: ya,
                                                            onChange: za
                                                        },
                                                        null,
                                                        8,
                                                        ["value"]
                                                    )
                                                ]),
                                                t("div", J, [
                                                    o(
                                                        n,
                                                        {
                                                            placeholder: "快速搭建3D地理信息系统",
                                                            value: V.value,
                                                            "onUpdate:value": l[1] || (l[1] = (a) => (V.value = a)),
                                                            "data-event": "prevent",
                                                            allowClear: "",
                                                            onChange: j,
                                                            onPressEnter: j
                                                        },
                                                        null,
                                                        8,
                                                        ["value"]
                                                    ),
                                                    o(
                                                        y,
                                                        { class: "mars-button", onClick: j },
                                                        {
                                                            default: r(() => [
                                                                o(C, {
                                                                    icon: "search",
                                                                    width: "20",
                                                                    color: "#4D5669"
                                                                })
                                                            ]),
                                                            _: 1
                                                        }
                                                    )
                                                ]),
                                                t(
                                                    "div",
                                                    {
                                                        class: c([
                                                            "search-new f-toe",
                                                            { "search-new-active": Va.value }
                                                        ]),
                                                        title: "选中后只显示最近加的新示例",
                                                        onClick: ja
                                                    },
                                                    "新",
                                                    2
                                                )
                                            ]),
                                            D
                                        ]),
                                        t("div", K, [
                                            t("div", Z, [
                                                v.value
                                                    ? (s(),
                                                      d(
                                                          y,
                                                          {
                                                              key: 0,
                                                              class: "contain-link",
                                                              title: "查看教程及说明",
                                                              onClick:
                                                                  l[2] ||
                                                                  (l[2] = (a) =>
                                                                      Ma({
                                                                          url: v.value.url,
                                                                          hash: v.value.hash
                                                                      }))
                                                          },
                                                          {
                                                              default: r(() => [
                                                                  o(z, null, {
                                                                      default: r(() => [
                                                                          o(C, {
                                                                              icon: "bookmark-three",
                                                                              width: "20",
                                                                              color: "#4D5669"
                                                                          }),
                                                                          R
                                                                      ]),
                                                                      _: 1
                                                                  })
                                                              ]),
                                                              _: 1
                                                          }
                                                      ))
                                                    : h("", !0),
                                                o(
                                                    y,
                                                    {
                                                        class: "contain-link",
                                                        title: "功能定制",
                                                        onClick:
                                                            l[3] ||
                                                            (l[3] = (a) =>
                                                                Ma({
                                                                    url: "http://mall.marsgis.cn/#/service/example",
                                                                    target: "_blank"
                                                                }))
                                                    },
                                                    {
                                                        default: r(() => [
                                                            o(z, null, {
                                                                default: r(() => [
                                                                    o(C, {
                                                                        icon: "tool",
                                                                        width: "20",
                                                                        color: "#4D5669"
                                                                    }),
                                                                    T
                                                                ]),
                                                                _: 1
                                                            })
                                                        ]),
                                                        _: 1
                                                    }
                                                ),
                                                o(
                                                    y,
                                                    {
                                                        class: "contain-link contain-link_more",
                                                        title: "更多"
                                                    },
                                                    {
                                                        default: r(() => [
                                                            o(z, null, {
                                                                default: r(() => [
                                                                    o(C, {
                                                                        icon: "all-application",
                                                                        width: "20",
                                                                        color: "#4D5669"
                                                                    }),
                                                                    O
                                                                ]),
                                                                _: 1
                                                            }),
                                                            G,
                                                            _,
                                                            t("div", P, [
                                                                Y,
                                                                q,
                                                                X,
                                                                N,
                                                                t("p", $, [
                                                                    o(z, null, {
                                                                        default: r(() => [aa, la, ea]),
                                                                        _: 1
                                                                    })
                                                                ]),
                                                                t("p", na, [
                                                                    o(
                                                                        y,
                                                                        {
                                                                            class: "contain-link",
                                                                            title: "下载txt格式",
                                                                            onClick:
                                                                                l[4] ||
                                                                                (l[4] = (a) =>
                                                                                    Ha(
                                                                                        "Mars3D功能清单.txt",
                                                                                        (function () {
                                                                                            var a;
                                                                                            let l = "Mars3D功能清单：",
                                                                                                e = 0;
                                                                                            const n = {};
                                                                                            return (
                                                                                                null == (a = x.value) ||
                                                                                                    a.forEach((a) => {
                                                                                                        if (
                                                                                                            !a.children ||
                                                                                                            !1 ===
                                                                                                                a.download
                                                                                                        )
                                                                                                            return;
                                                                                                        l += `\n\n功能 ${++e}  ${
                                                                                                            a.name
                                                                                                        }`;
                                                                                                        let s = 0;
                                                                                                        a.children.forEach(
                                                                                                            (a) => {
                                                                                                                if (
                                                                                                                    !a.children ||
                                                                                                                    !1 ===
                                                                                                                        a.download
                                                                                                                )
                                                                                                                    return;
                                                                                                                l += `\n功能 ${e}.${++s}  ${
                                                                                                                    a.name
                                                                                                                }：`;
                                                                                                                let i = 0;
                                                                                                                a.children.forEach(
                                                                                                                    (
                                                                                                                        a
                                                                                                                    ) => {
                                                                                                                        if (
                                                                                                                            !1 ===
                                                                                                                                a.download ||
                                                                                                                            a.hidden
                                                                                                                        )
                                                                                                                            return;
                                                                                                                        const e =
                                                                                                                            Wa(
                                                                                                                                a
                                                                                                                            );
                                                                                                                        e &&
                                                                                                                            (n[
                                                                                                                                e
                                                                                                                            ] ||
                                                                                                                                ((n[
                                                                                                                                    e
                                                                                                                                ] =
                                                                                                                                    !0),
                                                                                                                                ++i,
                                                                                                                                (l +=
                                                                                                                                    1 ===
                                                                                                                                    i
                                                                                                                                        ? `${e}`
                                                                                                                                        : `,${e}`)));
                                                                                                                    }
                                                                                                                );
                                                                                                            }
                                                                                                        );
                                                                                                    }),
                                                                                                l
                                                                                            );
                                                                                        })()
                                                                                    ))
                                                                        },
                                                                        {
                                                                            default: r(() => [
                                                                                o(z, null, {
                                                                                    default: r(() => [
                                                                                        o(C, {
                                                                                            icon: "download",
                                                                                            width: "20",
                                                                                            color: "#4D5669"
                                                                                        }),
                                                                                        sa
                                                                                    ]),
                                                                                    _: 1
                                                                                })
                                                                            ]),
                                                                            _: 1
                                                                        }
                                                                    ),
                                                                    o(
                                                                        y,
                                                                        {
                                                                            class: "contain-link",
                                                                            title: "下载csv格式",
                                                                            onClick:
                                                                                l[5] ||
                                                                                (l[5] = (a) =>
                                                                                    Ha(
                                                                                        "Mars3D功能清单.csv",
                                                                                        (function () {
                                                                                            var a;
                                                                                            let l =
                                                                                                    "序号,分类,子分类,功能名称,示例ID\n",
                                                                                                e = 0;
                                                                                            const n = {};
                                                                                            return (
                                                                                                null == (a = x.value) ||
                                                                                                    a.forEach((a) => {
                                                                                                        a.children &&
                                                                                                            !1 !==
                                                                                                                a.download &&
                                                                                                            a.children.forEach(
                                                                                                                (s) => {
                                                                                                                    s.children &&
                                                                                                                        !1 !==
                                                                                                                            s.download &&
                                                                                                                        s.children.forEach(
                                                                                                                            (
                                                                                                                                i
                                                                                                                            ) => {
                                                                                                                                if (
                                                                                                                                    !1 ===
                                                                                                                                        i.download ||
                                                                                                                                    i.hidden
                                                                                                                                )
                                                                                                                                    return;
                                                                                                                                const t =
                                                                                                                                    Wa(
                                                                                                                                        i
                                                                                                                                    );
                                                                                                                                t &&
                                                                                                                                    (n[
                                                                                                                                        t
                                                                                                                                    ] ||
                                                                                                                                        ((n[
                                                                                                                                            t
                                                                                                                                        ] =
                                                                                                                                            !0),
                                                                                                                                        (l += `${++e},${
                                                                                                                                            a.name
                                                                                                                                        },${
                                                                                                                                            s.name
                                                                                                                                        },${t},${
                                                                                                                                            i.main
                                                                                                                                        }\n`)));
                                                                                                                            }
                                                                                                                        );
                                                                                                                }
                                                                                                            );
                                                                                                    }),
                                                                                                l
                                                                                            );
                                                                                        })()
                                                                                    ))
                                                                        },
                                                                        {
                                                                            default: r(() => [
                                                                                o(z, null, {
                                                                                    default: r(() => [
                                                                                        o(C, {
                                                                                            icon: "download",
                                                                                            width: "20",
                                                                                            color: "#4D5669"
                                                                                        }),
                                                                                        ia
                                                                                    ]),
                                                                                    _: 1
                                                                                })
                                                                            ]),
                                                                            _: 1
                                                                        }
                                                                    )
                                                                ])
                                                            ])
                                                        ]),
                                                        _: 1
                                                    }
                                                )
                                            ])
                                        ])
                                    ],
                                    2
                                )
                            ]),
                            t("div", ta, [
                                t("div", ca, [
                                    t("div", { class: c("sidebar-bg " + v.value.className) }, null, 2),
                                    (s(!0),
                                    i(
                                        p,
                                        null,
                                        m(
                                            A.value,
                                            (a, l) => (
                                                s(),
                                                i("div", { class: "sidebar-main", key: l }, [
                                                    t(
                                                        "div",
                                                        {
                                                            class: "side1-item",
                                                            onClick: (l) =>
                                                                ((a) => {
                                                                    S.value !== a.id
                                                                        ? ((S.value = a.id),
                                                                          (window.location.hash = `#/${a.id}`))
                                                                        : (S.value = "");
                                                                })(a)
                                                        },
                                                        [
                                                            t("i", { class: c(["fa", a.icon]) }, null, 2),
                                                            t("div", ra, u(a.name) + "(" + u(a.count) + ")", 1),
                                                            S.value === a.id
                                                                ? (s(),
                                                                  d(C, {
                                                                      key: 0,
                                                                      icon: "down",
                                                                      class: "f-fr",
                                                                      width: "18",
                                                                      color: "#4D5669"
                                                                  }))
                                                                : (s(),
                                                                  d(C, {
                                                                      key: 1,
                                                                      icon: "right",
                                                                      class: "f-fr",
                                                                      width: "18",
                                                                      color: "#4D5669"
                                                                  }))
                                                        ],
                                                        8,
                                                        oa
                                                    ),
                                                    S.value === a.id
                                                        ? (s(!0),
                                                          i(
                                                              p,
                                                              { key: 0 },
                                                              m(
                                                                  a.children,
                                                                  (a, l) => (
                                                                      s(),
                                                                      i("div", { class: "sidebar-children", key: l }, [
                                                                          t(
                                                                              "div",
                                                                              {
                                                                                  class: c({
                                                                                      "sidebar-children_active":
                                                                                          E.value === a.id
                                                                                  }),
                                                                                  onClick: (l) =>
                                                                                      ((a, l) => {
                                                                                          Q(),
                                                                                              B(a.id),
                                                                                              (E.value = a.id);
                                                                                      })(a)
                                                                              },
                                                                              u(a.name) + "（" + u(a.count) + "） ",
                                                                              11,
                                                                              da
                                                                          )
                                                                      ])
                                                                  )
                                                              ),
                                                              128
                                                          ))
                                                        : h("", !0)
                                                ])
                                            )
                                        ),
                                        128
                                    )),
                                    t("div", ha, [g(" Total "), t("span", pa, u(b.value), 1), g(" Examples ")])
                                ]),
                                x.value.length
                                    ? (s(),
                                      i("div", ma, [
                                          (s(!0),
                                          i(
                                              p,
                                              null,
                                              m(
                                                  x.value,
                                                  (a, l) => (
                                                      s(),
                                                      i(
                                                          p,
                                                          { key: l },
                                                          [
                                                              0 !== a.children.length
                                                                  ? (s(),
                                                                    i(
                                                                        p,
                                                                        { key: 0 },
                                                                        [
                                                                            t(
                                                                                "div",
                                                                                { id: a.id, class: "list-title" },
                                                                                [
                                                                                    t("div", ua, [
                                                                                        t(
                                                                                            "div",
                                                                                            {
                                                                                                class: c(["fa", a.icon])
                                                                                            },
                                                                                            null,
                                                                                            2
                                                                                        ),
                                                                                        t(
                                                                                            "div",
                                                                                            va,
                                                                                            u(a.name) +
                                                                                                " （" +
                                                                                                u(a.count) +
                                                                                                "）",
                                                                                            1
                                                                                        )
                                                                                    ]),
                                                                                    Ca
                                                                                ],
                                                                                8,
                                                                                ga
                                                                            ),
                                                                            (s(!0),
                                                                            i(
                                                                                p,
                                                                                null,
                                                                                m(
                                                                                    a.children,
                                                                                    (l, e) => (
                                                                                        s(),
                                                                                        i(
                                                                                            p,
                                                                                            { key: e },
                                                                                            [
                                                                                                0 !== l.children.length
                                                                                                    ? (s(),
                                                                                                      i(
                                                                                                          "div",
                                                                                                          {
                                                                                                              key: 0,
                                                                                                              id: l.id,
                                                                                                              class: "list-item"
                                                                                                          },
                                                                                                          [
                                                                                                              t(
                                                                                                                  "div",
                                                                                                                  {
                                                                                                                      id: a.id,
                                                                                                                      class: c(
                                                                                                                          {
                                                                                                                              "list-children_title":
                                                                                                                                  !0,
                                                                                                                              activeItem:
                                                                                                                                  E.value ===
                                                                                                                                  l.id
                                                                                                                          }
                                                                                                                      )
                                                                                                                  },
                                                                                                                  [
                                                                                                                      g(
                                                                                                                          u(
                                                                                                                              l.name
                                                                                                                          ) +
                                                                                                                              "（" +
                                                                                                                              u(
                                                                                                                                  l.count
                                                                                                                              ) +
                                                                                                                              "） ",
                                                                                                                          1
                                                                                                                      ),
                                                                                                                      l.details
                                                                                                                          ? (s(),
                                                                                                                            d(
                                                                                                                                Ja,
                                                                                                                                {
                                                                                                                                    key: 0,
                                                                                                                                    placement:
                                                                                                                                        "right"
                                                                                                                                },
                                                                                                                                {
                                                                                                                                    content:
                                                                                                                                        r(
                                                                                                                                            () => [
                                                                                                                                                g(
                                                                                                                                                    u(
                                                                                                                                                        l.details
                                                                                                                                                    ),
                                                                                                                                                    1
                                                                                                                                                )
                                                                                                                                            ]
                                                                                                                                        ),
                                                                                                                                    default:
                                                                                                                                        r(
                                                                                                                                            () => [
                                                                                                                                                E.value ===
                                                                                                                                                l.id
                                                                                                                                                    ? (s(),
                                                                                                                                                      d(
                                                                                                                                                          C,
                                                                                                                                                          {
                                                                                                                                                              key: 0,
                                                                                                                                                              icon: "help",
                                                                                                                                                              width: "20",
                                                                                                                                                              color: "#2468f2"
                                                                                                                                                          }
                                                                                                                                                      ))
                                                                                                                                                    : (s(),
                                                                                                                                                      d(
                                                                                                                                                          C,
                                                                                                                                                          {
                                                                                                                                                              key: 1,
                                                                                                                                                              icon: "help",
                                                                                                                                                              width: "20",
                                                                                                                                                              color: "#071228"
                                                                                                                                                          }
                                                                                                                                                      ))
                                                                                                                                            ]
                                                                                                                                        ),
                                                                                                                                    _: 2
                                                                                                                                },
                                                                                                                                1024
                                                                                                                            ))
                                                                                                                          : h(
                                                                                                                                "",
                                                                                                                                !0
                                                                                                                            )
                                                                                                                  ],
                                                                                                                  10,
                                                                                                                  Ia
                                                                                                              ),
                                                                                                              t(
                                                                                                                  "div",
                                                                                                                  wa,
                                                                                                                  [
                                                                                                                      (s(
                                                                                                                          !0
                                                                                                                      ),
                                                                                                                      i(
                                                                                                                          p,
                                                                                                                          null,
                                                                                                                          m(
                                                                                                                              l.children,
                                                                                                                              (
                                                                                                                                  a,
                                                                                                                                  l
                                                                                                                              ) => (
                                                                                                                                  s(),
                                                                                                                                  i(
                                                                                                                                      p,
                                                                                                                                      {
                                                                                                                                          key: l
                                                                                                                                      },
                                                                                                                                      [
                                                                                                                                          !a.hidden ||
                                                                                                                                          a.main
                                                                                                                                              ? (s(),
                                                                                                                                                i(
                                                                                                                                                    "div",
                                                                                                                                                    {
                                                                                                                                                        key: 0,
                                                                                                                                                        class: "list-chilidren_item",
                                                                                                                                                        onClick:
                                                                                                                                                            (
                                                                                                                                                                l
                                                                                                                                                            ) =>
                                                                                                                                                                ((
                                                                                                                                                                    a
                                                                                                                                                                ) => {
                                                                                                                                                                    let l =
                                                                                                                                                                        `/editor.html?key=${a.id}&id=` +
                                                                                                                                                                        encodeURI(
                                                                                                                                                                            a.main
                                                                                                                                                                        );
                                                                                                                                                                    window.autoShowCode &&
                                                                                                                                                                        (l +=
                                                                                                                                                                            "&code=1"),
                                                                                                                                                                        a.params &&
                                                                                                                                                                            (l += `&${a.params}`),
                                                                                                                                                                        window.open(
                                                                                                                                                                            l,
                                                                                                                                                                            "_blank"
                                                                                                                                                                        );
                                                                                                                                                                })(
                                                                                                                                                                    a
                                                                                                                                                                )
                                                                                                                                                    },
                                                                                                                                                    [
                                                                                                                                                        Fa(
                                                                                                                                                            a
                                                                                                                                                        )
                                                                                                                                                            ? (s(),
                                                                                                                                                              i(
                                                                                                                                                                  "span",
                                                                                                                                                                  Aa,
                                                                                                                                                                  "新"
                                                                                                                                                              ))
                                                                                                                                                            : h(
                                                                                                                                                                  "",
                                                                                                                                                                  !0
                                                                                                                                                              ),
                                                                                                                                                        w(
                                                                                                                                                            t(
                                                                                                                                                                "img",
                                                                                                                                                                {
                                                                                                                                                                    class: "pic",
                                                                                                                                                                    onerror:
                                                                                                                                                                        Ua
                                                                                                                                                                },
                                                                                                                                                                null,
                                                                                                                                                                512
                                                                                                                                                            ),
                                                                                                                                                            [
                                                                                                                                                                [
                                                                                                                                                                    Da,
                                                                                                                                                                    La(
                                                                                                                                                                        a
                                                                                                                                                                    )
                                                                                                                                                                ]
                                                                                                                                                            ]
                                                                                                                                                        ),
                                                                                                                                                        t(
                                                                                                                                                            "p",
                                                                                                                                                            {
                                                                                                                                                                class: "name",
                                                                                                                                                                title: a.name
                                                                                                                                                            },
                                                                                                                                                            [
                                                                                                                                                                g(
                                                                                                                                                                    u(
                                                                                                                                                                        a.name
                                                                                                                                                                    ) +
                                                                                                                                                                        " ",
                                                                                                                                                                    1
                                                                                                                                                                ),
                                                                                                                                                                a.hasPannel
                                                                                                                                                                    ? (s(),
                                                                                                                                                                      i(
                                                                                                                                                                          "span",
                                                                                                                                                                          {
                                                                                                                                                                              key: 0,
                                                                                                                                                                              innerHTML:
                                                                                                                                                                                  v
                                                                                                                                                                                      .value
                                                                                                                                                                                      .icon
                                                                                                                                                                          },
                                                                                                                                                                          null,
                                                                                                                                                                          8,
                                                                                                                                                                          ba
                                                                                                                                                                      ))
                                                                                                                                                                    : h(
                                                                                                                                                                          "",
                                                                                                                                                                          !0
                                                                                                                                                                      ),
                                                                                                                                                                w(
                                                                                                                                                                    t(
                                                                                                                                                                        "span",
                                                                                                                                                                        {
                                                                                                                                                                            style: {
                                                                                                                                                                                color: "rgba(0, 147, 255, 0.7)"
                                                                                                                                                                            },
                                                                                                                                                                            title:
                                                                                                                                                                                "该功能需要引入 mars3d-" +
                                                                                                                                                                                a.plugins +
                                                                                                                                                                                ".js 插件才能使用。"
                                                                                                                                                                        },
                                                                                                                                                                        "[" +
                                                                                                                                                                            u(
                                                                                                                                                                                a.plugins
                                                                                                                                                                            ) +
                                                                                                                                                                            "插件]",
                                                                                                                                                                        9,
                                                                                                                                                                        Sa
                                                                                                                                                                    ),
                                                                                                                                                                    [
                                                                                                                                                                        [
                                                                                                                                                                            k,
                                                                                                                                                                            a.plugins
                                                                                                                                                                        ]
                                                                                                                                                                    ]
                                                                                                                                                                )
                                                                                                                                                            ],
                                                                                                                                                            8,
                                                                                                                                                            xa
                                                                                                                                                        )
                                                                                                                                                    ],
                                                                                                                                                    8,
                                                                                                                                                    ka
                                                                                                                                                ))
                                                                                                                                              : h(
                                                                                                                                                    "",
                                                                                                                                                    !0
                                                                                                                                                )
                                                                                                                                      ],
                                                                                                                                      64
                                                                                                                                  )
                                                                                                                              )
                                                                                                                          ),
                                                                                                                          128
                                                                                                                      ))
                                                                                                                  ]
                                                                                                              )
                                                                                                          ],
                                                                                                          8,
                                                                                                          fa
                                                                                                      ))
                                                                                                    : h("", !0)
                                                                                            ],
                                                                                            64
                                                                                        )
                                                                                    )
                                                                                ),
                                                                                128
                                                                            ))
                                                                        ],
                                                                        64
                                                                    ))
                                                                  : h("", !0)
                                                          ],
                                                          64
                                                      )
                                                  )
                                              ),
                                              128
                                          ))
                                      ]))
                                    : (s(), i("div", Ea, Ba))
                            ])
                        ])
                    );
                };
            }
        }),
        [["__scopeId", "data-v-b6af7eca"]]
    ),
    ya = { class: "page-content" },
    za = a({
        __name: "App",
        setup: (a) => (a, l) => (s(), i(p, null, [o(S, { navActive: 1 }), t("div", ya, [o(Qa)])], 64))
    });
E();
const Va = B(za);
Va.use(V, { error: "../../assets/img/thumbnail.png" }), Q(Va), Va.mount("#app");

