---
layout: post
title: "CentOS에 gogs 설치하기"
date: 2015-09-21 13:58:12 +0900
comments: true
categories: git
---
기존에는 SCM(source code management)으로 SVN을 주로 사용했다. 하지만 git를 사용하기 시작하면서 부터 git를 주로 사용하긴 했는데 주로 github를 통해서만 사용했다. 그런데 이번에 회사 프로젝트에서 필요한 부분이 있어 자체 호스팅을 하기 위해 기존에 봐뒀던 [gitlab](https://about.gitlab.com/)을 쓰려다가 [gogs](http://gogs.io/)를 알게 되면서 이걸 설치했다. gogs를 고른 이유는 간단하기 때문이다([GitHub vs GitLab vs Stash vs Gogs](https://blog.deimos.fr/2014/08/19/github-vs-gitlab-vs-stash-vs-gogs/)를 참고). 사실 아직 제대로 사용해보지 않아서 맞는지는 모르겠지만 gitlab은 ruby 기반이고 난 ruby 환경을 별로 좋아하지 않는다(내가 몰라서 그렇겠지만 이상하게 ruby 기반 프로젝트들은 설치/관리가 어려워서).

## git 설치

[How To Install Git on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-centos-7)를 참고하자. 다른 곳을 참조해도 당연히 무방하다. 난 사실 예전에 yum으로 git가 설치되어 있던 상황으로 이 단계는 건너뛰었다(게다가 나의 centos는 6이다).

## gogs 설치

기본적으로 설치방법은 [gogs Installation](http://gogs.io/docs/installation)에 잘 설명되어 있다. 하지만 centos가 없다. 조금 더 자세히 보면 대신 [Install from packages](http://gogs.io/docs/installation/install_from_packages.html)가 있다. 이곳의 설명/링크를 따라 [packager.io](https://packager.io/gh/pkgr/gogs)에 가면 설치 방법을 안내받을 수 있다.

찾아가는 수고를 덜어주기 위해 필요한 부분을 옮겨왔다. 2015.09.21 기준이므로 최신 내용을 확인하려면 위의 안내대로 사이트를 방문해서 안내받자.

```bash
sudo rpm --import https://rpm.packager.io/key
echo "[gogs]
name=Repository for pkgr/gogs application.
baseurl=https://rpm.packager.io/gh/pkgr/gogs/centos6/pkgr
enabled=1" | sudo tee /etc/yum.repos.d/gogs.repo
sudo yum install gogs
```

그냥 시키는대로 따라하면 설치는 간단히 완료된다. 단, gogs는 계정을 추가하는 부분이 있어 passwd, shadow 파일에 lock이 걸려있으면 아래와 같은 오류가 나며 제대로 설치가 되지 않는다.

```bash
Error in PREIN scriptlet in rpm package gogs-0.6.9-1442807350.69b1d65.centos6.x86_64
useradd: /etc/passwd을(를) 열 수 없습니다
```

일단 풀어주고 설치하자.

```bash
$ chattr -i /etc/passwd
$ chattr -i /etc/shadow
```

설치가 완료되면 다시 원상복구.

```bash
$ chattr +i /etc/passwd
$ chattr +i /etc/shadow
```

설치가 정상적으로 되었다면 아래의 파일이 존재할 것이다.`

```bash
ls /etc/init.d/gogs
la /home/gogs
```

그리고 나중에 ssh를 통한 clone을 사용할 예정이라면 설치 과정에서 추가된 gogs 계정의 비밀번호를 지정해 두어야 한다.

```bash
$ passwd gogs
```

## 환경구성

환경설정 파일은 ```/etc/gogs/conf/app.ini```에 있다. 하지만 최초 웹페이지 접속시 자동으로 설치 화면이 뜬다. 게다가 이 파일을 열어보면 상단에 절대로 수정하지 말라고 되어 있다. 따라서 그냥 웹에서 설정하자.

본격적으로 세팅을 하기 전에 주의사항이 있다. gogs는 DB가 있어야 된다. 따라서 mysql 또는 postgresql이 미리 설치되어 있어야 한다. 이건 뭐 굳이 여기서 설명하지 않아도 설치방법이 다른 곳에 많으니 설치가 되어 있다고 가정하고 설명한다.

### DB 설정

우선 DB를 세팅한다.

root 계정을 설정하는데 필요없다면 하지 않아도 된다. 기존에 DB가 이미 설치되어 있다면 당연히 이 부분이 처리가 되어 있을테니 하지 말자.
```bash
mysqladmin -u root password "${MYSQL_PASSWORD}"
mysqladmin -u root --password="${MYSQL_PASSWORD}" password "${MYSQL_PASSWORD}"
```

하지만 DB는 만들어 줘야 한다.
```bash
mysql -u root -p${MYSQL_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${APP_NAME}; use ${APP_NAME}; set global storage_engine=INNODB;"
```

**예시**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gogs; use gogs; set global storage_engine=INNODB;"
```

### WEB UI를 이용한 설정

그럼 본격적으로 설정을 시작하자.

http://userdomain:3000/

필요한 사항을 설정한다. 대부분 보면 뭘 해야할지 알 수 있다. 오류가 나면 해당 안내에 따라 설정하면 된다. 추후 설정에 변경이 필요하면 ```custom/conf/app.ini```파일에 필요한 설정만 override 하면 된다(나의 경우는 ```/opt/gogs/custom/conf/app.ini``` 파일이다. 이 파일 위치를 찾느라 한참을 헤멨다.). http://gogs.io/docs/installation/configuration_and_run.html 를 참고


### 도메인 연결

이제는 도메인 연결을 할 차례이다.

**httpd 2 기준**
```apache
<VirtualHost *:80>
  ServerName your.domain.com

  <IfModule !mod_proxy.c>
    LoadModule proxy_module modules/mod_proxy.so
  </IfModule>
  <IfModule !proxy_http_module.c>
    LoadModule proxy_http_module modules/mod_proxy_http.so
  </IfModule>

  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

나의 경우는 apache를 사용중이라 위와 같이 설정하면 되나 nginx를 사용하는 경우라면 아래를 참고하자(packager.io에 안내된 내용이다.).

**nginx**
```bash
cat > /etc/nginx/sites-available/default <<EOF
server {
  listen          80;
  server_name     ${HOSTNAME};
  location / {
    proxy_pass      http://localhost:6000;
  }
}
EOF
sudo service nginx restart
```

### 서버 시작시 자동시작

우선 서버 시작시 자동 시작 되도록 설정하자(필요하다면). 나의 경우 ```setup```으로 확인해보니 자동으로 들어가 있지 않았다. 그래서 아래와 같이 시도했다.

```bash
# 서버 부팅시 자동 시작
/sbin/chkconfig --add gogs
/sbin/chkconfig --level 35 gogs on
/sbin/chkconfig --list
```
첫줄부터 안된다. "gogs 서비스는 chkconfig 를 지원하지 않습니다"라고 오류를 내보낸다. 말그대로 gogs는 chkconfig를 지원하지 않는다. 해서 아래와 같이 서버 시작시 스크립트를 실행하도록 넣어 버렸다.

```bash
$ vi /etc/rc.d/rc.local

# 아래 줄을 추가
/etc/init.d/gogs start
```

### 설정시 유의 사항

설치는 위의 과정들을 통해 완료되었다. 하지만 제대로 써보려면 설정을 환경에 맞게 몇가지 조정하는 것이 좋다.

* ROOT 설정
```
[repository]
ROOT = /home/gogs
```
기본적으로 ROOT 부분은 ```ROOT = /home/gogs/gogs-repositories```로 되어 있지만 위 처럼 gogs-repositories 부분을 제거해 주는 것이 좋다. 나중에 레포지토리를 생성하게되면 clone 주소를 알려준다. 이때 http와 ssh 주소 두가지를 알려주는데 이때 ssh를 사용하게 되면 주소 부분이 맞지 않게된다. 예를들어 gogs@git.asamaru.net:root/test.git 이라는 주소로 생성된 경우 아래와 같이 clone을 시도할 것이다.

```bash
git clone gogs@git.corez.kr:root/test.git
```

하지만 아래와 같은 오류를 내며 정상적으로 clone이 되지 않는다.

```bash
fatal: 'root/test.git' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

다시 아래와 같이 해보면 정상적으로 clone 된다.

```bash
git clone gogs@git.corez.kr:gogs-repositories/root/test.git
```

ssh 주소를 사용하는 경우는 계정도 gogs를 사용하며 경로도 gogs의 home에서부터의 경로를 찾기 때문에 "gogs-repositories/"를 추가해 줘야하는 것이다. 이 주소를 일일이 넣는 것이 귀찮으므로 위에 설명한 것처럼 ROOT 경로를 변경해 버리는 것이 편하다. ssh 에서 home 경로를 바꿀 수도 있겠지만 이 방법이 더 나을 것으로 본다.
ROOT를 변경한 후 재시작하고 레포지토리를 만들면 아래의 예시처럼(gogs에서 안내되는 주소) clone을 받을 수 있다.

```bash
git clone gogs@git.corez.kr:root/test.git
```