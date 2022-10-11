import { shallowMount } from "@vue/test-utils";
import Treatment from "@/components/Treatment.vue";

describe("Treatment.vue", () => {
	const mocks = {
		__absmartlyGlobal: "$absmartly",
		$absmartly: {
			treatment: jest.fn(),
			attributes: jest.fn(),
			ready: jest.fn(),
			isReady: jest.fn(),
			isFailed: jest.fn()
		}
	};

	it("it should not render loading slot when ready", async done => {
		const slotMock = jest.fn();
		const loadingMock = jest.fn();

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(1);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock,
				loading: loadingMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
		expect(loadingMock).not.toHaveBeenCalled();
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: 1
		});

		done();
	});

	it("should render loading slot when not ready", async done => {
		const slotMock = jest.fn();
		const loadingMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(false);
		mocks.$absmartly.isFailed.mockReturnValue(false);

		const ready = Promise.resolve(true);
		mocks.$absmartly.ready.mockReturnValue(ready);

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		const wrapper = shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock,
				loading: loadingMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).not.toHaveBeenCalled();
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalled();
		expect(slotMock).not.toHaveBeenCalled();
		expect(loadingMock).toHaveBeenCalledTimes(1);
		expect(loadingMock).toHaveBeenCalledWith({
			ready: false,
			failed: false
		});

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.treatment.mockReturnValue(1);

		ready.then(() => {
			wrapper.vm.$nextTick(() => {
				expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
				expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
				expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
				expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
				expect(slotMock).toHaveBeenCalledTimes(1);
				expect(slotMock).toHaveBeenCalledWith({
					ready: true,
					failed: false,
					treatment: 1
				});

				done();
			});
		});
	});

	it("should render default slot when not ready", async done => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(false);
		mocks.$absmartly.isFailed.mockReturnValue(false);

		const ready = Promise.resolve(true);
		mocks.$absmartly.ready.mockReturnValue(ready);

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		const wrapper = shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).not.toHaveBeenCalled();
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalled();
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: false,
			failed: false
		});

		slotMock.mockClear();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.treatment.mockReturnValue(1);

		ready.then(() => {
			wrapper.vm.$nextTick(() => {
				expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
				expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
				expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
				expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
				expect(slotMock).toHaveBeenCalledTimes(1);
				expect(slotMock).toHaveBeenCalledWith({
					ready: true,
					failed: false,
					treatment: 1
				});

				done();
			});
		});
	});

	it.each([
		[0, "0"],
		[1, "1"],
		[2, "2"],
		[3, "3"],
		[4, "4"]
	])("should render treatment slot %i by index (%s)", async (treatment, slot, done) => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(treatment);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				[slot]: slotMock
			},
			mocks
		});

		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: treatment
		});

		done();
	});

	it.each([
		[0, "A"],
		[1, "B"],
		[2, "C"],
		[3, "D"],
		[4, "E"]
	])("should render treatment slot %i by alpha (%s)", async (treatment, slot, done) => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(treatment);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				[slot]: slotMock
			},
			mocks
		});

		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment
		});

		done();
	});

	it.each([[0], [1], [2], [3], [4]])(
		"should render default treatment slot for treatment %i",
		async (treatment, done) => {
			const slotMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(treatment);

			shallowMount(Treatment, {
				propsData: {
					name: "test_exp"
				},
				scopedSlots: {
					default: slotMock
				},
				mocks
			});

			expect(slotMock).toHaveBeenCalledTimes(1);
			expect(slotMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment
			});

			done();
		}
	);

	it("should throw with no matching slot", async done => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(2);

		expect(() => {
			jest.spyOn(console, "error").mockImplementation(() => {}); // suppress expected Vue error
			shallowMount(Treatment, {
				propsData: {
					name: "test_exp"
				},
				scopedSlots: {
					unused: slotMock
				},
				mocks
			});
		}).toThrow(new Error("No matching treatment slots. Expected one of C,2,default"));

		expect(slotMock).not.toHaveBeenCalled();

		done();
	});

	it("should not call context.attributes with no attribute property", async done => {
		const slotMock = jest.fn();
		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(1);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				default: slotMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalledWith();
		expect(slotMock).toHaveBeenCalledTimes(1);

		done();
	});
});
