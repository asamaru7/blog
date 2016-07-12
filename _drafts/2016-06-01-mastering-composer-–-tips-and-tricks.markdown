---
layout: post
title: "Composer 마스터하기 – Tips and Tricks"
date: 2016-06-01 19:56:51 +09:00
comments: true
categories: php
---

**아래의 글은 아직 작성이 완료되지 않은 글이다.**

---


이글은 [Mastering Composer – Tips and Tricks](https://www.sitepoint.com/mastering-composer-tips-tricks/)을 기반으로 내용을 정리한 글이다.

![Composer](img/2016/06/2016-06-01-mastering-composer-–-tips-and-tricks-composer.png)

[Composer](https://getcomposer.org/)는 PHP의 패키지 관리에 혁명을 일으켰다. Composer는 PHP 개발자가 프레임워크에 얽매이지 않고 완전히 공유 가능한 코드를 생성할 수 있도록 도와준다. 하지만 일부 사용자는 아주 기본적인 기능만 사용하고 있어 Composer 활용에 필요한 유용한 팁과 트릭을 제시하고자 한다.

## Global 설치

Composer는 [Documentation](https://getcomposer.org/doc/)에 정의되어 있듯이 Global 설치가 가능하다. Global 설치를 하게되면 아래와 같이 입력 명령을 단순화 할 수 있다.

```bash
php composer.phar somecommand
```

Global 설치 시에는 위의 명령을 아래와 같이 대체할 수 있다.

```bash
composer somecommand
```

또한 `composer.phar`의 위치에 영향을 받지 않으므로 `create-project`와 같은 명령을 어디서든 사용하여 쉽게 프로젝트를 개설할 수 있다.

Composer의 Global 설치를 원한다면 [메뉴얼](https://getcomposer.org/doc/00-intro.md#globally)을 참고하자.

## Init

프로젝트 내에서 새로운 `composer.json` 파일을 만들려면 아래의 명령을 사용할 수 있다.

```bash
composer init
```

또한 `init` 명령시 [메뉴얼](https://getcomposer.org/doc/03-cli.md#init)에 안내된 옵션을 사용해서 기본값을 지정할 수 있다.

## packages 설치하는 방법

여러 프로젝트의 튜토리얼이나 `README` 파일을 읽어보면 패키지의 설치 방법을 아래와 같이 설명하는 경우가 많다.

> Just add the following to your `composer.json` file:

```json
{
	"require": {
		"myproject": "someversion"
	}
}
```

그러나 위 방법은 몇가지 단점을 가지고 있다. `composer.json`의 경우 당연히 json 문법을 명확히 지켜야하나 복사해서 붙여넣는 과정에서 정확한 위치를 찾는데 어려움을 겪거나 json 문법의 오류를 범하는 경우가 생길 수 있다(,를 누락하거나 덧붙이는 경우 등).

따라서 최선의 방법은 아래와 같이 `require` 명령을 사용하여 `composer.json`에 패키지를 추가하는 것이다.

```bash
composer require somepackage/somepackage:someversion
```

이 방법은 다른 수작업없이 필요한 모든 내용을 자동으로 추가해 준다.
`require-dev`에 패키지를 추가하는 경우는 아래와 같이 `--dev` 옵션을 함께 사용할 수 있다.

```bash
composer require phpunit/phpunit --dev
```

`require` 명령의 경우 띄어쓰기로 여러 개의 패키지를 동시에 지정하는 것이 가능하고 특정 버전이 필요한 것이 아니라면 위의 명령 예시에서 보듯이 버전 지정을 제외함으로써 가장 최신 버전을 자동 선택하게 할 수 있다.

## Lock Files

`composer.lock` 파일은 현재 설치된 패키지들의 목록이 저장된 파일이다. 다른 사람이 현재의 프로젝트를 clone 했을 때 종속된 패키지들이 업데이트 되었을 수 있다. 이 경우 `composer.lock`을 통해 현재 프로젝트와 동일한 버전의 의존 패키지들이 설치 되도록 할 수 있다. 따라서 의존 패키지들의 업데이트로 인한 버전 차이로 인해 개발중인 프로젝트와 clone된 프로젝트의 패키지 환경이 다름으로 발생할 수 있는 오류를 막는데 도움이 될 수 있다.

따라서 `composer.lock` 파일은 가급적 형상 관리 도구에 commit 되어야 한다([Composer: It’s All About the Lock File](https://blog.engineyard.com/2014/composer-its-all-about-the-lock-file), [Composer: It's ALMOST Always About the Lock File](https://philsturgeon.uk/php/2014/11/04/composer-its-almost-always-about-the-lock-file/)).

> 요약하자면 라이브러리 모듈 등과 같이 다른 프로젝트에 종속되어 사용 되어지는 프로젝트에서는 `composer.lock` 파일이 함께 배포되어도 하위 의존성의 버전에 영향을 주지 않으므로 팀 작업 등을 고려하는 것이 아니라면 크게 의미가 없으나 서비스 프로젝트 등의 경우엔 의존성 패키지의 버전에 따른 영향을 받을 수 있으므로 `composer.lock` 파일을 함께 배포하는 것이 좋겠다.

`composer.lock` 파일은 `composer.json` 파일에 대한 hash를 포함하고 있으므로 프로젝트의 다른 파일만 업데이트될 경우 lock 파일과 json 파일이 맞지않는 다는 경고 메시지를 받을 수 있다. 이 경우는 `composer update --lock` 명령을 통해 다른 파일은 모두 그대로 두고 `composer.lock` 파일만 갱신 할 수 있다.

## Version 지정

[패키지 버전](https://getcomposer.org/doc/01-basic-usage.md#package-versions)을 지정하는 방법은 아래와 같이 다양하게 활용할 수 있다.

이름                |  예제            |  의미
-------------------|-----------------|----------------------------
정확한 버전           | 1.0.1	        | 버전 1.0.1과 일치하는 버전	 
범위 지정(Range)      | >=1.0	         | 1.0 보다 크거나 같은 버전중 마지막 버전. 2.0, 3.1 도 포함,	 >=1.2 <2.0	1.2 보다 크거나 같고 2.0 보다 작은 버전중 마지막 버전	 
물결(Tilde) 연산자(~) | ~1.2	           | 바로 위(>=1.2 <2.0)와 동일한 의미	 
OR 연산자(\|)        | 1.2.3 \| 1.3.4	|1.2.3 또는 1.3.4	 
와일드카드 연산자(\*)   | 1.0.*	          | 1.0.x 대중 가장 큰 버전으로 1.1 보다는 작은 버전. >= 1.0 < 1.1 과 동일	 
캐럿(Caret) 연산자(^) | ^1.2.3          |	>=1.2.3 <2.0 와 동일

* 물결(~) 연산자

github 에 공개된 PHP 프로젝트의 composer.json 을 보면 물결 연산자(~)로 지정한 것을 많이 볼수 있을 것 입니다.
예로 ~1.2 는 ">=1.2 <2.0.0"(1.2 보다 크거나 같고 2.0 보다는 작다)와 동일한 의미로 사용하는 라이브러리가 유의적 버전을 따른다면 API가 변경되지 않아 기존 소스가 이상없이 동작하며 기능 추가와 버그 픽스만 적용된 버전중 가장 마지막 버전을 사용하겠다는 의미입니다.
"~1.2.3"은 1.3.0 보다 작은 버전중 마지막 버전(예: 1.2.9) 를 사용하겠다는 의미입니다. 혼동을 줄이고 버전 지정에 익숙해 지기 위해 물결 연산자를 사용한 몇 가지 예제를 더 읽어 봅시다.

버전    | 의미             |  비고
-------|-----------------|----------------------------------------
~0.4   | >=0.4.0, <1.0.0 |
~4     | >=4.0.0, <5.0.0 |
~4.1   | >=4.1.0, <5.0.0 | 4.1 보다 크고 일반적으로 가장 많이 사용되는 표현
~4.1.3 | >=4.1.3, <4.2.0 |

* 캐럿(^) 기호 연산자

캐럿 기호 연산자는 물결 연산자와 비슷하지만 약간 다르게 동작합니다. 예로 ^1.2.3 은 ~1.2.3 과 달리 >= 1.2.3 < 2.0 으로 해석됩니다.
다음 예제를 보면서 물결 연산자와 차이를 알아 봅시다.

버전    | 의미             |  비고
-------|-----------------|----------------------------------------
^4.1.3 | >=4.1.3, <5.0.0 |
^4.1   | >=4.1.0, <5.0.0 | ~4.1 과 동일한 의미
^0.4   | >=0.4.0, <0.5.0 | 하위 호환성을 제공하는 라이브러리를 지정할 때 유용하며 ~0.4.0 과 동일 의미
^4     |>=4.0.0, <5.0.0. | ~4 또는 4.* 과 동일한 의미

* 와일드 카드(*) 연산자

와일드 카드 연산자는 1.\* 같이 마이너 버전에 지정하기 보다는 2.6.* 와 같이 패치 버전 항목에 많이 지정하여 사용합니다.
이것은 2.6 버전중에 가장 안정 버전을 사용하겠다는 의미로 사용하는 라이브러리에 추가되는 기능이 필요 없을 경우 유용합니다.
신규 기능을 구현하다 보면 버그가 발생하기 마련이니  안정적인 버전을 사용하여 프로젝트를 진행하고 싶다면 와일드 카드로 패치 버전을 지정하면 안정적인 외부 라이브러리를 사용할 수 있습니다.

----------------

Unless you know you need a specific version, I recommend always using the ~1.2.3 format – it’s your safest bet.
당신은 당신이 특정 버전이 필요 알지 못한다면, 난 항상 사용하는 것이 좋습니다 ~1.2.3 형식을 - 그것은 당신의 가장 안전한 베팅이다.

## Configuration and Global Configuration

The default values are not fixed in stone. See the full `config` [reference](https://getcomposer.org/doc/04-schema.md#config) for details.
기본값은 돌에 고정되지 않습니다. 전체 참조 config 참조 자세한 내용입니다.

For example, by specifying:
, 지정하여 예를 들면 :

```json
{
    "config": {
        "optimize-autoloader": true
    }
}
```

you force Composer to optimize the classmap after every installation/update, or in other words, whenever the autoload file is being generated. This is a little bit slower than generating the default autoloader, and slows down as the project grows.
당신은 모든 설치 / 업데이트 후 classmap을 최적화하기 위해 Composer를 강제하거나, 자동로드 파일이 생성 될 때마다 즉,이다. 이것은 기본 오토로더를 생성하는 것보다 조금 느리게, 그리고 프로젝트가 성장함에 따라 속도가 느려집니다.

Another useful option might be the `cache-files-maxsize` – in enormous projects like eZ Publish or Symfony, the cache might get full pretty fast. Increasing the size would keep Composer fast longer.
또 다른 유용한 옵션이 될 수 있습니다 cache-files-maxsize 레즈가 게시 또는 심포니는 캐시가 가득 꽤 빨리 얻을 수 있습니다처럼 거대한 프로젝트 -. 빠른 이상 Composer를 유지하는 것입니다 크기를 증가.

Note that configuration can be set globally, too, so it’s consistent across projects. See [here](https://getcomposer.org/doc/03-cli.md#config) for how. For example, to add the cache size setting to our global configuration, we either edit `~/.composer/config.json` or execute:
그 구성도 세계적으로 설정 될 수 있습니다, 그래서 프로젝트에서 일관성이다. 참조 여기에 방법에 대한. 예를 들어, 우리의 글로벌 구성 캐시 크기 설정을 추가하기 위해, 우리 중 하나를 편집 ~/.composer/config.json 또는 실행 :

```bash
composer config --global cache-files-maxsize "2048MiB"
```

## Profile and Verbose

You can add a --profile flag to any command you execute on the command line with Composer, and it’ll produce not only a final output like this:
당신은 추가 할 수 있습니다 --profile 당신이 Composer와 명령 줄에서 실행하는 모든 명령에 플래그를하고,이 같은 최종 출력뿐만 아니라 생산합니다 :

```
[174.6MB/54.70s] Memory usage: 174.58MB (peak: 513.47MB), time: 54.7s
```

but also prefix each line it outputs with the exact total duration of the command’s execution so far, plus the memory usage:
하지만, 또한 지금까지 명령 실행의 정확한 총 지속 시간과 출력 라인 각각 플러스 메모리 사용량 접두어 :

```
[175.9MB/54.64s] Installing assets for Sensio\Bundle\DistributionBundle into web/bundles/sensiodistribution
```

I use this command often to identify the bottleneck packages and to observe how the stats improve or degrade on [different versions of PHP](https://www.sitepoint.com/php7-resource-recap/).
나는 병목 패키지를 식별하고 통계 개선 또는에서 분해 방법을 관찰하는 것이이 명령을 사용하여 PHP의 다른 버전 .

Likewise, the `--verbose` flag will make sure Composer outputs more information with each operation it performs, helping you understand exactly what’s going on. Some people have even aliased their `composer` command to include `composer --verbose --profile` by default.
마찬가지로, --verbose 확인 Composer를 만들 것입니다 플래그는 당신이 무슨 일을 정확히 이해할 수 있도록, 수행하는 각 작업에 더 많은 정보를 출력한다. 어떤 사람들은 자신의 별명이 한 composer 포함 명령을 composer --verbose --profile 기본적으로.

## Custom Sources

Sometimes, you just want to install from a Github repo if your project isn’t yet on Packagist. Maybe it’s under development, maybe it’s locally hosted, who knows. To do that, see [our guide](https://www.sitepoint.com/quick-tip-composer-github-develop-packages-interactively/).
프로젝트 Packagist에 아직없는 경우 때때로, 당신은 단지 Github에서의 REPO에서 설치하려고합니다. 어쩌면 그것은 아마 로컬 알고있는 사람, 호스팅, 개발 중입니다. 이를 위해, 참조 가이드를 .

Likewise, if you have your own version of a popular project that another part of your project depends on, you can use custom sources in combination with inline aliasing to fake the version constraint like Matthieu Napoli [did here](http://mnapoli.fr/overriding-dependencies-with-composer/).
마티유 나폴리처럼 마찬가지로, 프로젝트의 다른 부분에 따라 인기있는 프로젝트의 자신의 버전이있는 경우, 당신은 가짜 인라인 앨리어싱과 함께 버전 제약 조건을 정의 소스를 사용할 수 있습니다 여기에했다 .

## Speeding up Composer

As per this excellent trick by [Mark Van Eijk](http://markvaneijk.com/use-hhvm-to-speed-up-composer), you can speed up Composer’s execution by making it run on HHVM.
하여이 우수한 트릭에 따라 마크 반 Eijk , 당신은 HHVM에서 실행하여 Composer의 실행 속도를 높일 수 있습니다.

Another way is forcing it to use `--prefer-dist` which downloads a stable, packaged version of a project rather than cloning it from the version control system it’s on (much slower). This is on by default, though, so you shouldn’t need to specify it on stable projects. If you want to download the sources, use the `--prefer-source` flag. More info about this in the options of the `install` command [here](https://getcomposer.org/doc/03-cli.md#install).
또 다른 방법으로 사용하도록 강요 --prefer-dist 가 (더 느린)에서의 버전 관리 시스템에서 복제보다는 프로젝트 안정적 패키지 버전을 다운로드한다. 하지만 이것은 기본적으로 설정되어 있습니다, 그래서 당신은 안정적인 프로젝트를 지정할 필요가 없습니다. 당신이 소스를 다운로드하려면 사용 --prefer-source 플래그. 의 옵션이에 대한 자세한 정보 install 명령 여기 .


## Making your Composer project lighter

If you’re someone who develops Composer-friendly projects, you might want to do your part, too. Based on [this Reddit thread](https://www.reddit.com/r/PHP/comments/2jzp6k/i_dont_need_your_tests_in_my_production/), you can use a `.gitattributes` file to ignore some of the files and folders during packaging for the `--prefer-dist` mode above.
당신은 Composer 친화적 인 프로젝트를 개발하는 사람이 있다면, 당신도, 당신의 부분을 수행 할 수 있습니다. 을 바탕으로 이 Reddit에 스레드 , 당신은 사용할 수 있습니다 .gitattributes 을위한 포장 중에 파일과 폴더의 일부를 무시하고 파일을 --prefer-dist 위의 모드.

```
/docs               export-ignore
/tests              export-ignore
/.gitattributes     export-ignore
/.gitignore         export-ignore
/.travis.yml        export-ignore
/phpunit.xml        export-ignore
```

How does this work? When you upload a project to Github, it automatically makes available the “Download zip” button which you can use to download an archive of your project. What’s more, Packagist uses these auto-generated archives to pull in the `--prefer-dist` dependencies, and then unarchives them once downloaded (much faster than cloning). If you thus ignore your tests, docs and other logically irrelevant files by listing them in `.gitattributes`, the archives won’t contain them, becoming much, much lighter.
어떻게 작동합니까? 당신이 Github에서에 프로젝트를 업로드하면 자동으로 프로젝트의 아카이브를 다운로드하는 데 사용할 수있는 '다운로드 우편 "버튼을 사용할 수 있습니다. 무엇보다, Packagist은에 끌어이 자동으로 생성 된 아카이브를 사용 --prefer-dist 종속 한 다음 한 번 (훨씬 빠르게 복제보다) 다운로드 전개함으로써. 당신이 이렇게에 나열하여 테스트, 문서 및 기타 논리적으로 관련이없는 파일을 무시하면 .gitattributes , 아카이브 훨씬, 훨씬 가볍고되고,이를 포함되지 않습니다.

Naturally, people who want to debug your library or run its tests should then specify the `--prefer-source` flag.
물론 라이브러리를 디버깅하거나 테스트를 실행하려는 사람은 다음 지정해야합니다 --prefer-source 플래그.


The [PhpLeague](http://thephpleague.com/) has adopted this approach and included it in their [Package skeleton](https://github.com/thephpleague/skeleton/blob/master/.gitattributes), so any project based on that is automatically “dist friendly”.
PhpLeague는 이 방식을 채택하고 자신의 그것을 포함하고있다 패키지 골격 , 그래서를 기반으로 모든 프로젝트가 자동으로 "DIST 친화적 ​​인"입니다.

## Show

If you ever forget what version of PHP or its extensions you’re running, or need a list of all the projects (and their descriptions) that you’ve installed inside the current project and their versions, you can use the `show` command with the `--platform` (short `-p`) and `--installed` (short `-i`) flags respectively:

혹시 실행중인 PHP 또는 확장 버전을 잊지 또는 모든 프로젝트 (및 설명) 현재 프로젝트 내부에 설치 한 및 해당 버전의 목록을해야하는 경우 사용할 수있는 show 와 명령을 --platform (짧은 -p ) 및 --installed (짧은 -i 각각) 플래그 :

```bash
$ composer show --installed

behat/behat                            v3.0.15            Scenario-oriented BDD framework for PHP 5.3
behat/gherkin                          v4.3.0             Gherkin DSL parser for PHP 5.3
...
```

## Dry Runs

To just see if an installation of new requirements would go well, you can use the `--dry-run` flag with Composer’s `install` and `update` command. This will throw all the potential problems at you, without actually causing them – no changes will really be made. Excellent for testing big requirement and setup changes before actually committing to them.
새로운 요구 사항의 설치가 잘 갈 것입니다 경우 단지 확인하려면, 당신은 사용할 수 있습니다 --dry-run Composer와 깃발을 install 하고 update 명령. 변경이 정말로 이루어지지 않습니다 -이 사실을 일으키지 않고, 당신의 모든 잠재적 인 문제가 발생합니다. 실제로 그들에게 적용하기 전에 큰 요구 사항 및 설정 변경을 테스트하기 위해 우수한.

```bash
composer update --dry-run --profile --verbose
```

## Create Project

Last but not least, we must mention the `create-project` [command](https://getcomposer.org/doc/03-cli.md#create-project), applicable to anything and everything.
마지막으로, 우리는 언급해야 create-project 명령 아무것도하고 모든 것에 적용을.

Create project takes a package name as the argument, then clones the package and executes `composer install` inside it. This is fantastic for bootstrapping projects – no more finding out the exact Github URL of the package you want, then cloning, then manually going into the folder and executing `install`.
만들기 프로젝트는 패키지를 클론 및 실행, 인수로 패키지 이름을 사용 composer install 안에. 이 부트 스트랩 프로젝트를위한 환상적인 없다 - 더 이상 다음, 복제 수동으로 폴더로 가서 실행, 원하는 패키지의 정확한 Github에서의 URL을 찾는 install .


Major projects such as Symfony and Laravel use this approach to bootstrap a skeleton application, and many others are jumping on board.
이러한 심포니와 Laravel 등 주요 프로젝트는 골격 응용 프로그램을 부트 스트랩이 방법을 사용하고, 많은 사람들이 보드에 뛰어 오르고있다.

With Laravel, for example, it’s used like this:
Laravel, 예를 들어, 다음과 같이 사용되는 :

```bash
composer create-project laravel/laravel --prefer-dist --profile --verbose
```

The `create-project` command also accepts two parameters. The first is the path into which to install. If omitted, the project’s name is used. The second is the version. If omitted, the latest version is used.
create-project 명령은 두 개의 매개 변수를 사용할 수 있습니다. 첫 번째는 설치하는에 경로입니다. 생략 할 경우, 프로젝트의 이름이 사용됩니다. 두 번째 버전이다. 생략 할 경우, 최신 버전이 사용됩니다.


## Conclusion

Hope this list of tips and tricks has been helpful! If we missed some, do tell us and we’ll update the post! And remember – if you forget about some of the commands or switches, just check out the cheatsheet. Happy Composing!
팁과 트릭의 목록을 희망 도움이되었습니다! 우리가 일부 누락 된 경우, 우리에게 않으며, 우리는 게시물을 업데이 트됩니다! 그리고 기억 - 당신은 단지 확인, 명령 또는 스위치의 일부에 대해 잊어 버린 경우 쪽지를 . 해피 구성!
