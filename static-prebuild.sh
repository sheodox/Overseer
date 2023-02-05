#!/usr/bin/env bash

mkdir -p public/fa6

cp -R src/static/assets/* public/fa6
cp -r node_modules/@fortawesome/fontawesome-free/ public/fa6
cp src/static/assets/Kanit-Light.ttf public
