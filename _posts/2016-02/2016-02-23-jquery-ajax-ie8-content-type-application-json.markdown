---
layout: "post"
title: "jQuery $.ajax에서 응답 Content-Type을 application/json 사용시 응답 내용이 파일로 다운로드 처리되는 문제"
date: "2016-02-23T21:24:34+09:00"
comments: true
categories: js
---

jQuery의 $.ajax 함수를 사용해서 JSON 응답을 받고자 할 때 응답값을 배열(객체)로 받는 방법으로 서버 응답시 header 정보에 `Content-Type:application/json; charset=utf-8`을 포함하는 방법을 주로 사용한다. 다른 방법도 있지만 응답 데이터의 유형을 명시적으로 지정해서 반환하는 것이 더 나은 방법이라는 생각이다. 실제로 이 방법으로 이제까지 잘 사용해 왔다.

그런데 얼마전 간단한 작업을 하던 중 이상한 상황에 부딪혔다.
IE8/9에서 `Content-Type:application/json; charset=utf-8`을 정상적으로 인식하지 못해 ajax 호출시 응답값을 파일로 저장(다운로드)하려고 하는 것이다(IE10에서 이상없음). 그래서 관련 내용을 찾아보니 [IE8 treats json response as file and tries to download it](http://stackoverflow.com/questions/8892819/ie8-treats-json-response-as-file-and-tries-to-download-it)라는 글이 있었다. 여기서의 설명처럼 `application/json` 대신 `text/plain`을 사용하면 다운로드를 시도하는 현상은 없어진다. 하지만 $.ajax의 done(success) 함수에서 받은 응답값이 배열(객체)가 아니라 text다. 어떻게보면 당연하다. 서버에서 text라고 보냈으니.

그럼 이 문제는 어떻게 해결할까? 간단한 방법은 $.ajax 사용시 dataType을 'json'으로 지정하는 방법을 사용하면 해결된다. 위 링크에서 질문자가 올린 코드를 예시로 아래에 남긴다.

```javascript
$.ajax({
  url: url_string,
  dataType: "json",
  success: function(response){
    alert('all is well');
  },
  error: function(request, status, error){
    alert(request);
    alert(status);
    alert(error);
  }
});
```

위 처럼 해결할 수는 있으나 매번 `dataType: "json"`을 사용하는 것은 맘에 들지 않는다. 다른 방법으로 response가 text로 넘어왔으니 직접 JSON을 parse 하면 되지만 이것도 맘에 들지 않는다. 하지만 현재까지 확인한 바로는 다른 해결 방법을 찾지 못했다.

---

사실 위 내용을 보고 이상하다는 생각을 할 수도 있다. 실제로 굳이 `dataType: "json"`를 사용하지 않아도 IE8/9에서 이상없이 `application/json` header를 사용하고 있는 사람이 있을 것이다. 나도 얼마전까지는 아무 문제없이 사용해오고 있었기 때문이다. 혹시나 싶어 기존 코드들 중 몇가지를 IE8에서 다시 테스트 해 봤으나 역시나 아무 문제가 없었다(아마도 구버전의 jQuery에서는 이 문제를 가지고 있었으나 현재는 관련 문제를 jQuery에서 해결해주고 있는 것으로 보인다.)

정확히 이야기하자면 나의 경우는 [jQuery Form Plugin](http://malsup.com/jquery/form/)을 사용하면서 이 문제가 발생했다. 이번 작업에서 AJAX 파일업로드를 처리 할 일이 있어서 위 라이브러리를 사용했다. 그런데 이 라이브러리의 문제인 것인지 `$.ajaxForm` 함수를 사용하면 위 문제가 발생한다.

해결 방법은 jQuery와 동일하다. 서버 응답시 header에 `text/plain`를 사용하고 `dataType: "json"`을 옵션으로 추가하면 해결된다. 아래의 예시를 보자.

우선 PHP 샘플 코드다. IE의 버전을 검사해서 필요시에만 `text/plain`를 적용한다.

```php
$returnData = [1,2,3];
if (preg_match('/(?i)msie [5-9]/', $_SERVER['HTTP_USER_AGENT'])) {
  header('Content-Type:text/plain; charset=utf-8');
} else {
  header('Content-Type:application/json; charset=utf-8');
}
echo json_encode($returnData);
```

다음은 javascript 샘플 코드다. `dataType: "json"`를 추가해서 사용한다.

```javascript
$('#form').ajaxForm({
	dataType: "json",
	beforeSubmit: function (formData, jqForm, options) {
		return true;
	},
	success: function (response, statusText, xhr, $form) {
		if ('success' == statusText) {
			if ((response) && (typeof response !== "object")) {
				response = $.parseJSON(response);
			}
		}
	},
	error: function () {
	}
});
```

추가적으로 응답값의 데이터 타입을 검사해서 text이면 `$.parseJSON` 또는 `JSON.parse`를 수행해 주도록 한다. 위 코드대로라면 IE9 이하에서는 response가 "string"으로 넘어오고 기타 브라우저에서는 "object"로 넘어올 것이기 때문이다.

---

이 글에서는 조금 두서없이 설명을 했다. 상황적으로 그런 것이 jQuery를 사용할 때는 굳이 부수적인 처리가 필요없지만(경험상으로는) 기타 AJAX를 사용하는 상황에서 위와 비슷한 문제가 발생할 수 있어 원인과 해결 방법의 힌트를 설명하고자 여러가지 이야기를 섞어서 설명할 수 밖에 없었으니 양해 바란다. 더욱 상세히 설명하지 못한 부분이 더 문제일수도... 하지만 일일이 설명하자니 너무 글이 길어질 것 같아 기본적인 부분만 언급하고 넘어가니 혹시 더 필요한 부분이 있다면 따로 요청 바란다.
