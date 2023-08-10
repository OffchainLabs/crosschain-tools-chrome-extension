# Cross-messaging tools - Chrome extension

Chrome extension that offers information on etherscan about Ethereum transactions that send L1->L2 messages to Arbitrum. It creates a new tab on Etherscan for these transactions with information of the L1->L2 messages taken from the appropriate subgraph.

## Installation

1. Clone repository

    `git checkout https://github.com/OffchainLabs/crosschain-tools-chrome-extension.git`

2. Install dependencies

    `npm install`

3. Build extension

    `npm run build`

4. Go to `chrome://extensions/` and activate Developer mode (top-right switch)

5. Click the `Load unpacked` button on the left and select the folder that holds the `manifest.json` file (usually the one where you cloned the repository to)

6. Done. You can now go to etherscan, to the page of a transaction that sent an L1->L2 message to see the new tab