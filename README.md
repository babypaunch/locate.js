# locate.js #
* 페이지 이동/ajax의 쉬운 처리를 위한 공통 함수
* 라이센스: MIT
* sample: locate.html

## Install js file ##
<div>1. jquery에 종속적인 내용만 다루므로 반드시 jquery 파일의 아래에 locate.js 파일을 위치시켜야 한다.</div>
<div>2. locate.js에서 사용하는 loading bar는 내가 만든 jquery.babypaunch.spinner.js를 이용하였다. 변경이 필요하면 jquery.babypaunch.spinner.js를 수정해서 사용하면 된다.</div>

## Usage ##

### 필수 유의 사항 ###
* ajax type을 지정하지 않으면 기본 'post'로 설정된다.
* ajax type이 'get'이면 file 전송이 되지 않으므로, file 전송을 원하는 경우엔 type을 지정하지 않던지, 'post'로 지정하면 된다. 특히 파일 전송을 위해서는 param을 jquery form element로 대입해주어야 한다.
* cross domain 문제 때문에 ajax return type을 'jsonp'로 하는 경우엔 type이 무조건 'get'으로 설정된다.
* headers 정보를 추가하기 위해서는 ajax return type이 'jsonp'가 아니어야 한다.

### 1. String.locate() method ###
* 추가설명
<pre>
	$(function(){
	});
</pre>

#### options ####
<table>
	<tr>
		<th>name</th>
		<th>description</th>
		<th>is ajax</th>
	</tr>
	<tr>
		<td></td>
		<td></td>
		<td></td>
	</tr>
</table>