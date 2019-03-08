#!/bin/bash
set -e

BOOL="$(git log -1 $TRAVIS_COMMIT --pretty="%aN")"
if [ $BOOL == "tt-bot" ]; then
    echo "A commit is made by tt-bot, ignoring."
    exit 0
else 
    echo "Triggering the test for $BOOL"
fi
npm test