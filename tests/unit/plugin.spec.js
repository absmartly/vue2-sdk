import { Context, SDK } from "@absmartly/javascript-sdk";
import { createLocalVue, mount } from "@vue/test-utils";
import ABSmartly from "@/plugin";

jest.mock("@absmartly/javascript-sdk");

const mockCreateContext = jest.fn().mockImplementation(() => {
	return new Context();
});

const mockCreateContextWith = jest.fn().mockImplementation(() => {
	return new Context();
});

SDK.mockImplementation(() => {
	return {
		createContext: mockCreateContext,
		createContextWith: mockCreateContextWith
	};
});

describe("ABSmartly Vue.js Plugin", () => {
	const Component = {
		template: "<div>test</div>"
	};

	const sdkOptions = {
		test: 1
	};

	const contextOptions = {
		refreshPeriod: 600000,
		test: 2
	};

	const context = {
		test: 2
	};

	const data = {
		test: 2
	};

	const attrs = {
		attr1: "value1",
		attr2: "value2"
	};

	it("should create SDK and context", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			contextOptions,
			attributes: attrs
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		done();
	});

	it("should create context with default options", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			attributes: attrs
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, {
			refreshPeriod: 300000
		});

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		done();
	});

	it("should create SDK and context with no attributes", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			contextOptions
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).not.toHaveBeenCalled();

		done();
	});

	it("should create SDK and context with data", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			data,
			contextOptions,
			attributes: attrs
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContextWith).toHaveBeenCalledTimes(1);
		expect(mockCreateContextWith).toHaveBeenCalledWith(data, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		done();
	});

	it("should use passed context", async done => {
		const mockContext = new Context();
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			context: mockContext,
			attributes: attrs
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).not.toHaveBeenCalled();
		expect(mockCreateContext).not.toHaveBeenCalled();
		expect(mockCreateContextWith).not.toHaveBeenCalled();

		expect(mockContext.attributes).toHaveBeenCalledTimes(1);
		expect(mockContext.attributes).toHaveBeenCalledWith(attrs);

		expect(wrapper.vm.$absmartly).toBe(mockContext);

		done();
	});

	it("should add global $absmartly context object", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$absmartly).toBeInstanceOf(Context);

		done();
	});

	it("should add options.globalName context object", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			globalName: "$exp"
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$exp).toBeInstanceOf(Context);

		done();
	});

	it("should add options.globalName context object", async done => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			globalName: "$exp"
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$exp).toBeInstanceOf(Context);

		done();
	});
});
