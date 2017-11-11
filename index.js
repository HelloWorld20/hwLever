/*!
 *  hwLever v1.0.2 By dntzhang
 *  Github: https://github.com/AlloyTeam/hwLever
 *  MIT Licensed.
 */

// import Raven from 'raven-js';
// import RavenVue from 'raven-js/plugins/vue';

var Raven = require('raven-js')
var RavenVue = require('raven-js/plugins/vue')

    ; (function (root, factory) {
        if (typeof exports === 'object' && typeof module === 'object')
            module.exports = factory()
        else if (typeof define === 'function' && define.amd)
            define([], factory)
        else if (typeof exports === 'object')
            exports["hwLever"] = factory()
        else
            root["hwLever"] = factory()
    })(this, function () {



        var hwLever = {}
        hwLever.settings = {
            cdn: '//s.url.cn/qqun/qun/qqweb/m/qun/confession/js/vconsole.min.js',
            reportUrl: null,
            reportPrefix: '',
            reportKey: 'msg',
            otherReport: null,
            entry: null,
            ravenId: 'http://56d67d26f9854c21a1f8e7b83854fecd@sentry.24haowan.com/12',
            vueObj: null
        }

        hwLever.store = []

        var methodList = ['log', 'info', 'warn', 'debug', 'error'];
        methodList.forEach(function (item) {
            var method = console[item];

            console[item] = function () {
                hwLever.store.push({
                    logType: item,
                    logs: arguments
                });

                method.apply(console, arguments);
            }
        });

        hwLever.logs = []
        hwLever.config = function (config) {
            for (var i in config) {
                if (config.hasOwnProperty(i)) {
                    hwLever.settings[i] = config[i]
                }
            }

            if (config.entry) {
                window.addEventListener('load', function () {
                    hwLever.entry(config.entry)
                })
            }

            var parameter = getParameter('vconsole')

            if (parameter) {
                if (parameter === 'show') {
                    hwLever.vConsole(true)
                } else {
                    hwLever.vConsole(false)
                }
            }

            // hwLever.EasterEgg();

            hwLever.sentry();
        }

        hwLever.sentry = function () {
            var settings = hwLever.settings;

            Raven
                .config(settings.ravenId)
                .addPlugin(RavenVue, settings.vueObj)
                .install();
        }

        hwLever.vConsole = function (show) {
            loadScript(hwLever.settings.cdn, function () {

                //support vconsole3.0
                if (typeof vConsole === 'undefined') {
                    vConsole = new VConsole({
                        defaultPlugins: ['system', 'network', 'element', 'storage'],
                        maxLogNumber: 5000
                    })
                }

                var i = 0,
                    len = hwLever.store.length

                for (; i < len; i++) {
                    var item = hwLever.store[i]
                    //console[item.type].apply(console, item.logs)
                    //prevent twice log
                    item.noOrigin = true
                    vConsole.pluginList.default.printLog(item)
                }

                if (show) {
                    try {
                        vConsole.show()
                    } catch (e) {

                    }

                    window.addEventListener('load', function () {
                        vConsole.show()
                    })
                }
            })
        }

        hwLever.entry = function (selector) {
            var count = 0,
                entry = document.querySelector(selector)
            if (entry) {
                entry.addEventListener('click', function () {
                    count++
                    if (count > 5) {
                        count = -10000
                        hwLever.vConsole(true)
                    }
                })
            }
        }

        window.onerror = function (msg, url, line, col, error) {
            var newMsg = msg

            if (error && error.stack) {
                newMsg = processStackMsg(error)
            }

            if (isOBJByType(newMsg, "Event")) {
                newMsg += newMsg.type ?
                    ("--" + newMsg.type + "--" + (newMsg.target ?
                        (newMsg.target.tagName + "::" + newMsg.target.src) : "")) : ""
            }

            newMsg = (newMsg + "" || "").substr(0, 500)

            hwLever.logs.push({
                msg: newMsg,
                target: url,
                rowNum: line,
                colNum: col
            })

            if (msg.toLowerCase().indexOf('script error') > -1) {
                console.error('Script Error: See Browser Console for Detail')
            } else {
                console.error(newMsg)
            }

            var ss = hwLever.settings
            if (ss.reportUrl) {
                var src = ss.reportUrl + (ss.reportUrl.indexOf('?') > -1 ? '&' : '?') + ss.reportKey + '=' + (ss.reportPrefix ? ('[' + ss.reportPrefix + ']') : '') + newMsg + '&t=' + new Date().getTime()
                if (ss.otherReport) {
                    for (var i in ss.otherReport) {
                        if (ss.otherReport.hasOwnProperty(i)) {
                            src += '&' + i + '=' + ss.otherReport[i]
                        }
                    }
                }
                new Image().src = src
            }
        }



        function loadScript(src, callback) {
            var s,
                r,
                t
            r = false
            s = document.createElement('script')
            s.type = 'text/javascript'
            s.src = src
            s.onload = s.onreadystatechange = function () {
                //console.log( this.readyState ); //uncomment this line to see which ready states are called.
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true
                    callback()
                }
            }
            t = document.getElementsByTagName('script')[0]
            t.parentNode.insertBefore(s, t)
        }

        function getParameter(n) {
            var m = window.location.hash.match(new RegExp('(?:#|&)' + n + '=([^&]*)(&|$)')),
                result = !m ? '' : decodeURIComponent(m[1])
            return result || getParameterByName(n)
        }

        function getParameterByName(name, url) {
            if (!url) url = window.location.href
            name = name.replace(/[\[\]]/g, "\\$&")
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url)
            if (!results) return null
            if (!results[2]) return ''
            return decodeURIComponent(results[2].replace(/\+/g, " "))
        }

        function isOBJByType(o, type) {
            return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]"
        }

        function processStackMsg(error) {
            var stack = error.stack
                .replace(/\n/gi, "")
                .split(/\bat\b/)
                .slice(0, 9)
                .join("@")
                .replace(/\?[^:]+/gi, "")
            var msg = error.toString()
            if (stack.indexOf(msg) < 0) {
                stack = msg + "@" + stack
            }
            return stack
        }

        function getCookie(name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")

            if (arr = document.cookie.match(reg))
                return unescape(arr[2])
            else
                return null
        }

        hwLever.getCookie = getCookie
        hwLever.getParameter = getParameter
        hwLever.loadScript = loadScript

        return hwLever
    });