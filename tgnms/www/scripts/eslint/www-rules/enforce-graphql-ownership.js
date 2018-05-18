// Generated by `js1 upgrade www-shared`.
// @generated SignedSource<<7f9efffa875ffbc0fe61a8963c9002d5>>

/*
* Copyright 2004-present Facebook. All Rights Reserved.
*
* This rule enforces ownership for GraphQL queries and fragments by enforcing
  the existence of a '@fb_owner example_oncall' annotation on the query.
  The format should look like this:
    query QueryName (
      ...
    ) @fb_owner(oncall: "example_oncall") {
      ...
    }
  }
* @format
*/

module.exports = function rule(context) {
  return {
    TaggedTemplateExpression(node) {
      if (node.tag.name == 'graphql') {
        var graphql_text = node.quasi.quasis[0].value.raw;
        if (
          !graphql_text.includes('@fb_owner') &&
          !graphql_text.includes('fragment ')
        ) {
          context.report(
            node,
            'Please claim ownership for GraphQL queries with @fb_owner i.e. ' +
              '"query QueryName (...) ' +
              '@fb_owner(oncall: "example_oncall") {...}"'
          );
        }
      }
    },
  };
};
