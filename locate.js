/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2016.11.23
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
					arguments[1].attr({action: url}).submit();
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
			, type: "post" //get or post
			, returnType: "text" //text(default), json, jsonp
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

		D.processData = true;
		D.data = D.param;
		if($.type(D.param) === "string"){
			D.contentType = "application/x-www-form-urlencoded; charset=utf-8";
		}else{
			try{
				if(D.param.is("form")){ //form
					if(D.param.find("input[type='file']").length > 0 && D.type.toLowerCase() === "post"){ //file ajaxSubmit
						//비동기 파일 전송시 반드시 contentType과 processData의 값이 false로 고정되야 함.
						D.contentType = false;
						D.processData = false;

						var formData = new FormData(D.param[0]);
						D.data = formData;
					}else{ //serialize form
						D.contentType = "application/x-www-form-urlencoded; charset=utf-8";
						D.data = D.param.serialize();
					}
				}
			}catch(e){ //json
				D.contentType = "application/json; charset=utf-8";
			}
		}

		if(D.returnType === "jsonp"){
			D.type = "get"; //jsonp로 받을 경우 반드시 type을 get으로 해야함.

			/*
			* param의 유형에 따라 callback 함수명 대입
			* server side에서 동적 callback 함수명으로 return하기 위해 사용해야 함.
			* server side에서는 jsonpCallback 파라미터가 있을 경우 구현해야 함.
			*/
			var u = D.unique();
			if($.type(D.data) === "string"){
				D.data += "&jsonpCallback=" + u;
			}else{
				try{
					/*
					* jsonp를 요청하면 get 방식을 권장하고 있다
					* 따라서 jsonp를 이용할 때는 FormData에 먼저 jsonpCallback을 대입하고
					* type이 object인 것들을 제외해서 D.data의 값을 serialized된 문자열로 대체한다.
					*/
					if(D.param.is("form")){ //form
						D.data.append("jsonpCallback", u);

						var serialized = "";
						for(var pair of D.data.entries()){
							if(typeof(pair[1]) !== "object"){
								serialized += "&" + pair[0] + "=" + pair[1]
							}
						}
						D.data = serialized;
					}
				}catch(e){ //json
					D.data.jsonpCallback = u;
				}
			}

			window[u] = D.done; //callback 함수 등록
		}
		D.dataType = D.returnType; //set dataType to text/json/jsonp

		if(D.loading !== undefined){
			D.loading();
		}else{
			$("body").append("<div id='locate-spinner'></div>");
			$("#locate-spinner").spinner().show();
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
				D.unloading === undefined ? $("#locate-spinner").hide() : D.unloading();

				D.done(arguments);
			}, error: function(xhr, status, error){
				D.unloading === undefined ? $("#locate-spinner").hide() : D.unloading();

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
