<div align="center">

# micro-lc notification center

[![Build Status][github-actions-svg]][github-actions]
[![javascript style guide][standard-mia-svg]][standard-mia]
[![Coverage Status][coverall-svg]][coverall-io]

</div>

This [micro-lc][micro-lc] plugin enables you to handle notifications in your application.

[micro-lc]: https://github.com/micro-lc/micro-lc

## run locally

If you'd like to test this notification center on your local machine, after install all needed packages via `yarn`,
you'll find a tiny backend notification server which handles you some data to start your component visualization mode. Such backend can be started by using

```shell
yarn start:be
```

[Stencil](https://stenciljs.com/) provides a simple frontend server which serves a simple html page containing a navbar + this repo's `micro-lc-notification-center`.
To open just run

```shell
yarn start
```

and, if not automatically prompted, navigate to <http://localhost:3333>

[standard-mia-svg]: https://img.shields.io/badge/code_style-standard--mia-orange.svg
[standard-mia]: https://github.com/mia-platform/eslint-config-mia
[coverall-svg]: https://coveralls.io/repos/github/mia-platform/microlc/badge.svg
[coverall-io]: https://coveralls.io/github/mia-platform/micro-lc-notification-center
[github-actions]: https://github.com/mia-platform/microlc/actions
[github-actions-svg]: https://img.shields.io/github/workflow/status/mia-platform/microlc/Node.js%20fe-container%20CI
