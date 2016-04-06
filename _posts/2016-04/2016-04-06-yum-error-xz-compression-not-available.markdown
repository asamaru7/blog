---
layout: "post"
title: "yum 실행시 Error: xz compression not available 오류가 날 경우"
date: "2016-04-06T19:37:12+09:00"
comments: true
categories: linux
---
yum을 사용하다 보면 아래와 같은 오류가 나는 경우가 있다.

```bash
$ yum update
Loaded plugins: fastestmirror
Setting up Install Process
Repository 'svn-wandisco' is missing name in configuration, using id
Loading mirror speeds from cached hostfile
 * base: ftp.daumkakao.com
 * epel: ftp.riken.jp
 * extras: ftp.daumkakao.com
 * updates: ftp.daumkakao.com
 * webtatic: sp.repo.webtatic.com
Error: xz compression not available
```

나의 경우엔 CentOS 6.7에서 실수로 CentOS 7용 EPEL 레포지토리를 설치한 후 이런 현상이 있었다.

해결 방법은 직접 레포지토리 정보를 지워주면 된다.

```bash
# epel 레포지토리 제거
rm -rf /etc/yum.repos.d/epel*

# epel cache 제거
rm -rf /var/cache/yum/x86_64/6/epel
```

EPEL이 필요하다면 다시 버전에 맞게 설치하면 된다.
