---
layout: post
title: "sftp-only 사용자 추가 (CentOS 7)"
date: 2015-12-09 11:17:23 +0900
comments: true
categories: linux
---
linux 서버를 운영하면서 sftp가 필요한 경우가 있다. 일반 계정이라면 sftp로 그냥 접속하면 되지만 특정 사용자에게 shell 접속은 차단하고 파일 업/다운로드만 제공해야 하는 상황이 있을 수 있다. 파일 전송을 주로 해야하는 서버가 아니라면 이런 경우를 위해 ftp 데몬을 구동하는 것도 부담스럽다. 이런 경우라면 sftp 전용 사용자를 추가하는 방법을 사용할 수 있다.

우선 아래의 과정을 보자. 미리 이야기 하지만 아래의 설정 과정은 앞으로 설명하는 요구 사항에 맞추어 작성된 것이다. 따라서 그룹 설정, home directory 설정 등 여러가지 설정들은 자신에게 맞게 변경해도 된다. 단, 설정을 잘못하면 실제로 접속시에 오류가 날 수 있으니 내용을 이해하고 사용하기를 당부한다.

```bash
$ /sbin/groupadd sftp
$ /usr/sbin/useradd -g sftp [username] -d [user home directory] -s /bin/false
$ echo "[password]" | passwd --stdin [username]

$ chown -R [username].sftp [user home directory]
$ chown root [user home directory]
$ chmod 755 [user home directory]

$ sed -i "s/Subsystem[[:space:]]*sftp/#Subsystem   sftp/g" /etc/ssh/sshd_config

$ echo "" >> /etc/ssh/sshd_config
$ echo "Subsystem   sftp    internal-sftp" >> /etc/ssh/sshd_config
$ echo "" >> /etc/ssh/sshd_config
$ echo "Match Group sftp" >> /etc/ssh/sshd_config
$ echo "    ChrootDirectory %h" >> /etc/ssh/sshd_config
$ echo "    AllowTcpForwarding no" >> /etc/ssh/sshd_config
$ echo "    X11Forwarding no" >> /etc/ssh/sshd_config
$ echo "    ForceCommand internal-sftp" >> /etc/ssh/sshd_config

$ setsebool -P ssh_chroot_rw_homedirs on

$ systemctl restart sshd.service
```

이제 하나씩 살펴보자

* `/sbin/groupadd sftp` : sftp라는 사용자 그룹을 추가한다. 필요없다면 하지 않아도 되고 다른 이름을 사용해도 된다. 나의 경우는 sftp 전용 사용자들을 묶어서 관리하기 위해 sftp라는 그룹을 추가한 것이다.

* `/usr/sbin/useradd -g sftp [username] -d [user home directory] -s /bin/false`
  * `-g sftp` : sftp 그룹에 사용자를 추가한다.
  * `[username]` : 원하는 사용자명을 입력한다.
  * `-d [user home directory]` : 사용자의 home directory를 지정한다. 이 옵션은 지정하지 않아도 상관없다. 미지정시 일반 계정을 생성할 때와 동일하게 지정된다(일반적으로 /home/[username]).     그리고 이미 directory가 생성되어 있다면 `-d [user home directory]`를 지정하지 않고 `-M`을 사용하여 home directory 생성을 건너뛸 수 있다.
  * `-s /bin/false` : 이 사용자는 shell로 접속할 수 없음을 지정한다.


* `$ echo "[password]" | passwd --stdin [username]` : 추가한 사용자 계정의 비밀번호를 입력한다. 일반적으로 비밀번호를 추가하는 방식으로 그냥 `passwd`를 사용해도 되나 나의 경우는 자동으로 처리하는 스크립트를 만들려고 하다보니 이런 방식을 사용한 것이다.

* `chown -R [username].sftp [user home directory]` : 사용자가 접속하게 될 폴더의 하위 파일의 소유자를 변경한다. 이 명령도 사용자 추가시 기존에 있던 폴더를 home directory로 지정한 것이 아니라면 실행하지 않아도 된다.

* `chown root [user home directory]` : 나중에 `ChrootDirectory`를 적용하려면 home directory의 소유자가 root가 되어야 한다. 이유는 chroot()에서 root가 소유한 directory를 요구하기 때문이다. 관련 내용은 [OpenSSH SFTP chroot() with ChrootDirectory](https://www.debian-administration.org/article/590/OpenSSH_SFTP_chroot_with_ChrootDirectory)에 나와 있다.

* `chmod 755 [user home directory]` : `ChrootDirectory` 적용시 소유자를 root로 변경하는 것과 함께 권한도 755로 변경해야 한다. 이렇게되면 사용자의 home directory에서는 쓰기 권한을 제거한 것이므로 하위에 폴더를 더 만들어서 소유자를 `[username]`로 변경하거나 쓰기 권한을 줘야한다(사용자는 해당 폴더들에서 쓰기를 할 수 있다). 이 부분이 상당히 불편할 수 있는 부분인데 chroot 적용이 되려면 보안상 쓰기 권한을 줄 수 없기 때문에 어쩔 수 없다. 사실 나도 이 부분을 제대로 몰라 한참을 고생한 적이있다.

* `sed -i "s/Subsystem[[:space:]]*sftp/#Subsystem   sftp/g" /etc/ssh/sshd_config` : `/etc/ssh/sshd_config` 파일에서 `Subsystem   sftp` 설정 부분을 주석 처리한다. 직접 파일을 열어서 해당 내용을 주석 처리해도 된다.

* echo section : 이 부분은 `/etc/ssh/sshd_config`에 필요한 부분을 추가하는 과정이다. 꼭 이렇게 해야하는 것은 아니고 직접 파일을 열어서 수정해도 된다. 그리고 나는 그룹 단위로 제어하기 위해서 `Match Group sftp`를 사용했지만 사용자 단위로 지정하려면 `Match User [username]`의 형식을 사용해도 된다.
  * `ChrootDirectory %h` : 이 설정은 chroot를 사용자 home directory로 지정하는 것이다. `%h` 대신 특정 경로를 직접 지정해도 된다.


* `setsebool -P ssh_chroot_rw_homedirs on` : 이 부분은 selinux를 사용할 경우에만 해당된다. chroot가 적용된 home directory에 읽기/쓰기를 할 수 있도록 권한을 열어준다. 그런데 테스트 해보니 이 명령은 하지 않아도 파일 업로드는 이상이 없다. 대부분의 경우에 이 옵션을 주도록 설명하고 있어 추가는 해 두었지만 sftp 전용으로 계정을 사용할 경우는 사용하지 않아도 되는 것으로 보인다. 따라서 지정하지 않은 상태에서 업로드를 테스트 해보고 이상이 없다면 처리하지 않아도 되지 않을까 생각한다.

* `systemctl restart sshd.service` : 설정이 완료되었으므로 sshd를 재시작 해주면 바로 사용할 수 있다. `[username]` 계정으로 접속(`sftp [username]@127.0.0.1`)해서 테스트 해보고 이상이 없다면 완료된 것이다.
