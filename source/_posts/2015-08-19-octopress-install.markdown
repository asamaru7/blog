---
layout: post
title: "Octopress 설치"
date: 2015-08-19 23:29:26 +0900
comments: true
categories: 
---
# Octopress 설치

[Octopress](http://octopress.org/)는 [Jekyll](http://jekyllrb.com/)을 위해 디자인된 프레임워크다.
Jekyll은 Github pages를 이용한 정적 블로깅 엔진으로 무료로 블로그 사이트를 생성할 수 있다.
하지만 해커들을 위한 블로깅 프레임워크이라고도 불리는 Jekyll은 사용이 그리 간단하지만은 않다.
자세한 내용은 검색하면 많이 찾을 수 있으니 그만 넘어가자.

## 기본 설치

Octopress에 안내된 설치방법은 아래의 사이트를 참고하자.
http://octopress.org/docs/setup/

하지만 위의 설명대로 잘 되지 않는다면 아래의 내용을 참고해 볼수도 있다. 나의 경우엔 설치가 그리 쉽지만은 않았다.

우선 설치 환경은 osx 10.10 기준이다.

이미 git, brew 등은 설치가 되어있었기 때문에 rvm으로 ruby 1.9.3을 설치하려고 했으나 아래와 같은 오류를 만났다.

### 오류 : requirements_osx_brew_libs_install gcc49 openssl

```bash
$ sudo rvm install 1.9.3
Searching for binary rubies, this might take some time.
No binary rubies available for: osx/10.10/x86_64/ruby-1.9.3-p551.
Continuing with compilation. Please read 'rvm help mount' to get more information on binary rubies.
Checking requirements for osx.
Installing requirements for osx.
Updating system.....
Installing required packages: gcc49, openssl....
Error running 'requirements_osx_brew_libs_install gcc49 openssl',
showing last 15 lines of /Users/yyj/.rvm/log/1439982916_ruby-1.9.3-p551/package_install_gcc49_openssl.log
++ case "$1" in
++ [[ -t 1 ]]
++ return 1
++ printf %b 'There were package installation errors, make sure to read the log.

Try `brew tap --repair` and make sure `brew doctor` looks reasonable.

Check Homebrew requirements https://github.com/Homebrew/homebrew/wiki/Installation\n'
There were package installation errors, make sure to read the log.

Try `brew tap --repair` and make sure `brew doctor` looks reasonable.

Check Homebrew requirements https://github.com/Homebrew/homebrew/wiki/Installation
++ case "$_system_version" in
++ return 1
Requirements installation failed with status: 1.

```

우선 안내에 나온대로 `brew tap --repair`와 `brew doctor`를 실행해서 안내하는대로 처리를 완료했음에도 문제는 해결이 되지 않았다.
그래서 다음과 같이 rvm에서 필요로하는 lib을 먼저 설치했다.

```bash
$ rvm get head --autolibs=3
$ rvm requirements
```

재시도 ...

```bash
$ sudo rvm install 1.9.3
```

이번엔 오류가 나지않고 ruby를 다운로드 시작... 그러나 엄청나게 느림... 중간에 끊어짐... 이런...
오랜 기다림 끝에 이제 ruby 1.9.3 설치 완료.
이제 ruby 1.9.3을 사용하도록 하고...

```bash
$ rvm use 1.9.3
$ rvm rubygems latest
```

그다음은 공식 사이트 설명대로... 단, Octopress를 clone 받은 경로로 가서...

```bash
$ gem install bundler
```

이번엔 그냥 넘아가나 했더니 아래와 같은 오류...

```bash
ERROR:  Could not find a valid gem 'bundler' (>= 0), here is why:
          Unable to download data from https://rubygems.org/ - server did not return a valid file (https://rubygems.org/latest_specs.4.8.gz)
```

이번에도 아래와 같이 하고...

```bash
$ rvm use 1.9.3
Using /Users/yyj/.rvm/gems/ruby-1.9.3-p551
$ rvm rubygems latest
```

 재시도...

```bash
$ gem install bundler
```

이번엔 퍼미션 에러...

```bash
$ sudo gem install bundler
```

드디어 설치.


```bash
$ rbenv rehash # 이건 필요시에만 한다고하니 명령이 없다는 오류가 나면 무시
$ bundle install
```

이번에도 `bundle install`에서 퍼미션 에러...

```bash
$ sudo bundle install
```

아.. 드디어 기본 설치 완료

## 테마설치

기본 테마 설치

```bash
$ rake install
```

다른 테마를 원한다면 [https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes](https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes) 에 가서 고르면 된다.

설치는 다음과 같이

```bash
$ git clone https://github.com/~~~.git .themes/테마이름
$ rake install['테마이름']
```

octostrap3 테마 적용 예시.

```bash
% git clone https://github.com/kAworu/octostrap3.git .themes/octostrap3
% rake install["octostrap3"]
```

## 설정

아래와 같이 명령을 실행하고 생성해둔 github 프로젝트 주소를 넣으면 설치는 완료된다.

```bash
$ rake setup_github_pages
Enter the read/write url for your repository
(For example, 'git@github.com:your_username/your_username.github.io.git)
           or 'https://github.com/your_username/your_username.github.io')
Repository url: https://github.com/~~~/~~~.git
```

## 배포

아직 작성한 글이 아무것도 없지만 일단 deploy 해본다.

```bash
$ rake generate
$ rake deploy
```

deploy를 하고나면 기본적으로 생성해 주는 아주 간단한 index.html 파일이 push되어 있는 것을 볼 수 있다.

이제 페이지가 정상적으로 뜨는지만 확인하면 기본 설치는 모두 완료.

## repository 연결

블로그는 gh-pages branch로 연결되어 있으니 원소스를 master로 연결하여 백업의 역할을 할 수 있도록 설정해보자.

```bash
$ git remote add origin https://github.com/~~~/~~~.git
$ git config branch.master.remote origin

$ git push
```

## 독립 도메인 연결

이왕이면 내 도메인도 연결해보자. 아래의 명령은 CNAME 파일을 통해 도메인 연결을 github에 알려주는 것으로 이후 deploy가 될 때 이 파일이 함께 배포되면 적용된다. 단, 도메인을 변경했으므로 이에 맞춰 _config.yml 파일도 함께 수정해야 한다.

```bash
$ echo 'blog.asamaru.net' >> source/CNAME
```
