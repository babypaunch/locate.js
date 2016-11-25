# locate.js #
* 페이지 이동/ajax의 쉬운 처리를 위한 공통 함수
* 라이센스: MIT
* sample: locate.html

## Install js file ##
<div>1. jquery에 종속적인 내용만 다루므로 반드시 jquery 파일의 아래에 locate.js 파일을 위치시켜야 한다.</div>
<div>2. locate.js에서 사용하는 loading bar는 내가 만든 jquery.babypaunch.spinner.min.js를 이용하였다. 변경이 필요하면 jquery.babypaunch.spinner.js를 수정해서 대체하면 된다. 자세한 사항은 locate.html을 참조하면 된다.</div>

## Usage ##

### 필수 유의 사항 ###
* ajax type을 지정하지 않으면 기본 'post'로 설정된다.
* ajax type이 'get'이면 file 전송이 되지 않으므로, file 전송을 원하는 경우엔 type을 지정하지 않던지, 'post'로 지정하면 된다. 특히 파일 전송을 위해서는 param을 jquery form element로 대입해주어야 한다.
* 혹시 form 내에 file이 있는데 ajax type을 get으로 지정하여 form 정보를 전송하는 경우엔, file을 filtering된 form serialized data만 전송한다.
* cross domain 문제 때문에 ajax return type을 'jsonp'로 하는 경우엔 type이 무조건 'get'으로 설정된다. 따라서 file 전송도 불가능하다.
* headers 정보를 추가하기 위해서는 type이 'get'이나 'post'나 모두 설정 가능하지만, ajax return type이 'jsonp'가 아니어야 한다.

### 1. locate(url)/url.locate() method ###
* 해당 url 페이지로 이동하는 같은 동작을 하는 함수다.
<pre>
	$(function(){
		var url = "http://www.google.com";
		locate(url);
		
		url.locate();
	});
</pre>

### 2. locate(url, string)/url.locate(string) method ###
* 해당 url 페이지로 이동시 query string을 붙여 이동한다.
* 아래 주석 처리된 결과는 모두 동일하게 처리된다.
<pre>
	$(function(){
		var url = "http://www.google.com";
		var string = "?q=123&a=abc";
		
		//var url = "http://www.google.com";
		//var string = "&q=123&a=abc";
		
		//var url = "http://www.google.com";
		//var string = "q=123&a=abc";
		
		//var url = "http://www.google.com?q=123";
		//var string = "a=abc";
		
		//var url = "http://www.google.com?q=123";
		//var string = "&a=abc";
		
		locate(url, string);
		
		url.locate(string);
	});
</pre>

### 3. locate(url, $("form"))/url.locate($("form")) method ###
* 해당 url 페이지로 form을 submit하여 이동한다.
<pre>
	$(function(){
		var url = "http://www.google.com";
		
		locate(url, $("form"));
		
		url.locate($("form"));
	});
</pre>

### 4. locate(url, json)/url.locate(json) method ###
* 해당 url 페이지로 ajax 요청한다.
<pre>
	$(function(){
		var url = "http://www.google.com";
		var json = {
			param: "&q=123" //$("form").serialize(), {q: 123}, $("form")
			, done: function(data){
				console.log(data);
			}
			, fail: function(data){
				console.log(data);
			}
		};
		
		locate(url, json);
		
		url.locate(json);
	});
</pre>

### 5. locate(json) method ###
* json 정보대로 ajax 요청한다.
<pre>
	$(function(){
		var json = {
			url: "http://www.google.com"
			, param: "&q=123" //$("form").serialize(), {q: 123}, $("form")
			, done: function(data){
				console.log(data);
			}
			, fail: function(data){
				console.log(data);
			}
		};
		
		locate(json);
	});
</pre>

#### options description ####
##### default value가 있다는 것은 생략할 수 있음을 의미한다. #####
<table>
	<tr>
		<th>key</th>
		<th>type</th>
		<th>value</th>
		<th>comment</th>
	</tr>
	<tr>
		<td>url</td>
		<td>String</td>
		<td>any</td>
		<td>
			<div>1. 요청 url</div>
			<div>2. 화면 이동 + ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>param</td>
		<td>
			<div>1. String</div>
			<div>2. JSON</div>
			<div>3. jquery form element</div>
		</td>
		<td>any(default)</td>
		<td>
			<div>1. 요청 파라미터</div>
			<div>2. 화면 이동 + ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>type</td>
		<td>String</td>
		<td>
			<div>1. "get"</div>
			<div>2. "post"(default)</div>
		</td>
		<td>
			<div>1. 요청 방식</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>returnType</td>
		<td>String</td>
		<td>
			<div>1. "text"(default)</div>
			<div>2. "json"</div>
			<div>2. "jsonp"</div>
		</td>
		<td>
			<div>1. 반환 방식</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>headers</td>
		<td>json</td>
		<td>any(default)</td>
		<td>
			<div>1. 서버로 전송할 header 값</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>done</td>
		<td>callback function</td>
		<td>any(default)</td>
		<td>
			<div>1. ajax 결과에 대한 성공 응답</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>fail</td>
		<td>callback function</td>
		<td>any(default)</td>
		<td>
			<div>1. ajax 결과에 대한 실패/에러 응답</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>loading</td>
		<td>callback function</td>
		<td>any(default)</td>
		<td>
			<div>1. ajax 시작 시 loading 시작 처리</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>unloading</td>
		<td>callback function</td>
		<td>any(default)</td>
		<td>
			<div>1. ajax done/fail 시 loading 완료 처리</div>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
	<tr>
		<td>upload</td>
		<td>callback function</td>
		<td>any(default)</td>
		<td>
			<div>2. ajax 시 사용 가능</div>
		</td>
	</tr>
</table>