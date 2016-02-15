#!/bin/bash

realpath() {
	[[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}
base=$(dirname $(realpath "$0"))
cd $base

jekyll build

cd _site
#ln -s sitemap.xml sitemap-naver.xml
git add .
git commit -am "deploy"
git push 
