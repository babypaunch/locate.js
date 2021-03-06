/*
* 개발: 정대규
* 최초: 2015.10.24
* 수정: 2018.04.12
* lisence: MIT
*/
"use strict";

/*
* locate(json)
*
* $(element).locate(json)
*/
var locate = function(data){
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
		, loading: undefined //show loading callback, false가 들어오면 아무 동작 안 함.
		, unloading: undefined //hide loading callback, false가 들어오면 아무 동작 안 함.
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
	
	//post 방식으로 단순 페이지 이동을 쉽게 하기 위해, 임의의 form을 넣어서 정보 전송.
	if(data.type === "submit"){
		var inputs = "";
		for(var i in data.param){
			inputs += "<input type='hidden' name='" + i + "' value='" + data.param[i] + "'/>";
		}
		var formId = "locate-submit-form";
		$("body").append("<form id='" + formId + "' action='" + data.url + "' method='post'>" + inputs + "</form>");
		$("#" + formId).submit();
		return false;
	}

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
			switch($.type(D.data)){
				case "string":
					var arr = D.data.split("&");
					for(var i = 0; i < arr.length; i++){
						var pair = arr[i].split("=");
						formData.append(pair[0], pair[1]);
					}
				break;
				case "object":
					for(var key in D.data){
						formData.append(key, D.data[key]);
					}
				break;
			} //end: switch($.type(D.data)){

			D.data = formData;
		} //end: if(D.$form.find("input[type='file']").length > 0 && D.type.toLowerCase() === "post"){
	} //end: if(D.$form !== undefined){

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
	if(D.loading === undefined || D.loading === true){ //loading이 undefined이거나 true이면 자동 생성, 그 외는 비생성
		if($.type($.fn.spinner) === "function"){
			if($("#" + spinnerId).length === 0){
				$("body").append("<div id='" + spinnerId + "'></div>");
			}
			$("#" + spinnerId).spinner().show();
		}
	}else{
		if($.type(D.loading) === "function"){ //D.loading이 function인 경우만 실행
			D.loading();
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
			this.unloader();

			D.done(data);
		}, error: function(xhr, status, error){
			this.unloader();

			if(D.dataType === "jsonp"){
				if(xhr.status !== 200){
					D.fail(arguments);
				}
			}else{
				D.fail(arguments);
			}
		}
		, unloader: function(){
			D.unloading === undefined || D.unloading === true ? ($.type($.fn.spinner) === "function" ? $("#" + spinnerId).hide() : "") : ($.type(D.unloading) === "function" ? D.unloading($("#" + spinnerId)) : "");
		}
	}); //end: $.ajax({
} //end: var locate = function(data){

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
	}; //end: var D = {

	$.extend(true, D, data); //data --> D로 deep copy

	if(D.url === ""){ //url이 공백이면 처리 불가
		console.log("Must input url");
	} //end: if(D.url === ""){

	return this.each(function(){
		var $element = $(this);

		$element.load(D.url, D.param, function(data){
			if(data === undefined){
				if(D.fail === true){
					alert("Error: locate() is fail");
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
		}); //end: $element.load(D.url, D.param, function(data){
	}); //end: return this.each(function(){
} //end: $.fn.locate = function(json){
