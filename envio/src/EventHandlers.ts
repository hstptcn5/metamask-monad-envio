import { Transfer } from "../generated/schema";
import { Transfer as TransferEvent } from "../generated/MonUSDC/MonUSDC";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleTransfer(event: TransferEvent): void {
  // Create Transfer entity
  const transfer = new Transfer(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );

  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = event.params.value;
  transfer.blockNumber = event.block.number;
  transfer.blockTimestamp = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;
  transfer.logIndex = event.logIndex;

  transfer.save();
}
