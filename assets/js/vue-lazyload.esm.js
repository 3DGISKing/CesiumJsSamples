import { K as e, d as t, r, P as s, E as i, q as o, G as n, a, J as l } from "./index.js";
/*!
 * Vue-Lazyload.js v3.0.0
 * (c) 2023 Awe <hilongjw@gmail.com>
 * Released under the MIT License.
 */ function d(e, t) {
    return e((t = { exports: {} }), t.exports), t.exports;
}
var h = d(function (e) {
        const t = Object.prototype.toString,
            r = Object.prototype.propertyIsEnumerable,
            s = Object.getOwnPropertySymbols;
        e.exports = (e, ...i) => {
            if ("function" != typeof (o = e) && "[object Object]" !== t.call(o) && !Array.isArray(o))
                throw new TypeError("expected the first argument to be an object");
            var o;
            if (0 === i.length || "function" != typeof Symbol || "function" != typeof s) return e;
            for (let t of i) {
                let i = s(t);
                for (let s of i) r.call(t, s) && (e[s] = t[s]);
            }
            return e;
        };
    }),
    c = Object.freeze({ __proto__: null, default: h, __moduleExports: h }),
    u = (c && h) || c,
    p = d(function (e) {
        const t = Object.prototype.toString,
            r = (e) => "__proto__" !== e && "constructor" !== e && "prototype" !== e,
            s = (e.exports = (e, ...t) => {
                let o = 0;
                var n;
                for (
                    ("object" == typeof (n = e) ? null === n : "function" != typeof n) && (e = t[o++]), e || (e = {});
                    o < t.length;
                    o++
                )
                    if (i(t[o])) {
                        for (const n of Object.keys(t[o]))
                            r(n) && (i(e[n]) && i(t[o][n]) ? s(e[n], t[o][n]) : (e[n] = t[o][n]));
                        u(e, t[o]);
                    }
                return e;
            });
        function i(e) {
            return "function" == typeof e || "[object Object]" === t.call(e);
        }
    });
const A = "undefined" != typeof window && null !== window,
    f = (function () {
        if (
            A &&
            "IntersectionObserver" in window &&
            "IntersectionObserverEntry" in window &&
            "intersectionRatio" in window.IntersectionObserverEntry.prototype
        )
            return (
                "isIntersecting" in window.IntersectionObserverEntry.prototype ||
                    Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", {
                        get: function () {
                            return this.intersectionRatio > 0;
                        }
                    }),
                !0
            );
        return !1;
    })();
const g = "event",
    v = "observer";
