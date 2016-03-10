---
layout: "post"
title: "PhantomJS 2.1.1: render PDF / pageSize format 버그 해결"
date: "2016-03-08T10:49:31+09:00"
comments: true
categories: js
---
이번에 작업을 하면서 [PhantomJS](http://phantomjs.org/)로 웹페이지를 PDF로 저장(캡춰)하는 부분을 처리하게 되었다. 기본적으로 PhantomJS는 보여지는 페이지를 [render](http://phantomjs.org/api/webpage/method/render.html) 함수를 사용해서 파일로 저장하는 기능을 기본적으로 제공한다. `render`에서 제공하는 포멧은 PDF, PNG, JPEG, BMP, PPM
, GIF 이다. 따라서 원하는 기능을 아주 간단하게 구현할 수 있다.

> [node.js](https://nodejs.org/ko/)의 설치나 PhantomJS의 설치에 관해서는 여기서 다루지 않는다. 복잡하지도 않고 검색해보면 상세히 설명되어 있는 자료도 많다.

그런데 내 Vagrant 환경에서 이상없이 동작하던 기능이 동료의 Vagrant 환경에서 이상하게 동작했다. PDF 출력시 A4 사이즈를 지정했음에도 페이지가 잘려보였던 것이다. 그래서 원인을 찾아보니 PhantomJS의 버전 문제였다. 나의 경우는 예전부터 사용하면서 구버전(1.9)이 설치되어 있었고 동료의 경우는 새로 설치하면서 최신버전(2.1.1)이 설치되었던 것이다.

이와 관련해서 찾아보니 아래와 같은 글들이 있었다.

* [phantomjs 2 fails to render pdf properly](https://github.com/ariya/phantomjs/issues/12936)
* [PhantomJS 2: PDF rendering too large, page.zoomFactor doesn't work](https://github.com/ariya/phantomjs/issues/12685)

분위기를 보면 PhantomJS가 2버전이 되면서 문제가 발생하는 것 같다. 이 글들에서 해결 방법으로 사람들이 이야기하는 것 중 그나마 효과가 있었던 것은 css로 zoom을 줘서 비율을 맞추는 것인데 이건 맘에 들지 않는다. 정확한 비율을 지정하기도 애매하고 나중에 버전이 변경되면서 어떻게 바뀔지 모르기 때문이다.

결론적으로 나의 경우는 [page.paperSize](http://phantomjs.org/api/webpage/property/paper-size.html)에 width, height를 주는 것으로 일단 해결했다. 이것 또한 완벽한 해결이라고 보기엔 어렵지만 zoom을 사용하는 것보다는 낫다는 개인적인 생각이다.

일단 코드를 보자. 실행시 첫번째 인자로 파일이 저장될 경로, 두번째 인자로 대상 url이 지정된 것을 가정하고 있다.

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
// fixme phantomjs 2.1.1 에서 pageSize.format A4 버그로 인해 강제로 사이즈를 지정함
var viewportSize = {width: 1024, height: 1024 * (2339/1654)};
//page.viewportSize = viewportSize;
page.viewportSize = {width: 1024, height: 768};	// PhantomJS에서 화면을 어떤 사이즈로 출력할 것인지에 대한 값 : 미디어 쿼리도 동작

var pageSize = {
	format: 'A4',
	orientation: 'portrait',
	margin: {
		top: '0.5cm',
		bottom: '0.5cm',
		left: '0.5cm',
		right: '0.5cm'
	}//,
	//header: {
	//	height: '1cm',
	//	contents: phantom.callback(function () {
	//		return '<div>PhantomJS Header, Footer 예제입니다.</div>';
	//	})
	//},
	//footer: {
	//	height: '1cm',
	//	contents: phantom.callback(function (pageNum, numPages) {
	//		return '<div>' + pageNum + '/' + numPages + '</div>';
	//	})
	//}
};
if (v.major >= 2) {
	pageSize.width = (viewportSize.width) + 'px';
	pageSize.height = (viewportSize.height) + 'px';
}
page.paperSize = pageSize;

page.onLoadFinished = function (status) {
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

여기서 이야기하는 문제와는 상관없지만 코드에서 설명이 필요한 부분들을 하나씩 보자.

```javascript
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
```

예전에는 [phantom.args](http://phantomjs.org/api/phantom/property/args.html)를 사용해서 인자를 받았지만 메뉴엘에도 설명되어 있는 것처럼 지금은 phantom.args가 제거되고 system.args을 사용한다.

그리고 중요한 부분. A4 사이즈에 대한 문제 해결 부분이다.

```javascript
// fixme phantomjs 2.1.1 에서 pageSize.format A4 버그로 인해 강제로 사이즈를 지정함
var viewportSize = {width: 1024, height: 1024 * (2339/1654)};
//page.viewportSize = viewportSize;
page.viewportSize = {width: 1024, height: 768};	// PhantomJS에서 화면을 어떤 사이즈로 출력할 것인지에 대한 값 : 미디어 쿼리도 동작

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
if (v.major >= 2) {
	pageSize.width = (viewportSize.width) + 'px';
	pageSize.height = (viewportSize.height) + 'px';
}
page.paperSize = pageSize;
```

여기서 중요한 것은 width와 height이다. width의 경우는 페이지를 랜더링할 width를 기준으로 주면되고 height의 경우는 A4 용지 비율에 맞게 넣어야 한다. `(2339/1654)`가 A4 용지의 세로 비율이다(참고 : [A4PaperSize.org
](http://www.a4papersize.org/a4-paper-size-in-pixels.php)).

그리고 한가지. 여기서는 페이지가 잘려나가지 않고 비율을 맞추는데 초첨을 맞춘 해결 방법이므로 완벽한 방법은 아니다. 일례로 OSX의 크롬에서는 브라우저에서 PDF를 열어 출력해도 깔끔하게 나오나 사파리에서는 50% 비율로 출력해야 정확히 나온다. 단, 브라우저가 아닌 파일 다운로드 후 출력하면 당연히 정상적으로 출력된다.
이것은 DPI 문제인 것 같으나 아직 해결하진 못했다. 기본 DPI가 72 DPI로 설정된 것으로 보인다. 이 경우 사이즈가 595px X 842px가 되므로 페이지가 잘려나가는 것이다. 하지만 페이지를 595px로 랜더링하면 웹페이지의 가로가 너무 좁으니 이렇게 사용할 수도 없다.

정확한 해결을 위해서는 [zoomFactor](http://phantomjs.org/api/webpage/property/zoom-factor.html)에 DPI 비율을 넣어줘야 하는데 지금 zoomFactor가 정상적으로 적용되지를 않는다.

```javascript
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
```

사실 위 부분은 실제로는 굳이 필요하지는 않다. PhantomJS의 경우는 서버 내부에 등록된 폰트를 사용하게 되므로 서버에 있는 폰트로 맞춰준 것이다. 위 코드를 사용하지 않아도 기본 한글 폰트가 지정되어 나온다. 단, 서버에 한글 폰트가 설치된 경우에 한해서. PhantomJS에서 한글이 나오지 않는다면 폰트가 설치되지 않은 것이고 이 또한 자료가 아주 많으니 쉽게 해결할 수 있다(간단히 말하자면 CentOS 기준으로 폰트 파일을 `/usr/share/fonts/`에 넣으면 된다).

```javascript
page.onLoadFinished = function (status) {
	setTimeout(function () {
		page.render(dest);    // 스크린 캡쳐파일 생성
		console.log('Status: ' + status);
		phantom.exit();
	}, 0);
};
```

마지막으로 한가지 `page.render` 처리를 setTimeout으로 씌운 것. 이 부분도 꼭 필요하지는 않으나 [page.evaluate](http://phantomjs.org/api/webpage/method/evaluate-java-script.html)가 실행되기 전에 render되는 경우가 있어 사용한 코드다.

---

A4 출력 문제로 이 글을 썼지만 내용을 보면 웹페이지를 PDF로 저장하는 방법에 대해서도 충분한 샘플이 포함되어 있으니 원하는 작업에 약간의 도움이라도 되었으면 하는 바람이다.
