/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { MicroLcHeaders } from "./components/nofication-center/micro-lc-notification-center";
import { PartialTranslations } from "./lib/utils/i18n.utils";
export namespace Components {
    interface MicroLcNotificationCenter {
        /**
          * `endpoint` (optional) is the http client url to fetch notifications. It defaults to relative ref: `/api/v1/micro-lc-notification-center`. It can also be used as a plain attribute by setting ```html <body>   <micro-lc-notification-center     endpoint="https://example.com/my-notifications"   ></micro-lc-notification-center> </body> ```
         */
        "endpoint": string;
        /**
          * `headers` (optional) is a key-value list of  http headers to attach to the http client that fetches notifications
         */
        "headers": MicroLcHeaders;
        /**
          * `limit` (optional) controls pagination limit  while fetching notifications. It is also an HTML  attribute.
         */
        "limit": number;
        /**
          * `locales` (optional) is a key-value list to  allow i18n support. Keys are paired to either a string, which overrides language support or to a key-value map that matches a language to a translation  ```javascript const locales = {   title: 'A Title',   subtitle: {     en: 'A i18n subtitle',     'it-IT': 'Un sottotitolo internazionalizzato'   } } ```
         */
        "locales": PartialTranslations;
    }
}
declare global {
    interface HTMLMicroLcNotificationCenterElement extends Components.MicroLcNotificationCenter, HTMLStencilElement {
    }
    var HTMLMicroLcNotificationCenterElement: {
        prototype: HTMLMicroLcNotificationCenterElement;
        new (): HTMLMicroLcNotificationCenterElement;
    };
    interface HTMLElementTagNameMap {
        "micro-lc-notification-center": HTMLMicroLcNotificationCenterElement;
    }
}
declare namespace LocalJSX {
    interface MicroLcNotificationCenter {
        /**
          * `endpoint` (optional) is the http client url to fetch notifications. It defaults to relative ref: `/api/v1/micro-lc-notification-center`. It can also be used as a plain attribute by setting ```html <body>   <micro-lc-notification-center     endpoint="https://example.com/my-notifications"   ></micro-lc-notification-center> </body> ```
         */
        "endpoint"?: string;
        /**
          * `headers` (optional) is a key-value list of  http headers to attach to the http client that fetches notifications
         */
        "headers"?: MicroLcHeaders;
        /**
          * `limit` (optional) controls pagination limit  while fetching notifications. It is also an HTML  attribute.
         */
        "limit"?: number;
        /**
          * `locales` (optional) is a key-value list to  allow i18n support. Keys are paired to either a string, which overrides language support or to a key-value map that matches a language to a translation  ```javascript const locales = {   title: 'A Title',   subtitle: {     en: 'A i18n subtitle',     'it-IT': 'Un sottotitolo internazionalizzato'   } } ```
         */
        "locales"?: PartialTranslations;
    }
    interface IntrinsicElements {
        "micro-lc-notification-center": MicroLcNotificationCenter;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "micro-lc-notification-center": LocalJSX.MicroLcNotificationCenter & JSXBase.HTMLAttributes<HTMLMicroLcNotificationCenterElement>;
        }
    }
}
