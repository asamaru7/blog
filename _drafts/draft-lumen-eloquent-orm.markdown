---
layout: post
title: draft lumen + Eloquent ORM
date: 2015-12-24T21:45:15+09:00
comments: true
categories: linux
---

[lumen](https://lumen.laravel.com/)

[라라벨 한국어 매뉴얼](http://xpressengine.github.io/laravel-korean-docs/)

[Composer](https://getcomposer.org/) 설치

```bash
$ curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

lumen 설치

```bash
$ composer global require "laravel/lumen-installer=~1.0"
$ lumen new [프로젝트명]
# 또는
$ composer create-project laravel/lumen --prefer-dist [프로젝트명]
```

laravel 설치

```bash
$ composer global require "laravel/installer=~1.1"
$ laravel new [프로젝트명]
# 또는
$ composer create-project --prefer-dist laravel/laravel [프로젝트명]
```
