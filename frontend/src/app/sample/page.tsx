type Data = {
    message: string;
};
import { gql } from "@/gql";

export const GetPingDocument = gql(`
  query GetPing {
    ping {
      message
    }
  }
`);

export default async function Sample() {
  const data = await getSample()
  return (
    <div>
      <p>this is sample</p>
      <p>{data.message}</p>
    </div>
  );
}

export async function getSample() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:8080/ping`);
  const data = (await res.json()) as Data;

  console.log(data);
  // Pass data to the page via props
  return data;
}
