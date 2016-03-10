---
layout: "post"
title: "PhantomJS 2.1.1: render PDF / zoomFactor 버그 해결"
date: "2016-03-09T11:18:51+09:00"
comments: true
categories: js
---
어제 작성했던 [PhantomJS 2.1.1: render PDF / pageSize format 버그 해결](/2016/03/08/phantomjs-2-pagesize-format-bug/)에서 언급했던 PhantomJS에서 웹페이지를 PDF로 저장할 때 [zoomFactor](http://phantomjs.org/api/webpage/property/zoom-factor.html)가 정상 동작하지 않는 문제를 개선한 코드를 새로 올린다. [PhantomJS 2: PDF rendering too large, page.zoomFactor doesn't work](https://github.com/ariya/phantomjs/issues/12685)에서 해결의 힌트가 있었음에도 불구하고 자세히 보지않아 해결하지 못했었는데 해당 부분을 조금 변형해서 조금 더 나은 방법을 적용했다(개인적인 생각).

일단 코드부터.

```javascript
"use strict";
/*global phantom: false*/

var dest, source;
var v = phantom.version;
if (v.major >= 2) {
	var system = require('system');
	dest = system.args[1];
	source = system.args[2];
} else {
	dest = phantom.args[0];
	source = phantom.args[1];
}

var page = require('webpage').create();	// Web Page를 Control 하기 위한 Web Page Module 객체 생성
// fixme phantomjs 2.1.1 에서 pageSize.format A4 버그 개선
var width = 1024;
page.viewportSize = {width: width, height: width * (768 / 1024)};	// PhantomJS에서 화면을 어떤 사이즈로 출력할 것인지에 대한 값 : 미디어 쿼리도 동작
page.zoomFactor = 585 / width;	// A4 / 72 DPI : 585px X 842px

var pageSize = {
	format: 'A4',
	orientation: 'portrait',
	margin: {
		top: '0.5cm',
		bottom: '0.5cm',
		left: '0.5cm',
		right: '0.5cm'
	}
};
page.paperSize = pageSize;

page.onLoadFinished = function (status) {
	var zoom = page.zoomFactor;
	page.evaluate(function (zoom) {
		document.getElementsByTagName('body')[0].style.zoom = zoom;
	}, zoom);

	setTimeout(function () {
		page.render(dest);    // 스크린 캡쳐파일 생성
		console.log('Status: ' + status);
		phantom.exit();

	}, 0);
};

page.open(source, function (status) {
	page.evaluate(function () {
		// 폰트 문제로 사용가능한 폰트로 교체
		var cssCode = 'html body, html body * { font-family:"바른돋움OTF" !important; }';// html { zoom: 1; }
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = cssCode;
		} else {
			styleElement.appendChild(document.createTextNode(cssCode));
		}
		document.getElementsByTagName("head")[0].appendChild(styleElement);
	});
	if (status !== 'success') {	// status 인자를 통해 성공, 실패여부 확인
		console.log('Cannot open webpage');
		phantom.exit();
	}
});
```

지난 글에서의 코드와 거의 유사하다. 변경된 부분 중 중요한 부분만 아래에 설명한다.

```javascript
var width = 1024;
page.viewportSize = {width: width, height: width * (768 / 1024)};	// PhantomJS에서 화면을 어떤 사이즈로 출력할 것인지에 대한 값 : 미디어 쿼리도 동작
page.zoomFactor = 585 / width;	// A4 / 72 DPI : 585px X 842px
```

보여줄 가로 width에 따라 zoomFactor를 결정한다. 585는 72 DPI 기준에서 A4용지의 가로 px 이다.

```javascript
page.onLoadFinished = function (status) {
	var zoom = page.zoomFactor;
	page.evaluate(function (zoom) {
		document.getElementsByTagName('body')[0].style.zoom = zoom;
	}, zoom);

	setTimeout(function () {
		page.render(dest);    // 스크린 캡쳐파일 생성
		console.log('Status: ' + status);
		phantom.exit();

	}, 0);
};
```

문제가 되던 부분이 zoomFactor가 적용되지 않는 것이었다. 이를 개선하기 위해 `body`의 zoom css를 사용해서 보정한다.

다른 부분의 자세한 내용은 [PhantomJS 2.1.1: render PDF / pageSize format 버그 해결](/2016/03/08/phantomjs-2-pagesize-format-bug/)을 참고하자.

---

마지막으로 위 방법도 완전한 방법은 아니다. PhantomJS가 버전업 되면서 zoomFactor 버그가 해결되면 이번엔 반대로 너무 작게 출력하게되는 코드가 될 수 있다. 그런 경우을 감안한다면 지난 글에서 언급한 방법이 나을 수도 있다(실제 PDF가 A4 사이즈가 아니라는 것을 무시한다면 : 출력시에는 A4에 맞게 잘 나온다).
