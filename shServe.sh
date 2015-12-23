#!/bin/bash

realpath() {
	[[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}
base=$(dirname $(realpath "$0"))
cd $base

jekyll serve
