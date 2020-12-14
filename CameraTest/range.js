/* 2018-9-7 21:20:47 | 版权所有 火星科技 http://marsgis.cn  【联系我们 微信：muyao1987  邮箱 wh@marsgis.cn】 */
$.fn.range = function(o) {
    o = o || {};
    var s = $(this);

    function t(t) {
        var r = Number(s.attr("max")),
            a = Number(s.attr("min")),
            n = Number(s.val()),
            e = Math.floor(100 * (n - a) / (r - a));
        return s.css("background-size", e + "% 100%"), s.attr("title", n), t && o.hasOwnProperty("onChange") && o.onChange(n, e), s
    }
    return o.hasOwnProperty("min") && s.attr("min", o.min), o.hasOwnProperty("max") && s.attr("max", o.max), o.hasOwnProperty("step") && s.attr("step", o.step), o.hasOwnProperty("value") && s.val(o.value), s.change(t), s.on("input propertychange", t), t(), this
};