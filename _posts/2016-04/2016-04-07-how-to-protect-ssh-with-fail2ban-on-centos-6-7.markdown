---
layout: post
title: "SSH 무작위 로그인 시도 막기(With Fail2Ban on CentOS 6/7 + selinux)"
date: 2016-04-07 21:03:32 +09:00
comments: true
categories: linux
---
linux 서버를 공개망에서 사용하면서 방화벽을 사용하지 않는 경우 ssh 로그인을 지속적으로 시도하는 로그를 볼 수 있다. 대부분 외국 IP 대역에서 지속적으로 ssh 로그인을 시도하는데 무작위 비밀번호를 대입하는 것이다. 당연히 방화벽을 설정하는 것이 당연하나 특수한 목적으로 인해 접속 IP 대역을 제한할 수 없는 경우도 있을 수 있다. 이런 경우에 보안을 조금이나마 강화하기 위해 사용할 수 있는 것이 [fail2ban](http://www.fail2ban.org/) 이다.

우선 실제로 해당 서버에 어떤 IP들이 ssh 로그인을 시도했는지 아래의 명령으로 확인 할 수 있다(이하는 CentOS 7 기준이다).

아래는 로그인 시도 IP를 확인하는 방법이다.

```bash
$ ls /var/log/secure | xargs grep -E "[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+" -o | sort | uniq
```

공개망에 연결된 서버라면 생각보다 많은 IP가 나와 놀랄수도 있다. IP들 중 자신이 아는 IP를 제외하면 대부분이 위에 언급한 공격일 확률이 높다.

다른 방법으로 아래와 같이 최근 로그인 실패 기록을 확인하는 것도 가능하다.

```bash
$ last -f /var/log/btmp | more
```

[20 Linux Log Files that are Located under /var/log Directory](http://www.thegeekstuff.com/2011/08/linux-var-log-files/)에 보면 `/var/log/btmp`에 대한 설명을 확인 할 수 있다.

상황을 확인 했으니 이제 본격적으로 [fail2ban](http://www.fail2ban.org/)을 사용해 보자.

---

### fail2ban 설치

fail2ban은 지정된 시간 내에 지정된 횟수 이상으로 ssh 로그인을 실패하면 해당 IP에서의 접근을 지정된 시간만큼 차단하는 역할을 한다.

아래의 설치 과정은 CentOS 7을 기준으로 한다. 이는 iptables 대신 firewalld가 사용되며 systemd를 사용하는 것을 기준으로 한다는 뜻이다. CentOS 6이라면 아래의 참고자료를 살펴보기 바란다.

```bash
# epel-release 추가
$ rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

# fail2ban 설치
$ yum install -y fail2ban

# fail2ban 기본 설정
$ hostname=`/bin/hostname`
$ echo "[DEFAULT]" > /etc/fail2ban/jail.local
# 1시간 동안 접근 제한
$ echo "bantime = 3600" >> /etc/fail2ban/jail.local
# 결과 수신 메일 지정
$ echo "destemail = ~~~@~~~.com" >> /etc/fail2ban/jail.local
# 결과 발신 메일 지정
$ echo "sender = root@$hostname" >> /etc/fail2ban/jail.local
$ echo "" >> /etc/fail2ban/jail.local
# ssh 접근 검사 활성화
$ echo "[sshd]" >> /etc/fail2ban/jail.local
$ echo "enabled = true" >> /etc/fail2ban/jail.local
# nginx-http-auth 접근 검사 활성화 : 필요시에만 사용
$ echo "" >> /etc/fail2ban/jail.local
$ echo "[nginx-http-auth]" >> /etc/fail2ban/jail.local
$ echo "enabled = true" >> /etc/fail2ban/jail.local
```

**fail2ban 서비스 활성**

```bash
$ systemctl enable fail2ban.service
```

**fail2ban 서비스 시작**

```bash
$ systemctl start fail2ban.service
```

### selinux 사용시 fail2ban 관련 설정

이하는 selinux 사용시에만 적용하면 된다.

```bash
$ checkmodule -M -m -o fail2ban-syslog.mod fail2ban-syslog.te
$ semodule_package -o fail2ban-syslog.pp -m fail2ban-syslog.mod
$ semodule -r fail2ban-syslog
$ semodule -i fail2ban-syslog.pp
$ rm -f fail2ban-syslog.mod
$ rm -f fail2ban-syslog.pp
$ semodule -l|grep fail2ban-syslog

$ checkmodule -M -m -o logrotate-fail2ban.mod logrotate-fail2ban.te
$ semodule_package -o logrotate-fail2ban.pp -m logrotate-fail2ban.mod
$ semodule -r logrotate-fail2ban
$ semodule -i logrotate-fail2ban.pp
$ rm -f logrotate-fail2ban.mod
$ rm -f logrotate-fail2ban.pp
$ semodule -l|grep logrotate-fail2ban
```

아래의 2개의 파일은 위 스크립트 실행에 필요한 파일이므로 해당 파일명으로 저장해서 사용하면 된다.

**fail2ban-syslog.te**

```
module fail2ban-syslog 1.0;

require {
type syslogd_var_run_t;
type fail2ban_t;
class dir read;
class file read;
class file open;
class file getattr;
}

#============= fail2ban_t ==============
allow fail2ban_t syslogd_var_run_t:dir read;
allow fail2ban_t syslogd_var_run_t:file read;
allow fail2ban_t syslogd_var_run_t:file open;
allow fail2ban_t syslogd_var_run_t:file getattr;
```

**logrotate-fail2ban.te**

```
module logrotate-fail2ban 1.7;

require {
type fail2ban_client_exec_t;
type logrotate_t;
type init_var_lib_t;
class file { open read execute getattr write create execute_no_trans setattr unlink ioctl rename};
}

#============= logrotate_t ==============
allow logrotate_t fail2ban_client_exec_t:file execute_no_trans;
allow logrotate_t fail2ban_client_exec_t:file { open read execute ioctl };
allow logrotate_t init_var_lib_t:file { open read getattr write create unlink setattr rename };
```

---------

설치가 다 되었다면 아래의 명령 실행시 다음과 비슷한 결과를 볼 수 있다.

```bash
$ firewall-cmd --direct --get-all-rules

ipv4 filter INPUT 0 -p tcp -m multiport --dports ssh -m set --match-set fail2ban-sshd src -j REJECT --reject-with icmp-port-unreachable
```

그리고 아래의 명령으로 적용 상황을 확인할 수 있다.

```bash
# fail2ban 상태 확인
$ fail2ban-client status sshd

Status for the jail: sshd
|- Filter
|  |- Currently failed:	1
|  |- Total failed:	153
|  `- File list:	/var/log/secure
`- Actions
   |- Currently banned:	0
   |- Total banned:	2
   `- Banned IP list:

# ipset에 설정(차단)된 내용 확인
$ ipset --list

Name: fail2ban-sshd
Type: hash:ip
Revision: 1
Header: family inet hashsize 1024 maxelem 65536 timeout 3600
Size in memory: 16656
References: 1
Members:

# fail2ban 로그 확인
$ cat /var/log/fail2ban.log

# 차단 IP 목록
$ awk '($(NF-1) = /Ban/){print $NF}' /var/log/fail2ban.log | sort | uniq -c | sort -n
```

---

### 참고자료

* [fail2ban-client commands](http://www.fail2ban.org/wiki/index.php/Commands)
* [selinux module for fail2ban on Centos/RHEL 7](https://krash.be/node/27)
* [How To Protect SSH With Fail2Ban on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-centos-7)
* [How To Protect SSH with fail2ban on CentOS 6](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-centos-6)
* [HOW TO INSTALL FAIL2BAN ON CENTOS](http://www.servermom.org/install-fail2ban-centos/1809/)
* [Fail2ban with FirewallD](https://fedoraproject.org/wiki/Fail2ban_with_FirewallD)
* [System: Monitoring the fail2ban log](http://www.the-art-of-web.com/system/fail2ban-log/)
