# 小游戏错误定位和上报vue插件

基于腾讯的AlloyLever修改，结合了Sentry错误上报系统的一个错误定位和上报vue插件。

因为sentry里是否使用vue的使用方法不太一样，所以这个版本先是针对vue而编写的插件，后期在写个通用的版本。

## 在线demo

[https://24haowan-cdn.shanyougame.com/dingzhi/hwlever_demo/index.html](https://24haowan-cdn.shanyougame.com/dingzhi/hwlever_demo/index.html)

[https://24haowan-cdn.shanyougame.com/dingzhi/hwlever_demo/index.html?vconsole=show](https://24haowan-cdn.shanyougame.com/dingzhi/hwlever_demo/index.html?vconsole=show)

## 使用方法


1. 安装好依赖


		npm install https://github.com/HelloWorld20/hwLever.git --save
			
	
2. 某些情况下（应该是npm版本问题）hwLever不能正确安装raven-js依赖，则需要手动进入hwLever路径下安装依赖


		cd node_modules/hwLever
	
		npm i
	
	
3. main.js中引入并配置hwLever

	```js
	import hwlever from 'hwlever';
	
	hwlever.config({
    	cdn: '//24haowan-cdn.shanyougame.com/public/js/vconsole.min.js',  //vconsole的CDN地址
		entry: 'eastEgg',		// 点击6下，id为eastEgg的元素6下。召唤神龙
    	vueObj: Vue,
    	ravenId: 'http://56d67d26f9854c21a1f8e7b83854fecd@sentry.24haowan.com/12',
	})
	```


4. 万事大吉


## 默认配置


	hwlever.config({
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
        })

## 配置说明

cdn：vconsole cdn地址；

entry：要点击6次召唤的dom对象id值；

ravenId: sentry上报的id；

vueObj：要监听错误的vue对象，一般就在main.js里配置，然后传入Vue对象

type: 要设置触发类型的字符串数组，支持['touch', 'click', 'swipe', 'shake']，分别对应：按顺序点击、点击某个元素6次、滑动手势、晃动手机

DEVIATION：按顺序点击和滑动允许的误差，单位是像素

touchKey：可配置的点击顺序，相对于屏幕比例位置，所以填入的值应该是0~100之间，

swipeKey: 可配置的滑动手势配置，相对于屏幕比例位置，0~100之间。


 

## 版本说明

* v1.0.0: 未完成版，不保证能用
* v1.1.1: 基础版本，保留所有AlloyLever功能，只结合Sentry的错误上报
* v1.2.0: 
	* 去除AlloyLever上报路径功能
	* 点击召唤神龙参数从jquery选择器改为id。
	* 添加按顺序滑动、按顺序点击、摇一摇召唤姿势
	* 添加一个extraConf配置用于传递sentry的额外配置