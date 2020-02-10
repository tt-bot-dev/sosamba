#!/bin/bash

BOOL="$(git log -1 $CURRENT_COMMIT --pretty="%aN")"
if [ $BOOL == "tt-bot" ]; then
    echo "A commit is made by tt-bot, ignoring."
    exit 0
else 
    echo "Building docs for $BOOL"
fi
echo "Running ESLint..."
npm test -- --fix

echo "Generating documentation..."
npx typedoc

git config --global user.name "tt-bot" >/dev/null 2>&1
git config --global user.email \
    "whatdidyouthinkiwontleakmyprivate@email.cz" \
    >/dev/null 2>&1 

echo "Adding the documentation to git update list"
git add . >/dev/null 2>&1

echo "Committing..."
git commit -m "Run ESlint and build documentation for $CURRENT_COMMIT" >/dev/null 2>&1
echo "Pushing.."

git push https://$COMMIT_AUTHOR:$GIT_ACCESS_TOKEN@github.com/$CURRENT_REPO HEAD:$CURRENT_BRANCH >/dev/null 2>&1

echo "Successfully built and pushed the documentation"

exit 0