#!/usr/bin/env bash

mkdir -p public

cp -R src/static/assets/* public/
cp -r node_modules/@fortawesome/fontawesome-free/ public
cp src/static/assets/Kanit-Light.ttf public
