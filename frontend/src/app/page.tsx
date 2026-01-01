"use client";

import { PingDocument } from "@/gql/graphql";
import { useQuery } from "@apollo/client/react";

export default function PingView() {
  const { data, loading } = useQuery(PingDocument);

  if (loading) return <p>loading...</p>;
  return <p>{data?.ping.message}</p>;
}
