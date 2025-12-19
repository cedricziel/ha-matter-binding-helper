# Changelog

## [0.26.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.26.0-rc.1...v0.26.1) (2025-12-19)


### Features

* add ACL verification polling with progress feedback ([#82](https://github.com/cedricziel/ha-matter-binding-helper/issues/82)) ([3d8158d](https://github.com/cedricziel/ha-matter-binding-helper/commit/3d8158d59cdd508c9efbb1bc441965efd98ccfc6))


### Miscellaneous

* configure release-please for pre-releases ([35b198c](https://github.com/cedricziel/ha-matter-binding-helper/commit/35b198cf775348f4ab21ec9978b340d18f9a1aaa))
* release 0.26.1 ([9b41181](https://github.com/cedricziel/ha-matter-binding-helper/commit/9b41181445a29e5dd9ea098899c873bfbae2bf3a))
* revert to normal releases ([ddae5d5](https://github.com/cedricziel/ha-matter-binding-helper/commit/ddae5d5b599a6696c16489397e3c8f51802b294d))

## [0.26.0-rc.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.25.4...v0.26.0-rc.1) (2025-12-18)


### Features

* add hideCard mode to RecommendationList and integrate ([d34605d](https://github.com/cedricziel/ha-matter-binding-helper/commit/d34605da41bc45ce46ecb0320a9d9bc1eb371b8a))
* **frontend:** add groups-tab component ([7a71865](https://github.com/cedricziel/ha-matter-binding-helper/commit/7a71865aa0e813d87c77761295337c2bfef496ee))
* **frontend:** extract additional UI components ([ac09c2c](https://github.com/cedricziel/ha-matter-binding-helper/commit/ac09c2c68fe60c13f833d3f147d9c27d4e153364))
* **frontend:** extract reusable components from matter-binding-panel ([e383c7c](https://github.com/cedricziel/ha-matter-binding-helper/commit/e383c7ce6519b086d569a43c80dea47ab5fd3929))


### Code Refactoring

* extract CSS from main panel into style modules ([b3e0a03](https://github.com/cedricziel/ha-matter-binding-helper/commit/b3e0a03c043e4f4f7b9bd237bedfcbf8403ebd39))
* **frontend:** integrate BindingWizard and CreateBindingDialog components ([c03d610](https://github.com/cedricziel/ha-matter-binding-helper/commit/c03d6105fcb971c0d16b662e5b5d20c69dd6fe5f))
* **frontend:** integrate extracted components into main panel ([98e53ce](https://github.com/cedricziel/ha-matter-binding-helper/commit/98e53ce88f722fa3a32952dcb5326cea5fd9d92f))
* **frontend:** integrate extracted components into main panel ([2290c24](https://github.com/cedricziel/ha-matter-binding-helper/commit/2290c24fb79e2a2228f0b6393f207f9c57f47329))
* integrate ConfirmDialog component for binding confirmations ([649671d](https://github.com/cedricziel/ha-matter-binding-helper/commit/649671d5642c9acd0d7992aef01c2a94d1a980a6))
* remove unused component imports ([3668697](https://github.com/cedricziel/ha-matter-binding-helper/commit/36686972449bb7adfc3d7c373d06332f93c35162))
* remove unused helper methods from main panel ([12f48a9](https://github.com/cedricziel/ha-matter-binding-helper/commit/12f48a99cc345ef8d361276c63d6fa44102d71ef))
* remove unused render methods replaced by components ([afe1ed6](https://github.com/cedricziel/ha-matter-binding-helper/commit/afe1ed6c65543dabf9df1d814940349bb4c8815b))


### Miscellaneous

* enable prerelease mode for release-please ([2c4fa6d](https://github.com/cedricziel/ha-matter-binding-helper/commit/2c4fa6d02da09c702a5d486f2ab838da90112991))
* prepare 0.26.0 pre-release ([5f253ea](https://github.com/cedricziel/ha-matter-binding-helper/commit/5f253ea177f21f7e7eb35749c7ea1dbaeef7c769))

## [0.25.4](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.25.3...v0.25.4) (2025-12-17)


### Bug Fixes

* use _extractErrorMessage for all caught exceptions in frontend ([ae971ed](https://github.com/cedricziel/ha-matter-binding-helper/commit/ae971ed1619525e3feaf35fc3c705c0b1c69b8c2))

## [0.25.3](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.25.2...v0.25.3) (2025-12-17)


### Documentation

* add frontend testing commands and ACL documentation ([fc90f0a](https://github.com/cedricziel/ha-matter-binding-helper/commit/fc90f0ae7d139bb386009d2dc0c92626c7cce68f))

## [0.25.2](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.25.1...v0.25.2) (2025-12-17)


### Bug Fixes

* apply error message extraction to all UI message displays ([872cc91](https://github.com/cedricziel/ha-matter-binding-helper/commit/872cc91aa02c739f75e2bf9124cb8ad64777869e))

## [0.25.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.25.0...v0.25.1) (2025-12-17)


### Bug Fixes

* handle object-shaped error messages in progress dialogs ([de2d699](https://github.com/cedricziel/ha-matter-binding-helper/commit/de2d699d5ad71ce8943d0a048ce3500cde4cb02f))

## [0.25.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.24.4...v0.25.0) (2025-12-17)


### Features

* add blocking progress dialogs for binding operations ([#75](https://github.com/cedricziel/ha-matter-binding-helper/issues/75)) ([735dae2](https://github.com/cedricziel/ha-matter-binding-helper/commit/735dae2b19ccb2578cbc313cb14f93cf29a40d7f))
* display node IDs in UI and fix matter.sh timeout ([#73](https://github.com/cedricziel/ha-matter-binding-helper/issues/73)) ([c041305](https://github.com/cedricziel/ha-matter-binding-helper/commit/c041305a34e1006f7c99ebd6cfe49826d0519463))

## [0.24.4](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.24.3...v0.24.4) (2025-12-17)


### Bug Fixes

* handle Matter SDK Nullable type in ACL target parsing ([#71](https://github.com/cedricziel/ha-matter-binding-helper/issues/71)) ([1f1533e](https://github.com/cedricziel/ha-matter-binding-helper/commit/1f1533e642486af9de108df821a8970a352ab51b))

## [0.24.3](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.24.2...v0.24.3) (2025-12-17)


### Bug Fixes

* properly handle error messages in ACL repair and other error handlers ([#69](https://github.com/cedricziel/ha-matter-binding-helper/issues/69)) ([4c9081c](https://github.com/cedricziel/ha-matter-binding-helper/commit/4c9081cf4f23645041d98721a731c5d46135a918))

## [0.24.2](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.24.1...v0.24.2) (2025-12-17)


### Bug Fixes

* use dedicated SET_ACL_ENTRY API and add read-after-write verification ([#67](https://github.com/cedricziel/ha-matter-binding-helper/issues/67)) ([9d71739](https://github.com/cedricziel/ha-matter-binding-helper/commit/9d7173929afbc7f1b3536ef1d58383adc0272865))

## [0.24.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.24.0...v0.24.1) (2025-12-17)


### Bug Fixes

* convert ACL values to native Python types for JSON serialization ([#65](https://github.com/cedricziel/ha-matter-binding-helper/issues/65)) ([a62b86f](https://github.com/cedricziel/ha-matter-binding-helper/commit/a62b86fffe4c58e40cf1dd90c1dda1790264631d))

## [0.24.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.9...v0.24.0) (2025-12-17)


### Features

* add ACL provisioning for Matter bindings ([#63](https://github.com/cedricziel/ha-matter-binding-helper/issues/63)) ([c2371d9](https://github.com/cedricziel/ha-matter-binding-helper/commit/c2371d94e047217eeb168f6cd5470c00b44a032c))
* **devices:** add on/off light switch device for binding tests ([762aac2](https://github.com/cedricziel/ha-matter-binding-helper/commit/762aac2fb7504a0b7b4c7be9929c383bfd76a769))
* **devices:** replace mock device with real rs-matter implementation ([762aac2](https://github.com/cedricziel/ha-matter-binding-helper/commit/762aac2fb7504a0b7b4c7be9929c383bfd76a769))
* **frontend:** add multi-step binding wizard and ACL repair ([#64](https://github.com/cedricziel/ha-matter-binding-helper/issues/64)) ([379810c](https://github.com/cedricziel/ha-matter-binding-helper/commit/379810c21b5798ccf6e084d61ffc3eb8c51d2772))
* rs-matter virtual devices and integration tests ([#62](https://github.com/cedricziel/ha-matter-binding-helper/issues/62)) ([762aac2](https://github.com/cedricziel/ha-matter-binding-helper/commit/762aac2fb7504a0b7b4c7be9929c383bfd76a769))
* **tests:** add pytest integration tests with testcontainers ([762aac2](https://github.com/cedricziel/ha-matter-binding-helper/commit/762aac2fb7504a0b7b4c7be9929c383bfd76a769))


### Bug Fixes

* **devices:** resolve Matter interview failure with Docker networking ([762aac2](https://github.com/cedricziel/ha-matter-binding-helper/commit/762aac2fb7504a0b7b4c7be9929c383bfd76a769))


### Miscellaneous

* remove debug output from ACL endpoint ([17020e4](https://github.com/cedricziel/ha-matter-binding-helper/commit/17020e44c4f2530f7eac8e40b371453ddbc02d74))

## [0.23.9](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.8...v0.23.9) (2025-12-16)


### Bug Fixes

* add detailed logging to ACL cache lookup ([186a4eb](https://github.com/cedricziel/ha-matter-binding-helper/commit/186a4ebefe448daf5a000784747ad223704d5b4d))
* handle Nullable targets in ACL parsing ([2729e5d](https://github.com/cedricziel/ha-matter-binding-helper/commit/2729e5d266781a02f80e18ccdf9f761815afa4f0))

## [0.23.8](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.7...v0.23.8) (2025-12-16)


### Bug Fixes

* add more debug logging to get_acl ([6e5e024](https://github.com/cedricziel/ha-matter-binding-helper/commit/6e5e0245ab1657da78c9c415162c6c40f5e2b39c))

## [0.23.7](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.6...v0.23.7) (2025-12-16)


### Bug Fixes

* add raw ACL value debug output ([1184b4a](https://github.com/cedricziel/ha-matter-binding-helper/commit/1184b4aab43d796b33e7e23732e65724dae628dd))

## [0.23.6](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.5...v0.23.6) (2025-12-16)


### Bug Fixes

* use string key lookup for node_data.attributes ACL ([7eff82b](https://github.com/cedricziel/ha-matter-binding-helper/commit/7eff82b8ca3650da8d8c63e13500300c49064a3e))

## [0.23.5](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.4...v0.23.5) (2025-12-16)


### Bug Fixes

* add sample key debug to ACL endpoint ([fcb1e7d](https://github.com/cedricziel/ha-matter-binding-helper/commit/fcb1e7d23d1461d4d82764009ade65eada857ecd))

## [0.23.4](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.3...v0.23.4) (2025-12-16)


### Bug Fixes

* add ACL key dump to ws_list_acl ([eb1fced](https://github.com/cedricziel/ha-matter-binding-helper/commit/eb1fcedbeac90eebe82a9c0a68be04f9a4240bc5))

## [0.23.3](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.2...v0.23.3) (2025-12-16)


### Bug Fixes

* handle AttributePath objects in ACL cache lookup ([339a66e](https://github.com/cedricziel/ha-matter-binding-helper/commit/339a66e2ecbd5f5640dea4c3490efd15ae10527e))

## [0.23.2](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.1...v0.23.2) (2025-12-16)


### Bug Fixes

* add node_data.attributes lookup for ACL cache ([5f0e618](https://github.com/cedricziel/ha-matter-binding-helper/commit/5f0e618f47ec56f634dc8b8f44a0dd5e2b6208e0))

## [0.23.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.23.0...v0.23.1) (2025-12-16)


### Bug Fixes

* improve ACL reading with node cache lookup and multi-format support ([9290ecb](https://github.com/cedricziel/ha-matter-binding-helper/commit/9290ecb47320c536ed08625ce17b32bcec0eb4a7))

## [0.23.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.22.0...v0.23.0) (2025-12-16)


### Features

* add structured error types for Matter operations ([e2ca786](https://github.com/cedricziel/ha-matter-binding-helper/commit/e2ca786a3bb32e648b5487d6ad6aee2cae5bcfc0))

## [0.22.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.21.1...v0.22.0) (2025-12-15)


### Features

* add read-only ACL visibility ([47d9e4f](https://github.com/cedricziel/ha-matter-binding-helper/commit/47d9e4f7f664def1af7200ba92dab486152e125b))
* highlight bindings missing ACL permissions ([763290f](https://github.com/cedricziel/ha-matter-binding-helper/commit/763290fe90c1b866a0f97f985c1b1f566c3218be))


### Miscellaneous

* **deps-dev:** bump @vitest/ui from 4.0.14 to 4.0.15 in /frontend ([#48](https://github.com/cedricziel/ha-matter-binding-helper/issues/48)) ([5f6a264](https://github.com/cedricziel/ha-matter-binding-helper/commit/5f6a2647276557b558846b4bcbbf21f68ff642f3))
* **deps-dev:** bump happy-dom from 20.0.10 to 20.0.11 in /frontend ([#47](https://github.com/cedricziel/ha-matter-binding-helper/issues/47)) ([698aaee](https://github.com/cedricziel/ha-matter-binding-helper/commit/698aaeefec99a598cfadf097263112144d325717))
* **deps-dev:** bump prettier from 3.6.2 to 3.7.4 in /frontend ([#45](https://github.com/cedricziel/ha-matter-binding-helper/issues/45)) ([fc05989](https://github.com/cedricziel/ha-matter-binding-helper/commit/fc059893767696a0408a8309f6eca47268ce5013))
* **deps-dev:** bump rollup from 4.53.3 to 4.53.4 in /frontend ([#46](https://github.com/cedricziel/ha-matter-binding-helper/issues/46)) ([cc67322](https://github.com/cedricziel/ha-matter-binding-helper/commit/cc67322407fc110e84da74bf002a624f3c88bd69))
* **deps:** bump actions/checkout from 4 to 6 ([#43](https://github.com/cedricziel/ha-matter-binding-helper/issues/43)) ([fb5366f](https://github.com/cedricziel/ha-matter-binding-helper/commit/fb5366fbe2ef67dc27790d2d3f1eda197c5e6ed5))
* **deps:** bump actions/setup-node from 4 to 6 ([#42](https://github.com/cedricziel/ha-matter-binding-helper/issues/42)) ([5baa4b0](https://github.com/cedricziel/ha-matter-binding-helper/commit/5baa4b0f1453d90b230d0c11454f0c5001deec0f))

## [0.21.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.21.0...v0.21.1) (2025-12-15)


### Bug Fixes

* create zip with files at root level for HACS ([1351e22](https://github.com/cedricziel/ha-matter-binding-helper/commit/1351e22d4c63a8f16115d8a4fd07fc24eeac285d))

## [0.21.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.20.0...v0.21.0) (2025-12-15)


### Features

* **frontend:** improve binding verification UX ([277e5c3](https://github.com/cedricziel/ha-matter-binding-helper/commit/277e5c300fd2e74626b914da34717c169bfcd91a))
* switch to zip_release for HACS distribution ([4cdf400](https://github.com/cedricziel/ha-matter-binding-helper/commit/4cdf400b2aeb66de9f209a0690d2b3a7651f8793))


### Bug Fixes

* **frontend:** update rollup config for @rollup/plugin-typescript v12 ([9be51f3](https://github.com/cedricziel/ha-matter-binding-helper/commit/9be51f3e4cebc02be083ee92dbb3e601774160dc))
* remove invalid filename field from hacs.json ([5d738fb](https://github.com/cedricziel/ha-matter-binding-helper/commit/5d738fba2e1b155b29c2450ffc9fdb91dd6f19c9))


### Miscellaneous

* **deps-dev:** bump [@typescript-eslint](https://github.com/typescript-eslint) packages to v8 ([692c839](https://github.com/cedricziel/ha-matter-binding-helper/commit/692c8397907049a3f3c611b748c3bc3f110b7e53))
* **deps-dev:** bump @rollup/plugin-node-resolve in /frontend ([#5](https://github.com/cedricziel/ha-matter-binding-helper/issues/5)) ([9360eb2](https://github.com/cedricziel/ha-matter-binding-helper/commit/9360eb2aaf9bbf8cf46d7c30ec4226932e83a08e))
* **deps-dev:** bump @rollup/plugin-typescript in /frontend ([#7](https://github.com/cedricziel/ha-matter-binding-helper/issues/7)) ([cb5725e](https://github.com/cedricziel/ha-matter-binding-helper/commit/cb5725eee76d6be0e531bac9483f221d439adf42))
* **deps-dev:** bump eslint from 8.57.1 to 9.39.1 in /frontend ([#6](https://github.com/cedricziel/ha-matter-binding-helper/issues/6)) ([c9bb2d9](https://github.com/cedricziel/ha-matter-binding-helper/commit/c9bb2d97c39c1a85bf214dc8ec738161f3a45b6f))
* **deps:** update package-lock.json peer dependency flags ([1912fa2](https://github.com/cedricziel/ha-matter-binding-helper/commit/1912fa25986ee2ca62847f43ae2ea0d29862994c))

## [0.20.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.19.1...v0.20.0) (2025-12-15)


### Features

* add binding verification with read-after-write confirmation ([eadd3fd](https://github.com/cedricziel/ha-matter-binding-helper/commit/eadd3fd5d1ac5f1abce0d1fdc35e4056ac544391)), closes [#38](https://github.com/cedricziel/ha-matter-binding-helper/issues/38)


### Miscellaneous

* **deps:** bump actions/checkout from 4 to 6 ([#37](https://github.com/cedricziel/ha-matter-binding-helper/issues/37)) ([3235056](https://github.com/cedricziel/ha-matter-binding-helper/commit/323505653f2dab86793f3408587b09ef1032780b))
* **deps:** bump actions/setup-node from 4 to 6 ([#35](https://github.com/cedricziel/ha-matter-binding-helper/issues/35)) ([47987fe](https://github.com/cedricziel/ha-matter-binding-helper/commit/47987fe52ad11c2233c0a3db911af3cff1890f74))
* **deps:** bump actions/setup-python from 5 to 6 ([#36](https://github.com/cedricziel/ha-matter-binding-helper/issues/36)) ([0c6bd2a](https://github.com/cedricziel/ha-matter-binding-helper/commit/0c6bd2ab3ab74d53b86974b33846f8e7e7152739))

## [0.19.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.19.0...v0.19.1) (2025-12-05)


### Bug Fixes

* try string parsing first for v3 attribute keys ([8771c75](https://github.com/cedricziel/ha-matter-binding-helper/commit/8771c75b59abfd0363fc04a760d5ee13c0310824))

## [0.19.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.18.2...v0.19.0) (2025-12-04)


### Features

* add debug-v3 endpoint to inspect attribute extraction ([8a02f96](https://github.com/cedricziel/ha-matter-binding-helper/commit/8a02f9623d97bffc873c993da4fcd8e715bd484b))


### Bug Fixes

* prefer node_data.attributes for v3 cluster extraction ([ca2746f](https://github.com/cedricziel/ha-matter-binding-helper/commit/ca2746fec68abb2a273ad35e22cc12eb2c50a610))

## [0.18.2](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.18.1...v0.18.2) (2025-12-04)


### Bug Fixes

* add fallback to node_data.attributes for v3 extraction ([99fc563](https://github.com/cedricziel/ha-matter-binding-helper/commit/99fc563fa90e10f2745193a529ecc4a2b214b654))

## [0.18.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.18.0...v0.18.1) (2025-12-04)


### Bug Fixes

* check AttributePath objects first in v3 cluster extraction ([8df3e06](https://github.com/cedricziel/ha-matter-binding-helper/commit/8df3e062ae05b90a9876e401865fdef9f45524d4))


### Miscellaneous

* add debug logging for v3 cluster extraction ([cefa027](https://github.com/cedricziel/ha-matter-binding-helper/commit/cefa027e27d43514095dd3200ed061eb57cc3971))

## [0.18.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.17.0...v0.18.0) (2025-12-04)


### Features

* add debug_telemetry WebSocket endpoint ([eaf5bf6](https://github.com/cedricziel/ha-matter-binding-helper/commit/eaf5bf65589c94fb7364fca2c7e2dff21e79dd13))


### Bug Fixes

* improve v3 cluster attribute extraction ([911a75b](https://github.com/cedricziel/ha-matter-binding-helper/commit/911a75bb4f6575694a8fa4fc17b3e4b6cafa5bdc))

## [0.17.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.16.0...v0.17.0) (2025-12-04)


### Features

* implement telemetry schema v3 with detailed cluster info ([3675942](https://github.com/cedricziel/ha-matter-binding-helper/commit/36759428440dbe72d9016b4fbe94f44f58637929))


### Bug Fixes

* add cluster_commands to attributes dict fallback extraction ([80099da](https://github.com/cedricziel/ha-matter-binding-helper/commit/80099da73a1090f8597c78cc532bc6dfe359a619))

## [0.16.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.15.0...v0.16.0) (2025-12-04)


### Features

* show human-readable command names in cluster tooltip ([5a5c5d0](https://github.com/cedricziel/ha-matter-binding-helper/commit/5a5c5d0cf8ea077af7622d20d942995b5c6df9d8))


### Bug Fixes

* check accepted commands before attempting schedule load ([0dc9ddf](https://github.com/cedricziel/ha-matter-binding-helper/commit/0dc9ddf5d41d958df11c2863de80f8afa32b9a0e))

## [0.15.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.14.1...v0.15.0) (2025-12-04)


### Features

* show accepted commands per cluster in endpoint view ([0f13721](https://github.com/cedricziel/ha-matter-binding-helper/commit/0f13721a1bbbf203857de55d0bb713deb9aa2c03))

## [0.14.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.14.0...v0.14.1) (2025-12-04)


### Bug Fixes

* improve schedule error handling and show explicit unsupported message ([41ba82c](https://github.com/cedricziel/ha-matter-binding-helper/commit/41ba82c4a9545e5594a64fcbe032a736ad1826b3))

## [0.14.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.13.2...v0.14.0) (2025-12-04)


### Features

* add Matter thermostat weekly schedule editor ([57f166e](https://github.com/cedricziel/ha-matter-binding-helper/commit/57f166eb51f3ad4906ac64110de4169dc8658d39))

## [0.13.2](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.13.1...v0.13.2) (2025-12-02)


### Bug Fixes

* disable proprietary sensors - was crashing Matter integration ([489e28f](https://github.com/cedricziel/ha-matter-binding-helper/commit/489e28f62f819bbcd2e18b50b6e19819f4c03352))

## [0.13.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.13.0...v0.13.1) (2025-12-02)


### Bug Fixes

* only create proprietary sensors for matching device fingerprints ([f67743e](https://github.com/cedricziel/ha-matter-binding-helper/commit/f67743e109a3e7fe106fd43ec14f10c35b9ec06c))

## [0.13.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.12.0...v0.13.0) (2025-12-02)


### Features

* add generic proprietary sensor framework ([d888d99](https://github.com/cedricziel/ha-matter-binding-helper/commit/d888d993f10dfa5d9a676e9dc1df3a2a77a46af1))

## [0.12.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.11.0...v0.12.0) (2025-12-02)


### Features

* add diagnostic sensor to show Matter bindings on device page ([289b7d1](https://github.com/cedricziel/ha-matter-binding-helper/commit/289b7d181a6766da17751d77763c38d943691470))
* integrate device registry in frontend ([5850696](https://github.com/cedricziel/ha-matter-binding-helper/commit/585069662c065017e7bd9662007d7201e2f1c65b))
* integrate matter-device-definitions registry ([d35d929](https://github.com/cedricziel/ha-matter-binding-helper/commit/d35d929a895ed29faf21b5e2e192d66fe6674675))


### Bug Fixes

* update build pipeline and add Makefile venv support ([517d1ff](https://github.com/cedricziel/ha-matter-binding-helper/commit/517d1ff7e5ede1a17ee3454ecb5128601119c23c))


### Miscellaneous

* update device-definitions to include dist/ ([6d06591](https://github.com/cedricziel/ha-matter-binding-helper/commit/6d065915b41d0449c08947ee78928c79e4be3265))

## [0.11.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.10.1...v0.11.0) (2025-12-01)


### Features

* redesign Devices tab with right-panel device details ([e00bcb8](https://github.com/cedricziel/ha-matter-binding-helper/commit/e00bcb8e4b4dc789fecd1fcf2ed47ff931925c4d))

## [0.10.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.10.0...v0.10.1) (2025-12-01)


### Bug Fixes

* improve Eve schedule attribute lookup ([8d5fb52](https://github.com/cedricziel/ha-matter-binding-helper/commit/8d5fb52e07781a9ab5fec5eecb20b7ee7faad787))

## [0.10.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.9.0...v0.10.0) (2025-12-01)


### Features

* add Eve thermostat schedule display ([fc8f289](https://github.com/cedricziel/ha-matter-binding-helper/commit/fc8f289977ab6c0d0ff86b14379e390003a96ef0))

## [0.9.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.8.0...v0.9.0) (2025-12-01)


### Features

* add raw node_data attribute inspection for unknown clusters ([bb924a1](https://github.com/cedricziel/ha-matter-binding-helper/commit/bb924a16650481b74e1940d4d12fd69e0d433fd0))

## [0.8.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.7.0...v0.8.0) (2025-12-01)


### Features

* add cluster attribute inspection for proprietary clusters ([4fad099](https://github.com/cedricziel/ha-matter-binding-helper/commit/4fad0995ca43b32fea9dd00ace3637a9ab22caf5))

## [0.7.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.6.1...v0.7.0) (2025-12-01)


### Features

* add debug command to list accepted cluster commands ([20919d5](https://github.com/cedricziel/ha-matter-binding-helper/commit/20919d589662ca2ede20676545a16b7445d30296))
* add integration icon ([a82f68a](https://github.com/cedricziel/ha-matter-binding-helper/commit/a82f68a3b8603bd269a15111223d50a60f20eed7))

## [0.6.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.6.0...v0.6.1) (2025-11-26)


### Bug Fixes

* update README features list to reflect current capabilities ([6ee1094](https://github.com/cedricziel/ha-matter-binding-helper/commit/6ee10945f6ff28e6bcab2639175b396631663916))

## [0.6.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.5.0...v0.6.0) (2025-11-26)


### Features

* complete UX overhaul for Bindings tab create dialog ([0a989fa](https://github.com/cedricziel/ha-matter-binding-helper/commit/0a989fae502a0c1704db2ca84c0d57666a922656))

## [0.5.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.4.1...v0.5.0) (2025-11-26)


### Features

* add cluster visibility badges to binding recommendations ([47536be](https://github.com/cedricziel/ha-matter-binding-helper/commit/47536be956223b1c13fc76db96410e2cd5d4857c))
* allow multiple bindings per cluster and add test suite ([4650886](https://github.com/cedricziel/ha-matter-binding-helper/commit/4650886ed6db5669220ed919d453e41995232bf6))


### Miscellaneous

* add dependabot ([d892236](https://github.com/cedricziel/ha-matter-binding-helper/commit/d892236271f480413b0a52a013f03dd5cef8cc97))
* add dependabot for component ([4715988](https://github.com/cedricziel/ha-matter-binding-helper/commit/4715988378bdd0591fca3195434b7b0a8b686751))
* add github actions flow ([55fe5e4](https://github.com/cedricziel/ha-matter-binding-helper/commit/55fe5e4fb25bb583d28c7d4da00e2c41d396e545))
* **deps:** bump actions/checkout from 4 to 6 ([#11](https://github.com/cedricziel/ha-matter-binding-helper/issues/11)) ([af50f6e](https://github.com/cedricziel/ha-matter-binding-helper/commit/af50f6e1a90daf116cc546c51814a74015055a17))
* **deps:** bump actions/checkout from 4 to 6 ([#4](https://github.com/cedricziel/ha-matter-binding-helper/issues/4)) ([ecb19fc](https://github.com/cedricziel/ha-matter-binding-helper/commit/ecb19fc5199920a81dddfe89b030a72f8df32740))
* **deps:** bump actions/setup-node from 4 to 6 ([#10](https://github.com/cedricziel/ha-matter-binding-helper/issues/10)) ([556af73](https://github.com/cedricziel/ha-matter-binding-helper/commit/556af73f6a9552ef83d44f582ab86abedfdcd8ab))
* **deps:** bump actions/setup-python from 5 to 6 ([#12](https://github.com/cedricziel/ha-matter-binding-helper/issues/12)) ([d663797](https://github.com/cedricziel/ha-matter-binding-helper/commit/d6637977431f24c97f74c273362361a9dda99ef8))

## [0.4.1](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.4.0...v0.4.1) (2025-11-23)


### Bug Fixes

* update repository references to ha-matter-binding-helper ([84c6827](https://github.com/cedricziel/ha-matter-binding-helper/commit/84c6827f6ece26db2d7d03265e3e9c5dd26b2381))

## [0.4.0](https://github.com/cedricziel/ha-matter-binding-helper/compare/v0.3.0...v0.4.0) (2025-11-23)


### Features

* add "Same area only" toggle filter for recommendations ([301a042](https://github.com/cedricziel/ha-matter-binding-helper/commit/301a04281bcad1e0649875e2dad63beba7d82372))
* add confirmation dialogs for create and delete bindings ([e9916b2](https://github.com/cedricziel/ha-matter-binding-helper/commit/e9916b2530f60d6328f1855b1b37f0b5b6dc757c))
* add debug logging for binding creation ([b29aa2b](https://github.com/cedricziel/ha-matter-binding-helper/commit/b29aa2ba4a5b0f77d5308d5564783e1f5c0a0c73))
* add detailed logging and user feedback for survey submissions ([abeddf6](https://github.com/cedricziel/ha-matter-binding-helper/commit/abeddf656312ac1e75e4c9c8f71816637cb0c895))
* add device info and area display from HA registry ([827d005](https://github.com/cedricziel/ha-matter-binding-helper/commit/827d005c2e42aa491c1844f20d4c3b5bf9be3c07))
* add device info to API and UI ([f696847](https://github.com/cedricziel/ha-matter-binding-helper/commit/f696847c23f863e92cc2b46dfc7151482052501f))
* add entity discovery with clickable links to HA ([6475377](https://github.com/cedricziel/ha-matter-binding-helper/commit/6475377e8610bd2f36519b395c80c1b892f6c208))
* add Generic Switch support and button automation templates ([b3b6810](https://github.com/cedricziel/ha-matter-binding-helper/commit/b3b68100b4da2bed6a4bcd2af554b112f6b9e08b))
* add loading spinner and auto-refresh for binding actions ([496df52](https://github.com/cedricziel/ha-matter-binding-helper/commit/496df523010fe21374cde878031af719bfb034ea))
* add loading spinner to Bindings tab delete button ([69f1755](https://github.com/cedricziel/ha-matter-binding-helper/commit/69f17556f5715ce3c390ad91b013b8e6834f74e4))
* add manual survey submission service and UI button ([620140d](https://github.com/cedricziel/ha-matter-binding-helper/commit/620140dd268bd2dc721ee2dbe5b5c03e4a43cae7))
* add Matter Survey telemetry and web index ([e753cfc](https://github.com/cedricziel/ha-matter-binding-helper/commit/e753cfc6245900bdb61d1ae2b84042e3119f3edd))
* add Overview tab with established and recommended bindings ([8c5c8e4](https://github.com/cedricziel/ha-matter-binding-helper/commit/8c5c8e4c9f739e0f004935adf26a6f3e57fc555c))
* add recommended automations section for missing binding features ([c52f372](https://github.com/cedricziel/ha-matter-binding-helper/commit/c52f37242cb0ad345d6c8794e7bda5f3ef8ebfa5))
* add smart binding validation based on client/server clusters ([853411e](https://github.com/cedricziel/ha-matter-binding-helper/commit/853411e2c9c9ec906346d13d154b93bc2e748da8))
* distinguish client vs server clusters in Matter endpoints ([42865de](https://github.com/cedricziel/ha-matter-binding-helper/commit/42865de174677a29d0598792bec9d25ae0523209))
* initial Matter Binding Helper integration ([caf6e1e](https://github.com/cedricziel/ha-matter-binding-helper/commit/caf6e1ebbaacf98316a44794b736790fc9c842e2))
* make binding rows human-readable ([5124d60](https://github.com/cedricziel/ha-matter-binding-helper/commit/5124d605f1039aba949ca0cad572a14e09b92a57))
* make device names clickable to navigate to HA device page ([6b57ab6](https://github.com/cedricziel/ha-matter-binding-helper/commit/6b57ab6762e9c8ff37b8cb5b84d4e3598755d248))
* show cluster names and areas in binding overview ([a910693](https://github.com/cedricziel/ha-matter-binding-helper/commit/a91069354787618bef5d65be9d1e87f9ecdc17b6))
* show endpoint details with device types and clusters ([c5945e1](https://github.com/cedricziel/ha-matter-binding-helper/commit/c5945e1514b34347a6d576b33133eb34672681b6))
* show primary device type in node list ([76f4696](https://github.com/cedricziel/ha-matter-binding-helper/commit/76f46965510ff9d8284fe0ff4f7985cdb83f71e8))


### Bug Fixes

* correct identifier format for HA device lookup ([26b008d](https://github.com/cedricziel/ha-matter-binding-helper/commit/26b008d5fa07a8b317719a4accec66a9a8d80768))
* correct Store import and instantiation in telemetry module ([72c3dfe](https://github.com/cedricziel/ha-matter-binding-helper/commit/72c3dfe900a8014a5808d7a4773f64c248aeaedb))
* exclude data/ from deploy to preserve database ([c1dd471](https://github.com/cedricziel/ha-matter-binding-helper/commit/c1dd471149a9361ceb8a1fa46d24183149949a6f))
* extract endpoints from MatterNodeData attributes dict ([77fe94d](https://github.com/cedricziel/ha-matter-binding-helper/commit/77fe94d6ca5b7cb4e51e27af0e11a7a585ebe6ad))
* extract endpoints from node.endpoints property ([fb88d11](https://github.com/cedricziel/ha-matter-binding-helper/commit/fb88d11e561a7bc9c90c8eba7e3b61bc2bb612c8))
* filter out conflicting binding recommendations ([82c787b](https://github.com/cedricziel/ha-matter-binding-helper/commit/82c787b682c51d02e46a2d27bc64a187deea2f7a))
* improve device_info extraction from Matter nodes ([4ef2f0f](https://github.com/cedricziel/ha-matter-binding-helper/commit/4ef2f0f957fdab2c5fc1fed9e4941a128731dc19))
* improve node list layout for better readability ([3dbd7d1](https://github.com/cedricziel/ha-matter-binding-helper/commit/3dbd7d1e97ab16fb8bbea9a47f296d0a40422609))
* read bindings from MatterEndpoint object instead of flat attributes dict ([06571f6](https://github.com/cedricziel/ha-matter-binding-helper/commit/06571f6a18634bce1e16765db3386b220ded70d6))
* replace Store with config entry storage for installation ID ([61053ad](https://github.com/cedricziel/ha-matter-binding-helper/commit/61053adc0a55eb0715bc57c0198b04103d72b264))
* replace survey notifications with non-blocking modal ([7c01444](https://github.com/cedricziel/ha-matter-binding-helper/commit/7c014446a4a106e8f54da7485ae04e8c23a5bbfd))
* selected item text colors and add device type separator ([e988263](https://github.com/cedricziel/ha-matter-binding-helper/commit/e9882632c7cc1637b47e5dd32533eff828da0900))
* stop event propagation on endpoint click ([11155b0](https://github.com/cedricziel/ha-matter-binding-helper/commit/11155b098780d044c7398ca93dcafb410ae33242))
* use device-specific language in automation 'why' explanations ([b09e014](https://github.com/cedricziel/ha-matter-binding-helper/commit/b09e014f336cf97c73868895cce83f061348e704))
* use hass-more-info event for entity links ([e11dab7](https://github.com/cedricziel/ha-matter-binding-helper/commit/e11dab7e51dc96978360c9f19cc0a8d25ad77c7e))
* use project data dir for rate limiting instead of /tmp ([28aad4c](https://github.com/cedricziel/ha-matter-binding-helper/commit/28aad4c04beed20d3d8fea1e269964fdc980e685))


### Code Refactoring

* migrate matter-survey to Symfony 7 microframework ([e6e28ff](https://github.com/cedricziel/ha-matter-binding-helper/commit/e6e28ff9c1b2d856b09f6adbc4bbc98bd6cf7bed))
* move version badge to node meta line ([fb1ce79](https://github.com/cedricziel/ha-matter-binding-helper/commit/fb1ce796525684d0e798260566f4a4e713c62cb0))


### Documentation

* add Claude Code project guidance ([a05bfe8](https://github.com/cedricziel/ha-matter-binding-helper/commit/a05bfe80492aaf6caeeff0b81a385499e2d21c87))
* add OpenAPI spec and Redoc documentation for Matter Survey API ([0312514](https://github.com/cedricziel/ha-matter-binding-helper/commit/0312514104bd1c717b918a67b6c7c873f67157b4))
* update CLAUDE.md with matter.sh commands and data model details ([8d3add9](https://github.com/cedricziel/ha-matter-binding-helper/commit/8d3add958d811a13f292b9fe308b39c805cd16dd))


### Miscellaneous

* add .env.dist ([e44b4d3](https://github.com/cedricziel/ha-matter-binding-helper/commit/e44b4d3da4b23cf1dab3c06866b587031bb1c344))
* add debug logging for device_info attribute inspection ([60de6f8](https://github.com/cedricziel/ha-matter-binding-helper/commit/60de6f8d88221b82291bd2f0491af2fb61b5432c))
* add debug logging for device_info extraction ([1e30e91](https://github.com/cedricziel/ha-matter-binding-helper/commit/1e30e913c43e6ddc879ffddb638c73fea7e219ae))
* add hassfest ([253ad97](https://github.com/cedricziel/ha-matter-binding-helper/commit/253ad9701c0b500b082123cb24a44fe8feeb18a8))
* bump version to 0.2.0 ([2c6d16e](https://github.com/cedricziel/ha-matter-binding-helper/commit/2c6d16e0775d8d99d07385a3a46245471b07e6ed))
* change token to RELEASE_PLEASE_TOKEN ([31ad8e9](https://github.com/cedricziel/ha-matter-binding-helper/commit/31ad8e949f786e0d9df3fa46981b1327c611fd7e))
* move matter-survey site to separate repository ([a2137c5](https://github.com/cedricziel/ha-matter-binding-helper/commit/a2137c5f4aa63665df3edda5df05dd2b42946718))
* update telemetry URL to matter-survey.org ([414b816](https://github.com/cedricziel/ha-matter-binding-helper/commit/414b816c08af9a1fc9d70ff54e102003a9a915a5))
* validate for hacs ([600dc09](https://github.com/cedricziel/ha-matter-binding-helper/commit/600dc0963431b6b24b0042e3047254c7f9e52e4e))
