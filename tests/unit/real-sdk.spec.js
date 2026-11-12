import { createLocalVue, shallowMount } from "@vue/test-utils";
import { SDK } from "@absmartly/javascript-sdk";
import ABSmartly from "@/plugin";
import Treatment from "@/components/Treatment.vue";

function mountContext(context) {
	const localVue = createLocalVue();
	localVue.use(ABSmartly, { context });
	return shallowMount(Treatment, {
		localVue,
		propsData: { name: "missing" },
		scopedSlots: {
			default: props => `${props.ready}/${props.failed}/${props.treatment}`,
			loading: () => "loading"
		}
	});
}

describe("real JavaScript SDK context", () => {
	it("renders control after failed initialization and preserves the original error event", async () => {
		let rejectLoad;
		const client = {
			getApplication: () => ({ name: "website", version: 0 }),
			getEnvironment: () => "production",
			getContext: jest.fn(
				() =>
					new Promise((resolve, reject) => {
						rejectLoad = reject;
					})
			)
		};
		const eventLogger = jest.fn();
		const context = new SDK({ client, eventLogger }).createContext(
			{ units: { user: "test-user" } },
			{ publishDelay: -1 }
		);
		const wrapper = mountContext(context);
		try {
			expect(wrapper.text()).toBe("loading");
			const failure = new Error("initial load failed");
			rejectLoad(failure);
			await expect(context.ready()).resolves.toBe(true);
			await wrapper.vm.$nextTick();
			expect(wrapper.text()).toBe("true/true/0");
			expect(context.peek("missing")).toBe(0);
			expect(context.variableValue("missing", "fallback")).toBe("fallback");
			expect(eventLogger).toHaveBeenCalledWith(context, "error", failure);
		} finally {
			wrapper.destroy();
			await context.finalize();
		}
	});

	it("uses the real context for readiness, refresh and goal publishing", async () => {
		let resolveLoad;
		const client = {
			getApplication: () => ({ name: "website", version: 0 }),
			getEnvironment: () => "production",
			getContext: jest
				.fn()
				.mockImplementationOnce(
					() =>
						new Promise(resolve => {
							resolveLoad = resolve;
						})
				)
				.mockResolvedValue({ experiments: [] }),
			publish: jest.fn().mockResolvedValue(undefined)
		};
		const eventLogger = jest.fn();
		const context = new SDK({ client, eventLogger }).createContext(
			{ units: { user: "test-user" } },
			{ publishDelay: -1 }
		);
		const wrapper = mountContext(context);
		try {
			expect(wrapper.text()).toBe("loading");
			resolveLoad({ experiments: [] });
			await context.ready();
			await wrapper.vm.$nextTick();
			expect(wrapper.text()).toBe("true/false/0");
			await context.refresh();
			expect(client.getContext).toHaveBeenCalledTimes(2);
			expect(eventLogger).toHaveBeenCalledWith(context, "refresh", { experiments: [] });
			context.track("purchase", { value: 42 });
			await context.publish();
			expect(client.publish).toHaveBeenCalledWith(
				expect.objectContaining({
					goals: [expect.objectContaining({ name: "purchase", properties: { value: 42 } })]
				}),
				undefined
			);
		} finally {
			wrapper.destroy();
			await context.finalize();
		}
	});
});

describe("system attributes in audience evaluation", () => {
	const strictAudienceData = environment => ({
		experiments: [
			{
				id: 1,
				name: "exp_test_ab",
				iteration: 1,
				unitType: "session_id",
				seedHi: 3603515,
				seedLo: 233373850,
				split: [0.0, 1.0],
				trafficSeedHi: 449867249,
				trafficSeedLo: 455443629,
				trafficSplit: [0.0, 1.0],
				fullOnVariant: 0,
				applications: [{ name: "website" }],
				variants: [
					{ name: "A", config: null },
					{ name: "B", config: '{"banner.size":"large"}' }
				],
				audienceStrict: true,
				audience: JSON.stringify({ filter: [{ eq: [{ var: "environment" }, { value: environment }] }] }),
				customFieldValues: null
			}
		]
	});

	function mountPlugin(data) {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions: {
				endpoint: "https://sandbox.absmartly.io/v1",
				apiKey: "test-api-key",
				application: "website",
				environment: "production"
			},
			context: { units: { session_id: "e791e240fcd3df7d238cfc285f475e8152fcc0ec" } },
			contextOptions: { publishDelay: -1, refreshPeriod: 0 },
			data
		});
		return shallowMount(Treatment, {
			localVue,
			propsData: { name: "exp_test_ab" },
			scopedSlots: {
				A: () => "A",
				B: () => "B"
			}
		});
	}

	it("gives a strict environment audience the matching variant", async () => {
		const wrapper = mountPlugin(strictAudienceData("production"));
		try {
			await wrapper.vm.$nextTick();
			const context = wrapper.vm.$absmartly;
			expect(wrapper.text()).toBe("B");
			expect(context.peek("exp_test_ab")).toBe(1);
			expect(context.variableValue("banner.size", "default")).toBe("large");
			expect(context.getAttribute("environment")).toBeUndefined();
		} finally {
			wrapper.destroy();
		}
	});

	it("gives variant 0 when a strict audience names another environment", async () => {
		const wrapper = mountPlugin(strictAudienceData("staging"));
		try {
			await wrapper.vm.$nextTick();
			expect(wrapper.text()).toBe("A");
			expect(wrapper.vm.$absmartly.peek("exp_test_ab")).toBe(0);
		} finally {
			wrapper.destroy();
		}
	});
});
