import fetch from "cross-fetch";
import { blockchainIndexer } from "./blockchain-indexer";
import { USDC_TEST } from "./chain";

const ENVIO_GRAPHQL = process.env.ENVIO_GRAPHQL;

/**
 * Query Envio hoặc fallback về blockchain indexer
 */
export async function queryDelegations(address: string) {
  // Nếu có Envio GraphQL endpoint, sử dụng nó
  if (ENVIO_GRAPHQL) {
    try {
      const q = /* GraphQL */ `
        query($addr: String!) {
          delegations(where: { delegator: $addr }, orderBy: createdAt, orderDirection: desc) {
            id
            delegator
            delegate
            token
            periodAmount
            periodDuration
            startDate
            totalRedeemed
            remaining
            lastRedeemedAt
          }
          redemptions(where: { delegator: $addr }, orderBy: timestamp, orderDirection: desc) {
            id
            delegator
            delegate
            token
            amount
            to
            txHash
            timestamp
          }
        }
      `;

      const res = await fetch(ENVIO_GRAPHQL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, variables: { addr: address.toLowerCase() } })
      });

      if (res.ok) {
        const json = await res.json();
        return json.data ?? { delegations: [], redemptions: [] };
      }
    } catch (error) {
      console.warn("Envio query failed, falling back to blockchain indexer:", error);
    }
  }

  // Fallback: Sử dụng blockchain indexer
  try {
    const transfers = await blockchainIndexer.getTransfersForAddress(
      USDC_TEST as `0x${string}`,
      address,
      0n // Từ block 0
    );

    // Chuyển đổi transfers thành format tương tự Envio
    const redemptions = transfers.map(transfer => ({
      id: transfer.id,
      delegator: address,
      delegate: transfer.from, // Giả định từ address là delegate
      token: transfer.token,
      amount: transfer.value.toString(),
      to: transfer.to,
      txHash: transfer.txHash,
      timestamp: transfer.timestamp.toString()
    }));

    return {
      delegations: [], // Chưa có delegation data từ blockchain indexer
      redemptions
    };
  } catch (error) {
    console.error("Blockchain indexer failed:", error);
    return { delegations: [], redemptions: [] };
  }
}
