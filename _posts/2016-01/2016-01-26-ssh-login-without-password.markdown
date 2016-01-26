---
layout: post
title: "SSH 비밀번호 입력없이 로그인하기"
date: 2016-01-26T21:15:08+09:00
comments: true
categories: linux
---

ssh 사용시 매번 비밀번호를 입력하는 것은 귀찮은 일이다. 그럼에도 불구하고 ssh의 기본 기능에 비밀번호를 미리 입력하는 기능을 제공하지 않는 것은 보안 상의 이유 때문일 것이다. 하지만 비밀번호를 입력하는 귀찮음을 해소하는 것 외에도 스케쥴링 처리 스크립트 등에서 사용자의 비밀번호 입력없이 ssh 접속을 해야할 경우가 있다. 이런 경우에 대비해서 ssh에서는 클라이언트의 공개키를 원격 서버에 미리 등록 시켜두는 방식으로 비밀번호 없이 접속할 수 있는 방법을 제공한다. 사실 이 방법이 보안 상으로도 안전한 편이고 등록하는 과정도 크게 복잡하지 않으므로 가장 권장되는 방법이라고 할 수 있다.

그렇다고 이 방법 외에는 대안이 없는 것은 아니다. `expect` 명령을 이용해서 비밀번호 입력을 자동화하는 방법과 [sshpass](http://sourceforge.net/projects/sshpass/)를 사용하는 방법이 있다. 사실 [sshpass](http://sourceforge.net/projects/sshpass/)를 몰랐을 때는 `expect`를 주로 사용했는데 [sshpass](http://sourceforge.net/projects/sshpass/)를 사용하면 훨씬 쉽게 다양한 일을 할 수 있다.

자.. 이제부터 하나씩 방법을 설명하고자 한다. 아래는 CentOS 기준이며 기타 리눅스에서도 거의 동일한 것으로 알고 있다.

### 1. 공개키 등록 방식

우선 `~/.ssh/id_rsa.pub`에 파일이 존재하는지 확인한다. 없다면 아래와 같이 `ssh-keygen`을 사용해서 개인용 개인키/공개키를 생성한다.

```bash
ssh-keygen -t rsa
```

위 명령을 입력하면 몇가지를 물어보는데 특별한 이유가 없다면 그냥 엔터를 계속 눌러서 완료하면 된다.
이렇게 생성하고나면 개인키는 `~/.ssh/id_rsa`로 공개키는 `~/.ssh/id_rsa.pub`로 생성된다.

이제는 공개키를 접속하려는 원격 서버에 등록해야 한다.
아래와 같이 직접 해당 서버로 복사하는 방법이 있다.

```bash
scp ~/.ssh/id_rsa.pub [user]@[host]:~/.ssh/authorized_keys
```

그런데 이렇게하면 기존 파일이 존재할 경우 덮어쓰게 되므로 권장하지 않는다. 대신 아래와 같이 `ssh-copy-id`를 사용하는 것을 권장한다. `ssh-copy-id`를 사용하면 원격 서버에 `authorized_keys` 파일이 없다면 생성해주고 있다면 공개키를 추가해 준다.

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub [user]@[host]
```

여기까지 완료 했다면 비밀번호 없이 ssh 접속이 가능해야 한다.
그런데 간혹 작업을 완료했음에도 불구하고 계속 비밀번호를 물어보는 경우가 있다. 그런 경우는 대부분 원격 서버의 `authorized_keys` 파일 퍼미션 문제다. 원격 서버에서 퍼미션을 아래와 같은지 확인하고 맞지 않다면 변경해 준다. 대부분의 경우는 접속 문제가 해결된다.

```bash
chmod 700 ~/.ssh/
chmod 600 ~/.ssh/authorized_keys
```

### 2. [sshpass](http://sourceforge.net/projects/sshpass/)를 사용하는 방식

[sshpass](http://sourceforge.net/projects/sshpass/)는 ssh와는 직접적인 관련이 없는 프로그램으로 별도 설치가 필요하다. 설치되어 있지 않다면 아래와 같이 설치한다.

```bash
yum --enablerepo=epel -y install sshpass
```

기본적인 사용은 아래와 같이 할 수 있다.

```bash
sshpass -p[password] ssh -o StrictHostKeyChecking=no [user]@[host]
```

위 방식은 서두에서도 이야기 했듯이 비밀번호가 명령 상에 노출되므로 보안상으로는 좋지는 않다. 하지만 필요할 때가 있으니 알아두면 요긴하게 쓰이리라 생각한다. 그리고 [sshpass](http://sourceforge.net/projects/sshpass/)는 접속시 비밀번호를 자동 입력해주는 역할 외에 다음과 같은 일도 할 수 있다.

```bash
# 원격 서버에서 command 실행
sshpass -p[password] ssh -o StrictHostKeyChecking=no [user]@[host] [command]
# 원격 서버로 test.txt 파일 복사(scp)
sshpass -p[password] scp -o StrictHostKeyChecking=no test.txt [user]@[host]:~/test.txt
```

### 3. expect를 사용하는 방식

[sshpass](http://sourceforge.net/projects/sshpass/)를 사용하면 이 방식은 크게 의미가 없다. 하지만 sshpass를 사용할 수 없는 상황이다. expect를 활용해서 다른 곳에 응용할 수 있으니 참고 차원에서 ssh 자동 로그인 스크립트를 남긴다.

**sshlogin** 파일로 아래의 내용을 저장하고 실행 권한을 준다.

```bash
#! /usr/bin/expect
set idNhost [lrange $argv 0 0]
set password [lindex $argv 1]
spawn ssh $idNhost
expect -re "password: "
send "$password\r"
interact
```

사용법은 다음과 같다.

```bash
./sshlogin [user]@[host] "[password]"
```