function m(e, t) {
    if (!e.length) return;
    const r = e.indexOf(t);
    return r > -1 ? e.splice(r, 1) : void 0;
}
function b(e, t) {
    if ("IMG" !== e.tagName || !e.getAttribute("data-srcset")) return "";
    let r = e.getAttribute("data-srcset").trim().split(",");
    const s = [],
        i = e.parentNode.offsetWidth * t;
    let o, n, a;
    r.forEach((e) => {
        (e = e.trim()),
            (o = e.lastIndexOf(" ")),
            -1 === o
                ? ((n = e), (a = 99999))
                : ((n = e.substr(0, o)), (a = parseInt(e.substr(o + 1, e.length - o - 2), 10))),
            s.push([a, n]);
    }),
        s.sort((e, t) => {
            if (e[0] < t[0]) return 1;
            if (e[0] > t[0]) return -1;
            if (e[0] === t[0]) {
                if (-1 !== t[1].indexOf(".webp", t[1].length - 5)) return 1;
                if (-1 !== e[1].indexOf(".webp", e[1].length - 5)) return -1;
            }
            return 0;
        });
    let l,
        d = "";
    for (let h = 0; h < s.length; h++) {
        (l = s[h]), (d = l[1]);
        const e = s[h + 1];
        if (e && e[0] < i) {
            d = l[1];
            break;
        }
        if (!e) {
            d = l[1];
            break;
        }
    }
    return d;
}
const y = (e = 1) => (A && window.devicePixelRatio) || e;
function w() {
    if (!A) return !1;
    let e = !0;
    function t(e, t) {
        const r = new Image();
        (r.onload = function () {
            const e = r.width > 0 && r.height > 0;
            t(e);
        }),
            (r.onerror = function () {
                t(!1);
            }),
            (r.src =
                "data:image/webp;base64," +
                {
                    lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
                    lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
                    alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
                    animation:
                        "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
                }[e]);
    }
    return (
        t("lossy", (t) => {
            e = t;
        }),
        t("lossless", (t) => {
            e = t;
        }),
        t("alpha", (t) => {
            e = t;
        }),
        t("animation", (t) => {
            e = t;
        }),
        e
    );
}
const _ = (function () {
        if (!A) return !1;
        let e = !1;
        try {
            const t = Object.defineProperty({}, "passive", {
                get: function () {
                    e = !0;
                }
            });
            window.addEventListener("test", I, t);
        } catch (t) {}
        return e;
    })(),
    L = {
        on(e, t, r, s = !1) {
            _ ? e.addEventListener(t, r, { capture: s, passive: !0 }) : e.addEventListener(t, r, s);
        },
        off(e, t, r, s = !1) {
            e.removeEventListener(t, r, s);
        }
    },
    E = (e, t, r) => {
        let s = new Image();
        if (!e || !e.src) {
            const e = new Error("image src is required");
            return r(e);
        }
        e.cors && (s.crossOrigin = e.cors),
            (s.src = e.src),
            (s.onload = function () {
                t({ naturalHeight: s.naturalHeight, naturalWidth: s.naturalWidth, src: s.src }), (s = null);
            }),
            (s.onerror = function (e) {
                r(e);
            });
    },
    Q = (e, t) => ("undefined" != typeof getComputedStyle ? getComputedStyle(e, null).getPropertyValue(t) : e.style[t]),
    z = (e) => Q(e, "overflow") + Q(e, "overflowY") + Q(e, "overflowX");
function I() {}
class T {
    constructor(e) {
        (this.max = e || 100), (this._caches = []);
    }
    has(e) {
        return this._caches.indexOf(e) > -1;
    }
    add(e) {
        this.has(e) || (this._caches.push(e), this._caches.length > this.max && this.free());
    }
    free() {
        this._caches.shift();
    }
}
class O {
    constructor(e, t, r, s, i, o, n, a, l, d) {
        (this.el = e),
            (this.src = t),
            (this.error = r),
            (this.loading = s),
            (this.bindType = i),
            (this.attempt = 0),
            (this.cors = a),
            (this.naturalHeight = 0),
            (this.naturalWidth = 0),
            (this.options = n),
            (this.rect = {}),
            (this.$parent = o),
            (this.elRenderer = l),
            (this._imageCache = d),
            (this.performanceData = { init: Date.now(), loadStart: 0, loadEnd: 0 }),
            this.filter(),
            this.initState(),
            this.render("loading", !1);
    }
    initState() {
        "dataset" in this.el ? (this.el.dataset.src = this.src) : this.el.setAttribute("data-src", this.src),
            (this.state = { loading: !1, error: !1, loaded: !1, rendered: !1 });
    }
    record(e) {
        this.performanceData[e] = Date.now();
    }
    update(e) {
        const t = this.src;
        (this.src = e.src),
            (this.loading = e.loading),
            (this.error = e.error),
            this.filter(),
            t !== this.src && ((this.attempt = 0), this.initState());
    }
    getRect() {
        this.rect = this.el.getBoundingClientRect();
    }
    checkInView() {
        return (
            this.getRect(),
            this.rect.top < window.innerHeight * this.options.preLoad &&
                this.rect.bottom > this.options.preLoadTop &&
                this.rect.left < window.innerWidth * this.options.preLoad &&
                this.rect.right > 0
        );
    }
    filter() {
        for (const e in this.options.filter) this.options.filter[e](this, this.options);
    }
    renderLoading(e) {
        (this.state.loading = !0),
            E(
                { src: this.loading, cors: this.cors },
                () => {
                    this.render("loading", !1), (this.state.loading = !1), e();
                },
                () => {
                    e(),
                        (this.state.loading = !1),
                        this.options.silent ||
                            console.warn(`VueLazyload log: load failed with loading image(${this.loading})`);
                }
            );
    }
    load(e = I) {
        return this.attempt > this.options.attempt - 1 && this.state.error
            ? (this.options.silent ||
                  console.log(`VueLazyload log: ${this.src} tried too more than ${this.options.attempt} times`),
              void e())
            : this.state.rendered && this.state.loaded
            ? void 0
            : this._imageCache.has(this.src)
            ? ((this.state.loaded = !0), this.render("loaded", !0), (this.state.rendered = !0), e())
            : void this.renderLoading(() => {
                  this.attempt++,
                      this.options.adapter.beforeLoad && this.options.adapter.beforeLoad(this, this.options),
                      this.record("loadStart"),
                      E(
                          { src: this.src, cors: this.cors },
                          (t) => {
                              (this.naturalHeight = t.naturalHeight),
                                  (this.naturalWidth = t.naturalWidth),
                                  (this.state.loaded = !0),
                                  (this.state.error = !1),
                                  this.record("loadEnd"),
                                  this.render("loaded", !1),
                                  (this.state.rendered = !0),
                                  this._imageCache.add(this.src),
                                  e();
                          },
                          (e) => {
                              !this.options.silent && console.error(e),
                                  (this.state.error = !0),
                                  (this.state.loaded = !1),
                                  this.render("error", !1);
                          }
                      );
              });
    }
    render(e, t) {
        this.elRenderer(this, e, t);
    }
    performance() {
        let e = "loading",
            t = 0;
        return (
            this.state.loaded &&
                ((e = "loaded"), (t = (this.performanceData.loadEnd - this.performanceData.loadStart) / 1e3)),
            this.state.error && (e = "error"),
            { src: this.src, state: e, time: t }
        );
    }
    $destroy() {
        (this.el = null),
            (this.src = ""),
            (this.error = null),
            (this.loading = ""),
            (this.bindType = null),
            (this.attempt = 0);
    }
}
const x = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    $ = ["scroll", "wheel", "mousewheel", "resize", "animationend", "transitionend", "touchmove"],
    B = { rootMargin: "0px", threshold: 0 };
