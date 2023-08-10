import { SubgraphTransactionInformation, Network } from './types';

const SUBGRAPH_URLS = {
  one: {
    bridge: 'https://api.thegraph.com/subgraphs/name/gvladika/arb-bridge-eth-nitro',
    retryables: 'https://api.thegraph.com/subgraphs/name/gvladika/arbitrum-retryables',
  },
  nova: {
    bridge: 'https://api.thegraph.com/subgraphs/name/gvladika/arb-bridge-eth-nova',
    retryables: '',
  },
  goerli: {
    bridge: 'https://api.thegraph.com/subgraphs/name/gvladika/arb-bridge-eth-goerli',
    retryables: 'https://api.thegraph.com/subgraphs/name/gvladika/arbitrum-retryables-goerli',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function querySubgraph(query: string, subgraphUrl: string): Promise<any> {
  const response = await fetch(subgraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data;
}

export const getTransactionInformation = async (
  transactionHash: string,
  network: Network,
): Promise<SubgraphTransactionInformation | undefined> => {
  const queryBridge = `
        query {
            retryables(
                first: 1,
                where: {
                    transactionHash: "${transactionHash}"
                }
            ) {
                id
                sender
                isEthDeposit
                value
                destAddr
                retryableTicketID
                l2Calldata
                timestamp
                transactionHash
                blockCreatedAt
            }
        }
    `;
  const resultBridge = await querySubgraph(queryBridge, SUBGRAPH_URLS[network]['bridge']);

  // Retryable was not found
  if (resultBridge.retryables.length <= 0) {
    return;
  }

  // Result object
  const retryableInformation = resultBridge.retryables[0];

  // Special case, Nova is not supported in TheGraph
  if (network == 'nova') {
    retryableInformation.status = 'Unknown';
    return retryableInformation;
  }

  // Querying the status of the retryable
  const queryRetryables = `
        {
            retryables(
                first: 1,
                where: {
                    createdAtTxHash: "${retryableInformation.retryableTicketID}"
                }
            ) {
                id
                status
                retryTxHash
                timeoutTimestamp
                createdAtTimestamp
                createdAtBlockNumber
                createdAtTxHash
                redeemedAtTimestamp
                isAutoRedeemed
                sequenceNum
                donatedGas
                gasDonor
                maxRefund
                submissionFeeRefund
                requestId
                l1BaseFee
                deposit
                callvalue
                gasFeeCap
                gasLimit
                maxSubmissionFee
                feeRefundAddress
                beneficiary
                retryTo
                retryData
            }
        }
    `;
  const resultRetryables = await querySubgraph(
    queryRetryables,
    SUBGRAPH_URLS[network]['retryables'],
  );

  if (resultRetryables.retryables.length <= 0) {
    retryableInformation.status = 'Created';
    retryableInformation.gasPrice = 0;
    retryableInformation.gasLimit = 0;
    retryableInformation.maxSubmissionFee = 0;
    retryableInformation.timeoutTimestamp = 0;
    retryableInformation.retryTxHash = '';

    return retryableInformation;
  }

  const retryable = resultRetryables.retryables[0];
  const currentDate = new Date();

  // Getting the status of the retryable
  retryableInformation.status =
    ['RedeemFailed', 'Created'].includes(retryable.status) &&
    retryable.timeoutTimestamp < currentDate.getTime()
      ? 'Expired'
      : retryable.status;

  // Getting gas fields
  retryableInformation.gasPrice = retryable.gasFeeCap;
  retryableInformation.gasLimit = retryable.gasLimit;
  retryableInformation.maxSubmissionFee = retryable.maxSubmissionFee;

  // Times
  retryableInformation.timeoutTimestamp = retryable.timeoutTimestamp;

  // Execution transaction hash
  retryableInformation.retryTxHash = retryable.retryTxHash;

  return retryableInformation;
};
