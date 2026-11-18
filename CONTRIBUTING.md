# Contributing to the A/B Smartly JavaScript SDK

The A/B Smartly JavaScript SDK is an open source project and we welcome your feedback and contributions.
The information below describes how to build and test the project, and how to submit a pull request.

## Development

### Development process

1. Fork the repository and create a topic branch from `main` branch. Please use a descriptive name for your branch.
2. While developing, use descriptive messages in your commits. Avoid short or meaningless sentences like: "fix bug".
3. Make sure to add tests for both positive and negative cases.
4. Run the linter script of the project and fix any issues you find.
5. Run the build script and make sure it runs with no errors.
6. Run all tests and make sure there are no failures.
7. `git push` your changes to GitHub within your topic branch.
8. Open a Pull Request from your forked repo and into the `main` branch of the original repository.
9. When creating your PR, please fill out all the fields of the PR template, as applicable, for the project.
10. Check for conflicts once the pull request is created to make sure your PR can be merged cleanly into `main`.
11. Keep an eye out for any feedback or comments from A/B Smartly's SDK team.

### Building the SDK

For widespread use of the SDK with different environments and module formats, we have these different builds:
* A bundled **UMD** file for browsers (IE 10+).
* A **CommonJS** modules compatible build.

The different builds can be generated all at once with the command `npm run build`. Refer to [package.json](package.json) for more insight on the build scripts.

### Running tests

The project includes unit tests for both browser and Node.js environments.

All tests can be run at once with the command `npm run test`. The release-script tests need `bash` on `PATH`.

For additional testing scripts or to get more insight on how these work, please refer to our [package.json](package.json) file.

### Linting and other useful checks

Consider running the linter script (`npm run lint`) and fixing any issues before pushing your changes.

If you want to debug your changes consuming it from a test application, you could:
- For browsers, import the **UMD** bundle from an HTML document. To debug you can use the browser dev tools.
- For Node, you could use symlinks via [npm link command](https://docs.npmjs.com/cli/link.html) and then import the package as usual. To debug you could use the [Node inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/).

## Releasing

Releases are published to npm by the [Publish workflow](.github/workflows/publish.yml) using npm Trusted Publishing (OIDC) with provenance.

1. Bump `version` in `package.json` (and `package-lock.json`) on `main`.
2. Tag the merged version-bump commit with `v` + that version and push that one tag on its own:

   ```sh
   git fetch origin main
   git tag v1.2.2 <version-bump-commit>   # a commit on origin/main whose package.json has 1.2.2
   git push origin v1.2.2
   ```

   The workflow fails if the tag and `package.json` version differ, or if the tagged commit is not on `main`. Push release tags one per `git push`: GitHub does not trigger tag workflows when more than three tags are pushed at once.
3. A `build` job (no publish credentials) runs the checks, `npm ci --ignore-scripts`, the tests and the build. A separate `publish` job, the only one in the `npm` environment with an OIDC token, then publishes that build with `npm publish --provenance --access public --ignore-scripts --tag "$NPM_TAG"`. `--ignore-scripts` skips the `prepack` script (which would run `npm upgrade` and rebuild); `NPM_TAG` is the dist-tag chosen as follows:
   - Stable releases (e.g. `1.2.2`) go to `latest`, unless they are older than the version `latest` points at on npm, so `latest` never moves backwards. An older major goes to `latest-<major>` (e.g. `1.4.0` after `2.0.0` goes to `latest-1`); an older minor or patch of the current major goes to `latest-<major>.<minor>` (e.g. `1.2.5` after `1.3.0` goes to `latest-1.2`).
   - Prereleases never go to `latest` or `latest-<major>`, whatever their major: versions containing `-alpha` go to `alpha`, `-beta` to `beta`, and any other prerelease (e.g. `1.3.0-rc.1`) to `next`. Build metadata (`+...`) is ignored when choosing, so `1.3.0+ci-alpha` is a stable release. Install one with `npm install @absmartly/vue2-sdk@beta` (or `@alpha`, `@next`), or list every tag with `npm view @absmartly/vue2-sdk dist-tags`.

   Publish runs are serialised across all tags and queued in order, so two release tags pushed one after the other publish one after the other. GitHub keeps at most 100 pending runs per queue and cancels any beyond that.

   Each `latest-<major>` and `latest-<major>.<minor>` tag points at the last release that was published *with that tag*. That release is not necessarily the newest one in the line:
   - A tag can move backwards. With `latest` at `2.0.0`, publishing `1.3.5` after `1.4.0` moves `latest-1` back to `1.3.5`.
   - A tag can be left behind. With `latest` at `1.3.0`, publishing `1.2.3` sets `latest-1.2`. Once `latest` is `2.0.0`, publishing `1.2.4` sets only `latest-1`, so `latest-1.2` stays at `1.2.3`.

   Only `latest` is protected against moving backwards. Fix a line tag by hand with `npm dist-tag add @absmartly/vue2-sdk@<version> <tag>`.

To check the pipeline without publishing, run the workflow manually from the Actions tab; `dry_run` defaults to `true` and runs only the `build` job, never the `publish` job, so a dry run gets no publish credentials. A dry run is also more lenient than a release: on a branch (not a `v*` tag) it skips the tag and on-`main` checks, and a version that is already on npm only produces a warning. The repository check, tests, build, dist-tag selection and package listing all run as in a release.

# Contact

If you have any other questions or need to contact us directly we can be reached at sdk@absmartly.com
