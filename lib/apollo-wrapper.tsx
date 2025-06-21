"use client"

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { useAuth } from "@clerk/nextjs"
import type { ReactNode } from "react"

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || "http://localhost:8080/v1/graphql",
})

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken()

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        "x-hasura-role": "user",
      },
    }
  })

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
      },
      query: {
        errorPolicy: "all",
      },
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
