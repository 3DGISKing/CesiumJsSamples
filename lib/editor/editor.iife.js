var JSEditor = (function (e, t) {
    "use strict";
    var i = Object.defineProperty,
        n = (e, t, n) => (
            ((e, t, n) => {
                t in e ? i(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n);
            })(e, "symbol" != typeof t ? t + "" : t, n),
            n
        );
    function r(e) {
        const t = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
        if (e)
            for (const i in e)
                if ("default" !== i) {
                    const n = Object.getOwnPropertyDescriptor(e, i);
                    Object.defineProperty(t, i, n.get ? n : { enumerable: !0, get: () => e[i] });
                }
        return (t.default = e), Object.freeze(t);
    }
    const s = r(t),
        a = class e {
            static setConfig(t) {
                (e.apiConf = t), (e.sessionName = t.packageName + "-homepage-config");
            }
            static getConfig() {
                return e.apiConf;
            }
            static getPackageName() {
                return e.apiConf.packageName;
            }
            static getExampleList() {
                if ("online" === e.apiConf.configFetchType) return e.fetchExampleList();
                try {
                    const t = JSON.parse(sessionStorage.getItem(e.sessionName) || "");
                    if (t) return e.saveCompConfig(t), Promise.resolve(t);
                    throw new Error("无缓存数据");
                } catch (t) {
                    return e.fetchExampleList();
                }
            }
            static async fetchExampleList() {
                const t = await fetch(e.apiConf.configSourceUrl),
                    i = await t.json();
                return (
                    e.saveCompConfig(i),
                    "local" === e.apiConf.configFetchType && sessionStorage.setItem(e.sessionName, JSON.stringify(i)),
                    i
                );
            }
            static async getCompConfig(t, i) {
                try {
                    const n = e.mars3dExampleConfig,
                        r = e.mars3dExampleConfig;
                    if (i && r && r[i] && r[i].main === t) return r[i];
                    if (n) return n[t];
                    throw new Error("无缓存数据");
                } catch (n) {
                    return await e.getExampleList(), e.getCompConfig(t, i);
                }
            }
            static saveCompConfig(t) {
                const i = {},
                    n = {};
                (e.totalCount = 0),
                    t.forEach((t, r) => {
                        (t.id = `ex_${r}`),
                            t.children &&
                                ((t.count = 0),
                                t.children.forEach((r, s) => {
                                    (r.id = `${t.id}_${s}`),
                                        r.children &&
                                            ((r.count = r.children.length),
                                            r.children.forEach((s, a) => {
                                                t.count++,
                                                    (s.id = `${r.id}_${a}`),
                                                    (s.fullName = `${t.name}  -  ${r.name}  -  ${s.name}`),
                                                    (s.thumbnail = `${e.apiConf.thumbnailPublicPath || "/"}${
                                                        s.thumbnail || "thumbnail.jpg"
                                                    }`),
                                                    (i[s.main] = s),
                                                    (n[s.id] = s),
                                                    s.hidden || e.totalCount++;
                                            }));
                                }));
                    }),
                    (e.mars3dExampleConfig = i),
                    (e.mars3dExampleConfigKeymap = n);
            }
            static getResourcesByLibs(t) {
                (t && 0 !== t.length) || (t = [e.apiConf.packageName]);
                let i = [];
                const n = {};
                for (let r = 0, s = t.length; r < s; r++) {
                    const s = t[r];
                    if (n[s]) continue;
                    n[s] = !0;
                    const a = e.apiConf.configLibs[s];
                    a &&
                        (i = i.concat(
                            a.map((t) =>
                                t.startsWith("http") || t.startsWith("//:") ? t : e.apiConf.libPublicPath + t
                            )
                        ));
                }
                return i;
            }
            static getLibs(t, i = [], n = []) {
                return e
                    .getResourcesByLibs(i)
                    .concat(n)
                    .map((i) => {
                        let n = i;
                        return (
                            i.startsWith(".") || i.startsWith("http") || i.startsWith("//:")
                                ? (n = i)
                                : i.startsWith("/")
                                ? "/" !== e.apiConf.baseUrl && (n = e.apiConf.baseUrl + i)
                                : (n = `${e.apiConf.resourcePublicPath}/${t}/${i}`),
                            { name: n, url: n }
                        );
                    });
            }
            static getQueryString(e) {
                return new URL(window.location.href).searchParams.get(e);
            }
            static LoadSource(t) {
                const i = (n) => {
                    if (t.length) {
                        const r = t.shift();
                        let s;
                        (s = r.endsWith(".css") ? e.loadLink(r) : e.loadScript(r)),
                            s.then(() => {
                                i(n);
                            });
                    } else n(!0);
                };
                return new Promise((e) => {
                    i(e);
                });
            }
            static loadScript(e, t = !0) {
                const i = document.createElement("script");
                return (
                    (i.async = t),
                    (i.src = e),
                    document.body.appendChild(i),
                    new Promise((e) => {
                        i.onload = () => {
                            e(!0);
                        };
                    })
                );
            }
            static loadLink(e) {
                const t = document.createElement("link");
                return (
                    (t.rel = "stylesheet"),
                    (t.href = e),
                    document.head.appendChild(t),
                    new Promise((e) => {
                        t.onload = () => {
                            e(!0);
                        };
                    })
                );
            }
            static scriptFilter(t) {
                return (
                    (t = (t = (t = t.replace(/const /gm, "var ")).replace(/let /gm, "var ")).replace(/export /gm, "")),
                    (t = (t =
                        "mars3d" === e.apiConf.packageName
                            ? (t = t.replace('import * as mars3d from "mars3d"', "")).replace(
                                  "const Cesium = mars3d.Cesium",
                                  ""
                              )
                            : (t = t.replace('import * as mars2d from "mars2d"', "")).replace(
                                  "const L = mars3d.L",
                                  ""
                              )).replace(/import /gm, "// import "))
                );
            }
        };
    n(a, "apiConf"),
        n(a, "sessionName"),
        n(a, "totalCount", 0),
        n(a, "mars3dExampleConfig"),
        n(a, "mars3dExampleConfigKeymap");
    let o = a;
    function c(e) {
        return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
    }
    function l(e) {
        if (e.__esModule) return e;
        var t = e.default;
        if ("function" == typeof t) {
            var i = function e() {
                return this instanceof e ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
            };
            i.prototype = t.prototype;
        } else i = {};
        return (
            Object.defineProperty(i, "__esModule", { value: !0 }),
            Object.keys(e).forEach(function (t) {
                var n = Object.getOwnPropertyDescriptor(e, t);
                Object.defineProperty(
                    i,
                    t,
                    n.get
                        ? n
                        : {
                              enumerable: !0,
                              get: function () {
                                  return e[t];
                              }
                          }
                );
            }),
            i
        );
    }
    var A = {};
    const m = l(
        Object.freeze(Object.defineProperty({ __proto__: null, default: {} }, Symbol.toStringTag, { value: "Module" }))
    );
    var d = {};
    !(function (e) {
        var t = /[|\\{}()[\]^$+*?.]/g,
            i = Object.prototype.hasOwnProperty,
            n = function (e, t) {
                return i.apply(e, [t]);
            };
        e.escapeRegExpChars = function (e) {
            return e ? String(e).replace(t, "\\$&") : "";
        };
        var r = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&#34;", "'": "&#39;" },
            s = /[&<>'"]/g;
        function a(e) {
            return r[e] || e;
        }
        function o() {
            return (
                Function.prototype.toString.call(this) +
                ';\nvar _ENCODE_HTML_RULES = {\n      "&": "&amp;"\n    , "<": "&lt;"\n    , ">": "&gt;"\n    , \'"\': "&#34;"\n    , "\'": "&#39;"\n    }\n  , _MATCH_HTML = /[&<>\'"]/g;\nfunction encode_char(c) {\n  return _ENCODE_HTML_RULES[c] || c;\n};\n'
            );
        }
        e.escapeXML = function (e) {
            return null == e ? "" : String(e).replace(s, a);
        };
        try {
            "function" == typeof Object.defineProperty
                ? Object.defineProperty(e.escapeXML, "toString", { value: o })
                : (e.escapeXML.toString = o);
        } catch (c) {
            console.warn("Unable to set escapeXML.toString (is the Function prototype frozen?)");
        }
        (e.shallowCopy = function (e, t) {
            if (((t = t || {}), null != e))
                for (var i in t) n(t, i) && "__proto__" !== i && "constructor" !== i && (e[i] = t[i]);
            return e;
        }),
            (e.shallowCopyFromList = function (e, t, i) {
                if (((i = i || []), (t = t || {}), null != e))
                    for (var r = 0; r < i.length; r++) {
                        var s = i[r];
                        if (void 0 !== t[s]) {
                            if (!n(t, s)) continue;
                            if ("__proto__" === s || "constructor" === s) continue;
                            e[s] = t[s];
                        }
                    }
                return e;
            }),
            (e.cache = {
                _data: {},
                set: function (e, t) {
                    this._data[e] = t;
                },
                get: function (e) {
                    return this._data[e];
                },
                remove: function (e) {
                    delete this._data[e];
                },
                reset: function () {
                    this._data = {};
                }
            }),
            (e.hyphenToCamel = function (e) {
                return e.replace(/-[a-z]/g, function (e) {
                    return e[1].toUpperCase();
                });
            }),
            (e.createNullProtoObjWherePossible =
                "function" == typeof Object.create
                    ? function () {
                          return Object.create(null);
                      }
                    : { __proto__: null } instanceof Object
                    ? function () {
                          return {};
                      }
                    : function () {
                          return { __proto__: null };
                      });
    })(d);
    const u = "3.1.9";
    !(function (e) {
        /**
         * @file Embedded JavaScript templating engine. {@link http://ejs.co}
         * @author Matthew Eernisse <mde@fleegix.org>
         * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
         * @project EJS
         * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
         */
        var t = m,
            i = m,
            n = d,
            r = !1,
            s = u,
            a = "locals",
            o = [
                "delimiter",
                "scope",
                "context",
                "debug",
                "compileDebug",
                "client",
                "_with",
                "rmWhitespace",
                "strict",
                "filename",
                "async"
            ],
            c = o.concat("cache"),
            l = /^\uFEFF/,
            A = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
        function p(i, n) {
            var r;
            if (
                n.some(function (n) {
                    return (r = e.resolveInclude(i, n, !0)), t.existsSync(r);
                })
            )
                return r;
        }
        function g(t, i) {
            var n,
                r = t.filename,
                s = arguments.length > 1;
            if (t.cache) {
                if (!r) throw new Error("cache option requires a filename");
                if ((n = e.cache.get(r))) return n;
                s || (i = h(r).toString().replace(l, ""));
            } else if (!s) {
                if (!r) throw new Error("Internal EJS error: no file name or template provided");
                i = h(r).toString().replace(l, "");
            }
            return (n = e.compile(i, t)), t.cache && e.cache.set(r, n), n;
        }
        function h(t) {
            return e.fileLoader(t);
        }
        function I(i, r) {
            var s = n.shallowCopy(n.createNullProtoObjWherePossible(), r);
            if (
                ((s.filename = (function (i, n) {
                    var r,
                        s,
                        a = n.views,
                        o = /^[A-Za-z]+:\\|^\//.exec(i);
                    if (o && o.length)
                        (i = i.replace(/^\/*/, "")),
                            (r = Array.isArray(n.root) ? p(i, n.root) : e.resolveInclude(i, n.root || "/", !0));
                    else if (
                        (n.filename && ((s = e.resolveInclude(i, n.filename)), t.existsSync(s) && (r = s)),
                        !r && Array.isArray(a) && (r = p(i, a)),
                        !r && "function" != typeof n.includer)
                    )
                        throw new Error('Could not find the include file "' + n.escapeFunction(i) + '"');
                    return r;
                })(i, s)),
                "function" == typeof r.includer)
            ) {
                var a = r.includer(i, s.filename);
                if (a && (a.filename && (s.filename = a.filename), a.template)) return g(s, a.template);
            }
            return g(s);
        }
        function f(e, t, i, n, r) {
            var s = t.split("\n"),
                a = Math.max(n - 3, 0),
                o = Math.min(s.length, n + 3),
                c = r(i),
                l = s
                    .slice(a, o)
                    .map(function (e, t) {
                        var i = t + a + 1;
                        return (i == n ? " >> " : "    ") + i + "| " + e;
                    })
                    .join("\n");
            throw ((e.path = c), (e.message = (c || "ejs") + ":" + n + "\n" + l + "\n\n" + e.message), e);
        }
        function M(e) {
            return e.replace(/;(\s*$)/, "$1");
        }
        function y(t, i) {
            i = i || n.createNullProtoObjWherePossible();
            var r = n.createNullProtoObjWherePossible();
            (this.templateText = t),
                (this.mode = null),
                (this.truncate = !1),
                (this.currentLine = 1),
                (this.source = ""),
                (r.client = i.client || !1),
                (r.escapeFunction = i.escape || i.escapeFunction || n.escapeXML),
                (r.compileDebug = !1 !== i.compileDebug),
                (r.debug = !!i.debug),
                (r.filename = i.filename),
                (r.openDelimiter = i.openDelimiter || e.openDelimiter || "<"),
                (r.closeDelimiter = i.closeDelimiter || e.closeDelimiter || ">"),
                (r.delimiter = i.delimiter || e.delimiter || "%"),
                (r.strict = i.strict || !1),
                (r.context = i.context),
                (r.cache = i.cache || !1),
                (r.rmWhitespace = i.rmWhitespace),
                (r.root = i.root),
                (r.includer = i.includer),
                (r.outputFunctionName = i.outputFunctionName),
                (r.localsName = i.localsName || e.localsName || a),
                (r.views = i.views),
                (r.async = i.async),
                (r.destructuredLocals = i.destructuredLocals),
                (r.legacyInclude = void 0 === i.legacyInclude || !!i.legacyInclude),
                r.strict ? (r._with = !1) : (r._with = void 0 === i._with || i._with),
                (this.opts = r),
                (this.regex = this.createRegex());
        }
        (e.cache = n.cache),
            (e.fileLoader = t.readFileSync),
            (e.localsName = a),
            (e.promiseImpl = new Function("return this;")().Promise),
            (e.resolveInclude = function (e, t, n) {
                var r = i.dirname,
                    s = i.extname,
                    a = (0, i.resolve)(n ? t : r(t), e);
                return s(e) || (a += ".ejs"), a;
            }),
            (e.compile = function (e, t) {
                return (
                    t &&
                        t.scope &&
                        (r || (console.warn("`scope` option is deprecated and will be removed in EJS 3"), (r = !0)),
                        t.context || (t.context = t.scope),
                        delete t.scope),
                    new y(e, t).compile()
                );
            }),
            (e.render = function (e, t, i) {
                var r = t || n.createNullProtoObjWherePossible(),
                    s = i || n.createNullProtoObjWherePossible();
                return 2 == arguments.length && n.shallowCopyFromList(s, r, o), g(s, e)(r);
            }),
            (e.renderFile = function () {
                var t,
                    i,
                    r,
                    s = Array.prototype.slice.call(arguments),
                    a = s.shift(),
                    o = { filename: a };
                return (
                    "function" == typeof arguments[arguments.length - 1] && (t = s.pop()),
                    s.length
                        ? ((i = s.shift()),
                          s.length
                              ? n.shallowCopy(o, s.pop())
                              : (i.settings &&
                                    (i.settings.views && (o.views = i.settings.views),
                                    i.settings["view cache"] && (o.cache = !0),
                                    (r = i.settings["view options"]) && n.shallowCopy(o, r)),
                                n.shallowCopyFromList(o, i, c)),
                          (o.filename = a))
                        : (i = n.createNullProtoObjWherePossible()),
                    (function (t, i, n) {
                        var r;
                        if (!n) {
                            if ("function" == typeof e.promiseImpl)
                                return new e.promiseImpl(function (e, n) {
                                    try {
                                        e((r = g(t)(i)));
                                    } catch (s) {
                                        n(s);
                                    }
                                });
                            throw new Error("Please provide a callback function");
                        }
                        try {
                            r = g(t)(i);
                        } catch (s) {
                            return n(s);
                        }
                        n(null, r);
                    })(o, i, t)
                );
            }),
            (e.Template = y),
            (e.clearCache = function () {
                e.cache.reset();
            }),
            (y.modes = { EVAL: "eval", ESCAPED: "escaped", RAW: "raw", COMMENT: "comment", LITERAL: "literal" }),
            (y.prototype = {
                createRegex: function () {
                    var e = "(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)",
                        t = n.escapeRegExpChars(this.opts.delimiter),
                        i = n.escapeRegExpChars(this.opts.openDelimiter),
                        r = n.escapeRegExpChars(this.opts.closeDelimiter);
                    return (e = e.replace(/%/g, t).replace(/</g, i).replace(/>/g, r)), new RegExp(e);
                },
                compile: function () {
                    var e,
                        t,
                        r,
                        s = this.opts,
                        a = "",
                        o = "",
                        c = s.escapeFunction,
                        l = s.filename ? JSON.stringify(s.filename) : "undefined";
                    if (!this.source) {
                        if (
                            (this.generateSource(),
                            (a +=
                                '  var __output = "";\n  function __append(s) { if (s !== undefined && s !== null) __output += s }\n'),
                            s.outputFunctionName)
                        ) {
                            if (!A.test(s.outputFunctionName))
                                throw new Error("outputFunctionName is not a valid JS identifier.");
                            a += "  var " + s.outputFunctionName + " = __append;\n";
                        }
                        if (s.localsName && !A.test(s.localsName))
                            throw new Error("localsName is not a valid JS identifier.");
                        if (s.destructuredLocals && s.destructuredLocals.length) {
                            for (
                                var m = "  var __locals = (" + s.localsName + " || {}),\n", d = 0;
                                d < s.destructuredLocals.length;
                                d++
                            ) {
                                var u = s.destructuredLocals[d];
                                if (!A.test(u))
                                    throw new Error("destructuredLocals[" + d + "] is not a valid JS identifier.");
                                d > 0 && (m += ",\n  "), (m += u + " = __locals." + u);
                            }
                            a += m + ";\n";
                        }
                        !1 !== s._with && ((a += "  with (" + s.localsName + " || {}) {\n"), (o += "  }\n")),
                            (o += "  return __output;\n"),
                            (this.source = a + this.source + o);
                    }
                    (e = s.compileDebug
                        ? "var __line = 1\n  , __lines = " +
                          JSON.stringify(this.templateText) +
                          "\n  , __filename = " +
                          l +
                          ";\ntry {\n" +
                          this.source +
                          "} catch (e) {\n  rethrow(e, __lines, __filename, __line, escapeFn);\n}\n"
                        : this.source),
                        s.client &&
                            ((e = "escapeFn = escapeFn || " + c.toString() + ";\n" + e),
                            s.compileDebug && (e = "rethrow = rethrow || " + f.toString() + ";\n" + e)),
                        s.strict && (e = '"use strict";\n' + e),
                        s.debug && console.log(e),
                        s.compileDebug && s.filename && (e = e + "\n//# sourceURL=" + l + "\n");
                    try {
                        if (s.async)
                            try {
                                r = new Function("return (async function(){}).constructor;")();
                            } catch (M) {
                                throw M instanceof SyntaxError
                                    ? new Error("This environment does not support async/await")
                                    : M;
                            }
                        else r = Function;
                        t = new r(s.localsName + ", escapeFn, include, rethrow", e);
                    } catch (M) {
                        throw (
                            (M instanceof SyntaxError &&
                                (s.filename && (M.message += " in " + s.filename),
                                (M.message += " while compiling ejs\n\n"),
                                (M.message += "If the above error is not helpful, you may want to try EJS-Lint:\n"),
                                (M.message += "https://github.com/RyanZim/EJS-Lint"),
                                s.async ||
                                    ((M.message += "\n"),
                                    (M.message +=
                                        "Or, if you meant to create an async function, pass `async: true` as an option."))),
                            M)
                        );
                    }
                    var p = s.client
                        ? t
                        : function (e) {
                              return t.apply(s.context, [
                                  e || n.createNullProtoObjWherePossible(),
                                  c,
                                  function (t, i) {
                                      var r = n.shallowCopy(n.createNullProtoObjWherePossible(), e);
                                      return i && (r = n.shallowCopy(r, i)), I(t, s)(r);
                                  },
                                  f
                              ]);
                          };
                    if (s.filename && "function" == typeof Object.defineProperty) {
                        var g = s.filename,
                            h = i.basename(g, i.extname(g));
                        try {
                            Object.defineProperty(p, "name", {
                                value: h,
                                writable: !1,
                                enumerable: !1,
                                configurable: !0
                            });
                        } catch (M) {}
                    }
                    return p;
                },
                generateSource: function () {
                    this.opts.rmWhitespace &&
                        (this.templateText = this.templateText.replace(/[\r\n]+/g, "\n").replace(/^\s+|\s+$/gm, "")),
                        (this.templateText = this.templateText
                            .replace(/[ \t]*<%_/gm, "<%_")
                            .replace(/_%>[ \t]*/gm, "_%>"));
                    var e = this,
                        t = this.parseTemplateText(),
                        i = this.opts.delimiter,
                        n = this.opts.openDelimiter,
                        r = this.opts.closeDelimiter;
                    t &&
                        t.length &&
                        t.forEach(function (s, a) {
                            var o;
                            if (
                                0 === s.indexOf(n + i) &&
                                0 !== s.indexOf(n + i + i) &&
                                (o = t[a + 2]) != i + r &&
                                o != "-" + i + r &&
                                o != "_" + i + r
                            )
                                throw new Error('Could not find matching close tag for "' + s + '".');
                            e.scanLine(s);
                        });
                },
                parseTemplateText: function () {
                    for (var e, t = this.templateText, i = this.regex, n = i.exec(t), r = []; n; )
                        0 !== (e = n.index) && (r.push(t.substring(0, e)), (t = t.slice(e))),
                            r.push(n[0]),
                            (t = t.slice(n[0].length)),
                            (n = i.exec(t));
                    return t && r.push(t), r;
                },
                _addOutput: function (e) {
                    if ((this.truncate && ((e = e.replace(/^(?:\r\n|\r|\n)/, "")), (this.truncate = !1)), !e)) return e;
                    (e = (e = (e = (e = e.replace(/\\/g, "\\\\")).replace(/\n/g, "\\n")).replace(/\r/g, "\\r")).replace(
                        /"/g,
                        '\\"'
                    )),
                        (this.source += '    ; __append("' + e + '")\n');
                },
                scanLine: function (e) {
                    var t,
                        i = this.opts.delimiter,
                        n = this.opts.openDelimiter,
                        r = this.opts.closeDelimiter;
                    switch (((t = e.split("\n").length - 1), e)) {
                        case n + i:
                        case n + i + "_":
                            this.mode = y.modes.EVAL;
                            break;
                        case n + i + "=":
                            this.mode = y.modes.ESCAPED;
                            break;
                        case n + i + "-":
                            this.mode = y.modes.RAW;
                            break;
                        case n + i + "#":
                            this.mode = y.modes.COMMENT;
                            break;
                        case n + i + i:
                            (this.mode = y.modes.LITERAL),
                                (this.source += '    ; __append("' + e.replace(n + i + i, n + i) + '")\n');
                            break;
                        case i + i + r:
                            (this.mode = y.modes.LITERAL),
                                (this.source += '    ; __append("' + e.replace(i + i + r, i + r) + '")\n');
                            break;
                        case i + r:
                        case "-" + i + r:
                        case "_" + i + r:
                            this.mode == y.modes.LITERAL && this._addOutput(e),
                                (this.mode = null),
                                (this.truncate = 0 === e.indexOf("-") || 0 === e.indexOf("_"));
                            break;
                        default:
                            if (this.mode) {
                                switch (this.mode) {
                                    case y.modes.EVAL:
                                    case y.modes.ESCAPED:
                                    case y.modes.RAW:
                                        e.lastIndexOf("//") > e.lastIndexOf("\n") && (e += "\n");
                                }
                                switch (this.mode) {
                                    case y.modes.EVAL:
                                        this.source += "    ; " + e + "\n";
                                        break;
                                    case y.modes.ESCAPED:
                                        this.source += "    ; __append(escapeFn(" + M(e) + "))\n";
                                        break;
                                    case y.modes.RAW:
                                        this.source += "    ; __append(" + M(e) + ")\n";
                                        break;
                                    case y.modes.COMMENT:
                                        break;
                                    case y.modes.LITERAL:
                                        this._addOutput(e);
                                }
                            } else this._addOutput(e);
                    }
                    this.opts.compileDebug &&
                        t &&
                        ((this.currentLine += t), (this.source += "    ; __line = " + this.currentLine + "\n"));
                }
            }),
            (e.escapeXML = n.escapeXML),
            (e.__express = e.renderFile),
            (e.VERSION = s),
            (e.name = "ejs"),
            "undefined" != typeof window && (window.ejs = e);
    })(A);
    const p = c(A);
    var g = "undefined" != typeof window ? window : null,
        h = null === g,
        I = h ? void 0 : g.document,
        f = "addEventListener",
        M = "removeEventListener",
        y = "getBoundingClientRect",
        S = "_a",
        v = "_b",
        D = "_c",
        w = "horizontal",
        C = function () {
            return !1;
        },
        N = h
            ? "calc"
            : ["", "-webkit-", "-moz-", "-o-"]
                  .filter(function (e) {
                      var t = I.createElement("div");
                      return (t.style.cssText = "width:" + e + "calc(9px)"), !!t.style.length;
                  })
                  .shift() + "calc",
        b = function (e) {
            return "string" == typeof e || e instanceof String;
        },
        E = function (e) {
            if (b(e)) {
                var t = I.querySelector(e);
                if (!t) throw new Error("Selector " + e + " did not match a DOM element");
                return t;
            }
            return e;
        },
        k = function (e, t, i) {
            var n = e[t];
            return void 0 !== n ? n : i;
        },
        j = function (e, t, i, n) {
            if (t) {
                if ("end" === n) return 0;
                if ("center" === n) return e / 2;
            } else if (i) {
                if ("start" === n) return 0;
                if ("center" === n) return e / 2;
            }
            return e;
        },
        x = function (e, t) {
            var i = I.createElement("div");
            return (i.className = "gutter gutter-" + t), i;
        },
        z = function (e, t, i) {
            var n = {};
            return b(t) ? (n[e] = t) : (n[e] = N + "(" + t + "% - " + i + "px)"), n;
        },
        L = function (e, t) {
            var i;
            return ((i = {})[e] = t + "px"), i;
        },
        P = function (e, t) {
            if ((void 0 === t && (t = {}), h)) return {};
            var i,
                n,
                r,
                s,
                a,
                o,
                c = e;
            Array.from && (c = Array.from(c));
            var l = E(c[0]).parentNode,
                A = getComputedStyle ? getComputedStyle(l) : null,
                m = A ? A.flexDirection : null,
                d =
                    k(t, "sizes") ||
                    c.map(function () {
                        return 100 / c.length;
                    }),
                u = k(t, "minSize", 100),
                p = Array.isArray(u)
                    ? u
                    : c.map(function () {
                          return u;
                      }),
                N = k(t, "maxSize", 1 / 0),
                b = Array.isArray(N)
                    ? N
                    : c.map(function () {
                          return N;
                      }),
                P = k(t, "expandToMin", !1),
                T = k(t, "gutterSize", 10),
                Q = k(t, "gutterAlign", "center"),
                B = k(t, "snapOffset", 30),
                Z = Array.isArray(B)
                    ? B
                    : c.map(function () {
                          return B;
                      }),
                J = k(t, "dragInterval", 1),
                O = k(t, "direction", w),
                Y = k(t, "cursor", O === w ? "col-resize" : "row-resize"),
                V = k(t, "gutter", x),
                R = k(t, "elementStyle", z),
                U = k(t, "gutterStyle", L);
            function W(e, t, n, r) {
                var s = R(i, t, n, r);
                Object.keys(s).forEach(function (t) {
                    e.style[t] = s[t];
                });
            }
            function H() {
                return o.map(function (e) {
                    return e.size;
                });
            }
            function G(e) {
                return "touches" in e ? e.touches[0][n] : e[n];
            }
            function F(e) {
                var t = o[this.a],
                    i = o[this.b],
                    n = t.size + i.size;
                (t.size = (e / this.size) * n),
                    (i.size = n - (e / this.size) * n),
                    W(t.element, t.size, this[v], t.i),
                    W(i.element, i.size, this[D], i.i);
            }
            function X(e) {
                var i,
                    n = o[this.a],
                    r = o[this.b];
                this.dragging &&
                    ((i = G(e) - this.start + (this[v] - this.dragOffset)),
                    J > 1 && (i = Math.round(i / J) * J),
                    i <= n.minSize + n.snapOffset + this[v]
                        ? (i = n.minSize + this[v])
                        : i >= this.size - (r.minSize + r.snapOffset + this[D]) &&
                          (i = this.size - (r.minSize + this[D])),
                    i >= n.maxSize - n.snapOffset + this[v]
                        ? (i = n.maxSize + this[v])
                        : i <= this.size - (r.maxSize - r.snapOffset + this[D]) &&
                          (i = this.size - (r.maxSize + this[D])),
                    F.call(this, i),
                    k(t, "onDrag", C)(H()));
            }
            function K() {
                var e = o[this.a].element,
                    t = o[this.b].element,
                    n = e[y](),
                    a = t[y]();
                (this.size = n[i] + a[i] + this[v] + this[D]), (this.start = n[r]), (this.end = n[s]);
            }
            function q(e) {
                var t = (function (e) {
                    if (!getComputedStyle) return null;
                    var t = getComputedStyle(e);
                    if (!t) return null;
                    var i = e[a];
                    return 0 === i
                        ? null
                        : (i -=
                              O === w
                                  ? parseFloat(t.paddingLeft) + parseFloat(t.paddingRight)
                                  : parseFloat(t.paddingTop) + parseFloat(t.paddingBottom));
                })(l);
                if (null === t) return e;
                if (
                    p.reduce(function (e, t) {
                        return e + t;
                    }, 0) > t
                )
                    return e;
                var i = 0,
                    n = [],
                    r = e.map(function (r, s) {
                        var a = (t * r) / 100,
                            o = j(T, 0 === s, s === e.length - 1, Q),
                            c = p[s] + o;
                        return a < c ? ((i += c - a), n.push(0), c) : (n.push(a - c), a);
                    });
                return 0 === i
                    ? e
                    : r.map(function (e, r) {
                          var s = e;
                          if (i > 0 && n[r] - i > 0) {
                              var a = Math.min(i, n[r] - i);
                              (i -= a), (s = e - a);
                          }
                          return (s / t) * 100;
                      });
            }
            function _() {
                var e = this,
                    i = o[e.a].element,
                    n = o[e.b].element;
                e.dragging && k(t, "onDragEnd", C)(H()),
                    (e.dragging = !1),
                    g[M]("mouseup", e.stop),
                    g[M]("touchend", e.stop),
                    g[M]("touchcancel", e.stop),
                    g[M]("mousemove", e.move),
                    g[M]("touchmove", e.move),
                    (e.stop = null),
                    (e.move = null),
                    i[M]("selectstart", C),
                    i[M]("dragstart", C),
                    n[M]("selectstart", C),
                    n[M]("dragstart", C),
                    (i.style.userSelect = ""),
                    (i.style.webkitUserSelect = ""),
                    (i.style.MozUserSelect = ""),
                    (i.style.pointerEvents = ""),
                    (n.style.userSelect = ""),
                    (n.style.webkitUserSelect = ""),
                    (n.style.MozUserSelect = ""),
                    (n.style.pointerEvents = ""),
                    (e.gutter.style.cursor = ""),
                    (e.parent.style.cursor = ""),
                    (I.body.style.cursor = "");
            }
            function $(e) {
                if (!("button" in e) || 0 === e.button) {
                    var i = this,
                        n = o[i.a].element,
                        r = o[i.b].element;
                    i.dragging || k(t, "onDragStart", C)(H()),
                        e.preventDefault(),
                        (i.dragging = !0),
                        (i.move = X.bind(i)),
                        (i.stop = _.bind(i)),
                        g[f]("mouseup", i.stop),
                        g[f]("touchend", i.stop),
                        g[f]("touchcancel", i.stop),
                        g[f]("mousemove", i.move),
                        g[f]("touchmove", i.move),
                        n[f]("selectstart", C),
                        n[f]("dragstart", C),
                        r[f]("selectstart", C),
                        r[f]("dragstart", C),
                        (n.style.userSelect = "none"),
                        (n.style.webkitUserSelect = "none"),
                        (n.style.MozUserSelect = "none"),
                        (n.style.pointerEvents = "none"),
                        (r.style.userSelect = "none"),
                        (r.style.webkitUserSelect = "none"),
                        (r.style.MozUserSelect = "none"),
                        (r.style.pointerEvents = "none"),
                        (i.gutter.style.cursor = Y),
                        (i.parent.style.cursor = Y),
                        (I.body.style.cursor = Y),
                        K.call(i),
                        (i.dragOffset = G(e) - i.end);
                }
            }
            O === w
                ? ((i = "width"), (n = "clientX"), (r = "left"), (s = "right"), (a = "clientWidth"))
                : "vertical" === O &&
                  ((i = "height"), (n = "clientY"), (r = "top"), (s = "bottom"), (a = "clientHeight")),
                (d = q(d));
            var ee = [];
            function te(e) {
                var t = e.i === ee.length,
                    i = t ? ee[e.i - 1] : ee[e.i];
                K.call(i);
                var n = t ? i.size - e.minSize - i[D] : e.minSize + i[v];
                F.call(i, n);
            }
            return (
                (o = c.map(function (e, t) {
                    var n,
                        r = { element: E(e), size: d[t], minSize: p[t], maxSize: b[t], snapOffset: Z[t], i: t };
                    if (
                        t > 0 &&
                        (((n = { a: t - 1, b: t, dragging: !1, direction: O, parent: l })[v] = j(T, t - 1 == 0, !1, Q)),
                        (n[D] = j(T, !1, t === c.length - 1, Q)),
                        "row-reverse" === m || "column-reverse" === m)
                    ) {
                        var s = n.a;
                        (n.a = n.b), (n.b = s);
                    }
                    if (t > 0) {
                        var a = V(t, O, r.element);
                        !(function (e, t, n) {
                            var r = U(i, t, n);
                            Object.keys(r).forEach(function (t) {
                                e.style[t] = r[t];
                            });
                        })(a, T, t),
                            (n[S] = $.bind(n)),
                            a[f]("mousedown", n[S]),
                            a[f]("touchstart", n[S]),
                            l.insertBefore(a, r.element),
                            (n.gutter = a);
                    }
                    return W(r.element, r.size, j(T, 0 === t, t === c.length - 1, Q), t), t > 0 && ee.push(n), r;
                })).forEach(function (e) {
                    var t = e.element[y]()[i];
                    t < e.minSize && (P ? te(e) : (e.minSize = t));
                }),
                {
                    setSizes: function (e) {
                        var t = q(e);
                        t.forEach(function (e, i) {
                            if (i > 0) {
                                var n = ee[i - 1],
                                    r = o[n.a],
                                    s = o[n.b];
                                (r.size = t[i - 1]),
                                    (s.size = e),
                                    W(r.element, r.size, n[v], r.i),
                                    W(s.element, s.size, n[D], s.i);
                            }
                        });
                    },
                    getSizes: H,
                    collapse: function (e) {
                        te(o[e]);
                    },
                    destroy: function (e, t) {
                        ee.forEach(function (n) {
                            if (
                                (!0 !== t
                                    ? n.parent.removeChild(n.gutter)
                                    : (n.gutter[M]("mousedown", n[S]), n.gutter[M]("touchstart", n[S])),
                                !0 !== e)
                            ) {
                                var r = R(i, n.a.size, n[v]);
                                Object.keys(r).forEach(function (e) {
                                    (o[n.a].element.style[e] = ""), (o[n.b].element.style[e] = "");
                                });
                            }
                        });
                    },
                    parent: l,
                    pairs: ee
                }
            );
        };
    class T {
        constructor() {
            n(this, "_cache", {});
        }
        on(e, t) {
            const i = (this._cache[e] = this._cache[e] || []);
            return -1 === i.indexOf(t) && i.push(t), this;
        }
        emit(e, ...t) {
            const i = this._cache[e];
            return (
                Array.isArray(i) &&
                    i.forEach((e) => {
                        e(...t);
                    }),
                this
            );
        }
        off(e, t) {
            const i = this._cache[e];
            if (Array.isArray(i))
                if (t) {
                    const e = i.indexOf(t);
                    -1 !== e && i.splice(e, 1);
                } else i.length = 0;
            return this;
        }
    }
    class Q extends T {
        constructor(e, t, i) {
            super(),
                n(this, "split"),
                n(this, "leftId"),
                n(this, "rightId"),
                (this.leftId = e),
                (this.rightId = t),
                (this.split = P([`#${e}`, `#${t}`], {
                    sizes: i ? [35, 65] : [0, 100],
                    minSize: [0, 800],
                    gutterSize: 5,
                    gutter(e, t) {
                        const n = document.createElement("div");
                        return (
                            i || (n.style.display = "none"),
                            (n.className = `gutter gutter-${t}`),
                            (n.id = "split-gutter"),
                            n
                        );
                    },
                    onDrag: () => {
                        this.getSize(0) < 5
                            ? this.collapse()
                            : ((document.getElementById("split-gutter").style.display = "block"), this.emit("layout"));
                    }
                })),
                i || (document.getElementById(this.rightId).style.width = "100%");
        }
        getSize(e) {
            return this.split.getSizes()[e];
        }
        expand() {
            this.split.setSizes([35, 65]),
                (document.getElementById("split-gutter").style.display = "block"),
                this.emit("layout");
        }
        collapse() {
            this.split.collapse(0),
                (document.getElementById("split-gutter").style.display = "none"),
                (document.getElementById(this.rightId).style.width = "100%"),
                this.emit("layout");
        }
        setLeft(e) {
            const t = document.getElementById(this.leftId);
            t && (t.innerHTML = e);
        }
        setRight(e) {
            const t = document.getElementById(this.rightId);
            t && (t.innerHTML = e);
        }
    }
    const B = { theme: "vs-dark", formatOnPaste: !0, fontSize: 14, scrollbar: { verticalScrollbarSize: 2 } };
    class Z extends T {
        constructor(e) {
            super(),
                n(this, "editor"),
                n(this, "uiEditor"),
                n(this, "resetBtn"),
                n(this, "runBtn"),
                n(this, "jsContainerId", "js-editor"),
                n(this, "originScript"),
                n(this, "config"),
                n(this, "showJsBtn"),
                n(this, "showUIBtn"),
                n(this, "jsEditorContainer"),
                n(this, "uiEditorContainer"),
                n(this, "fileNameEle"),
                (this.config = e),
                (this.editor = s.editor.create(document.getElementById(this.jsContainerId), {
                    language: "javascript",
                    value: "",
                    ...B
                })),
                this.fetchScript(),
                this.config.hasPannel &&
                    this.fetchUISource().then((e) => {
                        (this.uiEditor = s.editor.create(document.getElementById("ui-editor"), {
                            language: o.apiConf.UIFileLanguage,
                            readOnly: !0,
                            ...B
                        })),
                            this.uiEditor.setValue(e);
                    }),
                this.bindEvent();
        }
        async fetchScript() {
            const e = await fetch(`${o.apiConf.resourcePublicPath}/${this.config.main}/code.js`);
            (this.originScript = await e.text()),
                this.editor.setValue(this.originScript),
                this.emit("run", this.originScript);
        }
        async fetchUISource(e) {
            let t;
            if (o.apiConf.fetchUICode) {
                t = await o.apiConf.fetchUICode(this.config.main, e);
            } else if (e) {
                const i = await fetch(
                    e.url.replaceAll("{main}", `${o.apiConf.resourcePublicPath}/${this.config.main}`)
                );
                t = await i.text();
            } else {
                const e = await fetch(o.apiConf.UIFile(this.config.main));
                t = await e.text();
            }
            return t;
        }
        resize() {
            this.editor && this.editor.layout(), this.uiEditor && this.uiEditor.layout();
        }
        bindEvent() {
            this.jsEditorContainer || (this.jsEditorContainer = document.getElementById("js-editor")),
                this.uiEditorContainer || (this.uiEditorContainer = document.getElementById("ui-editor")),
                this.resetBtn || (this.resetBtn = document.getElementById("jsreset")),
                this.runBtn || (this.runBtn = document.getElementById("jsrun")),
                this.fileNameEle || (this.fileNameEle = document.getElementById("filename")),
                this.config.hasPannel &&
                    (this.showJsBtn || (this.showJsBtn = document.getElementById("showjs-button")),
                    this.showUIBtn || (this.showUIBtn = document.getElementById("showui-button")),
                    this.showJsBtn.addEventListener("click", () => {
                        (this.jsEditorContainer.style.display = "block"),
                            (this.uiEditorContainer.style.display = "none"),
                            (this.fileNameEle.innerHTML = "JS代码"),
                            this.resize();
                    }),
                    this.showUIBtn.addEventListener("click", () => {
                        (this.uiEditorContainer.style.display = "block"),
                            (this.jsEditorContainer.style.display = "none"),
                            (this.fileNameEle.innerHTML = "UI面板代码（只读）"),
                            this.resize();
                    }),
                    document.querySelectorAll(".uidep-item").forEach((e) => {
                        e.addEventListener("click", async (e) => {
                            const t = e.currentTarget;
                            try {
                                const e = JSON.parse(t.dataset.file);
                                console.log(e);
                                const i = await this.fetchUISource(e);
                                console.log(i),
                                    this.uiEditor.setValue(i),
                                    (this.uiEditorContainer.style.display = "block"),
                                    (this.jsEditorContainer.style.display = "none"),
                                    (this.fileNameEle.innerHTML = `${e.name}（只读）`),
                                    this.resize();
                            } catch (i) {
                                throw i;
                            }
                        });
                    })),
                this.resetBtn.addEventListener("click", () => {
                    this.editor.setValue(this.originScript), this.emit("run", this.scriptFilter(this.originScript));
                }),
                this.runBtn.addEventListener("click", () => {
                    this.emit("run", this.scriptFilter(this.editor.getValue()));
                }),
                window.addEventListener("resize", () => {
                    this.resize();
                }),
                document.addEventListener("keydown", (e) => {
                    if (!e.ctrlKey) return;
                    const t = String.fromCharCode(e.keyCode).toLowerCase();
                    "s" === t
                        ? (e.preventDefault(), this.emit("run", this.scriptFilter(this.editor.getValue())))
                        : "r" === t && (e.preventDefault(), this.emit("run", this.scriptFilter(this.originScript)));
                });
        }
        scriptFilter(e) {
            return (
                (e = (e = (e = e.replace(/export let /gm, "var ")).replace(/export const /gm, "var ")).replace(
                    /export /gm,
                    ""
                )),
                (e = (e =
                    "mars3d" === o.apiConf.packageName
                        ? (e = e.replace('import * as mars3d from "mars3d"', "")).replace(
                              "const Cesium = mars3d.Cesium",
                              ""
                          )
                        : (e = e.replace('import * as mars2d from "mars2d"', "")).replace(
                              "const L = mars3d.L",
                              ""
                          )).replace(/import /gm, "// import "))
            );
        }
    }
    class J extends T {
        constructor(e) {
            super(),
                n(this, "sanboxWapper"),
                n(this, "scriptDoc"),
                n(this, "htmlTemp"),
                n(this, "resourcePublicPath"),
                n(this, "exampleConfig"),
                (this.exampleConfig = e),
                (this.sanboxWapper = document.getElementById("sanbox")),
                (this.resourcePublicPath = o.apiConf.resourcePublicPath || ""),
                this.getTemp();
        }
        writeScriptDoc(e) {
            (this.scriptDoc = o.scriptFilter(e)), this.loadFramePage();
        }
        async loadFramePage() {
            const { main: e } = this.exampleConfig;
            if (this.scriptDoc && this.htmlTemp) {
                const t = this.createFrame().contentWindow.document,
                    i = `\n        <script type="text/javascript">\n        "use script"; \n        window.currentPath = "${this.resourcePublicPath}/${e}/"; // 当前示例的配置\n        ${this.scriptDoc}\n        <\/script> `,
                    n = `\n      <script type="text/javascript">\n        window.currentPath = "${this.resourcePublicPath}/${e}/"; // 当前示例的配置\n      <\/script>\n      <script type="text/javascript" src="${this.resourcePublicPath}/${e}/code.js"><\/script> `,
                    r = this.htmlTemp.replace("\x3c!-- script-output --\x3e", o.apiConf.alwaysUseOrigin ? n : i);
                t && (t.open(), t.write(r), t.close());
            }
        }
        async getTemp() {
            const { temp: e = "template" } = this.exampleConfig;
            console.log(`${o.apiConf.baseUrl}temp/${e}.html`);
            const t = await fetch(`${o.apiConf.baseUrl}temp/${e}.html`);
            (this.htmlTemp = this.mixTemp(await t.text())), this.loadFramePage();
        }
        mixTemp(e) {
            const { libs: t = [], resources: i = [], main: n } = this.exampleConfig;
            let r = "";
            return (
                o.getLibs(n, t, i).forEach(({ url: e }) => {
                    /\.css/.test(e)
                        ? (r += '<link href="' + e + '"  rel="stylesheet" >')
                        : (r += '<script src="' + e + '"  type="text/javascript" ></script>');
                }),
                e.replace("\x3c!-- resource-output --\x3e", r)
            );
        }
        createFrame() {
            const e = document.createElement("iframe");
            return (
                (this.sanboxWapper.innerHTML = ""),
                e.setAttribute("id", "marsgis-mappage"),
                e.setAttribute("name", "marsgis-mappage"),
                this.sanboxWapper.append(e),
                e
            );
        }
    }
    class O extends T {
        constructor(e) {
            super(), n(this, "config", {}), this.mergeConfig(e);
        }
        mergeConfig(e) {
            const t = {
                configFetchType: "online",
                code: "1",
                fullScreen: "0",
                packageName: "mars3d",
                framework: "es5",
                baseUrl: "/",
                resourcePublicPath: "example",
                configLibs: {},
                libPublicPath: "/",
                thumbnailPublicPath: "/config/thumbnail/",
                homepage: "http://mars3d.cn/example.html",
                configSourceUrl: "config/example.json",
                expandBtnText: "JavaScript",
                collapseBtnText: "Hide JavaScript",
                UIFileLanguage: "html",
                ...e
            };
            if (
                ("1" === t.fullScreen && (t.code = "0"),
                t.links ||
                    (t.links = [
                        {
                            id: "btn-jump-dev",
                            title: "教程",
                            description: "学习开发教程",
                            url: `http://${t.packageName}.cn/dev/guide/project/example-${t.framework}.html`,
                            icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03IDM3QzcgMjkuMjk2NyA3IDExIDcgMTFDNyA3LjY4NjI5IDkuNjg2MjkgNSAxMyA1SDM1VjMxQzM1IDMxIDE4LjIzMjYgMzEgMTMgMzFDOS43IDMxIDcgMzMuNjg0MiA3IDM3WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzUgMzFDMzUgMzEgMTQuMTUzNyAzMSAxMyAzMUM5LjY4NjI5IDMxIDcgMzMuNjg2MyA3IDM3QzcgNDAuMzEzNyA5LjY4NjI5IDQzIDEzIDQzQzE1LjIwOTEgNDMgMjUuODc1OCA0MyA0MSA0M1Y3IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE0IDM3SDM0IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+"
                        },
                        {
                            id: "btn-jump-api",
                            title: "API",
                            description: "查阅API文档",
                            url: `http://${t.packageName}.cn/api/Map.html`,
                            icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0zNyAyMi4wMDAxTDM0IDI1LjAwMDFMMjMgMTQuMDAwMUwyNiAxMS4wMDAxQzI3LjUgOS41MDAwMiAzMyA3LjAwMDA1IDM3IDExLjAwMDFDNDEgMTUuMDAwMSAzOC41IDIwLjUgMzcgMjIuMDAwMVoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNDIgNkwzNyAxMSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMSAyNS45OTk5TDE0IDIyLjk5OTlMMjUgMzMuOTk5OUwyMiAzNi45OTk5QzIwLjUgMzguNSAxNSA0MSAxMSAzNi45OTk5QzcgMzIuOTk5OSA5LjUgMjcuNSAxMSAyNS45OTk5WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMyAzMkwyNyAyOCIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02IDQyTDExIDM3IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE2IDI1TDIwIDIxIiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+"
                        },
                        {
                            id: "btn-jump-github",
                            title: "下载",
                            description: "下载源代码",
                            url: `https://gitee.com/marsgis/${t.packageName}-${t.framework}-example`,
                            icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yOS4zNDQ0IDMwLjQ3NjdDMzEuNzQ4MSAyOS45NzcxIDMzLjkyOTIgMjkuMTEwOSAzNS42MjQ3IDI3LjgzOTNDMzguNTIwMiAyNS42Njc3IDQwIDIyLjMxMzcgNDAgMTlDNDAgMTYuNjc1NCAzOS4xMTg3IDE0LjUwNTEgMzcuNTkyOSAxMi42NjY5QzM2Ljc0MjcgMTEuNjQyNiAzOS4yMjk1IDQuMDAwMDEgMzcuMDIgNS4wMjkzMUMzNC44MTA1IDYuMDU4NjEgMzEuNTcwOCA4LjMzNjkxIDI5Ljg3MjYgNy44MzQxQzI4LjA1NDUgNy4yOTU3NyAyNi4wNzMzIDcuMDAwMDEgMjQgNy4wMDAwMUMyMi4xOTkyIDcuMDAwMDEgMjAuNDY3OSA3LjIyMzEzIDE4Ljg1MjYgNy42MzQ1MkMxNi41MDQ2IDguMjMyNDkgMTQuMjU5MSA2LjAwMDAxIDEyIDUuMDI5MzFDOS43NDA4NiA0LjA1ODYxIDEwLjk3MzYgMTEuOTYzMyAxMC4zMDI2IDEyLjc5NDZDOC44NDExOSAxNC42MDUyIDggMTYuNzI4OSA4IDE5QzggMjIuMzEzNyA5Ljc5MDg2IDI1LjY2NzcgMTIuNjg2MyAyNy44MzkzQzE0LjYxNTEgMjkuMjg1OCAxNy4wMzQgMzAuMjA3NyAxOS43NDAxIDMwLjY2MjEiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMTkuNzQwMiAzMC42NjJDMTguNTgxNyAzMS45MzcyIDE4LjAwMjQgMzMuMTQ4IDE4LjAwMjQgMzQuMjk0NkMxOC4wMDI0IDM1LjQ0MTEgMTguMDAyNCAzOC4zNDY1IDE4LjAwMjQgNDMuMDEwOCIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yOS4zNDQzIDMwLjQ3NjdDMzAuNDQyMSAzMS45MTc1IDMwLjk5MSAzMy4yMTEyIDMwLjk5MSAzNC4zNTc3QzMwLjk5MSAzNS41MDQzIDMwLjk5MSAzOC4zODg2IDMwLjk5MSA0My4wMTA4IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTYgMzEuMjE1NkM2Ljg5ODg3IDMxLjMyNTUgNy41NjU1NCAzMS43Mzg4IDggMzIuNDU1NUM4LjY1MTY5IDMzLjUzMDQgMTEuMDc0MiAzNy41MTgxIDEzLjgyNTEgMzcuNTE4MUMxNS42NTkxIDM3LjUxODEgMTcuMDUxNSAzNy41MTgxIDE4LjAwMjQgMzcuNTE4MSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg=="
                        },
                        {
                            id: "btn-jump-stack",
                            title: "技术栈",
                            description: "查看其他技术栈版本示例",
                            icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxnPjxwYXRoIGQ9Ik0xMCA4VjE2SDM4TDQyIDEyTDM4IDhMMTAgOFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM4IDIzVjMxSDEwTDYgMjdMMTAgMjNMMzggMjNaIiBmaWxsPSJub25lIiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCAzMVY0NCIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCAxNlYyMyIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCA0VjgiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTkgNDRIMjkiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L2c+PC9nPjwvc3ZnPg==",
                            children: (() => {
                                const e = [];
                                return (
                                    "es5" !== t.framework &&
                                        e.push({
                                            id: "btn-jump-es5",
                                            title: "原生JS版",
                                            url: "javascript: toOtherFramework('es5');"
                                        }),
                                    "react" !== t.framework &&
                                        e.push({
                                            id: "btn-jump-react",
                                            title: "React版",
                                            url: "javascript: toOtherFramework('react');"
                                        }),
                                    "vue" !== t.framework &&
                                        e.push({
                                            id: "btn-jump-vue",
                                            title: "Vue版",
                                            url: "javascript: toOtherFramework('vue');"
                                        }),
                                    e
                                );
                            })()
                        }
                    ]),
                (t.code = "1" !== t.code ? "0" : "1"),
                "function" != typeof t.UIFile)
            ) {
                const e = t.UIFile || "{main}/index.html";
                t.UIFile = (i) => `${t.resourcePublicPath}/${e.replaceAll("{main}", i)}`;
            }
            (this.config = t), o.setConfig(t);
        }
    }
    const Y = { theme: "vs-dark", formatOnPaste: !0, fontSize: 14, scrollbar: { verticalScrollbarSize: 2 } };
    class V extends T {
        constructor(e) {
            super(),
                n(this, "editor"),
                n(this, "resetBtn"),
                n(this, "runBtn"),
                n(this, "jsContainerId", "js-editor"),
                n(this, "originScript"),
                n(this, "config"),
                n(this, "showJsBtn"),
                n(this, "showUIBtn"),
                n(this, "jsEditorContainer"),
                n(this, "uiEditorContainer"),
                n(this, "fileNameEle"),
                (this.config = e),
                (this.editor = s.editor.create(document.getElementById(this.jsContainerId), {
                    language: "html",
                    value: "",
                    ...Y
                })),
                this.fetchScript(),
                this.bindEvent();
        }
        async fetchScript() {
            const e = await fetch(`${o.apiConf.resourcePublicPath}/${this.config.main}/index.html`),
                t = await fetch(`${o.apiConf.resourcePublicPath}/${this.config.main}/code.js`);
            (this.originScript = this.mixinTemp(await e.text(), await t.text())),
                this.editor.setValue(this.originScript),
                this.emit("run", this.originScript);
        }
        mixinTemp(e, t) {
            let i = `${o.apiConf.resourcePublicPath}/${this.config.main}`;
            const n = `\n    <script type="text/javascript">\n      "use script"; \n      window.currentPath = "${i}/";// 当前示例的目录\n      ${(t =
                t.split("\n").join("\n      "))}\n    <\/script>`;
            let r = e
                .replace(new RegExp(/[\s]*<meta[^>]*?\/?>/, "gm"), "")
                .replace('<script src="./code.js"></script>', n)
                .replace(new RegExp(/\<link href="\./, "gm"), `<link href="${i}`)
                .replace(new RegExp(/\<script src="\./, "gm"), `<script src="${i}`);
            return o.scriptFilter(r);
        }
        resize() {
            this.editor && this.editor.layout();
        }
        bindEvent() {
            this.resetBtn || (this.resetBtn = document.getElementById("jsreset")),
                this.runBtn || (this.runBtn = document.getElementById("jsrun")),
                this.resetBtn.addEventListener("click", () => {
                    this.editor.setValue(this.originScript), this.emit("run", o.scriptFilter(this.originScript));
                }),
                this.runBtn.addEventListener("click", () => {
                    this.emit("run", o.scriptFilter(this.editor.getValue()));
                }),
                window.addEventListener("resize", () => {
                    this.resize();
                }),
                document.addEventListener("keydown", (e) => {
                    if (!e.ctrlKey) return;
                    const t = String.fromCharCode(e.keyCode).toLowerCase();
                    "s" === t
                        ? (e.preventDefault(), this.emit("run", o.scriptFilter(this.editor.getValue())))
                        : "r" === t && (e.preventDefault(), this.emit("run", o.scriptFilter(this.originScript)));
                });
        }
    }
    class R extends T {
        constructor() {
            super(),
                n(this, "sanboxWapper"),
                n(this, "innerHtml"),
                (this.sanboxWapper = document.getElementById("sanbox"));
        }
        writeHtml(e) {
            (this.innerHtml = e), this.loadFramePage();
        }
        async loadFramePage() {
            const e = this.createFrame().contentWindow.document;
            e && (e.open(), e.write(this.innerHtml), e.close());
        }
        createFrame() {
            const e = document.createElement("iframe");
            return (
                (this.sanboxWapper.innerHTML = ""),
                e.setAttribute("id", "marsgis-mappage"),
                e.setAttribute("name", "marsgis-mappage"),
                this.sanboxWapper.append(e),
                e
            );
        }
    }
    return (
        (e.Editor = class extends O {
            constructor() {
                super(...arguments),
                    n(this, "container"),
                    n(this, "fullName"),
                    n(this, "leftContainerId", "split-left"),
                    n(this, "rightContainerId", "split-right"),
                    n(this, "toogleBtn"),
                    n(this, "split"),
                    n(this, "jsEditor"),
                    n(this, "htmlEditor"),
                    n(this, "sanBox"),
                    n(this, "htmlRunner"),
                    n(this, "mapWork");
            }
            async renderContainer({ container: e, exampleId: t, exampleKey: i, onlyHtml: n = !1 }) {
                if (!e) throw new Error("container 不能为空");
                if (!t) throw (alert("id不能为空"), new Error("id不能为空"));
                (t = t.replace(/\\/gm, "/")),
                    (this.container = e),
                    (this.container.innerHTML = p.render(
                        '<div class="marsgis-editor__container">\r\n  <div id="split-left"></div>\r\n  <div id="split-right"></div>\r\n</div>\r\n'
                    ));
                const r = "1" === this.config.code;
                this.split = new Q(this.leftContainerId, this.rightContainerId, r);
                let s = await o.getCompConfig(t, i);
                if (!s) {
                    const e = "没有查询到当前id对应的配置";
                    window.$message ? window.$message(e) : alert(e),
                        (s = {
                            id: t,
                            main: t,
                            fullName: "临时测试页面",
                            name: "临时测试页面",
                            hasPannel: "1" === o.getQueryString("hasPannel")
                        });
                }
                this.fullName = s.fullName;
                var a = "localhost" === window.location.hostname ? `//${o.apiConf.packageName}.cn` : "";
                return (
                    (window.toOtherFramework = function (e) {
                        let t = `${a}/editor-${e}.html?id=${encodeURI(s.main)}`;
                        new URL(window.location.href).searchParams.forEach((e, i) => {
                            "id" !== i && "code" !== i && (t += `&${i}=${e}`);
                        }),
                            window.open(t);
                    }),
                    this.split.setLeft(
                        p.render(
                            '<div class="editor-container">\r\n  <div class="editor-header" >\r\n    <div class="header-left">\r\n      <% if(!onlyHtml) { %>\r\n        <div id="showjs-button" class="left-handles showjs" title="查看JS代码">\r\n          <img src="<%= javascriptIcon %>" alt="js" />\r\n        </div>\r\n        <% if (hasPannel) { %>\r\n          <div class="mars-dropdown">\r\n            <div id="showui-button" class="left-handles showui">\r\n              <img src="<%= uiIcon %>" alt="react" />\r\n            </div>\r\n            <div class="mars-dropdown-content" id="uilist-container"></div>\r\n          </div>\r\n          <% } %>\r\n            <% }%>\r\n              <div class="mars-dropdown">\r\n                <div class="left-handles">\r\n                  <img src="<%= fileIcon %>" alt="依赖" />\r\n                </div>\r\n                <div class="mars-dropdown-content" id="deplist-container"></div>\r\n              </div>\r\n    </div>\r\n    <span class="fileTip" id="filename">\r\n      <% if(!onlyHtml) { %>JS代码<% } else {%>Source code<% } %>\r\n    </span>\r\n    <div class="header-right">\r\n      <span id="jsreset" class="refresh mars-link-btn-primary" title="还原为初始代码，快捷键：Ctrl + R">\r\n        <img class="editor-icon" src="<%= refreshIcon %>" />\r\n        <span>Reload</span>\r\n      </span>\r\n      <span id="jsrun" class="mars-link-btn-primary" title="运行源码，快捷键：Ctrl + S">\r\n        <img class="editor-icon" src="<%= runIcon %>" />\r\n        <span>Run</span>\r\n      </span>\r\n    </div>\r\n  </div>\r\n\r\n\r\n  <div class="editor-code" id="js-editor"></div>\r\n  <div class="editor-code" id="ui-editor"></div>\r\n</div>',
                            {
                                onlyHtml: n,
                                javascriptIcon:
                                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAPY0lEQVR42u2dDdSX8xnHr6QWZUJnxcEiYpvNu3ZajEyzrRHzNkooa147S4gzzJi8LK9TbGJFmKzYbJiRaStLkre8pKXEkKcoipJn19X9eyx6np7/+3397vvzOed7nOM4x3Pf1+/6/n/37+W6RAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICZaq7ZX9VINUl2oukF1j2qy6mnVXNU7qqWq5aqPVfWqlaoPVR+o6lQLVC+rZqgmqSaqblZdqhqiOlq1j2rb8P8FgBrSSXVwSPK7VbNCEtenoFWqeaqHVSNVp6p6qjoQJoDK0EV1gmpcSLb6SDQvzB7ODabQllACNM/6qv1UV4apeH1GtEI1VTVctS+fD37wPnDyQAvVt1TXqd7KUNKvS0vCDOF4PhkwgLwagA38M8J3fH2OZWsYD6kGqDYmJTGArBtAV9WNqmU5T/zGZDsUd0qyo7Ee6YkBZImdJFm5X0WiF6RXVGeqNiVNMYCY2UZ1O4lfsk4iTTGAGNlIdUmY1pLIpekT1dakKQYQG70lrn17r5pJimIAMbFJmO6TvJXRxaQoBhALdsBlPklbUXUjRTEA79hBnmHy/ws2qDJ6U9gKxACcY2fcJ5CsVdHNpCcG4Bm7mfcEiVo1HUp6YgBesVt6c0nSqslqFGxEemIAHtlBksIZJGr19ACpiQF4NAD75X+DBK26TiU1MQBvBrC5ag7JWRN1JjUxAE8GYKv9M0jMmuhZ0hID8GQAts8/nsSsmYaTlhiAJwMYRlLWVN1JSwzAiwHYYFxJUtZMC1UtSUsMwIMBtBP2+mutMaQkBuDFAH5DQtZch5OSGIAHA7CpPxV8aquPVF8kJTGAtA3AbqBxxr/2eoh0xAA8GMBxJGMqGkw6YgBpG0ArFv5SUxfSEQNI2wB+QiKmolmkIgaQtgHYt3+W+vG9p5omSaONEZIcaLIS2/1VfcM/B4Z/d7YkJ/Csrfi9qumqt2v4t15OKmIAaRtA78gT3hL2FlU/1XaSHGEuF2vVtUdYF7lK9ajq/Sr87fuQihhA2gbw1wiT3gpn3CZJR+Fa1c+zdZI9Jenac7+U3/egTpKuyIABpGYAW0hcRT1tz/zq8HenzYaqgySp4VdXwrPcRhpiAGkbwNCIkn+Sanun46m1qo8khVJXFPg8R5GGGEDaBjAlgndhJxN/LvGUyu4YFh7X1SHJTKI9aYgBpGkAncT/sV9LlCMiHWN2u8/O+E9r5LkeIQUxgLQNoJ/zd/BJhqbJPVUPr/FsQ0hBDCBtAxjt/B1ksT/e3uHXvyspiAGkbQCzHT//U8IWGWAAVaN9mGJ7ff6eDFHAAKrHvo6f/d8MT8AAqsspjp/9JIYnYADVZYTjZ6c5BmAAVWai0+deyNAEDKD6TOX7HzCA/BqA1y1A6uMBBlCD569z+twckQUMoAbP/4H4PQAEgAFUGa9tvxZLZSr6AGAA68BzEZDtGJ6AAVSX5Y6f/WSGJ2AA1WWR42efyvAEDKC6zHH+/FTLBQygikxz/vzWo7AlwxQwgOowIYJ3cD7DFDCA6nBlBO/A6hX2YagCBlB5BkXwDhoagHyP4QoYQGXpHokBNDQD6c+QBQygcrQTv6cBm9K1kjTgAMAAKsCTkRmAaaZqZ4YvYAD5WAhsqlnIFaqNGMaAAZROr0gNoEELJGlush7DGTCA4mmjei9yEzA9rerNkAYMoHjGZsAAGjRdknMDXCcGDKBAvpshA1hzRnCssGMAGECz2Pfz3AyagOk11VDVpgx3wACa5uyMGkCD3leNUn2VYQ8YwNpYn8AlGTeBhnbjVnT0MKHxKAaAAXyGS3JgAJ/fQrxAtSWpgAFgACKbSFKQsz5nstqIf1L9QDhPgAHk2ACMITk0gDX1apgVbEV6YAB5NIBWqhdybgJrzgoOZFaAAeTJAIwekhTiqEer9bLqNEluTwIGkHkDMK4h8dfSorBQ2pHUwQCybgAbqJ4l6RvVMtV1wu4BBpBhAzC+plpKwjcpa6xiBUo6kUoYQBYNwDhcksMzJPy6TxleJNQmwAAyaADGeSR5QXpTNUDYNcAAMmYAdrV2NAlesKzhyu6kFwaQFQMwrEPPeJK7qHMEV6nakmYYQBYMwLC79RNJ7qL0itDjEAPIiAEYdlLwLhK76NnA8PDuAAOI2gAaPgdGkdgltTzfmrTDAGI3gAaGCUeGi9VC1f6kHgaQBQMwDhEOCxUr68Z0CumHAWTBAAwrs8UNwuI1QqhejAFkwAAMOwU3lqQuWrcKpckwgAwYQAPWpWcxiV2U7mKHAAPIigEYdkvuQRK7KI2TZHcFMIDoDUDCt21/VR3JXbCuJyUxgKwYQAMdVDcJNwoL1VmkJQaQJQNooJtqCgnerOxcxfdJTQygPoPv2z4LjpLkfDzJ3rRsEbUz6YkBZBVb8T5Z9TrJvs5jw2wPYgCZpo0k1XYXkPCN6jxSFAPIA3bNeKBqNkn/GX0kSV1GwABygZXS6qOaTPJ/qkmkKQaQR3aVpAzZMkxgdSdjwAByiTUsHax6LscG8BILghgAiOwlSSGSd3NoAv0JPwYACbZ7cITqPknu1ufBAGYJ5cYxAFgL68pzhurFHJjAgYQbA4DGsVOG+6ruVK3IqAH8mTBjANA8W0jSqmthxgxgpdCHEAOAgrEOx6er5mXIBAYTVgwAisPuHpyomp8BA/gH4cQAoDTahAXDmLcRrcnIZoQSA4DS6ai6ReItUnI4ISyfFs6D/Akhqjo9VXMjNICRhK581hf/K75QfTaW+LoeP0XYyucLzoO8nBDVlHMi+iSwH4cNCFl5fNF5kJcQoprTV+I5Wrw74Sp/IchzgBcRolToF8lM4FhCVR7bOQ/wG4QoNS6IwAB+QZjKY3fnAX6JEKWG3bp72Pn4GEOYyuM7zgM8nRClShfVh47Hx98IUXkc49wAHiVEqXOt4/HxNOEpjzOcG8C9hCh1tpGkU4/H8TGP8JTHNc4NYDQhcsFjTsfHYkJTHvc6N4DLCJELzhUOimWSF5wbwM8IkQv2dzo+PiY0pWPHgL2XjTqSMLlgK6fjYxWhKZ3dxP9Bj+6EyQWt+QTIHj+NwAC2JExu8LgT8C5hKZ2xzpPf3J0a8D5Yz+kYmU9oSsMKgXjvS/88YXLDZk7HyExCUxq7RDD9n0CYGC/N6O+EpjR+GYEBXEyY3NDP6Ri5hdCUNv2fE4EBsAXohxucjpELCU3x9Iog+U07ECo3C4ALnI6RvoSneO6PIPnfE3YA+MFoXrsSnuL4ZiS//l4WdzZmyMiDTscIRUFL+PafEokBXOTknV2vmqz6Nr/+7jSDlC6OUyJJftMBTt7ZM2v8TZNU++VovFjFaM+LxdeT0oXzDdWySJLfSlC1dfDONpXGj79OUx0mSVOVLC/8TRB2iTKB9Yl/NaJf/0ecvLeDmvk77Z0OVXXI4KfiKOdjxIyZ5qAFYJdpXogo+U1nOnl3V0jhdxbGSdJjL/adC7sifmsEY+RxUrt5uonf/dt16StO3t/jJfztVqPuV6qvRzhe7NzF9EjGyFmeX2TaWxPW/91OSK2IMPlnOYlh2wq8vxeDGewVptVeaRfGy/JIxoh1LNrGswHYLTvbOz1d1bXGxjMo/ArVRyovRzsr3S/BOhz9XpIz9Zs7eUZbu7Baf29HNkb+6Tn5G2u2aXeW7wiG0CP8N5VM+l5h0WZRxInv7fjvhVV+ztmqm1QnStKdqXUNx+cRkrQC/zDSMdLfswHsXOAUxkzB2i79VnW+aqDqYEkOnNjVyx0l6crSOfzTtvH2Vv1IkkKZdjljasRBbEz/chTHR2r87Db9fioswNmvsm1x7aH6UhkLixuGcXO0akQYLysiHyN14bnccmiGErLWOsFJDO3X+ANH78WS9rVgENYp6R7VnZJUdBodZMbxR0mOUNt/95bE0d03c1fEh5LI0Tt7d+LhUnaQraN3AxhJoErScEcxPJt4uNSvY9hLfYBAlfT9u4WjGN5HTFxeD4/ixOXLBKtojXQUP1twW0xMOPhTCi0zsMqaxq+/p9r/uxATl4fDWsVgAJ0JVtG63FkMTyMm7i797COR0JOAFSXbqmrvLIbjiYsrXS0RMZCAFaXjHMbwv8TFjZ6TyEp+XULQCpadgvR2QaYrcXGjpeLnVmjB/IHAFaQl4vM21wBi4+a2X5TVfp4geNFO/Y0xxMaFzpNIqSN4zWqs4/j9h/i4aPXVIsbkb0/wmpVdUvF6k2tL4pO67DJTtIVWdyOAzRbE2Mpx/H5MjFLvBN1aIuYwgtik3pXkhJ1nRhGn1HSrZKDEOjfImt7O6RFB/J4jVqno0li/+T/PjQSz0RtcMRzj7CDZLJ7hvfnLcZIhHiKoax3z3SOS2PUhXjXVXNWekjHmENhP9bxq24hiN4KY1Ux3qTbJWvLbAsZKgrtaE6WyVY9rwTTiVnW9o+orGaULAV59r39wpAs6Vp57FTGs2rHe2ySCWn7lcEDOg2ztpHaKPIZWPvtuFgMrqhmSlLLPPINyvMpvPQpaZiiWZmRjJFv9Fmota3pyjMTfKLVgLstZgG2943eqThmOqbXvukCSevwkdeGlu46VDBzqKZbxOUp8+57bIUextdlNb0muei8nyRst2WVb4D/M0y/+53ky40G2+/vXRLa1Vw1s+8r60v2FT4TVdzsuZUwkZLGMtC2GTZakeWU7QtyoGRwZZkR5uQZuXYStDVmvjK37lI1dJbXOvw9GPk38WJIGnWeqvkxYC8amvtbh95wwHV6aoen9zPBL34OkL4w2qv3CAtID4r/3+uywoGcdZDsQvopgi2B7hh2S21UvSRzbi/ZZYx2ErRLvIYyHymH9AqxrsJU6uiO4aq27z64MA9FO6p0fFrY6Epqa0T78ip4sSSck6+I7PyVjsJneq6r7Jem3d7wk9SxaEaba0SIkYLfwLTlEkiYZY8LMwZzYtlVeD2sMZhgr1kjm5WGqaTMMK2X1jOoxSQor2M3Ei8L3+4GqHSXyYgsZZoMQHztMNiD8SFwnSftvq5w8PRj3G2EcLA2/1DYGPlK9L0m9hYUhqZ9VTQmfo+NUV6qGhSTfX5JTqyQ6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQE75H/JUaRJ4GEHPAAAAAElFTkSuQmCC",
                                uiIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAANIAAADSABEULFowAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAA4ISURBVHic7d19jFX1ncfxz3dkvDOCk6rVxcqTmI0P6+ikkSA+gBEsuEpU0qe1G7L/1LZm2brpZjcm21pjiNvdjRZtSq1/gc2qJZrddleDBqsFqqk0nTIQjJYpDIKgUtdZkWFp5rN/nGsWSUW493fu79yZ9yuZf8jlez/n5Hy/99zzcI8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA+kTvAeGd7gqRZkq6SdIGk8yVNlXSqpJ76y4brf7slvSJpm6QNkjZFxB9anRlAE2zXbC+x/aTtYTdu2PYTtm+xfXLu5QJwDLbPtL3c9v4mmv6jvG37HtufzL2cAI5ge5Lt79g+UELjH+092/fanph7uYFxz8Xu+a4WNP7RhmzfnHv5gXHJdpftFRka/2irbZ+Se30A44btqbY3Z278I/3a9jm51wuqh9OAidm+QNJaSdNyZznKTkmLIuKV3EFQHQyAhGxfKOnnkqp6JP4tSXMZAvgAAyCR+i72RknTc2f5GK9LujIihnIHQX4MgARsd0t6SdIlubMcp35JcyJiJHcQ5NWRO8AYsULt0/yS1CfpvtwhkB97AE2yfYukJ3PnaNBNEfGT3CGQDwOgCS7Or2+VNCNzlEYNSbooIg7kDoI8+ArQnG+pfZtfKk5V3pk7BPJhD6BBts+QtEPSpMxRmnVA0oyIeDt3ELTehNwB2tgdStz8IyMju3fu3Lm2v79/0zPPPLP9qaeeekeSFi9efPr8+fNn9vX1XTZ9+vSFXV1dKa/qmyhpmaS7EtZEm2APoAEu7r3fI+mMFPVGRkZ2r1+//oGlS5f+7ODBg6PHem13d3fH6tWrr7366qv/pqur61Mp3l/S25LOiYj/TVQPbYIB0ICUR/7feOON/1qyZMm927ZtO6Fz8r29vd1r1qy5c/LkyX+eIoekmyPiPxLVQptgADTA9hOSljRb57XXXls1a9asBxv9/52dnfHSSy8tO++885Y2m0XSmoj4fII6aCOVGwC2L5X0FUnXqristitvonLs2bPnPy+66KJvN1uns7MzBgYG7pk8efKiBLGQ3oiKG7Gek/RQRPwmc54PqcwAsN0l6buSvqwxfnpyZGRkz3XXXfeFgYGBgynq9fX1nbJ27drHa7Xa2SnqoTSjkh6WdEdVLsOuRKPVm/9pFZ/8lchUpvXr169I1fyS1N/f//6GDRsa/iqBlulQsY0/Xd/ms6vEHoDtlZK+mjtHK4yMjOw+99xzb/m4o/0nqru7u2PHjh3/XqvVUp0ZQLl+EBFfyx0i+6et7Usk3ZY7R6vs2rVrberml6SDBw+ODg0NPZu6LkpzW33bzyr7AFDR/FXI0RL9/f2byqq9efPml8uqjeQ6VIEPvio03rW5A7TSs88+O1hW7XXr1pVWG6XIvu1XYQDMyB2glZ5//vn/LrH2O2XVRilm5A5QhQHg3AFaacKECaUdeC2zNkqR/FjQiarCANiRO0ArzZ079xNl1Z43b15ptVGKnbkDVGEAPJc7QCstWLBgZlm1r7nmmvPKqo1SZN/2qzAAfqgK7Aq1yqWXXjqrrNp9fX2l1UZyoyq2/ayyD4CIGJC0MneOVpk2bdrCnp6e5Ou9p6enY8qUKZ9JXRelWVnf9rPKPgDqviFpXe4QrVCr1c5etWrVdanrrl69emGtVpucui5KsU7FNp9dJQZARBySdIOk72kcfB244oorll122WXJHtg5e/bsiXPmzFmWqh5KM6piG7+hvs1nV7nTRrYvVnFH4HwV50nH5HPu9+7du7a3t/cfDx8+3NRp0M7Ozti6deu9Z5111oJU2ZDUARVnutZJejgituSN82GVGwDtwPYaSZ9tts7g4OC/zZ49+/5Gh0BnZ2e8/PLLfztjxoxbm80i6fGI+GKCOmgjlfgK0IZ+lKLIzJkzb92yZcvyRr4OzJ49e+LWrVvvTdT8UqJlQnthD6ABtjsl7ZZ0Zop6hw4d2vfiiy9+b+nSpWuHh4ePeQykp6en45FHHll0+eWX/3WtVjsrxfureGrwORFxOFE9tAkGQINs363iwSDJHDp0aO/rr7/+zMDAwKYXXnhhcOPGje9I0pVXXnnavHnzZvb29s6aMmXKZ2q12p+kfF9J346IuxPXRBtgADTI9ukqDu6cmjlKs4ZVPBiEG4nGIY4BNCgifi/pgdw5Erif5h+/2ANogu1uFQ8HPTd3lgbtVPFw0PdzB0Ee7AE0ISIOSvp67hwNsqTbaf7xjQHQpIj4qaTv587RgAcj4qncIZAXXwESsF2T9AtJn86d5ThtknRVVS5HRT7sASRQb6TFkn6XO8txGJS0mOaHxABIJiL2SFok6c3cWY5hn6SFEbE3dxBUAwMgoYh4VdIcSb/NneWP2CFpbkRUMRsyYQAkFhGDkuZK+lXuLEf4paQ59QEFoGy2a7ZX2B51Xg/ZPjn3+gDGJds32B7M0PjbbV+fe/mBcc92t+27bb/bgsZ/1/ZdLq5SBFAVtk+rN+e+Ehp/n+1v2ubZAECV2e60faPtx2zvb6Lp99t+1MXXjAm5lwvthysBM7PdIalP0tWSLpR0vqSpknokTaq/7D0Vt+0OSXpV0jZJ6yX1R8SY/xFVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAnCJ3AIxvtidImiXpKkkXSDpf0lRJp0rqqb9suP63W9IrkrZJ2iBpU0T8odWZATTBds32EttP2h5244ZtP2H7Ftsn514uAMdg+0zby23vb6LpP8rbtu+x/cncywngCLYn2f6O7QMlNP7R3rN9r+2JuZcbGPdc7J7vakHjH23I9s25lx8Yl2x32V6RofGPttr2KbnXBzBu2J5qe3Pmxj/Sr22fk3u9VBGnAZGU7QskrZU0LXeWo+yUtCgiXskdpEoYAEjG9oWSfi6pqkfi35I0lyHw/xgASKK+i71R0vTcWT7G65KujIih3EGqgAGAptnulvSSpEtyZzlO/ZLmRMRI7iC5deQOgDFhhdqn+SWpT9J9uUNUAXsAaIrtWyQ9mTtHg26KiJ/kDpETAwANc3F+faukGZmjNGpI0kURcSB3kFz4CoBmfEvt2/xScaryztwhcmIPAA2xfYakHZImZY7SrAOSZkTE27mD5MAeABp1h9I3/6Ck5ZIWSDpb0kn1v0/V/215/TUpTZS0LHFNYOyyfbKL229T2W77s7Y/9gPJdoftz9keTPj+b5nfEwCOj4s7/FJZ5QZu1rE90fYjCXPcVMa6AsYcF7/Ck8I/NZkjbP9zoiw/TrV+2knlDgLavlTSVyRdq+Ky0q68iVCSVRHxV80WsR2SfiTp1qYTlWNExY1Iz0l6KCJ+kznPh1RmANjukvRdSV8WByfHut9J6k11/t32JElbVP37EEYlPSzpjqpchlyJRqs3/9MqPvkrkQml+vuUF99ExHuS/iFVvRJ1qNjGn65v89lVYg/A9kpJX82dAy0xKOlPI2I0ZVEXZxC2q30uTPpBRHwtd4jsn7a2L5F0W+4caJnHUje/JNVrPp66boluq2/7WWUfACqavwo50Bo/K7H2cyXWTq1DFfjgq0LjXZs7AFpqa5vWLkP2bT/7MQDb70vqzp0DLXNyRBwuo7CLq/kOlVG7JAcjIusvFldhD8C5A6ClyvzQyf6BdoKSHws5UVUYADtyB0BLlfmDoWeWWLsMO3MHqMIAaKcDN2jen7Vp7TJk3/arMAB+qArsCqFlyjzwNb/E2qmNqtj2s8o+ACJiQNLK3DnQMn9h+6TURes1v5C6bolW1rf9rLIPgLpvSFqXOwRaYrqkz5dQ94uq3tOIPso6Fdt8dpU5amq7JulfJd2u6gwmlGNI0sUR8T8pitnuUXENwJQU9Uo0Kun7kv4uIipxurIyA+ADti9WcUfgfBXXdfOc97HpUUlfioimTgPXbwd+XNLnkqRK74CKM13rJD0cEVvyxgGaZHtNoh/huK/ewI3mCNv3J8ryWMp1BIxZtm9K1HS2/ajtUxvI0GP7xwlz3FjGugLGHNudtt9M2HxDtr/k4zg7YPsk239pe1fC93/Tdmcr1h0wJti+O2EDfmCni9/4u972NNvd9b9p9X/7FxfDIrW7cq/PXCp3EBDtwfbpKg5unfDue8UMq3gwyDu5g+TA6TY0JCJ+L+mB3DkSuH+8Nr/EHgCaYLtbxfn3c3NnadBOFQ8HfT93kFzYA0DDIuKgpK/nztEgS7p9PDe/xABAkyLipyqubms3D0bEU7lD5MZXADTNxWXcv5D06dxZjtMmSVdV5XLcnNgDQNPqjbRYxQM/qm5Q0mKav8AAQBIRsUfSIklv5s5yDPskLYyIvbmDVAUDAMlExKuS5kj6be4sf8QOSXMjoorZsmEAIKmIGJQ0V9Kvcmc5wi8lzakPKABls12zvcL2aAmX7p6Ih1z8XDiAVrN9g+3BDI2/3fb1uZcfGPdc3NBzt+13W9D479q+y8VVigCqwvZp9ebcV0Lj77P9TdufyL2cAI7Bxe8J3Gj7Mdv7m2j6/S5+UOQG2xNyL1c74kpAZGW7Q1KfpKslXSjpfElTJfVImlR/2XsqbtsdkvSqpG2S1kvqL+NR4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoDX+D+HyRiuzdmhrAAAAAElFTkSuQmCC",
                                fileIcon:
                                    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGQ9Ik0wIDBINDhWNDhIMFYwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxnPjxnPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0xMiA5LjkyNzA0VjdDMTIgNS4zNDMxNSAxMy4zNDMxIDQgMTUgNEg0MUM0Mi42NTY5IDQgNDQgNS4zNDMxNSA0NCA3VjMzQzQ0IDM0LjY1NjkgNDIuNjU2OSAzNiA0MSAzNkgzOC4wMTc0IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIvPjxyZWN0IHg9IjQiIHk9IjEwIiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHJ4PSIzIiBmaWxsPSJub25lIiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvZz48Zz48Zz48cGF0aCBkPSJNMTguNDM5NiAyMy4xMDk4TDIzLjczMjEgMTcuNjAwM0MyNS4xODM4IDE2LjE0ODYgMjcuNTY5MyAxNi4xODA2IDI5LjA2MDQgMTcuNjcxN0MzMC41NTE1IDE5LjE2MjggMzAuNTgzNSAyMS41NDgzIDI5LjEzMTkgMjNMMjcuMjIxOCAyNS4wMjI4IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEzLjQ2NjEgMjguNzQ2OUMxMi45NTU4IDI5LjI1NzMgMTEuOTAwNiAzMC4yNzYyIDExLjkwMDYgMzAuMjc2MkMxMC40NDg5IDMxLjcyNzkgMTAuNDA5NSAzNC4zMTUyIDExLjkwMDYgMzUuODA2M0MxMy4zOTE3IDM3LjI5NzQgMTUuNzc3MiAzNy4zMjk0IDE3LjIyODkgMzUuODc3N0wyMi4zOTMxIDMxLjE4OTQiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTguNjYzMSAyOC4zMjgzQzE3Ljk3MDUgMjcuNjM1NyAxNy41OTI3IDI2Ljc1MDEgMTcuNTMyMSAyNS44NTQ3QzE3LjQ2MjQgMjQuODIyNSAxNy44MTQzIDIzLjc3NzQgMTguNTkxNiAyMyIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMi4zMjE4IDI1Ljg2MTFDMjMuODEyOSAyNy4zNTIyIDIzLjg0NDkgMjkuNzM3NyAyMi4zOTMyIDMxLjE4OTQiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L2c+PC9nPjwvZz48L2c+PC9zdmc+",
                                hasPannel: s.hasPannel,
                                refreshIcon:
                                    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00MiA4VjI0IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTYgMjRMNiA0MCIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02IDI0QzYgMzMuOTQxMSAxNC4wNTg5IDQyIDI0IDQyQzI4Ljg1NTYgNDIgMzMuMjYyMiA0MC4wNzc0IDM2LjUgMzYuOTUxOSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00Mi4wMDA3IDI0QzQyLjAwMDcgMTQuMDU4OSAzMy45NDE4IDYgMjQuMDAwNyA2QzE4LjkxNTIgNiAxNC4zMjIzIDguMTA4OTYgMTEuMDQ4OCAxMS41IiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
                                runIcon:
                                    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yNCA0NEMzNS4wNDU3IDQ0IDQ0IDM1LjA0NTcgNDQgMjRDNDQgMTIuOTU0MyAzNS4wNDU3IDQgMjQgNEMxMi45NTQzIDQgNCAxMi45NTQzIDQgMjRDNCAzNS4wNDU3IDEyLjk1NDMgNDQgMjQgNDRaIiBmaWxsPSJub25lIiBzdHJva2U9IiMxODkwZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMCAyNFYxNy4wNzE4TDI2IDIwLjUzNTlMMzIgMjRMMjYgMjcuNDY0MUwyMCAzMC45MjgyVjI0WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="
                            }
                        )
                    ),
                    this.split.setRight(
                        p.render(
                            '<div class="layout-right">\r\n  <div class="layout-right__header mars-fadeInDown <%= fullScreen ? \'hidden\' : \'\' %>">\r\n    <span class="mars-link-btn-primary" id="toogle-editor">\r\n      <img class="editor-icon" id="expand-icon" style="display: none;" src="<%= expandIcon %>" />\r\n      <img class="editor-icon" id="collapse-icon" src="<%= collapseIcon %>" />\r\n      <span id="toogle-text">\r\n        <%= toogleText %>\r\n      </span>\r\n    </span>\r\n    <p class="fullname" id="fullname">标题</p>\r\n    <div id="other-intro">\r\n      <% links.forEach(function(item){ %>\r\n\r\n        <% if (item.children) { %>\r\n          <div id="<%= item.id %>" class="mars-dropdown" title="<%= item.description %>">\r\n            <div class="left-handles">\r\n              <span class="mars-link-btn-primary">\r\n                <img class="editor-icon" src="<%= item.icon %>" />\r\n                <span>\r\n                  <%= item.title %>\r\n                </span>\r\n              </span>\r\n            </div>\r\n            <div class="mars-dropdown-content display-left">\r\n              <div class="mars-dropdown-title">切换技术栈</div>\r\n              <% item.children.forEach(function(it){ %>\r\n                <a  id="<%= it.id %>" rel="noreferrer" class="mars-link-btn-primary mars-dropdown-item" href="<%= it.url %>">\r\n                  <%= it.title %>\r\n                </a>\r\n                <% }); %>\r\n            </div>\r\n          </div>\r\n          <% } %>\r\n            <% if (!item.children) { %>\r\n              <a id="<%= item.id %>" class="mars-link-btn-primary" target="_blank" rel="noreferrer"  title="<%= item.description %>"\r\n                href="<%= item.url %>">\r\n                <img class="editor-icon" src="<%= item.icon %>" />\r\n                <span>\r\n                  <%= item.title %>\r\n                </span>\r\n              </a>\r\n              <% } %>\r\n                <% }); %>\r\n    </div>\r\n  </div>\r\n\r\n  <div class="layout-right__content mars-main-view <%= fullScreen?\'layout-right__fillcontent\':\'\' %>" id="mars-main-view">\r\n    <div class="mars-ui-root" id="mars-ui-root"></div>\r\n    <div class="sanbox" id="sanbox"></div>\r\n  </div>\r\n</div>',
                            {
                                toogleText:
                                    "1" === this.config.code ? this.config.collapseBtnText : this.config.expandBtnText,
                                links: this.config.links,
                                fullScreen: "1" === this.config.fullScreen,
                                expandIcon:
                                    "data:image/png;base64,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",
                                collapseIcon:
                                    "data:image/png;base64,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"
                            }
                        )
                    ),
                    (document.getElementById("fullname").innerText = s.fullName),
                    (document.getElementById("fullname").title = s.fullName),
                    this.renderDepList(s),
                    this.bindEvent(),
                    s
                );
            }
            async render({ container: e, exampleId: t, exampleKey: i }) {
                const n = await this.renderContainer({ container: e, exampleId: t, exampleKey: i });
                Object.defineProperty(window, "mapWork", {
                    get: () => this.mapWork,
                    set: (e) => {
                        (this.mapWork = e), this.emit("loaded", n), n.hasPannel || this.useLifecycle();
                    }
                }),
                    n.hasPannel && this.renderUiDepList(n),
                    (this.sanBox = new J(n)),
                    (this.jsEditor = new Z(n)),
                    this.jsEditor.on("run", (e) => {
                        this.sanBox && this.sanBox.writeScriptDoc(e);
                    }),
                    this.split.on("layout", () => {
                        this.jsEditor.resize();
                    });
            }
            renderDepList({ main: e, libs: t, resources: i }) {
                const n = o.getLibs(e, t, i);
                document.getElementById("deplist-container").innerHTML = p.render(
                    '<div class="mars-dropdown-title">当前示例依赖的资源文件 (请注意顺序)</div>\r\n<% depSources.forEach(function(dep){ %>\r\n<div class="mars-dropdown-item">\r\n  <a rel="noreferrer" class="mars-link-btn-primary" target="_blank" href="<%= dep.url %>"> <%= dep.name %> </a>\r\n</div>\r\n<% }); %>\r\n',
                    { depSources: n }
                );
            }
            renderUiDepList({ pannelFiles: e }) {
                e &&
                    e[this.config.framework] &&
                    (document.getElementById("uilist-container").innerHTML = p.render(
                        '<div class="mars-dropdown-title">查看UI面板代码,代码只读</div>\r\n<% pannelFiles.forEach(function(dep){ %>\r\n  <div class="mars-dropdown-item uidep-item" data-file="<%= JSON.stringify(dep) %>">\r\n    <span class="mars-link-btn-primary deplist-item">\r\n      <%= dep.name %>\r\n    </span>\r\n  </div>\r\n  <% }); %>',
                        { pannelFiles: e[this.config.framework] }
                    ));
            }
            async renderHTML({ container: e, exampleId: t, exampleKey: i }) {
                const n = await this.renderContainer({ container: e, exampleId: t, exampleKey: i, onlyHtml: !0 });
                (this.htmlEditor = new V(n)),
                    (this.htmlRunner = new R()),
                    this.htmlEditor.on("run", (e) => {
                        this.htmlRunner && this.htmlRunner.writeHtml(e);
                    }),
                    this.split.on("layout", () => {
                        this.htmlEditor.resize();
                    });
            }
            useLifecycle() {
                const e = window._mapInstance;
                this.mapWork &&
                    (!window.mars3d && this.mapWork.mars3d && (window.mars3d = this.mapWork.mars3d),
                    !window.mars2d && this.mapWork.mars2d && (window.mars2d = this.mapWork.mars2d),
                    this.mapWork.onMounted && this.mapWork.onMounted(e));
            }
            bindEvent() {
                this.toogleBtn || (this.toogleBtn = document.getElementById("toogle-editor")),
                    this.toogleBtn.addEventListener("click", () => {
                        const e = document.getElementById("expand-icon"),
                            t = document.getElementById("collapse-icon"),
                            i = document.getElementById("toogle-text");
                        "0" === o.apiConf.code
                            ? (this.split.expand(),
                              (o.apiConf.code = "1"),
                              (i.innerText = this.config.collapseBtnText),
                              (e.style.display = "none"),
                              (t.style.display = "inline-block"))
                            : (this.split.collapse(),
                              (o.apiConf.code = "0"),
                              (i.innerText = this.config.expandBtnText),
                              (t.style.display = "none"),
                              (e.style.display = "inline-block"));
                    });
            }
        }),
        (e.Util = o),
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        e
    );
})({}, monaco);

