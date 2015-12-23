#!/bin/bash

jekyll build

cd _site
git add .
git commit -am "deploy"
git push 
