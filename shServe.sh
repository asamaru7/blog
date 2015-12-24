#!/bin/bash

realpath() {
	[[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}
base=$(dirname $(realpath "$0"))
cd $base

# todo 데이터 검사 [^\n]\n```([a-zA-Z0-9]+)

jekyll serve
