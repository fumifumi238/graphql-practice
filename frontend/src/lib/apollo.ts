import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
  credentials: "include",
});

//  SSR対策：ブラウザでのみ wsLink を作る
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:8080/graphql",
          lazy: false,
          retryAttempts: Infinity,
            on: {
    connected: () => console.log("WS connected"),
    closed: (e) => console.log("WS closed", e),
    error: (e) => console.log("WS error", e),
  },
        })
      )
    : null;

//  wsLink がある時だけ split
const link =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return (
            def.kind === "OperationDefinition" &&
            def.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

export const apolloClient = new ApolloClient({
  link: link,
  cache: new InMemoryCache({
    typePolicies: {
      Todo: {
        keyFields: ["id"],
      },
    },
  }),
});
