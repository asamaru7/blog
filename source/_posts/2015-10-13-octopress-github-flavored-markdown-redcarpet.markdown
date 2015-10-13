---
layout: post
title: "Octopress에서 GitHub Flavored Markdown 사용하기(redcarpet)"
date: 2015-10-13 14:38:25 +0900
comments: true
categories: octopress
---
옥토프레스에서는 markdown 해석기로 [rdiscount](https://github.com/davidfstr/rdiscount)를 기본으로 사용하고 있다. 현재 사용해보니 rdiscount에서도 GitHub Flavored Markdown를 지원하는 것으로 보이는데 예전엔 제대로 지원이 안되고 있었는지 [redcarpet](https://github.com/vmg/redcarpet)으로 바꾸서 사용하는 사람들이 많았다. 그래서 나도 바꿔 봤다.

변경을 위해 참고한 글은 다음과 같다.

* [Octopress で GitHub Flavored Markdown (GFM) を使う](http://blog.tdksk.com/2013/05/06/use-gfm-in-octopress.html)
* [Using Octopress With Github Flavored Markdown (RedCarpet)](http://yangsu.github.io/blog/2012/10/11/using-octopress-with-github-flavored-markdown-redcarpet/)

그런데 위 글들이 작성된 시점이 조금 오래되어서 그런지 그대로 따라해서는 정상적으로 적용이 되지 않았다. 그래서 몇가지를 수정해서 적용을 완료했다.

## redcarpet 설치

Gemfile에 아래의 내용을 추가 한다.

```ruby Gemfile
gem 'redcarpet', '~> 3.3.2'
gem 'albino', '~> 1.3.3'
```

```bash
[sudo] bundle install
```

## redcarpet 플러그인 설치

plugins/redcarpet2_markdown.rb 파일을 추가한다. 원본은 https://github.com/nono/Jekyll-plugins에 가면 볼 수 있다. 거의 그대로인데 약간 수정을 했다.

```ruby plugins/redcarpet2_markdown.rb
require 'fileutils'
require 'digest/md5'
require 'redcarpet'
require 'albino'

# PYGMENTS_CACHE_DIR = File.expand_path('../../_cache', __FILE__)
FileUtils.mkdir_p(PYGMENTS_CACHE_DIR)

class Redcarpet2Markdown < Redcarpet::Render::HTML
  def block_code(code, lang)
    lang = lang || "text"
    path = File.join(PYGMENTS_CACHE_DIR, "#{lang}-#{Digest::MD5.hexdigest code}.html")
    cache(path) do
      colorized = Albino.colorize(code, lang.downcase)
      add_code_tags(colorized, lang)
    end
  end

  def add_code_tags(code, lang)
    code.sub(/<pre>/, "<pre><code class=\"#{lang}\">").
         sub(/<\/pre>/, "</code></pre>")
  end

  def cache(path)
    if File.exist?(path)
      File.read(path)
    else
      content = yield
      File.open(path, 'w') {|f| f.print(content) }
      content
    end
  end
end

class Jekyll::MarkdownConverter
  def extensions
    Hash[ *@config['redcarpet']['extensions'].map {|e| [e.to_sym, true] }.flatten ]
  end

  def markdown
    @markdown ||= Redcarpet::Markdown.new(Redcarpet2Markdown.new(extensions), extensions)
  end

  def convert(content)
    return super unless @config['markdown'] == 'redcarpet'
    markdown.render(content)
  end
end
```

## config 설정

_config.yml 파일을 열어서 rdiscount 부분을 아래와 같이 수정한다.

```yaml _config.yml
#markdown: rdiscount
markdown: redcarpet
redcarpet:
  extensions: ["no_intra_emphasis", "fenced_code_blocks", "autolink", "tables", "with_toc_data", "strikethrough", "superscript"]
#rdiscount:
#  extensions:
#    - autolink
#    - footnotes
#    - smart
```

참고 사이트들 설명을 보면 extensions에 hard_wrap을 추가하라고 되어 있는데 나의 경우는 이 옵션을 추가하면 Pygments에서 오류가 났다.

이것으로 설치는 끝이다. generate를 해보면 페이지가 잘 생성된다.
