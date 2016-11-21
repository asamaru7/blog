---
layout: post
title: "HTTP referrer(referer) 숨기기"
date: 2016-11-04 11:50:26 +09:00
comments: true
categories: ["html","js"]
---

브라우저에서 http 요청을 하는 경우 대부분 referrer 정보가 넘어간다.(HTTP 리퍼러를 정의한 RFC에서 'referrer'를 'referer'라고 잘못 친 것에서 기인하여 HTTP 리퍼러는 'HTTP referer'라고 불린다 : [위키백과](https://ko.wikipedia.org/wiki/%EB%A6%AC%ED%8D%BC%EB%9F%AC))

그런데 간혹 이 referrer를 숨기고 싶을 때가 있다. 현 페이지에서 resouces(js, css, image, ajax 등)를 요청할 때나 페이지를 이동할 때 referrer가 전송되는데 여기서는 resouces를 호출할 때 referrer를 숨기는 방법에 대해 설명하려고 한다.

---

* *`<meta>` Tag를 이용한 referrer 제거*

[Remove http referrer](http://stackoverflow.com/a/32014225/6736772)에 보면 아래와 같이 referrer를 제거하는 방법을 소개하고 있다.

```html
<meta name="referrer" content="no-referrer" />
```

```javascript
var meta = document.createElement('meta');
meta.name = "referrer";
meta.content = "no-referrer";
document.getElementsByTagName('head')[0].appendChild(meta);
```

html, javascript로 처리하는 두가지 방식이 있는데 html의 경우 `<head>` 내부에 넣어주면 된다. 그리고 javascript의 경우는 필요한 시점에 실행해주면 된다. 예를들어 특정 ajax 호출시에만 referrer를 숨기고자 하는 경우 등이다.

`no-referrer` 외에 사용할 수 있는 값은 `unsafe-url`, `origin-when-cross-origin` 등이 있는데 자세한 내용은 [W3C Referrer Policy](https://www.w3.org/TR/referrer-policy/)를 참고하면 된다. 여기보면 `<a href="http://example.com" referrerpolicy="origin">` 와 같이 개별 링크에 Referrer 정책을 지정하는 방법들도 안내되어 있다.

---

* *`<IFrame>` Tag를 이용한 referrer 제거*

다른 방법으로는 iframe을 이용해서 referrer를 제거할 수 있다. 일단 아래의 코드를 보자.

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<style type="text/css">
		html, body { width:100%; height:100%; margin:0; padding:0; }
		textarea { display:none; }
		iframe { width:100%; height:100%; }
	</style>
</head>
<body>
<textarea id="html"><!-- 실제 들어갈 HTML --></textarea>
<script type="text/javascript">
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);

	var html = document.getElementById('html').value;

	// 가장 간단하지만 crass domain 문제가 있을 수 있다.
	// iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);

	// cross domain issue 해결
	iframe.srcdoc = html;

	// (iframe.contentDefault || iframe.contentWindow.document).domain = document.domain;
</script>
</body>
</html>
```

`srcdoc`이 생소하다면 [Which is the difference between srcdoc=“…” and src=“data:text/html,…” in an <iframe>?](http://stackoverflow.com/questions/19739001/which-is-the-difference-between-srcdoc-and-src-datatext-html-in-an)를 참고하길 바란다.

아주 간단한 코드니 굳이 설명하지 않아도 내용은 이해할 수 있으리라 본다. 원리만 간단히 설명하자면 iframe은 하나의 독립 문서이므로 새로운 iframe을 만들고 동적으로 html을 출력하면 넘겨주고 싶어도 넘겨줄 referrer가 없으므로 referrer를 제거하는 것과 같은 효과가 난다. 사실 이 방법은 referrer를 숨기는 것 외에도 여러가지로 활용될 수 있다(활용은 개인의 몫).
