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