---
layout: post
title: "옥토프레스 category list 플러그인 설치"
date: 2015-08-28 20:45:21 +0900
comments: true
categories: ["octopress"]
---

이번엔 옥토프레스에 category list 플러그인을 추가해 보았다.

사실 현재 시점에서 쓰고 있는 테마를 선택한 이유가 우측에 나오는 카테고리 목록이었다. 그런데 막상 테마를 설치한 후에도 카테고리 목록이 보이지 않았다. 처음엔 설정이 누락되어서 그렇다고 생각했고 시간이 없어서 그냥 두다가 오늘에서야 추가를 하고자 확인해 봤다.

현재 시점에 사용하고 있는 테마는 "[octostrap3](https://github.com/kAworu/octostrap3)"다. 해당 소스를 뒤져서 aside에 추가하는 부분은 찾았으나 테마엔 그 파일이 없었다. 그럼 이사람은 없는 파일을 어떻게 불러서 쓴단 말인가?

알아보니 별도 플러그인을 추가해야만 했다.
https://github.com/ctdk/octopress-category-list
현재 내가 적용한 플러그인이다. 최근 업데이트가 시점이 오래되어 조금 미심쩍지만 대안이 없다.

일단 설명이 된대로 소스를 받아서 안내하는 경로에 집어 넣었다.
그리고 octostrap3에서 사용하던것 처럼 _config.xml 파일에 추가 했다.일단 사이드 영역에 "custom/asides/category_list.html"를 추가.

> default_asides: [asides/recent_posts.html, custom/asides/category_list.html, asides/github.html, asides/delicious.html, asides/pinboard.html, asides/googleplus.html]

그리고는 정상적으로 적용이 되는지 확인.

```bash
$ rake generate
## Generating Site with Jekyll
Configuration file: /Volumes/Data/DropBox/blog/_config.yml
            Source: source
       Destination: public/blog
      Generating...
  Liquid Exception: undefined method `+' for nil:NilClass in _layouts/page.html
jekyll 2.5.3 | Error:  undefined method `+' for nil:NilClass
```

하지만 오류.. 이런.. 불친절하게 어디가 문제인지 명확히 알려주지 않는다. 무작정 소스를 봤다. ruby를 아예 모르는 관계로 봐도 모르겠다. 하지만 nil 오류라고 하니 값이 없는 것이 문제라는 생각에 의심되는 부분들을 보다가 발견한 부분..

```ruby
def render(context)
  lists = {}
  max, min = 1, 1
  config = context.registers[:site].config
  category_dir = config['root'] + config['category_dir'] + '/'
  categories = context.registers[:site].categories
  categories.keys.sort_by{ |str| str.downcase }.each do |category|
    count = categories[category].count
    lists[category] = count
    max = count if count > max
  end
```

여기서 config['root'] 이 부분이 문제 였다. 내 _config.xml 파일에서는 "root:" 부분을 비워두었다. 하위 폴더를 사용하지 않기 때문에. 여기에 값이 없어서 오류. 그래서 "root: /"로 수정.

다시 시도.

```bash
$ rake generate
```

이젠 된다. 카테고리 목록도 잘 나온다.

