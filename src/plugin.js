import { Context, SDK } from "@absmartly/javascript-sdk";

export default {
	install(Vue, options) {
		options = Object.assign(
			{},
			{
				globalName: "$absmartly"
			},
			options
		);

		let context = options.context;

		if (!(context instanceof Context)) {
			const sdkOptions = options.sdkOptions;
			const sdk = new SDK(sdkOptions);

			const contextOptions = Object.assign(
				{},
				{
					refreshPeriod: 5 * 60 * 1000
				},
				options.contextOptions || {}
			);

			if (options.data) {
				context = sdk.createContextWith(options.data, contextOptions);
			} else {
				context = sdk.createContext(context, contextOptions);
			}
		}

		if (options.attributes instanceof Object) {
			context.attributes(options.attributes);
		}

		Vue.prototype.__absmartlyGlobal = options.globalName;
		Vue.prototype[options.globalName] = context;
	}
};
