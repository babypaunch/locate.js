/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2016.11.17
* lisence: MIT
*/
"use strict";

var L = {
	/*
	* L.timer(): 지정된 시간까지 남은 시간을 출력한다. callback 함수를 입력해서 후처리하면 됨.
	*/
	timer: function(theTime, callback){
		var remain = function(theTime){
			var t = (Date.parse(theTime) - Date.parse(new Date())) / 1000;
			return {
				gap: t
				, d: Math.floor(t / 86400)
				, h: Math.floor(t / 3600 % 24)
				, m: Math.floor(t / 60 % 60)
				, s: Math.floor(t % 60)
			}
		}

		var interval = setInterval(function(){
			var t = remain(theTime);
			t.gap <= 0 ? clearInterval(interval) : callback(t);
		}, 1000);
	} //end: timer: function(theTime, callback){

	/*
	* L.serailize(): 입력받은 json객체를 직렬화한다.
	* options는 concat(string), separator(string), excepts(array), empty(boolean)를 가진다.
	* json만 넘길경우엔 jquery의 직렬화와는 조금 다른 결과가 나온다. jquery의 serialize() 경우엔 한글이 인코딩된다.
	*/
	, serialize: function(json, options){
		var str = "";

		if(options === undefined){
			for(var keys = Object.keys(json), i = 0; i < keys.length; i++){
				var key = keys[i];

				str += key + "=" + json[key] + (i + 1 === keys.length ? "" : "&");
			}
		}else{
			if(options.excepts !== undefined){
				if(options.excepts.length > 0){
					json = this.excepts(json, options.excepts);
				}
			}

			for(var keys = Object.keys(json), i = 0; i < keys.length; i++){
				var key = keys[i];

				if(options.empty === false && json[key] === ""){
					continue;
				}

				str += key + (options.concat === undefined ? "=" : options.concat) + json[key] + (i + 1 === keys.length ? "" : (options.separator === undefined ? "&" : options.separator));
			}
		}

		return str;
	} //end: , serialize: function(json, options){

	/*
	* L.locate(): jquery의 ajax()를 delegate해서 간략화한 함수이다.
	* options 파라미터를 활용하면, file을 비동기 전송할 수 있다.
	* 기본값이 설정되어있지 않은 options의 4가지 유용한 값(true를 지정할 경우에만 동작)
	* setJson: 전송할 데이터의 contentType을 json타입으로 지정함. 
	* getJson: 서버로부터 받을 데이터를 json타입으로 지정함.
	* setStringify: 전송할 데이터를 JSON.stringify()해서 전송할지 결정함.
	* getStringify: 전송받은 결과를 callback 파라미터로 넘길때 JSON.stringify()해서 전송할지 결정함.
	*/
	, locate: function(url, params, options, done, fail){
		var defaults = {
			"type": "post"
			, "processData": true
			, "file": false
			, "block": {
				"use": true
				, "successClose": true
				, "position": "fixed"
				, "top": 0
				, "left": 0
				, "width": "100%"
				, "height": "100%"
				, "background": "rgba(0,0,0,0.5)"
				, "text-align": "center"
				, "z-index": L.ui.maxIndex() + 1
				, "img": "<img src='data:image/gif;base64,R0lGODlhEAALAPQAAAAAAP///yQkJC4uLhQUFPj4+P///9DQ0Hx8fJ6enkRERNzc3LS0tHR0dJqamkBAQNjY2Pr6+rCwsBgYGCYmJgoKCsbGxiIiIgwMDEhISF5eXjQ0NBAQEAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA' style='position: relative; top: calc(50% - 5.5px); width: 16px; height: 11px;'/>"
			}
			, "bypass": {}

			, "init": function(options){
				options = L.filterOption(options);
				$.extend(true, this, options);

				/*
				* 값 초기화 대상: defaults.contentType, defaults.processData
				* 개발사유1: 비동기 파일 전송을 할 경우, contentType과 processData의 값을 false로 고정해야하므로
				* 개발사유2: 기본값이 설정되어 있지 않은 setJson의 값을 통해 서버로 보낼 contentType을 쉽게 설정하고 사용하기 위해.
				* 1. options가 정의되지 않고 defaults에 contentType도 정의되지 않았다면 "urlencoded" 타입으로 초기화.
				* 2. options가 정의되어 있고 defaults에 contentType도 정의되어 있다면
				* 2.1. options에 setJson이 true로 정의되어 있으면 "json" 타입으로 초기화.
				* 2.2.1. options의 contentType이 정의되지 않았다면 "urlencoded"로 초기화.
				* 2.2.2. options의 contentType이 정의되어 있다면 정의된 값으로 초기화.
				*/
				if(this.file){ //비동기 파일 전송일 경우
					this.contentType = false;
					this.processData = false;
				}else{
					var appType = {
						"urlencoded": "application/x-www-form-urlencoded; charset=utf-8"
						, "json": "application/json; charset=utf-8"
					};
					this.contentType = (options === undefined && this.contentType === undefined) ? appType.urlencoded : (options.setJson ? appType.json : (options.contentType === undefined ? appType.urlencoded: options.contentType));
				}

				/*
				* 값 초기화 대상: defaults.dataType
				* 개발사유: 기본값이 설정되어 있지 않은 getJson의 값을 통해 서버에서 받을 dataType을 쉽게 설정하고 사용하기 위해.
				* 1. options가 정의되지 않고 defaults에 dataType도 정의되지 않았다면 "text"로 초기화.
				* 2. options가 정의되어 있고 defaults에 dataType도 정의되어 있다면
				* 2.1. options에 getJson이 true로 정의되어 있으면 "json"으로 초기화.
				* 2.2.1. options의 dataType이 정의되지 않았다면 "text"로 초기화.
				* 2.2.2. options의 dataType이 정의되어 있다면 정의된 값으로 초기화.
				*/
				this.dataType = (options === undefined && this.dataType === undefined) ? "text" : (options.getJson ? "json" : (this.dataType = options.dataType === undefined ? "text" : options.dataType));

				if(this.block.use){ //dim layer를 사용할 경우
					var blockStyle = L.excepts(this.block, ["use", "successClose", "img"]);
					var $layer = $("div[data-layered='0']");
					$layer.length > 0 ? $layer.show() : $("body").append(L.ui.layer(blockStyle, defaults.block.img)).css({"overflow": "hidden"});
				}

				return options;
			} //end: , "init": function(options){
		}; //end: var defaults = {

		options = defaults.init(options); //초기화

		$.ajax({
			"type": defaults.type
			, "url": url
			, "data": options === undefined ? params : (options.setStringify ? JSON.stringify(params) : params)
			, "dataType": defaults.dataType
			, "contentType": defaults.contentType
			, "processData": defaults.processData
			, success: function(data, status, xhr){
				if(defaults.block.successClose){ //성공시 dim layer를 자동닫도록 설정하면
					L.ui.closeLayer(defaults.block.use);
				}
				if(done !== undefined){
					done(options === undefined ? [data, defaults.bypass] : (options.getStringify ? JSON.stringify([data, defaults.bypass]) : [data, defaults.bypass]));
				}
			}, error: function(xhr, status, error){
				if(fail !== undefined){
					fail(options === undefined ? [xhr, defaults.bypass] : (options.getStringify ? JSON.stringify([xhr, defaults.bypass]) : [xhr, defaults.bypass]));
				}
			}
		}); //end: $.ajax({
	} //end: , locate: function(url, params, options, done, fail){
}; //end: var L = {
