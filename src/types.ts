export type Network = 'one' | 'nova' | 'goerli';

export type SubgraphTransactionInformation = {
  // Fields from Bridge subgraph
  id: string;
  sender: string;
  isEthDeposit: boolean;
  value: number;
  destAddr: string;
  retryableTicketID: string;
  l2Calldata: string;
  timestamp: number;
  transactionHash: string;
  blockCreatedAt: number;

  // Fields from Retryables subgraph
  status: RetryableStatus;
  gasPrice: number;
  gasLimit: number;
  maxSubmissionFee: number;
  timeoutTimestamp: number;
  retryTxHash: string;
};

// Unknown is used for Nova as it is not supported in TheGraph
type RetryableStatus = 'Created' | 'Canceled' | 'Redeemed' | 'RedeemFailed' | 'Expired' | 'Unknown';

type RenderableTransactionInformationItem = {
  label: string;
  value: string | number | RetryableStatus;
  link?: string;
  linkLabel?: string;
};

export type RenderableTransactionInformation = {
  status: RenderableTransactionInformationItem;
  destAddr: RenderableTransactionInformationItem;
  l2CallValue: RenderableTransactionInformationItem;
  l2Calldata: RenderableTransactionInformationItem;
  retryableTicketID: RenderableTransactionInformationItem;
};
