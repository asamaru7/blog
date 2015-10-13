---
layout: post
title: "리눅스 명령어 모음(Centos 6)"
date: 2015-10-08 11:44:32 +0900
comments: true
categories: linux
---
아래의 내용은 개인적으로 간혹 사용이 필요한 내용을 기록해 두기 위한 것으로 잘못된 정보일 수 있으니 참고만 하기 바란다.

### 시스템 로그 삭제

```bash
/etc/init.d/rsyslog restart
```

### sl 인증서 + apache 시작시 비밀번호 입력 제거

```bash
openssl rsa -in key.pem -out key.nopw.pem
```

### ssh 접속자 강제 로그아웃
```bash
# 602 : userid
pkill -KILL -u 602
```

### bash script에서 실행경로 구하기
```bash
cd ${0%/*} 2>/dev/null
echo $PWD/${0##*/}
```

### 서버 네트워크 상태 확인
```bash
netstat -an|grep ":80"|awk '/tcp/ {print $6}'|sort -nr| uniq -c
```

### 아파치 동시접속자 수 확인
```bash
netstat -anp | grep :80 | grep ESTAB | wc -l
```

### 권한 파일 찾기 / 바꾸기
```bash
# root 권한 파일 찾기
find . -uid 0

# chown 특정 사용자만 변경
chown web.usergroup * -R --from=root.root
chown --from=511 -R web account/
```

### 포트 강제로 죽이기
```bash
sudo fuser -k -n tcp 444
```

### 실행 결과 숨기기(stdout, stderr)
```bash
명력어 > /dev/null 2>&1
```

### 검색된 파일만 vi 열기
```bash
vi -p $(find .|grep ModuleLink|grep -v '.svn'|grep -v CZFramework)
```

### 내용 일괄변환
```bash
find . -type f -name *.php -exec perl -pi -e 's|\\CZ\\CZFramework|\\CZF|g' {} \;
```

### ssh 비밀번호 없이 접속

#### local
```bash
ssh-keygen -t rsa
# scp /root/.ssh/id_rsa.pub root@[ip]:/root/.ssh/authorized_keys
ssh-copy-id -i ~/.ssh/id_rsa.pub admin@[ip]
```

#### 대상 서버(호스트)의 퍼미션
```bash
750 /home/admin/
700 /home/admin/.ssh/
600 /home/admin/.ssh/authorized_keys
```

### 배드블럭 검사
```bash
badblocks -v /dev/sda1
```

### 프로세스 실행경로 확인
```bash
# 프로세스 정보
ps ef
ps aux

# 프로세스 트리보기
pstree -aph

#프로세스 상세보기
lsof -P
```

### 아파치 :  모든 페이지 요청시 동일페이지 노출
```apacheconf
RewriteEngine On
RewriteRule ^(.*)$ /target/index.html
```

## Mysql 사용자 관리

#### 패턴
```mysql
grant all privileges on 디비명.테이블명 to 사용자@'접속지 주소' identified by '암호' (with grant option);
```

#### 권한 생성
```mysql
# 원격지에서 root로 접속하는 경우
grant all privileges on *.* to root identified by '암호' with grant option;

# '사용자'가 '암호'으로 모든 컴퓨터에서 모든 디비와 테이블에 접속하도록 허용
grant all privileges on *.* to 사용자 identified by '암호';

# '사용자'가 '암호'으로 localhost 에서 db1 디비의 table1에 접속하도록 허용
grant all privileges on root.db1 to 사용자@'localhost' identified by '암호';

# '사용자'가 '암호'으로 111.222.333.444 에서 db1 디비의 모든 테이블에 접속하도록 허용
grant all privileges on root.* to 사용자@'111.222.333.444' identified by '암호';

# '사용자'가 '암호'으로 111.222.333.0/24 에서 모든 디비와 테이블에 접속하도록 허용
grant all privileges on *.* to 사용자 @'111.222.333.%' identified by '암호';
```

#### 권한 제거
```mysql
revoke all on 디비명.테이블명 from 사용자;
```

#### 권한 적용
```mysql
# 모든 명령 후에 항상 아래 명령을 실행해야 실제로 적용된다.
flush privileges;
```

#### Connection 상태 확인하기
```mysql
SHOW FULL PROCESSLIST;
```

#### Connection 수 확인하기
```mysql
SHOW STATUS LIKE 'Threads_connected';
```

#### 동작중인 Connection 수 확인하기
```mysql
SHOW STATUS LIKE 'Threads_running';
```

#### Connection 상태 확인하기
```mysql
SHOW FULL PROCESSLIST;
```
