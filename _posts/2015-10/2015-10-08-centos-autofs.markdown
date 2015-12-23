---
layout: post
title: "CentOS autofs"
date: 2015-10-08 12:04:05 +0900
comments: true
categories: linux
---
## 설치
```bash
yum install -y autofs
```

## 설정
```bash
# 서버 부팅시 자동 시작
/sbin/chkconfig --add autofs
/sbin/chkconfig --level 35 autofs on
```
## mount 설정
```bash
vi /etc/auto.master

/home/nfsusers   /etc/auto.users --timeout 60

vi /etc/auto.users
yyj -rw,vers=3,udp,nolock   192.168.11.99:/czdev/vagrant/work/web

service autofs restart
```

## 관리
```bash
# 데몬 재시작
service autofs restart

# 상태 확인
service autofs status

# 설정 다시 일기
service autofs reload
```

## Troubleshooting
```bash
# 동작 로그 보기
service autofs stop
automount -f -v
```