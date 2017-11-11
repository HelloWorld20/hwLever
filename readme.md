# 小游戏错误定位和上报vue插件

基于腾讯的AlloyLever修改，结合了Sentry错误上报系统的一个错误定位和上报vue插件。

因为sentry里是否使用vue的使用方法不太一样，所以这个版本先是针对vue而编写的插件，后期在写个通用的版本。

## 使用方法


安装好依赖

	npm install git@github.com:HelloWorld20/hwLever.git --save
	
main.js中引入并配置hwLever

	import hwLever from 'hwlever';
	
	hwlever.config({
    	cdn: '//24haowan-cdn.shanyougame.com/public/js/vconsole.min.js',  //vconsole的CDN地址
    	entry: ".content",          //请点击这个DOM元素6次召唤vConsole。//你可以通过AlloyLever.entry('#entry2')设置多个机关入口召唤神龙
    	vueObj: Vue,
    	ravenId: 'http://56d67d26f9854c21a1f8e7b83854fecd@sentry.24haowan.com/12',
	})

就OK了。

## 配置说明

AlloyTeam的配置还完整保留

	AlloyLever.config({
	    cdn:'//s.url.cn/qqun/qun/qqweb/m/qun/confession/js/vconsole.min.js',  //vconsole的CDN地址
	    reportUrl: "//a.qq.com",  //错误上报地址
	    reportPrefix: 'qun',    //错误上报msg前缀，一般用于标识业务类型
	    reportKey: 'msg',        //错误上报msg前缀的key，用户上报系统接收存储msg
	    otherReport: {              //需要上报的其他信息
	        uin: 491862102
	    },
	    entry:"#entry"          //请点击这个DOM元素6次召唤vConsole。//你可以通过AlloyLever.entry('#entry2')设置多个机关入口召唤神龙
	})
	
	
新增了两个配置：

	hwlever.config({
		    cdn:'//s.url.cn/qqun/qun/qqweb/m/qun/confession/js/vconsole.min.js',  //vconsole的CDN地址
		    entry:"#entry"          //请点击这个DOM元素6次召唤vConsole。//你可以通过AlloyLever.entry('#entry2')设置多个机关入口召唤神龙
		    ravenId: 'https://<key>@sentry.io/<project>',		// sentry配置的id
		    vueObj: Vue		// Vue对象。会监听这个Vue对象下的所有错误
		})


## 版本说明

* v1.0.0: 未完成版，不保证能用
* v1.1.1: 基础版本，保留所有AlloyLever功能，只结合Sentry的错误上报