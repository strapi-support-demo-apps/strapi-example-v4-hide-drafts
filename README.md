# Hiding previews (drafts) from content-api

## Default behavior

By default Strapi exposes drafts (previews) for users to be able to show these previews in their frontend. This is done by adding a query parameter `?publicationState=preview` to the request for the parent but when fetching by ID, our findOne does not accept filters nor does the findOne automatically filter out drafts.

## Solution for hiding drafts on findOne

For the findOne endpoints, we need to modify the core-api service and convert it to instead use the find (aka findMany) and specific specific filters to filter out drafts.

You can see the complete example in [this file](src/api/relation/services/relation.js), however as a rough summary we are using the `super.find()` method to call the default core-api service for the normal findMany endpoint and passing in the entityId as a filter. To ensure it's only fetching live entities we specify the publicationStatus as well. Optionally you can customize the response here to throw a custom error instead of the default Koa 404 message.

For additional error options you should see the [error handling documentation](https://docs.strapi.io/dev-docs/error-handling#services-and-models-lifecycles).

Here is the code snippet:

```js
const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::relation.relation", ({ strapi }) => ({
  async findOne(entityId, params = {}) {
    // Replicate findOne logic
    params.filters = {
      id: entityId,
    };

    // Force publicationState to live
    params.publicationState = "live";

    // Call the core-api find service instead of findOne
    const { results } = await super.find(params);

    // If the entry exists, return it, else return nothing to use the default 404 response
    // Note you can provide an else statement here and throw a custom error, shown below
    if (results.length > 0) {
      // Return the first result, there should only be one anyway
      return results[0];
    }
  },
}));
```

Note that this code snippet will not impact other params such as populate, so if you have multiple nested populations that also contain drafts you may want to review the next section.

## Solution for hiding drafts on populations (believed to be a bug)

For populating relations, it's easier to do this in a route or global middleware. For simplicity in this example we will use a route middleware to read in the incoming request and modify the query parameters to force a filter on the populated relation.

You can find the implementation of this in the [following file](src/middlewares/hideDrafts.js) for the middleware and [this file](src/api/test/routes/test.js) for the route configuration.

In the middleware we are doing a bit of complex logic to determine if the populate query parameter is one of the following:

- A string specifying all relations: `'*'`
- An array specifying several relations with no other parameters: `['relation1', 'relation2']`
  - In this example we convert this array to the object syntax: `{ relation1: true, relation2: true }` with the exception for a specific relation where we inject the custom populate filter for publicationState
- An object specifying one or more relations and simply injecting the custom populate filter for publicationState: `{ relation1: ..., relation2: { publicationState: 'live' } }`
- Undefined, in which case we forcefully inject the default population with the specific filter for publicationState: `{ relation2: { publicationState: 'live' } }`

## Bug report for publicationState not being set on populate

Since it's believed to be a bug, you can find the [bug report here](https://github.com/strapi/strapi/issues/16188) regarding the issue. If you are experiencing this issue, please upvote the issue to help get it resolved.
