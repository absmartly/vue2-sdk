import { spawnSync } from "child_process";
import path from "path";

const script = path.resolve(__dirname, "../../.github/scripts/npm-dist-tag.sh");

function distTag(version, latest) {
	const result = spawnSync("bash", [script, version, latest], { encoding: "utf8" });
	return { status: result.status, tag: result.stdout.trim(), error: result.stderr.trim() };
}

describe("npm-dist-tag.sh", () => {
	it.each([
		["1.2.2", "1.2.1", "latest"],
		["1.3.0", "1.2.1", "latest"],
		["2.0.0", "1.2.1", "latest"],
		["1.2.1", "1.2.1", "latest"],
		["1.10.0", "1.9.0", "latest"],
		["10.0.0", "9.9.9", "latest"],
		["1.2.0", "2.0.0", "latest-1"],
		["1.99.99", "2.0.0", "latest-1"],
		["9.0.0", "10.0.0", "latest-9"],
		["1.2.0", "1.3.0", "latest-1.2"],
		["1.2.3", "1.2.10", "latest-1.2"],
		["1.9.0", "1.10.0", "latest-1.9"],
		["1.2.0", "1.2.1", "latest-1.2"]
	])("publishes stable %s under %s when latest is %s", (version, latest, expected) => {
		expect(distTag(version, latest)).toEqual({ status: 0, tag: expected, error: "" });
	});

	it.each([
		["1.3.0-alpha.1", "2.0.0", "alpha"],
		["1.3.0-beta.1", "2.0.0", "beta"],
		["3.0.0-beta.1", "2.0.0", "beta"],
		["1.3.0-rc.1", "2.0.0", "next"],
		["1.3.0-beta.1", "", "beta"],
		["1.3.0-rc.1", "garbage", "next"]
	])("publishes prerelease %s under its prerelease tag (latest %s)", (version, latest, expected) => {
		expect(distTag(version, latest)).toEqual({ status: 0, tag: expected, error: "" });
	});

	it.each([[""], ["garbage"], ["2"], ["2.0"], ["2.0.0-beta.1"]])(
		"fails closed for a stable release when latest is %p",
		latest => {
			const result = distTag("1.2.0", latest);
			expect(result.status).toBe(1);
			expect(result.tag).toBe("");
			expect(result.error).toBe(`Could not read the current latest version (got '${latest}')`);
		}
	);

	it.each([["v1.2.0"], ["1.2"], ["1.2.0.0"]])("rejects version %p that is not x.y.z", version => {
		const result = distTag(version, "1.2.1");
		expect(result.status).toBe(1);
		expect(result.tag).toBe("");
		expect(result.error).toBe(`Version '${version}' is not a plain x.y.z version`);
	});
});
