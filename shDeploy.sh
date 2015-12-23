#!/bin/bash

cd _site
git add .
git commit -am "deploy"
git push 
