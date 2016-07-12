---
layout: post
title: "PHP Composer : Private Repository / Proxy / 속도 향상(Toran Proxy를 사용한)"
date: 2016-07-04 20:09:16 +09:00
comments: true
categories: php
---

오늘은 [Composer](https://getcomposer.org/)에서 [Packagist](https://packagist.org/)가 아닌 private repository를 사용할 수 있도록 [Toran Proxy](https://toranproxy.com/)를 설정하는 방법을 설명하고자 한다. 사실 Toran Proxy 외에도 [Satis](https://github.com/composer/satis)라는 것도 있는데 관련된 내용은 [Handling private packages with Satis or Toran Proxy](https://getcomposer.org/doc/articles/handling-private-packages-with-satis.md)을 참고하길 바란다(Satis를 조금 더 편하게 사용하기 위한 라이브러리들도 몇가지가 있다. 사실 Satis가 더 유명하나 Toran Proxy가 더 사용하기 편할 것 같아 선택했다).

본 설명에 앞서 Toran Proxy를 이용함으로써 얻을 수 있는 이점부터 이야기 해보자. 내가 Toran Proxy를 설치한 이유기도 하다.

* private repository 운영할 수 있다.
* public proxy를 사용해서 composer의 속도를 올릴 수 있다.

오픈소스 프로젝트를 진행하는 것이 아닌 회사의 업무 등의 이유로 composer를 사용하는 경우라면 private project로 진행하는 것이 일반적일 것이다. 나의 경우는 [gitlab.com](https://gitlab.com/)에서 private project로 git를 사용하고 composer에는 아래와 같은 형식으로 사용하고 있었다.

```json
"require": {
  "company/project": "dev-master"
},
"repositories": [
    {
      "type": "git",
      "url": "git@gitlab.com:company/project.git"
    }
]    
```

이 방법은 project를 package로 배포하지 않고 최신 소스(커밋)를 composer에서 가져오도록 한 것이다. 이 경우 별도의 composer repository가 필요하지 않다. 다만, 버전을 별도로 관리할 수 없고 `composer update`가 느려진다. `composer update`가 느려지는 이유는 update시마다 해당 프로젝트의 composer.json을 읽어 변경사항을 확인하기 때문이다. 이렇게 사용하는 것이 한두개라면 모르겠지만 많다면 `composer update`를 실행 하기가 두려워질 정도로 느려진다(composer.json 파일을 매번 확인하는 데다가 [gitlab.com](gitlab.com) / [packagist.org](packagist.org)가 해외 서비스다 보니 네트워크가 느려서 더 심하다). composer 자체도 느린데 이런 문제까지 겹치니 감당 안된다. [php composer 속도 개선하기](/2016/03/17/php-composer-speed-up/)에서 언급한 방법들을 적용해도 이 문제에는 큰 효과가 없다.

composer에 관해서는 더 많은 이야기가 있을 수 있으나 본 글의 주제를 벗어 나므로 이쯤에서 줄이고 본격적으로 Toran Proxy 설치를 설명하겠다.

---

> Toran Proxy는 사실 유료다. 단, 개인 사용자에게는 개발자 1명까지 무료다(무료의 경우 기술 지원을 하지 않는다).

[Toran Proxy](https://toranproxy.com/)에서 [download 링크](https://toranproxy.com/download)를 누르면 다시 download 링크와 설치 방법에 대한 안내를 볼 수 있다.

아래는 내가 설치한 과정을 정리한 것이다. 실제로는 bash shell 스크립트로 작성되어 있는데 중요한 부분만 다시 정리한 것으로 작업 상에 약간의 차이가 있을 수 있다. 또한, CentOS 7에서 작업 했으며 사용자는 `web`, 사용자 그룹은 `usergroup`이며 사용자 root directory는 `/home/web/`이다. 따라서 자신의 환경과 맞지 않는 부분은 맞게 고쳐서 적용해야 한다.

```bash
# 소스를 다운 받아서 /home/web/에 압축을 푼다.
# 최신 버전이 1.5.1이 아닐 수 있으니 다운로드 링크는 웹사이트에서 복사하는 것을 권한다.
$ curl -LO https://toranproxy.com/releases/toran-proxy-v1.5.1.tgz
$ tar zxvf toran-proxy-v1.5.1.tgz -C /home/web/

# 해당 폴더로 가서
$ cd /home/web/toran
# 기본 설정 파일을 만든다.
$ cp app/config/parameters.yml.dist app/config/parameters.yml

# 아래의 app/config/parameters.yml의 설정은 직접 해당 파일을 열어서 수정해도 된다.
# 나의 경우는 shell 스크립트로 제작하면서 아래와 같이 처리한 것이다.

# project hash키를 난수로 만들어 넣어준다.
$ hashkey=`php -r "echo sha1(rand());"`
$ sed -i "s/ThisTokenIsNotSoSecret-Change-I/$hashkey/g" app/config/parameters.yml
# https를 사용하도록 설정한다. 기본은 http이나 나중에 composer에서 쉽게 사용하려면 https를 사용하는 것이 좋다.
sed -i "s/toran_scheme:\s*http$/toran_scheme: https/g" app/config/parameters.yml
# private repository로 사용할 도메인을 지정한다.
sed -i "s/toran_host:\s*example.org$/toran_host: your-private-repository.com/g" app/config/parameters.yml

# 필요한 디렉토리를 생성하고 권한을 부여한다.
chmod 777 app/toran app/cache app/logs web/repo app/bootstrap.php.cache
mkdir -p app/toran/cache web/repo/packagist/ web/repo/private/
chmod 777 app/toran/cache web/repo/packagist/ web/repo/private/
chown web.usergroup -R /home/web/toran
```

여기까지가 기본 설치 과정이다. 하지만 사용을 위해서는 설정할 것들이 많이 남았다. 이 상태에서 `php bin/cron -v`를 실행하면 아래와 같은 결과가 나올 것이다.

```bash
$ php bin/cron -v
You need to setup a GitHub OAuth token because Toran makes a lot of requests and will use up the API calls limit if it is unauthenticated
Head to https://github.com/settings/tokens/new to create a token. You need to select the public_repo credentials, and the repo one if you are going to use private repositories from GitHub with Toran.
Token:
```

안내에 설명되어 있는 것과 같이 [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new) 에 가서 개인용 ssh token을 생성해서 넣어야 한다. 생성시 어떤 권한을 부여할지 선택하는 화면이 나오는데 다른 것은 필요 없고 `public_repo`만 선택해서 생성하면 된다. 사실 일반적인 경우라면 composer 사용시 미리 받아 놓은 token이 있을테니 그걸 사용해도 된다. 보통 `~/.composer/auth.json` 또는 `~/.config/composer/auth.json`에 등록이 되어있다.

token을 입력하면 `app/toran/composer/auth.json`에 파일이 생성된다. 여기서는 github에 대한 token만 등록하도록 물어보는데 나의 경우처럼 gitlab.com 등의 접근이 필요하다면 아래과 같이 설정 할 수 있다.

```json
{
    "github-oauth": { "github.com": "[github token]" },
    "gitlab-oauth": { "gitlab.com": "[gitlab token]" }
}
```

여기서 설정된 "gitlab token"은 github와는 조금 다르다. github의 경우는 사이트에 token을 발급해서 넣었었는데 gitlab은 동일하게 [사이트에서 발급](https://gitlab.com/profile/personal_access_tokens) 받은 token을 강제로 넣었더니 정상적으로 동작하지 않았다. 대신 gitlab에 관련된 repository가 추가된 후 `php bin/cron -v`를 다시 실행하면 아래와 같이 아이디와 비밀번호를 물어보는데 여기에 입력하면 "gitlab token"이 생성되어 들어가 있다. gitlab.com에 API로 token을 만들어주나 싶어 확인해 봤더니 token은 없었다(아이디 / 비밀번호를 암호화해서 보관하는 것으로 보인다).

```bash
$ php bin/cron -v
Initializing private repositories
Initializing git@gitlab.com:company/project.git

Could not fetch https://gitlab.com/api/v3/projects/company%2Fproject, enter your gitlab.com credentials to access private repos
A token will be created and stored in "/home/web/toran/app/toran/composer/auth.json", your password will never be stored
To revoke access to this token you can visit gitlab.com/profile/applications
Username:
Password:
Token successfully created
```

여기까지 적용 했다면 이제는 웹페이지를 열어서 최종 설정을 하고 crontab에 스케쥴을 걸면 끝난다. 하지만 웹페이지 관련 설정이 조금 복잡하다. 이유는 Toran Proxy가 shell 접근과 web 접근시 동일한 퍼미션을 요구하기 때문이다. 필요한 폴더를 모두 쓰기 권한(777)을 주는 방법이 일반적이나 생성되는 파일 마다 계속 쓰기 권한을 주는 것은 무리가 있었다(몇가지를 그렇게 맞추다가 포기했다).

따라서 아래의 내용은 선택에 맡긴다. 쓰기 권한이 요구되는 상황에 맞추어 권한을 주는 방법과 아래와 같이 php-fpm에서 사용자를 변경하는 방법이 있다.

일반적인 php-fpm 설정 상태라면 pool로 www(/etc/php-fpm.d/www.conf)가 설정되어 있을 것이다. 여기에 새로운 pool을 아래와 같이 추가한다.

**/etc/php-fpm.d/toran.conf**

```
[toran]
...
user = web
group = usergroup
...
listen = /dev/shm/php5-fpm.toran.sock
...
```

나머지 설정은 자신의 상황에 맞게하면 된다. 우선 listen의 경우 기존 unix socket 과 겹치지 않는 파일을 지정한 것인데 기존에 unix socket를 사용하지 않고 `listen = 127.0.0.1:9000`과 같이 사용한다면 `listen = 127.0.0.1:9001`와 같이 다른 포트를 지정해서 사용하면 된다.
중요한 부분은 user / group 설정 부분이다. 일반적으로 nobody / nobody를 사용하지만 여기서는 web / usergroup 를 지정해서 웹 접근시에도 shell 접속과 동일한 계정을 사용하도록 한 것이다. 일반적으로 보안 상의 이유로 이렇게 사용하지는 않으나 이 방법이 제일 쉬운 방법이다(보안에 대한 문제는 방화벽 등에서 제어하기 바란다. 어짜피 private repository로 사용할 것이므로 접근 제한은 해야할 것이다).

이제 php-fpm을 재시작하면 www와 toran 두가지 pool이 동작하고 있다.

이제부터는 nginx 설정이다. 아래의 예시를 참고해서 설정하자. ssl 관련된 설정을 위해서 ssl 인증서를 생성해야 한다([letsencrypt](https://letsencrypt.org/)를 이용하면 무료로 인증서를 받을 수 있다. 이게 어렵거나 귀찮다면 [https://buy.wosign.com/free/](https://buy.wosign.com/free/)를 이용하면 3년까지 사용 가능한 ssl 인증서를 받을 수 있다).

```
server {
    listen 80;
    listen 443 ssl;
    server_name  your-private-repository.com;
    root         /home/web/toran/web/;

    ssl_certificate /etc/nginx/ssl/toran/your-private-repository.com.crt;
    ssl_certificate_key /etc/nginx/ssl/toran/your-private-repository.com.key;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers AES256+EECDH:AES256+EDH:!aNULL;

    location / {
        try_files $uri /app.php$is_args$args;
    }

    location ~ ^/(app|cron)\.php(/|$) {
        # The path or IP to access your PHP FCGI/FPM processes
        fastcgi_pass unix:/dev/shm/php5-fpm.toran.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;

        # Set this to "off" if you are not using an ssl vhost
        fastcgi_param  HTTPS              on;
    }
}
```

이제는 거의 마지막이다. 이제 your-private-repository.com로 접속해 보면 설정화면이 나온다. 여기서는 내용을 보고 필요한 설정을 하면 된다. 대부분의 경우는 특별히 손댈 것이 없다. 다만, 맨 위의 라이센스 관련된 부분을 확인해서 개인 사용을 체크 해주고 저장하면 설정이 완료된다. 나머지 설정도 나중에 설정 화면에서 변경할 수 있다.

정말 마지막. 스케쥴 설정을 해준다.

```bash
$ crontab -e

* * * * * su - web -c "cd /home/web/toran && php bin/cron"
```

위 설정은 매분마다 정보를 갱신하도록 스케쥴을 설정한 것이다.

---

설정은 모두 끝났다. 이젠 사용하면된다.

```json
"require": {
  "company/project": "dev-master"
},
"repositories": [
  {
    "type": "composer",
    "url": "https://your-private-repository.com/repo/private/"
  },
  {
    "type": "composer",
    "url": "https://your-private-repository.com/repo/packagist/"
  },
  {
    "packagist": false
  }
]    
```

간단히 설명하자면 `https://your-private-repository.com/repo/packagist/`와 `"packagist": false`는 default repository인 packagist를 제외하고 toran proxy를 추가하는 것이다. toran이 proxy / cache 처리를 해주므로 packagist는 제외해도 된다(proxy를 사용하는 경우). 이 설정을 통해 느린 packagist를 벗어나 빠른 개인 repository를 사용할 수 있다.

`https://your-private-repository.com/repo/private/` 설정은 말 그대로 private repository를 사용하기 위한 설정이다. private repository를 설정하는 것은 관리 화면에서 `Private Repositories` 메뉴로 들어가면 간단히 사용할 수 있다.

나의 경우처럼 git를 바로 연결해서 사용했었다면 간단히 `Add Repository`를 눌러 Type을 `vcs`로 선택하고 git repository 주소를 입력해주면 끝난다(참고로 설정 내용은 `app/toran/config.yml` 파일에 저장되어 있다).

단, 여기서 오류가 날 수 있다. 앞서 설명했던 것과 같이 해당 repository가 private project라면 접속 권한 요구에 대한 오류가 날 수 있다. 이 때는 `app/toran/composer/auth.json`에 접근 정보를 추가해 주면 된다(Type을 `git`를 선택했다면 web 계정의 `auth.json`(`~/.composer/auth.json` 또는 `~/.config/composer/auth.json`)에 접근 정보를 추가해 주어야 할 수도 있다).

그리고 Type를 `git`로 선택할 수도 있는데 이 경우엔 composer에서 package를 받았을 때 git를 사용할 수 없다. `vcs`로 설정된 경우만 git를 사용할 수 있어 commit / push가 가능하다. 목적에 따라 이를 막아야 할 경우라면 `git`를 선택하는 것도 가능하다.
