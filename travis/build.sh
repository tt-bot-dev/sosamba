#!/bin/bash
set -e

if [ "$(git log -1 $TRAVIS_COMMIT --pretty="%aN")" == "tt-bot" ]; then
    echo "A commit is made by tt-bot, ignoring."
    exit 0
fi

echo "Generating documentation..."
node generateDocs

git config --global user.name "tt.bot" >/dev/null 2>&1
# this is on purpose, it's public, feel free to email me! - TTtie 2019
git config --global user.email \
    "whatdidyouthinkiwontleakmyprivate@email.cz" \
    >/dev/null 2>&1 

echo "Adding the documentation to git update list"
git add docs/

git commit -m "Build documentation for $TRAVIS_COMMIT"

git push https://tt-bot:$GIT_ACCESS_TOKEN@github.com/$TRAVIS_REPO_SLUG $TRAVIS_BRANCH >/dev/null 2>&1

echo "Successfully built and pushed the documentation"

exit 0