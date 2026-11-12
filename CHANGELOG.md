# Changelog

## 1.3.0 (unreleased)

### Changed
- Cross-SDK consistency fixes; `Treatment` handles failures in `ready().then`.
- Dependency updates.
- Depends on the `@absmartly/javascript-sdk` system-attributes change ([javascript-sdk#68](https://github.com/absmartly/javascript-sdk/pull/68)): audiences and assignment rules are always evaluated with the configured `application` and `environment` names, and `app_version` is no longer available to them. User-set attributes with the same name still win. `includeSystemAttributes` now only publishes `sdk_name` and `sdk_version`.

### Migration

**This changes assignment for running experiments.** A unit in an experiment with Audience enforced (`audienceStrict`) and an `environment` or `application` condition currently gets variant 0, even when it matches the condition and even when the experiment is full-on. After upgrading, a matching unit is randomised normally (or gets the full-on variant). Those experiments are broken today; this release fixes them, but their exposures will change. If an audience used `app_version`, it no longer matches.
