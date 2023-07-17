"use strict";

/**
 * test router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::test.test", {
  config: {
    find: {
      middlewares: ["global::hideDrafts"],
    },
    findOne: {
      middlewares: ["global::hideDrafts"],
    },
  },
});
