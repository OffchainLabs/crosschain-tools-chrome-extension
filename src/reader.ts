import { AbiCoder, ethers } from 'ethers';
import axios from 'axios';
import { getTransactionInformation } from './subgraphs';
import { renderL1ToL2Tab } from './renderer';

// Constants
const ARBISCAN_BASE_URLS = {
  one: 'https://arbiscan.io',
  nova: 'https://nova.arbiscan.io',
  goerli: 'https://goerli.arbiscan.io',
};
const DETHCODE_BASE_URLS = {
  one: 'https://arbiscan.deth.net',
  nova: '',
  goerli: '',
};
const RETRYABLES_DASHBOARD_BASE_URL = 'https://retryable-dashboard.arbitrum.io';

///////////////
// Main flow //
///////////////
const main = async () => {
  // 1.- Get transaction hash from URL
  const transactionHash = window.location.pathname.split('/')[2];

  // 2.- Obtain network
  const network = 'one';

  // 3.- Get transaction information from the Subgraph
  const transactionInformation = await getTransactionInformation(transactionHash, network);
  if (!transactionInformation) {
    return;
  }

  // 4.- Decode calldata information
  let l2FunctionSignature = '';
  let l2DecodedParameters: Array<string> = [];
  try {
    // 0x + 4bytes
    const l2FunctionSignatureBytes = transactionInformation.l2Calldata.substring(0, 10);
    const url = `https://sig.eth.samczsun.com/api/v1/signatures?function=${l2FunctionSignatureBytes}`;
    const response = await axios.get(url);
    l2FunctionSignature = response.data.result.function[l2FunctionSignatureBytes][0].name;

    const l2FunctionParameters = l2FunctionSignature.split('(')[1].slice(0, -1).split(',');
    l2DecodedParameters = AbiCoder.defaultAbiCoder().decode(
      l2FunctionParameters,
      ethers.dataSlice(transactionInformation.l2Calldata, 4),
    );
  } catch {}

  const isContract = transactionInformation.l2Calldata.length >= 10;

  // 5.- Format transaction information to render in page
  const informationToRender = {
    status: {
      label: 'Status',
      value: transactionInformation.status,
      link: ['Created', 'RedeemFailed'].includes(transactionInformation.status)
        ? RETRYABLES_DASHBOARD_BASE_URL + '/tx/' + transactionHash
        : undefined,
      linkLabel: '(Redeem)',
    },
    destAddr: {
      label: 'Destination address',
      value:
        `<a target="_blank" href="${ARBISCAN_BASE_URLS[network]}/address/${transactionInformation.destAddr}">${transactionInformation.destAddr}</a>` +
        (isContract
          ? ` | <a target="_blank" href="${ARBISCAN_BASE_URLS[network]}/address/${transactionInformation.destAddr}#code">Code</a>`
          : '') +
        (isContract && DETHCODE_BASE_URLS[network] != ''
          ? ` | <a target="_blank" href="${DETHCODE_BASE_URLS[network]}/address/${transactionInformation.destAddr}">DethCode</a>`
          : ''),
    },
    l2CallValue: {
      label: 'L2 call value',
      value: ethers.formatEther(transactionInformation.value) + ' ETH',
    },
    l2Calldata: {
      label: 'L2 call data',
      value: transactionInformation.l2Calldata,
    },
    l2DecodedCalldata: {
      label: 'L2 decoded call data',
      value:
        l2FunctionSignature +
        '<br />' +
        '<ul>' +
        l2DecodedParameters.reduce(
          (result, element) => (result += '<li>' + element + '</li>'),
          '',
        ) +
        '</ul>',
    },
    retryableTicketID: {
      label: 'Retryable ticket id',
      value: `<a target="_blank" href="${ARBISCAN_BASE_URLS[network]}/tx/${transactionInformation.retryableTicketID}">${transactionInformation.retryableTicketID}</a>`,
    },
    retryableTransactionHash: {
      label: 'Execution transaction hash',
      value:
        transactionInformation.retryTxHash && transactionInformation.retryTxHash !== ''
          ? `<a target="_blank" href="${ARBISCAN_BASE_URLS[network]}/tx/${transactionInformation.retryTxHash}">${transactionInformation.retryTxHash}</a>`
          : '',
    },
    gasLimit: {
      label: 'Gas limit for execution',
      value: transactionInformation.gasLimit,
    },
    gasPrice: {
      label: 'Gas price for execution',
      value: ethers.formatEther(transactionInformation.gasPrice) + ' ETH',
    },
    maxSubmissionFee: {
      label: 'Max submission fee for ticket',
      value: ethers.formatEther(transactionInformation.maxSubmissionFee) + ' ETH',
    },
    timeoutTimestamp: {
      label: 'Expiry date (UTC)',
      value: new Date(Number(transactionInformation.timeoutTimestamp) * 1000).toISOString(),
    },
  };

  // 6.- Add information to new tab
  renderL1ToL2Tab(informationToRender);
};

main()
  .then()
  .catch((error) => {
    console.error(error);
  });
