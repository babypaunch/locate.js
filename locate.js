/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2016.12.06
* lisence: MIT
*/
"use strict";

/*
* locate(json)
*
* locate(url)
* locate(url, string)
* locate(url, $form)
* locate(url, json)
*
* url.locate()
* url.locate(string)
* url.locate($form)
* url.locate(json)
*
* $(element).locate(url, done, fail)
* $(element).locate(json)
*/
var locate = function(){
	var data = undefined;

	if(arguments.length === 1){
		if($.type(arguments[0]) === "string"){ //url
			location.href = arguments[0];
		}else{ //json
			data = arguments[0];
		}
	} //end: if(arguments.length === 1){

	if(arguments.length === 2){
		var url = arguments[0];

		if($.type(arguments[1]) === "string"){ //param
			var param = arguments[1] || "";
			var question = url.indexOf("?") !== -1 || param.indexOf("?") !== -1;
			var query = question ? (param === "" ? "" : (param.charAt(0) === "&" ? param : "&" + param)) : (param === "" ? "" : "?" + (param.charAt(0) === "&" ? param.substr(1) : param));
			location.href = url + query; 
		}else{
			try{
				if(arguments[1].is("form")){ //form
					arguments[1].attr({action: url, method: "post"}).submit();
					return false;
				}
			}catch(e){ //json
				data = arguments[1];
				data.url = arguments[0];
			}
		}
	} //end: if(arguments.length === 2){

	if(data !== undefined){
		var D = {
			url: ""
			, param: "" //string or json
			, $form: undefined
			, type: "post" //get or post
			, sendType: "text"
			, SENDTYPE: {
				text: "application/x-www-form-urlencoded; charset=utf-8"
				, json: "application/json; charset=utf-8"
			}
			, returnType: "json" //json(default), text, jsonp
			, headers: {} //set ajax header data(can't set with jsonp)
			, done: function(){} //success
			, fail: function(){} //error
			, loading: undefined //show loading callback
			, unloading: undefined //hide loading callback
			, upload: undefined //control upload progress

			, unique: function(){
				var result = "_";
				for(var i = 0; i < 8; i++){
					result += Math.floor((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
				}
				return result;
			}
		};
		$.extend(true, D, data);

		/*
		* contentType은 기본적으로 sendType을 따라가도록 한다. $form이 지정되었을 경우에만 추가 처리하면 된다.
		* $form이 ajaxSubmit되는 경우에 processData는 false가 되고, 나머지는 모두 true여야한다.
		* $form과 다르게 param이 form인 경우엔 serialize된 문자열을 data에 대입한다.
		*/
		D.contentType = D.SENDTYPE[D.sendType];
		D.processData = true;
		try{
			D.data = D.param.is("form") ? D.param.serialize() : D.param;
		}catch(e){
			D.data = D.param;
		}

		/*
		* file ajaxSubmit을 사용할 경우만 $form을 지정하면 된다.
		*/
		if(D.$form !== undefined){
			if(D.$form.find("input[type='file']").length > 0 && D.type.toLowerCase() === "post"){ //file ajaxSubmit
				//비동기 파일 전송시 반드시 contentType과 processData의 값이 false로 고정되야 함.
				D.contentType = false;
				D.processData = false;

				var formData = new FormData(D.$form[0]);
				//D.data의 기존값을 formData에 append시켜야 한다.
				D.data = formData;
			}
		}

		/*
		* jsonp를 이용할 때는 jsonpCallback을 파라미터로 대입해서 D.data의 값을 serialized된 문자열로 대체한다.
		* server에서는 반드시 JSON.stringify된 문자열을 보내줘야 정상 처리된다.
		*/
		if(D.returnType === "jsonp"){
			D.type = "get"; //jsonp를 요청하려면 반드시 type을 get으로 해야함.

			/*
			* param의 유형에 따라 callback 함수명 대입
			* server side에서 동적 callback 함수명으로 return하기 위해 사용해야 함.
			* server side에서는 jsonpCallback 파라미터가 있을 경우 구현해야 함.
			*/
			var u = D.unique();
			if($.type(D.data) === "string"){ //파라미터가 문자열이면
				D.data += "&jsonpCallback=" + u;
			}else{ //파라미터가 문자열이 아니면
				try{
					if(D.param.is("form")){ //form
						D.data += "&jsonpCallback=" + u;
					}else{ //json
						D.data.jsonpCallback = u;
					}
				}catch(e){
					D.data.jsonpCallback = u;
				}
			}

			window[u] = D.done; //jsonp용 callback 함수 등록
		}
		D.dataType = D.returnType; //set dataType to text/json/jsonp

		var spinnerId = "locate-spinner";
		
		if(D.loading !== undefined){
			D.loading();
		}else{
			if($.type($.fn.spinner) === "function"){
				if($("#" + spinnerId).length === 0){
					$("body").append("<div id='" + spinnerId + "'></div>");
				}
				$("#" + spinnerId).spinner().show();
			}
		}

		/*
		* ajax start
		*/
		$.ajax({
			type: D.type
			, url: D.url
			, data: D.data
			, dataType: D.dataType
			, contentType: D.contentType
			, processData: D.processData
			, headers: D.headers
			, xhr: function(){ //for upload
				var xhr = $.ajaxSettings.xhr();
				xhr.upload.onprogress = function(e){
					if(D.upload !== undefined){
						D.upload(Math.floor(e.loaded / e.total * 100));
					}
				};
				return xhr;
			}
			, success: function(data, status, xhr){
				D.unloading === undefined ? $.type($.fn.spinner) === "function" ? $("#" + spinnerId).hide() : "" : D.unloading($("#" + spinnerId));

				D.done(data);
			}, error: function(xhr, status, error){
				D.unloading === undefined ? $.type($.fn.spinner) === "function" ? $("#" + spinnerId).hide() : "" : D.unloading($("#" + spinnerId));

				if(D.dataType === "jsonp"){
				   	if(xhr.status !== 200){
						D.fail(arguments);
					}
				}else{
					D.fail(arguments);
				}
			}
		}); //end: $.ajax({
	} //end: if(data !== undefined){
} //end: var locate = function(){

/*
* url.locate(data)
*/
String.prototype.locate = function(data){
	data = data || {};
	data.url = this;
	locate(data);
} //end: String.prototype.locate = function(data){

/*
* $(element).locate(json)
* 우선 post 방식으로도 parameter를 넘겨주도록 수정함.
* 파라미터를 배열로 하는 경우에 반드시 갯수나 순서를 맞춰서 넘겨야함.
*/
$.fn.locate = function(data){
	var D = {
		url: ""
		, param: undefined //parameters
		, done: undefined //success
		, fail: undefined //error
	};

	if(arguments.length === 1){ //json을 받은 것으로 간주함.
		$.extend(true, D, data);
	}else{
		D.url = arguments[0]; //url

		if(arguments.length === 2){ //url, param or url, done
			if($.type(arguments[1]) === "function"){ //done
				D.done = arguments[1];
			}else{ //param
				D.param = arguments[1];
			}
		}

		if(arguments.length === 3){ //url, param, done or url, done, fail
			if($.type(arguments[1]) === "function"){ //done
				D.done = arguments[1];
			}else{
				D.param = arguments[1];
			}
			D.fail = arguments[2];
		}

		if(arguments.length === 4){ //url, param, done, fail
			D.param = arguments[1];
			D.done = arguments[2];
			D.fail = arguments[3];
		}
	}

	return this.each(function(){
		var $element = $(this);
		$element.load(D.url, D.param, function(data){
			if(data === undefined){
				if(D.fail === true){
					var style = "style='margin: 10px 0; padding: 10px; background: gray; color: white; font-weight: bold; text-align: center;'";
					$element.html("<div data-locate-error " + style + ">Error</div>");
				}else{
					if(D.fail !== undefined){
						D.fail();
					}
				}
			}else{
				if(D.done !== undefined){
					D.done(data);
				}
			}
		});
	});
} //end: $.fn.locate = function(json){