#!/bin/bash

realpath() {
	[[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}
base=$(dirname $(realpath "$0"))
cd $base

cd _site
git add .
git commit -am "deploy"
git push 
