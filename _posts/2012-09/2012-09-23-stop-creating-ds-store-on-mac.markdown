---
layout: post
title: "네트워크 연결을 통해 .DS_Store 파일 생성을 방지하는 방법"
date: 2012-09-23 08:29:57 +0900
comments: true
categories: osx
---

**애플 공식 [고객지원](http://support.apple.com/kb/HT1629?viewlocale=ko_KR) 사이트에 따르면 다음의 명령을 터미널에 입력하면 된다.**

```bash
defaults write com.apple.desktopservices DSDontWriteNetworkStores true
```

잘 적용되었는지 확인하려면

```bash
defaults read com.apple.desktopservices DSDontWriteNetworkStores
```

를 입력했을 때 "true"라는 글자가 나오면 된다.

보다 상세한 정보를 얻길 원한다면 애플 공식 [고객지원](http://support.apple.com/kb/HT1629?viewlocale=ko_KR) 사이트를 방문하기 바란다.

고객지원 사이트의 안내에는 "이 문서는 Apple에서 보관하던 문서로 더 이상 업데이트되지 않습니다."라고 나와있고 지원되는 버전에도 10.6(스노우 레오파드)까지만 나와있지만 현재 최신 버전인 마운틴 라이언에서도 이상없이 동작한다. 당연히 라이언에도...

위처럼 defaults로 설정할 수 있는 것들은 .DS_Store를 지우는 것 외에도 다양한데 아래의 링크에서 구경하시길...

[링크1](http://nerdlogger.com/2012/07/30/get-control-of-mountain-lion-with-a-huge-list-of-command-line-tweaks/)

[링크2](https://github.com/mathiasbynens/dotfiles/blob/master/.osx)

* * *

**기존에 이미 생성된 파일을 지우는 방법**

```bash
find . -name \.DS_Store -exec rm {} \;
find . -name \.AppleDouble -exec rm -rf {} \;
```