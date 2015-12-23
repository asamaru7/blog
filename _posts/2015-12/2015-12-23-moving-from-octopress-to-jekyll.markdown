---
layout: post
title: "Octopress 2에서 Jekyll로 전환"
date: 2015-12-23T21:41:33+09:00
comments: true
categories: ["octopress", "jekyll"]
---
최근 이틀동안 현재 운영중인 블로그에서 사용중인 옥토프레스를 걷어내고 순수 [Jekyll](https://jekyllrb.com/)로 전환하는 작업을 했다. 사실 처음엔 지금 사용중인 옥토프레스를 3버전으로 버전업 하려고 했다. 그래서 [Migrating Octopress 2 to Octopress 3](http://samwize.com/2015/09/30/migrating-octopress-2-to-octopress-3/)를 따라 전환을 시도했다. 이 글에서도 나와 있는 것처럼 옥토프레스 제작자가 [Octopress 3.0 Is Coming](http://octopress.org/2015/01/15/octopress-3.0-is-coming/)이라고만 해두고 정식 릴리즈를 하지 않아 기다림에 지쳐 작업을 시작했다(이때까지만 하더라도 일이 간단하리라 생각했다).

아래의 글은 체계적인 설치 안내서 보다는 전환 경험담에 가깝다. 아래의 과정을 따라 설치하면 동일하게 안될 확률이 높으므로 참고만 하길 바란다. 사실 처음엔 잘 정리해 두려고 했는데 워낙에 이리저리 시도를 많이 하면서 정리하는 것을 포기했다.

[Jekyll](https://jekyllrb.com/) 전환에 앞서 octopress 버전업 시도 과정부터 이야기하려고 한다.

[Octopress 3 - Github](https://github.com/octopress/octopress)에 가면 최신 옥토프레스를 확인할 수 있다. 현재 시점을 기준으로 3.0.11이 최신이다. 정식 릴리즈를 공식적으로 출시하지 않았지만 개발을 나름 활발히 진행중이다. 나중에 버전업을 진행해 보니 왜 정식 릴리즈를 하지 못하고 있는지 알 것도 같다. [Jekyll](https://jekyllrb.com/) 기반으로 여러가지 플러그인을 사용하고 템플릿의 제작도 프로그램 제작에 준할 정도로 커스텀되는 상황이다보니 체계적인 마이그레이션 방법을 제시하기 어려운 것 같다.

[Migrating Octopress 2 to Octopress 3](http://samwize.com/2015/09/30/migrating-octopress-2-to-octopress-3/)에 나름 잘 설명되어 있기는하나 나의 경우엔 그대로 적용되지 않았다(특별한 플러그인 다수 사용하지도 않았는데). 결국은 여러가지 시도 끝에 남은 거라곤 옥토프레스 3.0.11이 설치되었다는 것 밖에 없다(사실 이건 간단히 설치가 되므로 대부분의 시간을 허비한 것이다).

이러한 이유로 순수 [Jekyll](https://jekyllrb.com/)로 전환을 시작하게 되었다. 사실 이 과정도 옥토프레스를 버전업하는 것과 같이 새로운 블로그를 생성하고 주요 설정을 이전하는 것이다.
옥토프레스는 원래 Jekyll을 기반으로 확장된 것이라 전환이 간단할 것이라고 생각했다. 이것 또한 착각이었다. 이 과정에서도 여러가지 실패기가 있지만 다 나열하기도 힘들다. 이후부터는 설치 과정을 간략히 요약하려고 한다.

---

아래는 Jekyll을 설치하기 위한 **Gemfile** 의 내용이다. 거의 필수에 가까운 플러그인만으로 구성했다.

```ruby
source 'https://rubygems.org'

gem 'jekyll', '= 3.0.1'
gem 'jekyll-paginate'
gem 'jekyll-archives'
gem 'jekyll-sitemap'
gem 'jekyll-feed'
gem 'pygments.rb'
```

**Gemfile** 을 사용한 설치는 아래와 같이 할 수 있다. 단, ruby 버전 2.1 이상을 요구할 수 있는데 그때는 rvm을 사용해 설치하면 된다.

```bash
$ sudo gem install bundler
$ bundle install
```

다음은 [Jekyll](https://jekyllrb.com/)에서 가장 중요한 **_config.yml** 파일의 내용이다.

```yaml
gems:
  - jekyll-paginate
  - jekyll-archives
  - jekyll-sitemap
  - jekyll-feed
  - pygments.rb

exclude: [".idea", ".git", "README.md", "Gemfile", "Gemfile.lock"]

url: http://blog.asamaru.net
title: 이 세상에 하나는 남기고 가자
subtitle: 내가 할 수 있는 모든 것을...
author: 유영재
simple_search: https://www.google.com/search
description: > # this means to ignore newlines until "baseurl:"
  세상에 필요한 소스코드 한줄 남기고 가자.

email: asamaru@asamaru.net
baseurl: "" # the subpath of your site, e.g. /blog/

permalink: /:year/:month/:day/:title/

markdown: KramdownPygments
markdown_ext: markdown,mkd,mkdn,md
textile_ext: textile
kramdown:
  input: GFM
  auto_ids: true
  footnote_nr: 1
  entity_output: as_char
  toc_levels: 1..6
  smart_quotes: lsquo,rsquo,ldquo,rdquo

paginate: 1
paginate_path: "posts/:num"
recent_posts: 5
excerpt_link: "Read on &rarr;"
excerpt_separator: "<!--more-->"

titlecase: false

# Disqus Comments
disqus_short_name: asamaru7

# Google Analytics
google_analytics_tracking_id: UA-65749108-2

github_username: asamaru7

feed:
  path: atom.xml

# archives 생성
jekyll-archives:
  enabled:
    - categories
    - year
    - month
    - day
    - tags
  layouts:
    year: archive-year
    month: archive-month
    day: archive-day
    tag: archive-tag
    category: archive-tag
  permalinks:
    year: '/:year/'
    month: '/:year/:month/'
    day: '/:year/:month/:day/'
    tag: '/tag/:name/'
    category: '/category/:name/'
```

하나씩 설명하자니 너무 많다. 다만 그리 어려운 설정들이 아니므로 보면 이해할 것으로 본다.

마지막으로 한가지. [Kramdown with Pygments](https://github.com/mvdbos/kramdown-with-pygments)라는 플러그인을 사용했다. Jekyll에서 kramdown을 사용하면서 Pygments를 함께 사용(코드 하이라이팅)하기 위한 플러그인이다. 그런데 몇가지 문제가 있어 아래와 같이 변형해서 사용하고 있다. 덤으로 옥토프레스에서 코드 블럭에 사용되던 문법도 호환되게 변경했으나 마지막에 문제에 걸렸다. kramdown에서 그 문법을 정상적으로 인식하지 못했다. 코드에 빈 줄바꿈이 포함되면 정상적으로 인식하지 못한다. 따라서 이 플러그인이 동작하기 이전에 발생되는 문제로 여기서는 아직 처리하지 못했다. 시간을 들여 분석해보면 처리 방법이 있을수도 있지만 일단 두기로 했다. 중요한 문제는 아니므로(게다가 내가 ruby를 모른다. 이 작업도 기본 문법 몇가지만 공부해서 처리한 것이라 깊이있는 수정은 어렵다).

**kramdown_pygments.rb**

```ruby
# We define the an additional option for the kramdown parser to look for
module Kramdown
  module Options
      define(:kramdown_default_lang, Symbol, nil, <<EOF)
Sets the default language for highlighting code blocks

If no language is set for a code block, the default language is used
instead. The value has to be one of the languages supported by pygments
or nil if no default language should be used.

Default: nil
Used by: PygmentsHtml converter
EOF
  end
end

# This class is a plugin for kramdown, to make it use pygments instead of coderay
# It has nothing to do with Jekyll, it is simply used by the custom converter below
module Kramdown
  module Converter
    #AllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?\n/i
    #LangCaption = /([^\s]+)\s*(.+)?\n/i
    AllOptions = /([a-z0-9]+)[[:blank:]]+(.+?)[[:blank:]]+(https?:\/\/\S+|\/\S+)[[:blank:]]*([^\n]+)?\n/i
    LangCaption = /([a-z0-9]+)[[:blank:]]*([^\n]+)?\n/i

    class PygmentsHtml < Html

      begin
        require 'pygments'
      rescue LoadError
        STDERR.puts 'You are missing a library required for syntax highlighting. Please run:'
        STDERR.puts '  $ [sudo] gem install pygments'
        raise FatalException.new("Missing dependency: Pygments")
      end

      def convert_codeblock(el, indent)
        codeProc(el, indent, false)
      end

      def convert_codespan(el, indent)
        codeProc(el, indent, true)
      end

      def codeProc(el, indent, isSapn)
        attr = el.attr.dup
        lang = extract_code_language!(attr) || @options[:kramdown_default_lang]
        # STDERR.puts "lang #{el.value}"

        codeStr = el.value
        # octopress code 형식 지원
        caption = ""
        if isSapn
          if codeStr =~ AllOptions or codeStr =~ LangCaption
            acceptLang = Pygments::Lexer.find_by_alias("#{$1}")
            if acceptLang != nil
              # STDERR.puts "lang [#{$1}] [#{$2}]"
              isSapn = false
              lang = "#{$1}"

              if codeStr =~ AllOptions
                # STDERR.puts "lang all"
                # fn = "#{$2}".gsub(/\s+/, "")
                caption = "<figcaption><span>#{$2}</span><a href='#{$3}'>#{$4 || 'link'}</a></figcaption>"
              end
              if caption == "" and codeStr =~ LangCaption
                # STDERR.puts "lang lang"
                caption = "<figcaption><span>#{$2}</span></figcaption>"
              end
              if caption != ""
                codeStr = codeStr.lines.to_a[1..-1].join  # 첫줄 제거
              end
            end
          end
        end

        code = pygmentize(codeStr, lang)
        code_attr = {}
        if isSapn
          if lang
            code_attr['class'] = "highlight notranslate"
            if code_attr.has_key?('class')
              code_attr['class'] += " language-#{lang}"
            else
              code_attr['class'] = "language-#{lang}"
            end
          end
        else
          code_attr['class'] = "language-#{lang}" if lang
        end
        if code == nil
          code = escape_html(codeStr)
          if code_attr['class'] != nil
            code_attr['class'] += " nmcode"
          else
            code_attr['class'] = "nmcode"
          end
        end
        if isSapn
          "<code#{html_attributes(attr)}>#{code}</code>"
        else
          "#{' '*indent}<figure class='code'>#{caption}<div class=\"highlight notranslate\"><pre#{html_attributes(attr)}><code#{html_attributes(code_attr)}>#{code}</code></pre></div></figure>\n"
        end
      end

      def pygmentize(code, lang)
        if lang
          Pygments.highlight(code,
            :lexer => lang,
#            :options => { :startinline => true, :encoding => 'utf-8', :nowrap => true })
            :options => { :startinline => true, :encoding => 'utf-8', :linenos => 'table' })
        end
      end
    end
  end
end

# This class is the actual custom Jekyll converter.
class Jekyll::Converters::Markdown::KramdownPygments

  def initialize(config)
    require 'kramdown'
    @config = config
  rescue LoadError
    STDERR.puts 'You are missing a library required for Markdown. Please run:'
    STDERR.puts '  $ [sudo] gem install kramdown'
    raise FatalException.new("Missing dependency: kramdown")
  end

  def convert(content)
    html = Kramdown::Document.new(content, {
        :auto_ids             => @config['kramdown']['auto_ids'],
        :footnote_nr          => @config['kramdown']['footnote_nr'],
        :entity_output        => @config['kramdown']['entity_output'],
        :toc_levels           => @config['kramdown']['toc_levels'],
        :smart_quotes         => @config['kramdown']['smart_quotes'],
        :kramdown_default_lang => @config['kramdown']['default_lang'],
        :input                => @config['kramdown']['input'],
        :hard_wrap            => @config['kramdown']['hard_wrap']
    }).to_pygments_html
    return html;
  end
end
```

---

보다 자세한 처리 결과를 확인하고 싶다면 이 블로그의 소스를 참고하기 바란다. [asamaru7/blog - Github](https://github.com/asamaru7/blog)
