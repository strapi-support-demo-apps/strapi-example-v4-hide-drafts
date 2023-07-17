"use strict";

/**
 * relation service
 */

// Uncomment the following line to use the utils package on throwing custom errors
// const utils = require("@strapi/utils");
// const { UnauthorizedError } = utils.errors;
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

    // Example throwing a custom error
    // if (results.length > 0) {
    //   return results[0];
    // } else {
    //   throw new UnauthorizedError("You can't access this resource", {
    //     errorMessage: "This entry is restricted",
    //   });
    // }
  },
}));
