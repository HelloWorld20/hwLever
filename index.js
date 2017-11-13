/*!
 *  hwLever v1.0.2 By weijianghong
 *  Github: https://github.com/HelloWorld20/hwLever
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
            cdn: '//24haowan-cdn.shanyougame.com/public/js/vconsole.min.js',
            entry: null,
            ravenId: 'http://56d67d26f9854c21a1f8e7b83854fecd@sentry.24haowan.com/12',
            vueObj: null,
            extrConf: null,
            // 选择配置的触发方式：['touch', 'click', 'swipe', 'shake']
            // 分别是：按顺序点击、点击某个元素6次、滑动手势、晃动手机
            type: null,
            DEVIATION: 100,                             // 允许误差，像素
            // 点击位置队列，0~100之间，屏幕比例。
            // 默认：1、左下角；2、右下角。
            touchKey: [
                {
                    x: 5,
                    y: 95
                },
                {
                    x: 95,
                    y: 95
                }
            ],
            // 滑动距离队列，0~100之间，屏幕比例。
            // 默认：打叉手势，距离为屏幕宽度的30%和屏幕高度的30%
            swipeKey: [
                {
                    x: -30,
                    y: 30
                },
                {
                    x: 30,
                    y: 30
                }

            ]
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

            var settings = hwLever.settings;

            Raven
                .config(settings.ravenId, settings.extrConf)
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
            var type = hwLever.settings.type
            for (var i in type) {
                console.log(type, type[i])
                switch (type[i]) {
                    case 'touch': initTouch(); break;
                    case 'click': initClick(selector); break;
                    case 'swipe': initSwipe(); break;
                    case 'shake': initShake(); break;
                }
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

        }

        function initClick(selector) {
            var count = 0,
                entry = hwLever.settings.entry
            if (selector) {
                document.addEventListener('click', function (e) {
                    if (e.target.getAttribute('id') == entry) {
                        count++
                        if (count > 5) {
                            count = -10000
                            hwLever.vConsole(true)
                        }
                    }
                })
            }
        }

        function initShake() {
            //摇一摇(使用DeviceMotion事件, 推荐,应为可以计算加速度)
            if (window.DeviceMotionEvent) {
                var speed = 25;    // 用来判定的加速度阈值，太大了则很难触发
                var x, y, z, lastX, lastY, lastZ;
                x = y = z = lastX = lastY = lastZ = 0;

                window.addEventListener('devicemotion', handleMotion, false);

                function handleMotion() {
                    var acceleration = event.accelerationIncludingGravity;
                    x = acceleration.x;
                    y = acceleration.y;
                    if (Math.abs(x - lastX) > speed || Math.abs(y - lastY) > speed) {
                        // 用户设备摇动了，触发响应操作
                        // 此处的判断依据是用户设备的加速度大于我们设置的阈值
                        hwLever.vConsole(true)
                        window.removeEventListener('devicemotion', handleMotion)
                    }
                    lastX = x;
                    lastY = y;

                }
            }
        }

        function initSwipe() {
            var DEVIATION = hwLever.settings.DEVIATION;

            var swipeKey = hwLever.settings.swipeKey;

            var keyLen = swipeKey.length;
            var checkIndex = 0;

            document.addEventListener('touchstart', handleTouchStart, false);
            document.addEventListener('touchend', handleTouchEnd, false);

            var startX, startY, endX, endY;

            function handleTouchStart(event) {
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
            }

            function handleTouchEnd(event) {
                endX = event.changedTouches[0].clientX;
                endY = event.changedTouches[0].clientY;
                if (Math.abs((endX - startX) - swipeKey[checkIndex].x * innerWidth / 100) < DEVIATION && Math.abs((endY - startY) - swipeKey[checkIndex].y * innerHeight / 100) < DEVIATION) {
                    checkIndex++
                } else {
                    checkIndex = 0
                }

                if (checkIndex >= keyLen) {
                    hwLever.vConsole(true)
                    document.removeEventListener('touchstart', handleTouchStart)
                    document.removeEventListener('touchend', handleTouchEnd)
                    checkIndex = 0
                }
            }
        }

        function initTouch() {
            // 触摸范围，像素
            var DEVIATION = hwLever.settings.DEVIATION
            // 触摸顺序，x和y分别是屏幕位置比例。以左上角为坐标原点。
            var touchKey = hwLever.settings.touchKey

            var keyLen = touchKey.length
            var checkIndex = 0

            document.addEventListener('touchstart', handleTouch, false);

            function handleTouch(event) {
                var clientX = event.touches[0].clientX
                var clientY = event.touches[0].clientY

                var keyX = touchKey[checkIndex].x * innerWidth / 100
                var keyY = touchKey[checkIndex].y * innerHeight / 100

                if (Math.abs(clientX - keyX) < DEVIATION && Math.abs(clientY - keyY) < DEVIATION) {
                    checkIndex++
                } else {
                    checkIndex = 0
                }

                if (checkIndex >= keyLen) {
                    hwLever.vConsole(true)
                    document.removeEventListener('touchstart', handleTouch)
                    checkIndex = 0
                }

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