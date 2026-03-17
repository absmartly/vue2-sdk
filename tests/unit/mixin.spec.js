import { Context, SDK } from "@absmartly/javascript-sdk";
import { createLocalVue, mount } from "@vue/test-utils";
import ABSmartly from "@/plugin";

jest.mock("@absmartly/javascript-sdk");

const mockTreatment = jest.fn();
const mockAttributes = jest.fn();
const mockOverrides = jest.fn();
const mockIsReady = jest.fn();
const mockIsFailed = jest.fn();
const mockReady = jest.fn();

const mockCreateContext = jest.fn().mockImplementation(() => {
	return new Context();
});

SDK.mockImplementation(() => {
	return {
		createContext: mockCreateContext,
		createContextWith: jest.fn().mockImplementation(() => new Context())
	};
});

Context.mockImplementation(() => {
	return {
		treatment: mockTreatment,
		attributes: mockAttributes,
		overrides: mockOverrides,
		isReady: mockIsReady,
		isFailed: mockIsFailed,
		ready: mockReady
	};
});

describe("Mixin Behavior", () => {
	const sdkOptions = { endpoint: "https://test.absmartly.io" };

	beforeEach(() => {
		jest.clearAllMocks();
		mockIsReady.mockReturnValue(true);
		mockIsFailed.mockReturnValue(false);
		mockTreatment.mockReturnValue(0);
	});

	it("provides context access via globalName property", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, { sdkOptions });

		const TestComponent = {
			template: "<div>{{ hasContext }}</div>",
			computed: {
				hasContext() {
					return this.$absmartly !== undefined ? "yes" : "no";
				}
			}
		};

		const wrapper = mount(TestComponent, { localVue });
		expect(wrapper.text()).toBe("yes");
	});

	it("allows calling treatment method via context", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, { sdkOptions });

		mockTreatment.mockReturnValue(1);

		const TestComponent = {
			template: "<div>{{ treatment }}</div>",
			computed: {
				treatment() {
					return this.$absmartly.treatment("test_exp");
				}
			}
		};

		const wrapper = mount(TestComponent, { localVue });
		expect(mockTreatment).toHaveBeenCalledWith("test_exp");
		expect(wrapper.text()).toBe("1");
	});

	it("exposes context methods to components", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, { sdkOptions });

		const TestComponent = {
			template: "<div></div>",
			methods: {
				checkContext() {
					return {
						hasTreatment: typeof this.$absmartly.treatment === "function",
						hasAttributes: typeof this.$absmartly.attributes === "function",
						hasIsReady: typeof this.$absmartly.isReady === "function",
						hasIsFailed: typeof this.$absmartly.isFailed === "function"
					};
				}
			}
		};

		const wrapper = mount(TestComponent, { localVue });
		const result = wrapper.vm.checkContext();

		expect(result.hasTreatment).toBe(true);
		expect(result.hasAttributes).toBe(true);
		expect(result.hasIsReady).toBe(true);
		expect(result.hasIsFailed).toBe(true);
	});

	it("allows reactive updates based on context state", async () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, { sdkOptions });

		mockTreatment.mockReturnValue(0);

		const TestComponent = {
			template: "<div>{{ treatmentValue }}</div>",
			data() {
				return {
					treatmentValue: null
				};
			},
			mounted() {
				this.treatmentValue = this.$absmartly.treatment("experiment");
			}
		};

		const wrapper = mount(TestComponent, { localVue });
		await wrapper.vm.$nextTick();

		expect(wrapper.vm.treatmentValue).toBe(0);
		expect(wrapper.text()).toBe("0");
	});
});
