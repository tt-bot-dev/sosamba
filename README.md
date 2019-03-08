# Sosamba [![Build status][azp badge]][azp]
A Discord framework based on Eris library, currently in an alpha stage.

## How to use Sosamba
You can look at the documentation [here][docs], or look at a bundled (currently incomplete) example at the [example/](example/) folder.

## What does Sosamba aim to do?
Many things. Most of them are tt.bot's features, however improved in order to be efficient. (for example, we currently register an event listener in some commands, which may lead to memory leak issues). The main one though, is to use as least production dependencies as possible.

Currently, you can do these things:
- Commands with an extendable context
- Event listeners
- Reaction menus
- Custom argument parsers to suit your needs

There will be likely more features included than that, though.

## Why this name?
И пoчему нет? (Why not?)

## Prerequisites
- [Node.js], v10 and higher. We already use some advanced features that Node v8 does not support.
- [Eris]

[azp badge]: https://dev.azure.com/tt-bot-dev/sosamba/_apis/build/status/tt-bot-dev.sosamba?branchName=master
[azp]: https://dev.azure.com/tt-bot-dev/sosamba/_build/latest?definitionId=3&branchName=master
[docs]: https://tt-bot-dev.github.io/sosamba
[Eris]: https://github.com/abalabahaha/eris
[Node.js]: https://nodejs.org