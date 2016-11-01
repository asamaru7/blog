---
layout: "post"
title: "OSX에서 Nokogiri 설치시 'Libxml2 missing.' 오류 해결"
date: "2016-11-01T13:34:54+09:00"
comments: true
categories: ["osx", "jekyll"]
---

OSX (sierra)에서 jekyll을 설치하던 중 [Nokogiri](http://www.nokogiri.org/)가 설치되는 과정에서 아래의 오류가 발생하고 더 이상이 진행되지 않는 문제가 발생했다.

> libxml2 is missing.  Please locate mkmf.log to investigate how it is failing.

이 문제는 libxml2가 설치되지 않아서 발생하는 문제로 libxml2부터 설치해야 한다.

```bash
$ brew install libxml2
```

그런데 설치 후에도 동일한 문제가 발생한다면 [Nokogiri](http://www.nokogiri.org/)를 직접 설치하면 된다.

[Libxml2 missing mac os x 10.10](http://stackoverflow.com/questions/26878263/libxml2-missing-mac-os-x-10-10) 글에 보면 아래와 같은 방법을 제시하고 있으나 정상적으로 동작하지 않았다.

```bash
$ sudo env ARCHFLAGS="-arch x86_64" gem install nokogiri:1.6.4.1 -- --use-system-libraries --with-xml=/usr/local/Cellar/libxml2/
```

나의 경우는 아래와 같이 실행하면 정상적으로 Nokogiri를 설치할 수 있었다.

```bash
$ gem install pkg-config -v "~> 1.1.7"
$ sudo gem install -n /usr/local/bin nokogiri -- --use-system-libraries=true --with-xml2-include=/usr/include/libxml2/
```