class R {
    constructor({
        preLoad: e,
        error: t,
        throttleWait: r,
        preLoadTop: s,
        dispatchEvent: i,
        loading: o,
        attempt: n,
        silent: a = !0,
        scale: l,
        listenEvents: d,
        filter: h,
        adapter: c,
        observer: u,
        observerOptions: p
    }) {
        (this.version = '"3.0.0"'),
            (this.lazyContainerMananger = null),
            (this.mode = g),
            (this.ListenerQueue = []),
            (this.TargetIndex = 0),
            (this.TargetQueue = []),
            (this.options = {
                silent: a,
                dispatchEvent: !!i,
                throttleWait: r || 200,
                preLoad: e || 1.3,
                preLoadTop: s || 0,
                error: t || x,
                loading: o || x,
                attempt: n || 3,
                scale: l || y(l),
                listenEvents: d || $,
                supportWebp: w(),
                filter: h || {},
                adapter: c || {},
                observer: !!u,
                observerOptions: p || B
            }),
            this._initEvent(),
            (this._imageCache = new T(200)),
            (this.lazyLoadHandler = (function (e, t) {
                let r = null,
                    s = 0;
                return function () {
                    if (r) return;
                    const i = Date.now() - s,
                        o = this,
                        n = arguments,
                        a = function () {
                            (s = Date.now()), (r = !1), e.apply(o, n);
                        };
                    i >= t ? a() : (r = setTimeout(a, t));
                };
            })(this._lazyLoadHandler.bind(this), this.options.throttleWait)),
            this.setMode(this.options.observer ? v : g);
    }
    performance() {
        const e = [];
        return this.ListenerQueue.map((t) => e.push(t.performance())), e;
    }
    addLazyBox(e) {
        this.ListenerQueue.push(e),
            A &&
                (this._addListenerTarget(window),
                this._observer && this._observer.observe(e.el),
                e.$el && e.$el.parentNode && this._addListenerTarget(e.$el.parentNode));
    }
    add(t, r, s) {
        if (this.ListenerQueue.some((e) => e.el === t)) return this.update(t, r), e(this.lazyLoadHandler);
        let { src: i, loading: o, error: n, cors: a } = this._valueFormatter(r.value);
        e(() => {
            (i = b(t, this.options.scale) || i), this._observer && this._observer.observe(t);
            const s = Object.keys(r.modifiers)[0];
            let l;
            s && ((l = r.instance.$refs[s]), (l = l ? l.el || l : document.getElementById(s))),
                l ||
                    (l = ((e) => {
                        if (!A) return;
                        if (!(e instanceof Element)) return window;
                        let t = e;
                        for (; t && t !== document.body && t !== document.documentElement && t.parentNode; ) {
                            if (/(scroll|auto)/.test(z(t))) return t;
                            t = t.parentNode;
                        }
                        return window;
                    })(t));
            const d = new O(t, i, n, o, r.arg, l, this.options, a, this._elRenderer.bind(this), this._imageCache);
            this.ListenerQueue.push(d),
                A && (this._addListenerTarget(window), this._addListenerTarget(l)),
                e(this.lazyLoadHandler);
        });
    }
    update(t, r, s) {
        let { src: i, loading: o, error: n } = this._valueFormatter(r.value);
        i = b(t, this.options.scale) || i;
        const a = this.ListenerQueue.find((e) => e.el === t);
        a
            ? a.update({ src: i, loading: o, error: n })
            : ("loaded" === t.getAttribute("lazy") && t.dataset.src === i) || this.add(t, r, s),
            this._observer && (this._observer.unobserve(t), this._observer.observe(t)),
            e(this.lazyLoadHandler);
    }
    remove(e) {
        if (!e) return;
        this._observer && this._observer.unobserve(e);
        const t = this.ListenerQueue.find((t) => t.el === e);
        t &&
            (this._removeListenerTarget(t.$parent),
            this._removeListenerTarget(window),
            m(this.ListenerQueue, t),
            t.$destroy && t.$destroy());
    }
    removeComponent(e) {
        e &&
            (m(this.ListenerQueue, e),
            this._observer && this._observer.unobserve(e.el),
            e.$parent && e.$el.parentNode && this._removeListenerTarget(e.$el.parentNode),
            this._removeListenerTarget(window));
    }
    setMode(e) {
        f || e !== v || (e = g),
            (this.mode = e),
            e === g
                ? (this._observer &&
                      (this.ListenerQueue.forEach((e) => {
                          this._observer.unobserve(e.el);
                      }),
                      (this._observer = null)),
                  this.TargetQueue.forEach((e) => {
                      this._initListen(e.el, !0);
                  }))
                : (this.TargetQueue.forEach((e) => {
                      this._initListen(e.el, !1);
                  }),
                  this._initIntersectionObserver());
    }
    _addListenerTarget(e) {
        if (!e) return;
        let t = this.TargetQueue.find((t) => t.el === e);
        return (
            t
                ? t.childrenCount++
                : ((t = { el: e, id: ++this.TargetIndex, childrenCount: 1, listened: !0 }),
                  this.mode === g && this._initListen(t.el, !0),
                  this.TargetQueue.push(t)),
            this.TargetIndex
        );
    }
    _removeListenerTarget(e) {
        this.TargetQueue.forEach((t, r) => {
            t.el === e &&
                (t.childrenCount--,
                t.childrenCount || (this._initListen(t.el, !1), this.TargetQueue.splice(r, 1), (t = null)));
        });
    }
    _initListen(e, t) {
        this.options.listenEvents.forEach((r) => L[t ? "on" : "off"](e, r, this.lazyLoadHandler));
    }
    _initEvent() {
        (this.Event = { listeners: { loading: [], loaded: [], error: [] } }),
            (this.$on = (e, t) => {
                this.Event.listeners[e] || (this.Event.listeners[e] = []), this.Event.listeners[e].push(t);
            }),
            (this.$once = (e, t) => {
                const r = this;
                this.$on(e, function s() {
                    r.$off(e, s), t.apply(r, arguments);
                });
            }),
            (this.$off = (e, t) => {
                if (t) m(this.Event.listeners[e], t);
                else {
                    if (!this.Event.listeners[e]) return;
                    this.Event.listeners[e].length = 0;
                }
            }),
            (this.$emit = (e, t, r) => {
                this.Event.listeners[e] && this.Event.listeners[e].forEach((e) => e(t, r));
            });
    }
    _lazyLoadHandler() {
        const e = [];
        this.ListenerQueue.forEach((t, r) => {
            (t.el && t.el.parentNode && !t.state.loaded) || e.push(t);
            t.checkInView() && (t.state.loaded || t.load());
        }),
            e.forEach((e) => {
                m(this.ListenerQueue, e), e.$destroy && e.$destroy();
            });
    }
    _initIntersectionObserver() {
        f &&
            ((this._observer = new IntersectionObserver(
                this._observerHandler.bind(this),
                this.options.observerOptions
            )),
            this.ListenerQueue.length &&
                this.ListenerQueue.forEach((e) => {
                    this._observer.observe(e.el);
                }));
    }
    _observerHandler(e) {
        e.forEach((e) => {
            e.isIntersecting &&
                this.ListenerQueue.forEach((t) => {
                    if (t.el === e.target) {
                        if (t.state.loaded) return this._observer.unobserve(t.el);
                        t.load();
                    }
                });
        });
    }
    _elRenderer(e, t, r) {
        if (!e.el) return;
        const { el: s, bindType: i } = e;
        let o;
        switch (t) {
            case "loading":
                o = e.loading;
                break;
            case "error":
                o = e.error;
                break;
            default:
                o = e.src;
        }
        if (
            (i ? (s.style[i] = 'url("' + o + '")') : s.getAttribute("src") !== o && s.setAttribute("src", o),
            s.setAttribute("lazy", t),
            this.$emit(t, e, r),
            this.options.adapter[t] && this.options.adapter[t](e, this.options),
            this.options.dispatchEvent)
        ) {
            const r = new CustomEvent(t, { detail: e });
            s.dispatchEvent(r);
        }
    }
    _valueFormatter(e) {
        return null !== (t = e) && "object" == typeof t
            ? (e.src || this.options.silent || console.error("Vue Lazyload warning: miss src with " + e),
              {
                  src: e.src,
                  loading: e.loading || this.options.loading,
                  error: e.error || this.options.error,
                  cors: this.options.cors
              })
            : { src: e, loading: this.options.loading, error: this.options.error, cors: this.options.cors };
        var t;
    }
}
const C = (e, t) => {
    let r = s({});
    return {
        rect: r,
        checkInView: () => (
            (r = e.value.getBoundingClientRect()),
            A && r.top < window.innerHeight * t && r.bottom > 0 && r.left < window.innerWidth * t && r.right > 0
        )
    };
};
class H {
    constructor(e) {
        (this.lazy = e), (e.lazyContainerMananger = this), (this._queue = []);
    }
    bind(e, t, r) {
        const s = new j(e, t, r, this.lazy);
        this._queue.push(s);
    }
    update(e, t, r) {
        const s = this._queue.find((t) => t.el === e);
        s && s.update(e, t);
    }
    unbind(e, t, r) {
        const s = this._queue.find((t) => t.el === e);
        s && (s.clear(), m(this._queue, s));
    }
}
const k = { selector: "img", error: "", loading: "" };
class j {
    constructor(e, t, r, s) {
        (this.el = e),
            (this.vnode = r),
            (this.binding = t),
            (this.options = {}),
            (this.lazy = s),
            (this._queue = []),
            this.update(e, t);
    }
    update(e, t) {
        (this.el = e), (this.options = p({}, k, t.value));
        this.getImgs().forEach((e) => {
            this.lazy.add(
                e,
                p({}, this.binding, {
                    value: {
                        src: e.getAttribute("data-src") || e.dataset.src,
                        error: e.getAttribute("data-error") || e.dataset.error || this.options.error,
                        loading: e.getAttribute("data-loading") || e.dataset.loading || this.options.loading
                    }
                }),
                this.vnode
            );
        });
    }
    getImgs() {
        return Array.from(this.el.querySelectorAll(this.options.selector));
    }
    clear() {
        this.getImgs().forEach((e) => this.lazy.remove(e)),
            (this.vnode = null),
            (this.binding = null),
            (this.lazy = null);
    }
}
var S = (e) =>
        t({
            setup(t, { slots: d }) {
                const h = r(),
                    c = s({ src: "", error: "", loading: "", attempt: e.options.attempt }),
                    u = s({ loaded: !1, error: !1, attempt: 0 }),
                    { rect: p, checkInView: A } = C(h, e.options.preLoad),
                    f = r(""),
                    g = (t = I) => {
                        if (u.attempt > c.attempt - 1 && u.error)
                            return (
                                e.options.silent ||
                                    console.log(`VueLazyload log: ${c.src} tried too more than ${c.attempt} times`),
                                t()
                            );
                        const r = c.src;
                        E(
                            { src: r },
                            ({ src: e }) => {
                                (f.value = e), (u.loaded = !0);
                            },
                            () => {
                                u.attempt++, (f.value = c.error), (u.error = !0);
                            }
                        );
                    },
                    v = i(() => ({ el: h.value, rect: p, checkInView: A, load: g, state: u }));
                o(() => {
                    e.addLazyBox(v.value), e.lazyLoadHandler();
                }),
                    n(() => {
                        e.removeComponent(v.value);
                    });
                return (
                    l(
                        () => t.src,
                        () => {
                            (() => {
                                const { src: r, loading: s, error: i } = e._valueFormatter(t.src);
                                (u.loaded = !1), (c.src = r), (c.error = i), (c.loading = s), (f.value = c.loading);
                            })(),
                                e.addLazyBox(v.value),
                                e.lazyLoadHandler();
                        },
                        { immediate: !0 }
                    ),
                    () => {
                        var e;
                        return a(t.tag || "img", { src: f.value, ref: h }, [
                            null === (e = d.default) || void 0 === e ? void 0 : e.call(d)
                        ]);
                    }
                );
            }
        }),
    V = {
        install(e, l = {}) {
            const d = new R(l),
                h = new H(d);
            if (Number(e.version.split(".")[0]) < 3) return new Error("Vue version at least 3.0");
            (e.config.globalProperties.$Lazyload = d),
                e.provide("Lazyload", d),
                l.lazyComponent &&
                    e.component(
                        "lazy-component",
                        ((e) =>
                            t({
                                props: { tag: { type: String, default: "div" } },
                                emits: ["show"],
                                setup(t, { emit: l, slots: d }) {
                                    const h = r(),
                                        c = s({ loaded: !1, error: !1, attempt: 0 }),
                                        u = r(!1),
                                        { rect: p, checkInView: A } = C(h, e.options.preLoad),
                                        f = () => {
                                            (u.value = !0), (c.loaded = !0), l("show", u.value);
                                        },
                                        g = i(() => ({ el: h.value, rect: p, checkInView: A, load: f, state: c }));
                                    return (
                                        o(() => {
                                            e.addLazyBox(g.value), e.lazyLoadHandler();
                                        }),
                                        n(() => {
                                            e.removeComponent(g.value);
                                        }),
                                        () => {
                                            var e;
                                            return a(t.tag, { ref: h }, [
                                                u.value &&
                                                    (null === (e = d.default) || void 0 === e ? void 0 : e.call(d))
                                            ]);
                                        }
                                    );
                                }
                            }))(d)
                    ),
                l.lazyImage && e.component("lazy-image", S(d)),
                e.directive("lazy", {
                    beforeMount: d.add.bind(d),
                    beforeUpdate: d.update.bind(d),
                    updated: d.lazyLoadHandler.bind(d),
                    unmounted: d.remove.bind(d)
                }),
                e.directive("lazy-container", {
                    beforeMount: h.bind.bind(h),
                    updated: h.update.bind(h),
                    unmounted: h.unbind.bind(h)
                });
        }
    };
export { V as i };

