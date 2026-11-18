import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const workflow = path.resolve(__dirname, "../../.github/workflows/publish.yml");

// The `run: |` script of the named step in publish.yml, de-indented.
function stepScript(name) {
	const lines = fs.readFileSync(workflow, "utf8").split("\n");
	const start = lines.findIndex(line => line.trim() === `- name: ${name}`);
	const run = lines.findIndex((line, i) => i > start && line.trim() === "run: |");
	const indent = lines[run + 1].match(/^ */)[0];
	const body = [];
	for (let i = run + 1; i < lines.length && (lines[i] === "" || lines[i].startsWith(indent)); i++) {
		body.push(lines[i].slice(indent.length));
	}
	return body.join("\n");
}

// Runs the step with `npm view ... versions --json` stubbed to `published`.
function checkVersion(version, dryRun, published) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "npm-stub-"));
	try {
		fs.writeFileSync(path.join(dir, "npm"), `#!/bin/sh\necho '${JSON.stringify(published)}'\n`, { mode: 0o755 });
		const result = spawnSync("bash", ["-c", stepScript("Check version is not already on npm")], {
			encoding: "utf8",
			env: {
				...process.env,
				PATH: `${dir}${path.delimiter}${process.env.PATH}`,
				PACKAGE_NAME: "@absmartly/vue2-sdk",
				FULL_VERSION: version,
				DRY_RUN: String(dryRun)
			}
		});
		if (result.error) {
			throw new Error(`Could not run the step with bash (bash must be on PATH): ${result.error.message}`);
		}
		return { status: result.status, out: result.stdout.trim(), error: result.stderr.trim() };
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
}

describe("publish.yml: Check version is not already on npm", () => {
	const published = ["1.2.0", "1.2.1"];

	it.each([["1.2.1"], ["1.2.1+build.5"]])("fails a release of %s, already on npm as 1.2.1", version => {
		expect(checkVersion(version, false, published)).toEqual({
			status: 1,
			out: "",
			error: "@absmartly/vue2-sdk@1.2.1 is already on npm - bump package.json version first"
		});
	});

	it.each([["1.2.1"], ["1.2.1+build.5"]])("only warns on a dry run of %s", version => {
		expect(checkVersion(version, true, published)).toEqual({
			status: 0,
			out: "::warning::@absmartly/vue2-sdk@1.2.1 is already on npm; a real publish of this version would fail",
			error: ""
		});
	});

	it.each([
		["1.2.2", "1.2.2"],
		["1.2.2+ci", "1.2.2"],
		["1.2.1-beta.1", "1.2.1-beta.1"]
	])("passes %s, which is not on npm", (version, stored) => {
		expect(checkVersion(version, false, published)).toEqual({
			status: 0,
			out: `@absmartly/vue2-sdk@${stored} is not on npm yet`,
			error: ""
		});
	});

	it("matches a package with a single published version", () => {
		expect(checkVersion("1.2.1", false, "1.2.1").status).toBe(1);
		expect(checkVersion("1.2.2", false, "1.2.1").status).toBe(0);
	});
});
