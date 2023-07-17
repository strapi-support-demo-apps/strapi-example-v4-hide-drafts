"use strict";

/**
 * `hideDrafts` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const publicationFilter = {
      relation: {
        publicationState: "live",
      },
    };

    if (ctx.query.populate) {
      if ((ctx.query.populate = "*")) {
        // force only the relation, this should be replaced by your custom population
        ctx.query.populate = publicationFilter;
      } else if (Array.isArray(ctx.query.populate)) {
        // if using the array syntax, convert to object syntax, not a perfect solution
        // if nested string keys such as field.field is used this may break
        const populate = {};
        const keys = Object.keys(ctx.query.populate);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];

          if (key === "relation") {
            // if the key is the relation, we inject the custom filter
            populate[key] = publicationFilter.relation;
          } else {
            // if it's something else we just let it through and populate it
            populate[key] = true;
          }
        }
        ctx.query.populate = populate;
      }
    } else {
      // if no populate is provided, we force the default population
      ctx.query.populate = publicationFilter;
    }

    await next();
  };
};
