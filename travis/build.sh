#!/bin/bash

BOOL="$(git log -1 $TRAVIS_COMMIT --pretty="%aN")"
if [ $BOOL == "tt-bot" ]; then
    echo "A commit is made by tt-bot, ignoring."
    exit 0
else 
    echo "Building docs for $BOOL"
fi

echo "Checking out $TRAVIS_BRANCH..."
git checkout $TRAVIS_BRANCH
echo "Running ESLint..."
npm test -- --fix

echo "Generating documentation..."
node generateDocs

git config --global user.name "tt-bot" >/dev/null 2>&1
# this is on purpose, it's public, feel free to email me! - TTtie 2019
git config --global user.email \
    "whatdidyouthinkiwontleakmyprivate@email.cz" \
    >/dev/null 2>&1 

echo "Adding the documentation to git update list"
git add . >/dev/null 2>&1

echo "Committing..."
git commit -m "Run ESlint and build documentation for $TRAVIS_COMMIT" >/dev/null 2>&1
echo "Pushing.."

git push https://tt-bot:$GIT_ACCESS_TOKEN@github.com/$TRAVIS_REPO_SLUG $TRAVIS_BRANCH >/dev/null 2>&1

echo "Successfully built and pushed the documentation"

exit 0