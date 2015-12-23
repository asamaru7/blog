---
layout: post
title: "옥토프레스 rake deploy에서 오류가 날 경우"
date: 2015-08-20 22:56:20 +0900
comments: true
categories: [octopress]
---
옥토프레스를 설치하고 테스트 포스팅을 한 후 본격적으로 세팅을 하려고 시작했다.
도메인도 세팅하고 구글 어날리틱스, disqus 등도 연결을 하고자 _config.xml 파일을 수정하고 몇가지 글도 포스팅하려고 저장 후 generate 했다.

이제 배포를 하려고 rake deploy를 하니 아래와 같은 오류가 나타났다.

```bash
To https://github.com/asamaru7/blog.git
 ! [rejected]        gh-pages -> gh-pages (non-fast-forward)
error: failed to push some refs to 'https://github.com/asamaru7/blog.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

구글에서 검색해서 여러가지 방법들을 따라 시도해도 진행이 되지 않다가 발견한 stackoverflow에서 강제 업데이트하는 방법을 안내하고 있었다.

```bash
vi Rakefile
```

Rakefile을 열어 deploy_branch로 검색하다 보면 아래와 같은 부분을 볼 수 있다.

```ruby
desc "deploy public directory to github pages"
multitask :push do
  puts "## Deploying branch to Github Pages "
  puts "## Pulling any updates from Github Pages "
  cd "#{deploy_dir}" do
    Bundler.with_clean_env { system "git pull" }
  end
  (Dir["#{deploy_dir}/*"]).each { |f| rm_rf(f) }
  Rake::Task[:copydot].invoke(public_dir, deploy_dir)
  puts "\n## Copying #{public_dir} to #{deploy_dir}"
  cp_r "#{public_dir}/.", deploy_dir
  cd "#{deploy_dir}" do
    system "git add -A"
    message = "Site updated at #{Time.now.utc}"
    puts "\n## Committing: #{message}"
    system "git commit -m \"#{message}\""
    puts "\n## Pushing generated #{deploy_dir} website"
    Bundler.with_clean_env { system "git push origin #{deploy_branch}" }
    puts "\n## Github Pages deploy complete"
  end
end
```

여기서 고칠 부분은 `Bundler.with_clean_env { system "git push origin #{deploy_branch}" }` 이 부분이다.
`#{deploy_branch}"` 앞에 +를 붙여준다.

```ruby
Bundler.with_clean_env { system "git push origin #{deploy_branch}" }
```

이제 저장후 나와서 다시 deploy...

```bash
## Pushing generated _deploy website
Counting objects: 36, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (27/27), done.
Writing objects: 100% (36/36), 12.90 KiB | 0 bytes/s, done.
Total 36 (delta 14), reused 0 (delta 0)
To https://github.com/asamaru7/blog.git
 + 9295247...d6c0b14 gh-pages -> gh-pages (forced update)
```

이번엔 gh-pages (forced update) 안내를 보여주며 push 성공.