import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:8080/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Todo: {
        keyFields: ["id"],
      },
      Query: {
        fields: {
          todos: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});
