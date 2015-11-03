---
layout: post
title: "옥토프레스에 구글 번역기 달기"
date: 2015-09-05 06:47:14 +0900
comments: true
categories: octopress
---
구글에서는 웹사이트에 여러가지 언어로 번역해서 보여줄 수 있는 기능을 제공해 준다.
이 블로그에 한국어가 아닌 다른 언어를 사용하는 사람이 누가 오겠냐만은 이 블로그는 여러가지 실험을 하기 위한 블로그이므로 구글 번역기도 달아봤다. 생각보다 간단하다.

## 구글 번역 스크립트 생성
http://translate.google.com/manager/website/

![웹사이트에 지금 추가](/img/2015-09-05-octopress-google-translate-1.png "웹사이트에 지금 추가")

"웹사이트에 지금 추가"를 눌러 다음으로.

![웹사이트 정보](/img/2015-09-05-octopress-google-translate-2.png)

번역기를 넣을 웹사이트 주소를 입력하고 언어 선택 후 다음.

![플러그인 설정](/img/2015-09-05-octopress-google-translate-3.png)

원하는 옵션을 선택하고 다음.

![플러그인 추가](/img/2015-09-05-octopress-google-translate-4.png)

번역 스크립트 완성. 이제 이 스크립트를 복사해서 원하는 곳에 넣으면 끝이다.

## 옥토프레스에 추가

옥토프레스에 추가하는 방법은 템플릿 html 어딘가에(노출을 원하는 위치) 넣으면 끝이다.
맨 상단 메뉴에 넣고 싶다면 source/_includes/navigation.html 파일 내부에 원하는 곳에 넣으면 된다. 당연히 하단, 본문 등 원하는 곳에 그냥 넣으면 끝이다.

하지만. 난 우측 aside 영역에 넣기로 했다. 그리고 그냥 넣지않고 파일을 분리하기로 했다. 플러그인 처럼.

```bash
vi source/_includes/custom/asides/google_translate.html
```

우선 google_translate.html을 열어 구글에서 제공해준 스크립트를 넣는다.

```bash
vi _config.yml
```

_config.yml 파일을 열어 아래처럼 default_asides 항목에 생성한 파일을 넣어준다.(원하는 순서에)

```yaml
default_asides: [custom/asides/google_translate.html, ...]
```

이것으로 끝.

확인을 위해

```bash
rake generate
rake deploy
```
