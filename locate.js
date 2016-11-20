/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2016.11.17
* lisence: MIT
*/
"use strict";

/*
* locate(url)
* locate(url, string)
* locate(url, $form)
*
* locate(json)
* locate(url, json)
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
		console.log("[data-1]", data);
	} //end: if(arguments.length === 1){

	if(arguments.length === 2){
		var url = arguments[0];

		if($.type(arguments[1]) === "string"){ //param
			var param = arguments[1] || "";
			var question = url.indexOf("?") !== -1 || param.indexOf("?") !== -1;
			location.href = question ? url + param : url + (param === "" ? "" : "?" + param);
		}else{
			if(arguments[1].is("form")){ //form
				arguments[1].attr({action: url}).submit();
				console.log(arguments[1]);
			}else{ //json
				data = arguments[1];
				data.log = data.log || "[1-2] locate(data)";
			}
		}
		console.log("[data-2]", data);
	} //end: if(arguments.length === 2){

	if(data !== undefined){
		var D = {
			url: ""
			, param: "" //string or json
			, form: undefined //form element
			, type: "post" //get or post
			, sendType: "text" //text(default), json, file
			, returnType: "text" //text(default), json, jsonp
			, headers: {} //set ajax header data
			, done: undefined //success
			, fail: undefined //error
			, bypass: {} //parameter for callback
		};
		$.extend(true, D, data);
		console.log("[D]", D);

		/*
		* 비동기 파일 전송시 반드시 contentType과 processData의 값이 false로 고정되야 함.
		*/
		if(D.sendType === "file"){ //ajax file send
			D.contentType = false;
			D.processData = false;
			
			D.param = new FormData();
			$.each($("#file")[0].files, function(i, file){
				D.append("file-" + i, file);
			});
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
		}
		D.dataType = D.returnType; //set dataType to text/json/jsonp

		//layer open
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
				//layer close;
				//defaults.bypass
				return arguments;
			}, error: function(xhr, status, error){
				//layer close;
				//defaults.bypass
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
