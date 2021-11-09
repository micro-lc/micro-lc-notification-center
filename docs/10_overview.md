# Notification center

The notification center is a web-component that can be mounted in micro-lc to enable logged users to interact with notifications.

## Integrate in micro-lc

_Coming soon..._

## Backend communication

The notification center needs a backend service to retrieve and interact with notifications. It follows a description of
the endpoints called by the component that should be exposed by the service.

#### GET - `/own`

This endpoint should return the list of paged notifications that the currently logged-in user should visualize.

**Query**

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

**Response**

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string"
      },
      "content": {
        "type": "string"
      },
      "read": {
        "type": "boolean"
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
      "title"
    ]
  }
}
```

#### PATCH - `/read-state/:notificationId`

This endpoint should change the read state of a specific notification given its id.

**Body**

```json
{
  "readState": {
    "type": "boolean"
  }
}
```

#### PATCH - `/read-state/own`

This endpoint should change the read state of all the notifications that the currently logged-in user can retrieve.

```json
{
  "readState": {
    "type": "boolean"
  }
}
```
