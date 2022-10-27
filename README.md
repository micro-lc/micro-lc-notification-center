<div align="center">

# micro-lc notification center

[![Build Status][github-actions-svg]][github-actions]
[![javascript style guide][standard-mia-svg]][standard-mia]
[![Coverage Status][coverall-svg]][coverall-io]
[![Mia-Platform](https://img.shields.io/badge/Supported%20by-Mia--Platform-green?style=for-the-badge&link=https://mia-platform.eu/&color=DE0D92&labelColor=214147)](https://mia-platform.eu/?utm_source=referral&utm_medium=github&utm_campaign=micro-lc)

</div>

This [micro-lc][micro-lc] plugin enables you to handle notifications in your application.

This plugin is in fact a web-component which can be
embedded in any html page or within micro-lc.
It works by dealing
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
|`limitQueryParam`|`limit-query-param`|string|'limit'|string to use as query param as pagination limit param|
|`skipQueryParam`|`skip-query-param`|string|'skip'|string to use as query param as pagination skip param|
|`pushStateKey`|`push-state-key`|string|'micro-lc-notification-center'|it's the key used to scope the content callback context in window.history.state when clickStrategy is 'push'. Otherwise it is neglected|
|`allowExternalHrefs`|`allow-external-hrefs`|string|'micro-lc-notification-center'|When true and clickStrategy is `default`, `href` or `replace`, notification links can browse to external web pages and href are not checked to ensure they are relative to self-website|
|`mode`|`mode`|[ResourceFetchingMode](#resource-fetching-mode)|'default'|Strategy to implement for automatic notifications fetching|
|`pollingFrequency`|`pollingFrequency`|number|10000|frequency of notifications automatic fetching (in milliseconds), if mode is set to `polling`|


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

## resource fetching mode

```typescript
enum ClickStrategies =
  'polling' |
  'default' |
  'none'
```

Determines how the data is automatically fetched. If `polling`, the property `pollingFrequency` determines the fetching frequency. If `default` or `none`, data is never fetched automatically.


# backend communication

The notification center needs a backend service to retrieve and interact with notifications. It follows a description of
the endpoints called by the component that should be exposed by the service.

## GET - `/own`

This endpoint should return the list of paged notifications that the currently logged-in user should visualize. The notifications
should be ordered by creation date descending.

### Query Parameters

Query parameters `size` and `limit` helps querying the notification pagination. While the optional parameter `lang` allows to
communicate to the server which translation to serve. The interface still accepts a `LocalizedText` even if `lang` is specified

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "description": "Limits the number of documents, max 200 elements, minimum 1",
      "type": "integer",
      "minimum": 1
    },
    "skip": {
      "description": "Skip the specified number of documents",
      "type": "integer",
      "minimum": 0
    },
    "lang": {
      "description": "a language code meta like `en` or `zh`",
      "type": "string"
    }
  },
  "required": ["skip", "limit"]
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
you'll find a tiny backend notification mock server which handles some data to your frontend and further allows to better
asses the notification API. The backend can be started by using

```shell
yarn start:server
```

You can start your frontend in 2 different ways

1. `viteJS` development mode which servers typescript source files ready for transpilation
2. using the minified library pack

For the former case, just run

```shell
yarn start
```

which serves `./index.html` on `localhost:3000`.

The latter requires building the library and a corresponding docker container

```shell
yarn build:unpkg

export IMAGE_NAME=micro-lc-notification-center
docker build --tag $IMAGE_NAME .

## or instead

yarn docker:build
```

where the latter is recommended if the default image name is fine for
your local machine

and then deploying

```shell
export CONTAINER_NAME=notification-center
docker run -d -p 3000:8080 --name $CONTAINER_NAME $IMAGE_NAME

## or 

yarn docker:run [<container_name>]
```

where the latter is recommended if you kept the default image name. The
container name defaults to `nc` and can be omitted.

feel free to edit both variables at will. A sample webpage will be available at `http://localhost:3000`.

## build

The repository emits:

1. ES Module
2. CommonJS
3. TS Types
4. Minified ES Module library with [`adoptedStyleSheet`](https://caniuse.com/mdn-api_document_adoptedstylesheets) polyfills (needed by Firefox and Safari)

libraries are built by the idiomatic scripts

1. ```yarn build:es```
2. ```yarn build:cjs```
3. ```yarn build:types```
4. ```yarn build:unpkg```

An overall parallel script to run them all is available as

```shell
yarn build
```

[micro-lc]: https://github.com/micro-lc/micro-lc
[standard-mia-svg]: https://img.shields.io/badge/code_style-standard--mia-orange.svg
[standard-mia]: https://github.com/mia-platform/eslint-config-mia
[coverall-svg]: https://coveralls.io/repos/github/mia-platform/microlc/badge.svg
[coverall-io]: https://coveralls.io/github/mia-platform/micro-lc-notification-center
[github-actions]: https://github.com/mia-platform/microlc/actions
[github-actions-svg]: https://img.shields.io/github/workflow/status/mia-platform/microlc/Node.js%20fe-container%20CI
