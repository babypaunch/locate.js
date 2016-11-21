/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2016.11.17
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
			data.log = data.log || "[1-1] locate(data)";
		}
	} //end: if(arguments.length === 1){

	if(arguments.length === 2){
		var url = arguments[0];

		if($.type(arguments[1]) === "string"){ //param
			var param = arguments[1] || "";
			var question = url.indexOf("?") !== -1 || param.indexOf("?") !== -1;
			location.href = question ? url + param : url + (param === "" ? "" : "?" + param);
		}else{
			try{
				if(arguments[1].is("form")){ //form
					console.log("[args-form]", arguments[1]);
					arguments[1].attr({action: url}).submit();
				}
			}catch(e){ //json
				console.log("[args-json]", arguments[1]);
				data = arguments[1];
				data.url = arguments[0];
				data.log = data.log || "[1-2] locate(data)";
			}
		}
	} //end: if(arguments.length === 2){

	if(data !== undefined){
		var D = {
			url: ""
			, param: "" //string or json
			, form: undefined //form element for ajax submit
			, type: "post" //get or post
			, sendType: "text" //text(default), json, file
			, returnType: "text" //text(default), json, jsonp
			, headers: {} //set ajax header data
			, callback: "" //set callback name for jsonp
			, done: undefined //success
			, fail: undefined //error
			, loading: undefined //show loading callback
			, unloading: undefined //hide loading callback
		};
		$.extend(true, D, data);

		/*
		* 비동기 파일 전송시 반드시 contentType과 processData의 값이 false로 고정되야 함.
		*/
		if(D.sendType === "file"){ //ajax file send
			D.contentType = false;
			D.processData = false;
			
			D.param = new FromData(D.form[0]);
		}else{ //text or json
			var sendType = {
				text: "application/x-www-form-urlencoded; charset=utf-8"
				, json: "application/json; charset=utf-8"
			}
			D.contentType = sendType[D.sendType];
			D.processData = true;
		}

		if(D.returnType === "jsonp"){
			D.type = "get"; //jsonp로 받을 경우 반드시 type을 get으로 해야함.
			D.jsonpCallback = D.callback; //jsonp일때 return받을 callback 함수명 대입

			/*
			* param의 유형에 따라 callback 함수명 대입
			* server side에서 동적 callback 함수명 대입을 위해 사용함.
			*/
			if($.type(D.param) === "object"){
				D.param.jsonpCallback = D.callback;
			}else{
				D.param += "&jsonpCallback=" + D.callback;
			}
		}
		D.dataType = D.returnType; //set dataType to text/json/jsonp

		console.log("[D]", D);

		if(D.loading !== undefined){
			D.loading();
		}
		/*
		* ajax start
		*/
		$.ajax({
			type: D.type
			, url: D.url
			, data: D.param
			, dataType: D.dataType
			, contentType: D.contentType
			, processData: D.processData
			, success: function(data, status, xhr){
				if(D.unloading !== undefined){
					D.unloading();
				}
				return arguments;
			}, error: function(xhr, status, error){
				if(D.unloading !== undefined){
					D.unloading();
				}
				return arguments;
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
	data.log = "[2] url.locate(data)";
	locate(data);
} //end: String.prototype.locate = function(data){
