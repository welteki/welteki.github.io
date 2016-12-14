#!/bin/bash

# Build site for production
JEKYLL_ENV=production
jekyll build

# Copy _site to _dist
cp -r _site/* _dist

# Get bumped version number
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION

# Commit and push
git add -A
git commit -m "release -$PACKAGE_VERSION"
git subtree push --prefix _dist origin master

# Check branch and merge
CURRENT_BRANCH=$(git branch | grep \* | cut -d ' ' -f2)
echo $CURRENT_BRANCH

if [ $CURRENT_BRANCH == "develop" ]
then
  git checkout release
  git merge --no-ff develop
  git checkout develop
elif [ $CURRENT_BRANCH == "release"]
then
  git checkout develop
  git merge --no-ff release
  git checkout release
fi
