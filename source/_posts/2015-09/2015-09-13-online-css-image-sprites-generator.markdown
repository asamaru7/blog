---
layout: post
title: "필요해서 만들어본 CSS Image Sprites 생성기"
date: 2015-09-13 20:15:23 +0900
comments: true
categories: css
---
웹 기반 프로그램 개발을 주업으로 하다보니 CSS에 관련된 작업도 많이 하게 된다. 게다가 웹 서비스 성능에 대해 고민을 많이 하게되는 것도 당연하다.
그중에서도 간혹 필요하지만 마땅한 도구가 없어 고민을 하게되던 것 중 하나가 CSS Image Sprite 도구다.
얼마전에도 비슷한 작업이 필요하게되어 온라인 도구들을 찾던 중 마땅한 것이 없어 필요에 의해 도구를 하나 만들어 버렸다.

일단 이 도구에 대해 설명하기 전에 CSS Image Sprite가 무엇인지 부터 알아보자.

## CSS Image Sprite 기법

간단하게 설명하자면 웹 페이지에서 필요한 이미지들을 한장의 이미지로 묶어 제작/배포하여 HTTP request를 줄임으로써 웹페이지 성능을 높이는 기법이다.
이 부분을 이해하기 위해서는 왜 HTTP request를 줄이는 것이 성능에 관련이 있는지를 알아야한다.
일반적으로 복잡한 웹페이지의 경우 페이지를 읽는데 수십에서 수백개의 request(CSS, JS, Image 등)가 발생한다. 이러한 페이지를 브라우저가 로딩할때 한꺼번에 모든 request를 처리하는 것이 아니라 순차적(보통 동시에 2~4개를 동시에 처리 : 브라우저마다 설정에 따라 다름)으로 처리함에 따라 이 수가 많다면 완료 시간이 늘어날 수 밖에 없다. 이와 관련된 자세한 내용은 얘기가 길어지므로 일단 이 정도만 설명하겠다. 조금 더 자세한 내용이 필요하다면 아래의 사이트를 참고하자.

* https://css-tricks.com/css-sprites/
* http://alistapart.com/article/sprites
* http://windtale.net/blog/css-image-sprite-automation-with-grunt-spritesmith/ (한글)

## CSS Image Sprites 생성기

https://asamaru7.github.io/SpriteImageGenerator/  또는  http://sprite.asamaru.net  으로 접속해서 사용할 수 있다.

Github :  https://github.com/asamaru7/SpriteImageGenerator
(만들어서 나와 같은 필요을 느끼는 사람이 있을까 싶어 페이지도 개설할 겸 Github에 등록했다.)

그리고 만든 김에 크롬 익스텐션도 만들어 올렸다. 사실 그냥 바로가기 링크랑 기능이 동일하다.

https://chrome.google.com/webstore/detail/sprite-image-generator/ckdkgoopenkcogopkfpehfcjkkhhofgo?utm_source=gmail

참고로 사이트는 내용이 크게 어려울 것이 없기 때문에 영어로 만들었다.(사실 영어 잘 못한다. 그래서 오탈자가 많을 수 있다.) 혹시나 다른 나라에서도 사용할까 싶어서 하긴 했는데 아직은 방문자가 거의 없다.

사실 이미 잘만들어진 많은 도구들이 있다. 하지만 굳이 새로 만든 이유는 Export 기능 때문이다. 보통 sprite image를 생성한 후에 사용된 작은 이미지들을 따로 관리하지 않아서 수정하거나 추가할 것이 생겼을 때 골치 아플 수 있다. 그래서 export 기능을 추가 했다. sprite.json 파일을 함께 export하는데 이 파일에서 생성시에 설정한 옵션과 원본 이미지들이 모두 포함되어 있어서 수정이 필요하면 이 파일만 import해서 수정할 수 있다. 나의 경우는 프로그램 소스에 함께 포함시켜 두고 관리한다.

### 특징

- Retina/Normal sprites 동시 생성 가능
- Drag and drop 파일 첨부
- 이미지 이름 변경 가능(CSS 클래스명에 사용됨)
- 이미지 이름별/사이즈별 정렬, drag and drop으로 직접 정렬
- Support DataURL Export
- Export: Sprites 이미지 / 설정 파일 다운로드
- 설정 파일 Import 기능 : *.sprite.json File (향후 수정시 기존 export를 첨부하여 재작업 가능)

### 스크린샷

![Sprite CSS Image Generator 설정](/img/2015-09-13-online-css-image-sprites-generator-1.png)
![Sprite CSS Image Generator 확인](/img/2015-09-13-online-css-image-sprites-generator-2.png)
![Sprite CSS Image Generator 생성](/img/2015-09-13-online-css-image-sprites-generator-3.png)
![Sprite CSS Image Generator 추출](/img/2015-09-13-online-css-image-sprites-generator-4.png)