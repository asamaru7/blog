---
layout: "post"
title: "ssh proxy를 이용한 git 사용하기"
date: "2016-03-07T20:28:24+09:00"
comments: true
categories: git
---

앞서 [CentOS에 gogs 설치하기](/2015/09/21/how-to-install-gogs-on-centos/),
[CentOS에 Gitlab 설치하기](/2015/09/22/how-to-install-gitlib-on-centos/), [자체 설치한 gitlab-ce에서 gitlab.com으로 이전하다](/2015/10/12/gitlab-ce-to-gitlab-dot-com/)에서 언급했던 것처럼 git 저장소로 [gitlab.com](https://gitlab.com/)을 사용중이다. 한동안은 아무 문제없이 잘 사용하고 있었다. 아니 사실 gitlab.com에 접속이 되지 않는 문제가 간헐적으로 발생했었다. 얼마전까지만 하더라도 해외 서비스에서 서비스되는 사이트라서 그런가보다 했다.

그런데 몇일 전부터 회사 네트워크에서 [gitlab.com](https://gitlab.com/)에 접속할 수 없었다. 웹사이트뿐 아니라 git push/pull도 할 수가 없었다. 처음엔 회사 네트워크 방화벽 문제인 줄 알고 확인했으나 아니었다. 그래서 tracepath로 확인해 보니 SK Broadband 네트워크를 벗어나지 못하고 있었다(회사 네트워크가 SK다). 이상해서 조금 검색해보니 예전부터 SK Broadband의 해외 사이트 접속 문제가 유명했던 것 같다. 사람들의 이야기를 봐도 SK에 이야기한다고 해결될 문제는 아닌 것 같고... 그렇다고 git를 사용하지 않을 수 없어서 다른 방법을 찾아야 했다.

다행히 회사엔 외부망(SK가 아닌)에 연결된 Proxy가 하나 있다. 그래서 그 Proxy를 사용해서 급한대로 gitlab.com에 push/pull 하고 있다. 조금 더 기다려볼 생각이지만 빠른 시일 내에 접속이 복구되지 않는다면 다시 설치형 gitlab을 검토해야 할 것 같다.

---

본론으로 들어가서 위의 이유로 인해 사용하게된 ssh proxy에 대한 처리 방법을 설명하려고 한다. 이번에 필요에 의해 적용한 환경은 CentOS 7과 OSX 10.11 이다.

**CentOS 7**

`~/.ssh/config` 파일에 아래의 내용을 추가 한다.

```
Host gitlab.com
    User                    git
    ProxyCommand            socat STDIO SOCKS4:[proxy ip]:%h:%p,socksport=[proxy port]
```

여기서 중요한 부분. `socat`이 설치되어 있어야 한다. 설치되어 있지 않다면 간단히 `yum install socat`을 통해 설치할 수 있다.

그리고 `SOCKS4`는 Proxy의 프로토콜에 따라 변경되어야 한다. 사실 내가 사용한 Proxy는 `SOCKS5`를 사용하는데 `SOCKS5`를 지정하면 오류가 나고 `SOCKS4`를 지정해야만 정상 동작했다. 기타 프로토콜의 경우는 [socat](http://www.dest-unreach.org/socat/)를 참고.

위 처리를 하고나면 "gitlab.com" 도메인에 대해서는 ssh 접속시 지정한 Proxy를 사용한다. 따라서 git 명령을 사용하면 Proxy를 통해서 데이터가 전달된다. 단, ssh를 사용해서 git remote가 연결된 경우에.


**OSX**

OSX 또한 `~/.ssh/config` 파일에 아래의 내용을 추가 한다.

```
Host gitlab.com
    User                    git
    ProxyCommand            nc -X 5 -x [proxy ip]:[proxy port] %h %p
```

OSX도 CentOS와 방법은 동일하나 socat 대신 nc([netcat](http://netcat.sourceforge.net/))를 사용하고 있다. nc가 기본적으로 설치되어 있어서 그냥 nc를 사용했다. 어짜피 원리는 같다.
nc의 경우는 -X 뒤에 있는 5가 Proxy 프로토콜을 뜻한다.

> -X proxy_version
>             Requests that nc should use the specified protocol when talking to the proxy server.  Supported protocols are "4" (SOCKS v.4), "5"
>             (SOCKS v.5) and "connect" (HTTPS proxy).  If the protocol is not specified, SOCKS version 5 is used.

**PHPStorm**

덤으로 PHPStorm과 같은 IntelliJ IDE에서의 설정을 설명한다. 기본적으로 IntelliJ는 Git의 ssh 클라이언트를 Built-in을 사용한다. 이 설정을 Native로 바꿔주면 위에서 설정한 `~/.ssh/config` 파일의 설정을 그대로 적용시킬 수 있다. 메뉴의 위치는 "Preference > Version Control > Git"에서 "SSH executable"를 찾으면 된다.

---

위 방법은 ssh의 설정을 이용한 방법이지만 git의 설정한 방법도 있다. 개인적으로 git에 설정하는게 더 복잡해서 그냥 ssh에 설정하는 것을 선택했을 뿐이다.

**참고글**

* [Tutorial: how to use git through a proxy](http://cms-sw.github.io/tutorial-proxy.html)
* [Using git through a SOCKS proxy (or SSH tunnel)](http://www.jones.ec/blogs/a/entry/using_git_through_a_socks/)
