---
layout: post
title: "Javascript 국제화(I18N) 라이브러리 - i18next"
date: 2015-09-15 19:02:43 +0900
comments: true
categories: js
---
## 국제화(internationalization : i18n)의 의미

국제화는 [텀즈](http://www.terms.co.kr/internationalization.htm)의 정의에 따르면 아래와 같다.

국제화는 때로 줄여서 그저 "I18N"이라고도 표기하는데, 그 의미는 이 용어의 영어 표기에서 첫 글자인 "I"자와 마지막 글자인 "N"의 사이에 18글자가 들어가 있다는 의미이다. 국제화는 제품이나 서비스를 특정지역의 언어나 문화에 맞추는, 즉 현지화라고 불리는 과정을 쉽게 할 수 있도록 계획하거나 이행하는 과정을 말한다. 국제화는 때로 번역 및 현지화 능력부여 작업이라고도 불리는데, 여기에는 다음과 같은 것들이 포함된다.

* 하드웨어 레이블이나, 도움말 페이지, 그리고 온라인 메뉴 등 사용자 인터페이스를 설계할 때, 더 많은 수의 글자가 들어갈 때를 대비하여 여유를 둔다.
* 웹에디터나 저작도구 등과 같은 제품을 개발할 때 국제 문자셋, 즉 유니코드를 지원할 수 있게 한다.
* 인쇄용 그래픽 이미지나, 웹사이트를 만들어서 텍스트 레이블을 번역할 때 비용이 많이 들지 않게 한다.
* 전세계적으로 통용될 수 있는 예시를 사용한다.
* 소프트웨어의 경우에는, 메시지들이 영어와 같은 단일 바이트 문자 코드에서, 한글과 같은 다중 바이트 문자 코드로 변환될 수 있도록 데이터 공간을 확보한다.

위키피디아에는 ["국제화와 지역화"](https://ko.wikipedia.org/wiki/%EA%B5%AD%EC%A0%9C%ED%99%94%EC%99%80_%EC%A7%80%EC%97%AD%ED%99%94)라는 주제로 설명되어 있기도 하다.

## i18next

* 공식 사이트 : http://i18next.com/
* Github : https://github.com/i18next/i18next
* CDN : http://cdnjs.com/libraries/i18next
* i18next-node : https://github.com/i18next/i18next-node

i18next는 위에 설명한 i18n을 자바스크립트 상에서 사용할 수 있도록 제작된 라이브러리다. 아주 다양한 형태로의 사용을 지원하는데 사용해본 결과 메뉴얼이 조금 부실(?)하다. 확인해보면 메뉴얼의 양이 적은 건 아니다. 하지만 워낙 다양하게 지원하다 보니 개별적인 설명이 부족한 감이 든다.

이번에 다국어용 one page 앱을 제작하면서 영어와 한국어를 지원하기 위해 사용하게되었는데 조금 해멨다. 사실 아직도 자유자재로 사용하지는 못하겠다. 하지만 아주 다양한 형태를 지원하므로 필요한 형태를 메뉴얼을 참고하여 사용한다면 유용하게 사용할 수 있을 것으로 생각한다.

### 사용예시

아래는 내가 작업한 일부를 간단하게 요약한 것이다.

```html
<html>
<body>

<div class="translation">
	<a href="javascript:void(0);" onclick="changeLang('en-US');">영어</a>
	<a href="javascript:void(0);" onclick="changeLang('ko-KR');">한국어</a>
	<ul>
		<li data-i18n="A:apple"></li>
		<li data-i18n="A:banana"></li>
		<li data-i18n="A:orange"></li>
	</ul>

	<ul>
		<li data-i18n="B:car"></li>
		<li data-i18n="B:airplane"></li>
		<li data-i18n="B:bicycle"></li>
	</ul>
</div>

<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/i18next/1.9.0/i18next.min.js" type="text/javascript"></script>
<script type="text/javascript">
	$.i18n.init({
		//lng: 'en-US',
		lng: 'ko-KR',
		debug: true,
		useLocalStorage: false,
		localStorageExpirationTime: 86400000, // in ms, default 1 week
		ns: {
			namespaces: ['A', 'B'],
			defaultNs: 'A'
		},
		//resGetPath: 'js/locales/translation.json'
		resStore: {
			"en-US": {
				"A": {
					"apple": "Apple",
					"banana": "Banana",
					"orange": "Orange"
				},
				"B": {
					"car": "Car",
					"airplane": "Airplane",
					"bicycle": "Bicycle"
				}
			},
			"ko-KR": {
				"A": {
					"apple": "사과",
					"banana": "바나나",
					"orange": "오렌지"
				},
				"B": {
					"car": "자동차",
					"airplane": "비행기",
					"bicycle": "자전거"
				}
			}
		}
	}, function () {
		$('.translation').i18n();
	});

	var changeLang = function (lang) {
		$.i18n.setLng(lang);
		$('.translation').i18n();
	}
</script>
</body>
</html>
```

위의 예시는 jquery와 함께 사용하는 예시이지만 jquery에 대한 의존성을 가진 것은 아니다. [CDN](http://cdnjs.com/libraries/i18next) 목록에서 보여지는 것과 같이 amd, commonjs, 기본 등 여러가지 환경에서 사용 가능하다.

여러번 얘기하게되지만 사용방법이 너무 다양하다. 그래서 위의 예시를 기준으로 몇가지 옵션만 설명하겠다. 보다 다양한 사용법은 제작 사이트의 [메뉴얼](http://i18next.com/pages/doc_init.html)과 [샘플](http://i18next.com/pages/sample.html)을 참고하자.

* **lng** : 기본 언어를 지정한다. 위의 예시처럼 setLng 함수를 통해 언제든 변경할 수 있다.
* **debug** : true로 설정시 내부적인 처리에 관련되 log를 확인할 수 있다.
* **useLocalStorage** : true로 설정시 local storage에 내용을 저장하여 향후 재사용할 수 있도록 한다. 이 예시에서는 resStore를 사용해서 언어 설정을 했기 때문에 의미가 없지만 서버에서 언어 정보를 받아와서 사용하는 경우에는 성능에 이점을 얻을 수 있다.
* **localStorageExpirationTime** : local storage에 저장된 데이터에 유효기간을 설정한다. 단위는 ms이며 기본값은 1주일이다.
* **ns** : 사용할 Namespace를 정의한다. 필수는 아니며 필요시에만 사용하면 된다. Namespace의 구분은 ::로 한다.(예시 : "A::apple")
* **resStore** : i18n에 사용될 데이터를 설정한다.
* **resGetPath** : i18n에서 사용할 데이터를 서버에서 요청할 경우 경로를 구성하는 방법을 정의한다. ``'locales/__lng__/__ns__.json'`` 이런 형식을 쓸 수 있는데 ```__lng__```는 언어명으로 ```__ns__```는 Namespace로 대체된다.

그 외에도 다양한 옵션이 있을 뿐 아니라 여러가지 상황에 대입해서 사용할 수 있다. 위의 예시는 html에 data attribute를 사용하는 것을 예를 들었지만 js에서 직접적으로 데이터를 받아서 사용할 수도 있고, sprintf 등과 같이 데이터를 데입해서 내용을 생성하는 것도 가능하다.
게다가 handlebars, angular, JQuery UI에서 template에 적용시킬 수도 있다.