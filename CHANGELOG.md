# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [v2.0.0] - 2022/06/23

### Added

- `micro-lc-notification-center` supports (short-)polling for real-time notifications

## [v2.0.0] - 2022/05/12

### Added

- `micro-lc-notification-center` webcomponent migrated to [lit](https://lit.dev/) and build is using [vite](https://vitejs.dev/)

### Changed

- `/own` requests add a language `lang` query params to help notification translation server-side (possibly breaking server-side)

## [v1.0.0-rc2] - 2022/01/17

### Added
  
- new property/attribute `clickStrategy`/`click-strategy` (see [README](./README.md#on-click-strategies))
- `title` and `content` can be internationalized using `object` instead of `string`
