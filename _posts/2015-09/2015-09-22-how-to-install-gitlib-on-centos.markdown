---
layout: post
title: "CentOS에 Gitlab 설치하기"
date: 2015-09-22 07:36:21 +0900
comments: true
categories: git
---
지난 포스팅 [CentOS에 gogs 설치하기](http://blog.asamaru.net/2015/09/21/how-to-install-gogs-on-centos/)에서 gitlab 대신 gogs를 설치했다. 심플해서 설치/사용이 쉬울 것 같았기 때문에 선택한 것이었다. 설치 후에 사용하면서 느낀 것은 설치도 그리 쉽지만은 않고 사용할 때는 기능이 조금 많이 빈약한 느낌이 든다. 사실 많은 기능을 필요로하는 것은 아닌데 아직은 초기 버전이라 그런지 정말 딱 기본 기능만 있는 느낌이다. 그래서 결국 Gitlab을 추가로 설치해서 비교 중이다.

## 설치

Gitlab의 설치는 생각보다 훨씬 간단했다. 다른 사람들의 글의 보니 예전에 의존성 관련해서 설치할 것들이 많았다고 하는데 최근에는 패키지로 거의 한방에 설치가 가능했다.

[Gitlab 다운로드 페이지](https://about.gitlab.com/downloads/)에 가면 운영체제별로 안내가 잘되어 있다. 나는 이번에도 CentOS 6에 설치하므로 아래의 내용은 그 기준이다.

일단 그냥 시키는대로 주욱 명령을 실행한다. 그럼 그냥 설치 끝이다.

```bash
sudo yum install curl openssh-server postfix cronie
sudo service postfix start
sudo chkconfig postfix on
sudo lokkit -s http -s ssh

curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
sudo yum install gitlab-ce
```

## 설정 및 실행

안내 페이지의 마지막에 보면 아래의 명령이 있다. 실행에 앞서 아래의 내용을 먼저 읽어보기를 권장한다.

```bash
sudo gitlab-ctl reconfigure
```

이 명령은 초기설정 과정들을 진행하면서 시간이 조금 걸렸다. 처음엔 멈춰있는줄 알고 작업을 중지시키곤 했다. 그 후에 브라우저에서 접속해서 안내된 계정으로 접속한다. 사실 난 여기서 부터 조금 난해했다. 이미 해당 서버는 웹 서버가 돌고 있었으므로 어떻게 Gitlab 웹 서버가 동시에 뜰 수 있을까? 어딘가 분명 설정이 있을텐데...

그래서 찾아보니 `/etc/gitlab/gitlab.rb` 파일을 통해 설정이 가능했다. 우선 다른 설정은 다 무시하고 external_url 설정만 보자(실제로 이것만 활성화되어 있고 나머지는 다 주석처리 되어 있다). 이 설정을 통해 웹 서버가 사용할 도메인과 port를 지정할 수 있다.

```ruby
external_url 'http://your.domain:port'
```

이렇게 설정을 완료한 후 `sudo gitlab-ctl reconfigure` 명령을 실행하면 여기에 맞추어 서버를 알아서 구동해 준다(Gitlab은 내부적으로 웹 서버를 nginx를 사용한다).

이후에는 브라우저에서 접속해서 사용하면 된다.

## 서버의 시작 / 종료

아래의 명령들을 통해 서비스를 시작 / 종료할 수 있다. reconfigure는 설정을 반영해서 다시 설정하는 과정을 거치는 것으로 설정을 변경할 떄만 사용하면 된다.

```bash
sudo gitlab-ctl start
```

```bash
sudo gitlab-ctl stop
```

## 내장 웹서버(nginx)를 사용하지 않고 외부 웹서버에 연결하기

나의 경우는 이미 웹서버가 설치된 상황이었기 때문에 Gitlab 서버를 동시에 사용하려면 port를 따로 지정해서 사용하는 방법 밖에 없었다. 하지만 그렇게 사용하기는 보기 싫어서 웹 서버를 따로 구성하기로 했다.

자세히 본 것은 아니라서 정확하진 않지만 Gitlab은 내부적으로 [unicorn](http://unicorn.bogomips.org/)과 nginx의 조합으로 이뤄져 있고 기능적 처리는 unicon과 연결된다. unicon의 기본 port가 8080으로 설정되어 있기 때문에 이 부분만 연결해주면 외부 웹서버로 연결하는 것도 당연히 가능하다.

아래는 아파치를 사용하는 상황에서의 설정 방법이다. 내용중 LimitRequestBody를 잊지말고 해주는 것이 좋다. 아니면 push에서 오류를 만날 수 있다.

```apacheconf
<VirtualHost *:80>
  ServerName your.domain
  ServerSignature Off

  ProxyPreserveHost On

  <IfModule !mod_proxy.c>
    LoadModule proxy_module modules/mod_proxy.so
  </IfModule>
  <IfModule !proxy_http_module.c>
    LoadModule proxy_http_module modules/mod_proxy_http.so
  </IfModule>

  <Location />
    Order deny,allow
    Allow from all
    # push 전송시 용량 문제를 막기 위해 지정 : error: RPC failed; result=22, HTTP code = 413
    LimitRequestBody 52428800

    ProxyPassReverse http://127.0.0.1:8080
  </Location>

  RewriteEngine on
  RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-f
  RewriteRule .* http://127.0.0.1:8080%{REQUEST_URI} [P,QSA]

  # needed for downloading attachments
  DocumentRoot /opt/gitlab/embedded/service/gitlab-rails/public
</VirtualHost>
```

그리고 `/etc/gitlab/gitlab.rb`에 아래의 내용을 추가한다.

```ruby
nginx['enable'] = false
```

그리고 재설정.

```bash
sudo gitlab-ctl reconfigure
```
### 예시

내가 설정한 설정을 예로 보자면 아래와 같다.

```ruby
external_url 'http://git.asamaru.net'
nginx['enable'] = false
```

이렇게 설정하면 위 주소로 접속시 gitlab 화면을 볼 수 있다.

## 첨언

이건 gitlab과 직접적인 관련이 있는 내용은 아니나 도움이 될까해서 적어둔다. gogs나 gitlab 모두 ssh 주소와 http 주소를 제공한다. 별도 설정을 하지 않는한 ssh 주소를 사용할 경우에는 shell 계정으로 push를 하게되고 http 주소를 사용할 경우는 해당 클라이언트(사용자 컴퓨터)의 git 설정에 있는 사용자명으로 push를 해준다. 따라서 이 사용자명을 바꾸고 싶다면 아래의 명령으로 수정할 수 있다. 단, OSX 기준이다. 아마도 linux는 같을 것이라고 보는데... 윈도우는 사용하질 않아서 잘 모르겠다. 윈도우도 git 사용자명 변경에 관련된 검색을 하면 많이 나올테니 쉽게 해결하리라 본다.

```bash
git config --global user.name "사용자명"
git config --global user.email "사용자 이메일"
```

이 사용자명(특히 이메일)을 gitlab에 가입된 user와 맞춰주면 변경사항 기록시 서로 연결된다. 따라서 그냥 설정할 것이 아니라 Gitlab 설치와 기본 설정 후 사용할 계정으로 가입 후 그 계정에 맞게 맞추는 것을 권장한다. 나의 경우엔 이메일만 연관이 있고 user는 달라도 상관은 없었다(정확한 기준은 확인해 보지 못했고 실수로 다르게 넣었는데 이메일이 같으니 알아서 연결해 주더라).
사실 Gitlab에서 프로젝트를 생성하고 최초 commit/push 전에 나오는 안내화면에 관련 설정 부분을 안내해 주고 있다.
