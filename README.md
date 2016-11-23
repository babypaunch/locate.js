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
* cross domain 문제 때문에 ajax return type을 'jsonp'로 하는 경우엔 type이 무조건 'get'으로 설정된다.
* headers 정보를 추가하기 위해서는 ajax return type이 'jsonp'가 아니어야 한다.

### 1. locate(url)/url.locate() method ###
* 해당 url 페이지로 이동하는 같은 동작을 하는 함수다.
<pre>
	$(function(){
		locate(url);
		
		url.locate();
	});
</pre>

### 2. locate(url, string)/url.locate(string) method ###
* 해당 url 페이지로 이동시 query string을 붙여 이동한다.
<pre>
	$(function(){
		locate(url, string);
		
		url.locate(string);
	});
</pre>

### 3. locate(url, $("form"))/url.locate($("form")) method ###
* 해당 url 페이지로 form을 submit하여 이동한다.
<pre>
	$(function(){
		locate(url, $("form"));
		
		url.locate($("form"));
	});
</pre>

### 4. locate(url, json)/url.locate(json) method ###
* 해당 url 페이지로 ajax 요청한다.
<pre>
	$(function(){
		locate(url, json);
		
		url.locate(json);
	});
</pre>

### 5. locate(json) method ###
* json 정보대로 ajax 요청한다.
<pre>
	$(function(){
		locate(json);
	});
</pre>

#### options description ####
<table>
	<tr>
		<th>key</th>
		<th>value</th>
		<th>use when</th>
	</tr>
	<tr>
		<td>url</td>
		<td>요청 url</td>
		<td>page move, ajax</td>
	</tr>
	<tr>
		<td>param</td>
		<td>요청 파라미터</td>
		<td>page move, ajax</td>
	</tr>
	<tr>
		<td>type</td>
		<td>요청 방식</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>returnType</td>
		<td>text(default)/json/jsonp</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>headers</td>
		<td>json</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>done</td>
		<td>callback function</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>fail</td>
		<td>callback function</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>loading</td>
		<td>callback function</td>
		<td>ajax only</td>
	</tr>
	<tr>
		<td>unloading</td>
		<td>callback function</td>
		<td>ajax only</td>
	</tr>
</table>