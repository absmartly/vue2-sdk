# Vue2 SDK Fix Plan

Based on full review of PR #17.

## Critical
None.

## Important

### 1. Fix README documenting non-existent config slot prop
- **File**: `README.md:~295-308`
- **Issue**: README shows `config` as a scoped slot property and uses `config.color` in examples, but Treatment.vue never provides `config` in slot props. Always `undefined` at runtime.
- **Fix**: Remove `config` from README scoped slot documentation and examples. If `config` is wanted, implement it in Treatment.vue.

### 2. Consider using nullish coalescing for treatment default (informational)
- **File**: `Treatment.vue:39`
- **Issue**: `this.treatment || 0` — works but `??` would be more precise.
- **Status**: Pre-existing, not introduced by PR. Low priority.

## Minor

### 3. Fix wrong assertion matcher in test
- **File**: `Treatment.spec.js:299`
- **Fix**: Change `.not.toHaveBeenCalledWith()` to `.not.toHaveBeenCalled()`.

### 4. Rename mixin.spec.js
- **Fix**: Rename to `plugin.spec.js` since it tests plugin integration, not a Vue mixin.

### 5. Document babel-preset override
- **File**: `package.json:37`
- **Fix**: Add a comment in package.json (or a note in README) explaining why `babel-preset-current-node-syntax` is pinned to 1.0.1.

## Additional Findings (Full Review v3)

### 6. Dead mock: `experimentConfig` mocked but never asserted
- **Files**: `Treatment.spec.js:8`, `mixin.spec.js:29`
- **Issue**: `experimentConfig` is set up as a mock in `createMocks()` and in mixin.spec.js mock setup, but neither the Treatment component nor any test ever calls or asserts on it. This is dead code left over from the original test structure.
- **Severity**: Minor (code quality)
- **Fix**: Remove `experimentConfig` from mock setups in both files.

### 7. Test uses Vue internal `_isDestroyed` property
- **File**: `Treatment.spec.js:533`
- **Issue**: The "handles component destruction gracefully" test asserts `wrapper.vm._isDestroyed`. The `_` prefix indicates a Vue internal property that is not part of the public API and could break on Vue 2 patch updates.
- **Severity**: Minor (correctness/robustness)
- **Fix**: Use `wrapper.vm.$destroyed` or check `wrapper.emitted()` / `wrapper.exists()` patterns from `@vue/test-utils` instead of reaching into Vue internals.

### 8. Missing destroyed-component guard in ready() promise handler
- **File**: `Treatment.vue:80-82`
- **Issue**: When a Treatment component is destroyed before `context.ready()` resolves, the `.then()` callback still calls `updateState(context)`, which sets reactive data (`this.ready`, `this.treatment`, `this.treatmentNames`) on a destroyed instance. In Vue 2, this can trigger "[Vue warn]: You are setting a reactive property on an object that is not reactive" or silently update dead state. The existing test (line 508-534) exercises this path but does not verify the guard.
- **Severity**: Minor (correctness - potential Vue warning in dev mode)
- **Fix**: Add a destroyed check in the promise callback: `context.ready().then(() => { if (!this._isDestroyed) updateState(context); });`
