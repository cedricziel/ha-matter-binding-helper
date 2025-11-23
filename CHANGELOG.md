# Changelog

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
