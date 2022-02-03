<div align="center">

# micro-lc notification center

[![Build Status][github-actions-svg]][github-actions]
[![javascript style guide][standard-mia-svg]][standard-mia]
[![Coverage Status][coverall-svg]][coverall-io]
[![Mia-Platform](https://img.shields.io/badge/Supported%20by-Mia--Platform-green?style=for-the-badge&link=https://mia-platform.eu/&color=DE0D92&labelColor=214147)](https://mia-platform.eu/?utm_source=referral&utm_medium=github&utm_campaign=micro-lc)

</div>

This [micro-lc][micro-lc] plugin enables you to handle notifications in your application.

This plugin is in fact a web-component which can be embedded in any html page or within micro-lc. It works by dealing
with a backend source with a simple REST API interface.

The webcomponent

```html
<micro-lc-notification-center></micro-lc-notification-center>
```

comes with few customizable props

| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|
|`endpoint`|`endpoint`|string|`/api/v1/micro-lc-notification-center`|API endpoint for HTTP calls|
|`headers`| - |{ [x: string]: string; }|{}|headers included in any HTTP request|
|`limit`|`limit`|number|10|notification pagination limit|
|`locales`| - |[PartialTranslations](#partial-translations)|{}|language locales and translations|
|`clickStrategy`|`click-strategy`|[ClickStrategies](#click-strategies)|'default'|establishes what to do when a single notification is clicked|

## partial translations

`PartialTranslations` enables the user to apply custom translations within the webcomponent and works by key. Keys are given by the type:

```typescript
type LanguageKeys =
  'title' |
  'loadingButton' |
  'dateFormat' |
  'errorMessage' |
  'noNotification' |
  'readAll' |
  'reload' |
  'backOnTop'
```

and to each key, one could attach either a string value (which will override any browser language settings) or a localized string given by the key/value map

```javascript
{
  en: "English Translation",
  'en-AU': "English Translation",
  fr: "Traduction Française",
  de: "Deutsche Übersetzung",
  zh: "中文翻译",
  ...
}
```

try [here](src/index.html) for an example of configured locales

## click strategies

```typescript
enum ClickStrategies =
  'default' |
  'href' |
  'replace' |
  'push'
```

An on-click-strategy correspond to what happens when a notification is clicked.
`default` and `href` do create an invisible `anchor` and click it, `replace`
triggers `window.location.replace` while `push` pushes onto `window.history` stack.

# backend communication

The notification center needs a backend service to retrieve and interact with notifications. It follows a description of
the endpoints called by the component that should be exposed by the service.

## GET - `/own`

This endpoint should return the list of paged notifications that the currently logged-in user should visualize. The notifications
should be ordered by creation date descending.

### Query

```json
{
  "limit": {
    "description": "Limits the number of documents, max 200 elements, minimum 1",
    "type": "integer",
    "minimum": 1
  },
  "skip": {
    "description": "Skip the specified number of documents",
    "type": "integer",
    "minimum": 0
  }
}
```

### Response

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "title": {
        "anyOf": [
          {"type": "string"},
          {"type": "object"}
        ]
      },
      "content": {
        "anyOf": [
          {"type": "string"},
          {"type": "object"}
        ]
      },
      "readState": {
        "type": "boolean"
      },
      "createdAt": {
        "type": "string"
      },
      "onClickCallback": {
        "kind": {
          "type": "string",
          "enum": [
            "href"
          ]
        },
        "content": {
          "type": "string"
        }
      }
    },
    "required": [
      "title",
      "createdAt"
    ]
  }
}
```

## PATCH - `/read-state/:notificationId`

This endpoint should change the read state of a specific notification given its id.

### Body

```json
{
  "type": "object",
  "properties": {
    "readState": {
      "type": "boolean"
    }
  }
}
```

### PATCH - `/read-state/own`

This endpoint should change the read state of all the notifications that the currently logged-in user can retrieve.

```json
{
  "type": "object",
  "properties": {
    "readState": {
      "type": "boolean"
    }
  }
}
```

# development

## run locally

To install extenal dependencies, please run

```shell
yarn install
```

If you'd like to test this notification center on your local machine, after installing,
you'll find a tiny backend notification mock server which handles you some data to start your component visualization mode and further allows to better
asses the notification API. The backend can be started by using

```shell
yarn start:be
```

[Stencil](https://stenciljs.com/) provides a simple frontend server which serves a simple html page containing a navbar + this repo's `micro-lc-notification-center`.
To open just run

```shell
yarn start
```

and, if not automatically prompted, navigate to <http://localhost:3333>

[micro-lc]: https://github.com/micro-lc/micro-lc
[standard-mia-svg]: https://img.shields.io/badge/code_style-standard--mia-orange.svg
[standard-mia]: https://github.com/mia-platform/eslint-config-mia
[coverall-svg]: https://coveralls.io/repos/github/mia-platform/microlc/badge.svg
[coverall-io]: https://coveralls.io/github/mia-platform/micro-lc-notification-center
[github-actions]: https://github.com/mia-platform/microlc/actions
[github-actions-svg]: https://img.shields.io/github/workflow/status/mia-platform/microlc/Node.js%20fe-container%20CI
