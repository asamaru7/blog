---
layout: post
title: "SSH를 사용해서 mysqldump 하기"
date: 2016-01-27T19:57:47+09:00
comments: true
categories: linux
---
[SSH 비밀번호 입력없이 로그인하기](/2016/01/26/ssh-login-without-password/)에 이어서 ssh를 이용해서 MySql 원격 서버의 데이터를 로컬로 dump 받는 방법을 소개하려고 한다.

"굳이 이런 방법이 왜 필요한가?"에 대한 의문이 생길 수 있으니 상황부터 설명해야 할 것 같다.
mysqldump를 사용하고자 할 경우 mysql client가 설치되어 있어야 한다. CentOS기준으로 mysql은 "mysql", mariadb 기준으로 보자면 "MariaDB-client" 패키지가 설치되어 있어야 한다. 그런데 이 패키지가 설치되지 않은 상태에서 mysqldump를 사용하고자 하는 것이다. 간단히 생각하면 위 패키지를 설치하면 끝인데 굳이 자주 사용되지 않을 기능 때문에 패키지를 설치하고 싶지 않다면 아래에 소개할 내용이 필요하다. 굳이 필요할까 싶지만 성격 문제인지 패키지를 설치하는 것이 싫어서 이렇게 하고 있다.

```bash
ssh [user]@[host] "mysqldump -uroot --default-character-set=utf8 --skip-triggers --compress [db name] [table name]" > [save file]
```

[SSH 비밀번호 입력없이 로그인하기](/2016/01/26/ssh-login-without-password/)에서 설명했던 공개키 등록이 선행되어 있어야 한다. 아니면 sshpass를 활용하는 방법도 당연히 가능하다.

지난 글과 겹치는 내용이긴하나 이렇게도 사용할 수 있다는 소개 차원에서 글을 남긴다.
