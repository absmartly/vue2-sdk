# A/B Smartly Vue2 SDK [![npm version](https://badge.fury.io/js/%40absmartly%2Fvue2-sdk.svg)](https://badge.fury.io/js/%40absmartly%2Fvue2-sdk)

A/B Smartly - Vue2 SDK

## Compatibility

The A/B Smartly Vue2 SDK is a thin wrapper around the [A/B Smartly JavaScript SDK](https://www.github.com/absmartly/javascript-sdk)

It requires Vue2 version 2.6.0+ and is supported on IE 10+ and all the other major browsers.

**Note**: IE 10 does not natively support Promises.
If you target IE 10, you must include a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise) or [rsvp](https://www.npmjs.com/package/rsvp).

## Installation

#### npm

```shell
npm install @absmartly/vue2-sdk --save
```

#### Directly in the browser
You can include an optimized and pre-built package directly in your HTML code through [unpkg.com](https://www.unpkg.com).

Simply add the following code to your `head` section to include the latest published version.
```html
    <script src="https://unpkg.com/@absmartly/vue2-sdk"></script>
```

## Getting Started

Please follow the [installation](#installation) instructions before trying the following code:

#### Import the SDK into your project
```javascript
const absmartly = require('@absmartly/vue2-sdk');
// OR with ES6 modules:
import absmartly from '@absmartly/vue2-sdk';
```

#### Basic initialization
This example assumes an Api Key, an Application, and an Environment have been created in the A/B Smartly web console.

The Vue2 SDK is a thin wrapper around our Javascript SDK. Please check the [A/B Smartly Javascript SDK](https://www.github.com/absmartly/javascript-sdk) docs for details regarding other options used for initialization.

```javascript
// somewhere in your application initialization code, before mounting your Vue application
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: 'https://sandbox-api.absmartly.com/v1',
        apiKey: ABSMARTLY_API_KEY,
        environment: "production",
        application: "website",
    },
    context: {
        units: {
            session_id: '5ebf06d8cb5d8137290c4abb64155584fbdb64d8',
        },
    },
    attributes: {
        user_agent: navigator.userAgent
    },
    overrides: {
        exp_test_development: 1
    }
});
```

This makes the `$absmartly` extension available in every Vue instance.

#### Initializing with pre-fetched Context data
When doing full-stack experimentation with A/B Smartly, we recommend creating a context only once on the server-side.
Creating a context involves a round-trip to the A/B Smartly event collector.
We can avoid repeating the round-trip on the client-side by sending the server-side data embedded in the first document, for example, by rendering it on the template.
Then we can initialize the A/B Smartly context on the client-side directly with it. The Vue2 SDK also supports this optimized usage.

In this example, we assume the variable `prefectedContextData` contains the pre-fetched data previously injected.

```javascript
// somewhere in your application initialization code, before mounting your Vue application
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: 'https://sandbox-api.absmartly.com/v1',
        apiKey: ABSMARTLY_API_KEY,
        environment: "production",
        application: "website"",
    },
    attributes: {
        user_agent: navigator.userAgent
    },
    data: prefetchedContext, // assuming prefectedContext has been inject
});
```

#### Selecting a treatment
The preferred method to select a treatment is using the `Treatment` component with a named and scoped slot per treatment.

The slot selection rules are as follows:

* If the context is not ready:
    - If the `loading` slot exists, select it
    - Otherwise, select the `default` slot

* Otherwise, if the context is ready:
    - If a slot with the treatment alias (A, B, C, ...) exists, select it
    - Otherwise, if a slot with the treatment index exists, select it
    - Otherwise, select the `default`

* If the selected slot doesn't exist, nothing will be rendered

Example using the treatment alias:
```html
<treatment name="exp_test_experiment">
    <template #A>
        <my-button></my-button>
    </template>
    <template #B="{ config }">
        <my-button :color="config.color"></my-button>
    </template>
    <template #loading>
        <my-spinner></my-spinner>
    </template>
</treatment>
```

Example using the treatment index:
```html
<treatment name="exp_test_experiment">
    <template #0>
        <my-button></my-button>
    </template>
    <template #1="{ config }">
        <my-button :color="config.color"></my-button>
    </template>
    <template #2="{ config }">
        <my-other-button :color="config.color"></my-other-button>
    </template>
    <template #loading>
        <my-spinner></my-spinner>
    </template>
</treatment>
```

Example using only the `default` slot:
```html
<treatment name="exp_test_experiment">
    <template #default="{ config, treatment, ready }">
        <template v-if="ready">
            <my-button v-if="treatment == 0"></my-button>
            <my-button v-else-if="treatment == 1" :color="config.color"></my-button>
            <my-other-button v-else-if="treatment == 2" :color="config.color"></my-other-button>
        </template>
        <template v-else><my-spinner></my-spinner></template>
    </template>
</treatment>
```

The scoped slot properties contain information about the A/B Smartly context and the selected treatment:

```json
{
  "treatment": 1,
  "config": {
    "color": "red"
  },
  "ready": true,
  "failed": false
}
```

If the experiment is not running, or the context creation failed, the slot will be rendered with the following properties:
```json
{
  "treatment": 0,
  "config": {},
  "ready": true,
  "failed": false
}
```

#### Setting context attributes
Attributes can be set in script.
```javascript
this.$absmartly.attribute('user_agent', navigator.userAgent);

this.$absmartly.attributes({
    customer_age: 'new_customer',
});
```

Or directly in templates with the `attributes` property of the `Treatment` component.

```html
<treatment name="exp_test_experiment" :attributes="{customer_age: 'returning'}">
    <template #default="{ config, treatment, ready }">
        <template v-if="ready">
            <my-button v-if="treatment == 0"></my-button>
            <my-button v-else-if="treatment == 1" :color="config.color"></my-button>
            <my-other-button v-else-if="treatment == 2" :color="config.color"></my-other-button>
        </template>
        <template v-else><my-spinner></my-spinner></template>
    </template>
</treatment>
```


#### Tracking a goal achievement
Goals are created in the A/B Smartly web console.
```javascript
this.$absmartly.track("payment", 1000);
```

#### Finalizing
The `finalize()` method will ensure all events have been published to the A/B Smartly collector, like `publish()`, and will also "seal" the context, throwing an error if any method that could generate an event is called.
```javascript
await this.$absmartly.finalize().then(() => {
    window.location = "https://www.absmartly.com"
})
```

#### Further info
Please refer to the [A/B Smartly JavaScript SDK](https://www.github.com/absmartly/javascript-sdk) for more details.

## About A/B Smartly
**A/B Smartly** is the leading provider of state-of-the-art, on-premises, full-stack experimentation platforms for engineering and product teams that want to confidently deploy features as fast as they can develop them.
A/B Smartly's real-time analytics helps engineering and product teams ensure that new features will improve the customer experience without breaking or degrading performance and/or business metrics.

### Have a look at our growing list of clients and SDKs:
- [JavaScript SDK](https://www.github.com/absmartly/javascript-sdk)
- [Vue2 SDK](https://www.github.com/absmartly/vue2-sdk)
- [PHP SDK](https://www.github.com/absmartly/php-sdk)
