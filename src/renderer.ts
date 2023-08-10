import { RenderableTransactionInformation } from './types';

// Types for rendering
type RetryableStatus = 'success' | 'pending' | 'expired' | undefined;

// Etherscan element ids
const tabListId = 'ContentPlaceHolder1_myTab';
const tabContentsId = 'pills-tabContent';
const l1tol2TabId = 'l1tol2';

const createNewTab = (tabId: string, status?: RetryableStatus): HTMLDivElement | undefined => {
  // Finding tab list and tab contents elements
  const tablistContainer = document.getElementById(tabListId);
  if (!tablistContainer || !tablistContainer.lastElementChild) {
    console.log('Tab list container not found (ID: ' + tabListId + ')');
    return;
  }
  const tabContentsContainer = document.getElementById(tabContentsId);
  if (!tabContentsContainer) {
    console.log('Tab contents container not found (ID: ' + tabContentsId + ')');
    return;
  }

  // Creating link
  const aElement = document.createElement('a');
  aElement.className = 'nav-link';
  aElement.href = '#' + tabId;
  aElement.id = tabId + '-tab';
  aElement.setAttribute('data-bs-toggle', 'pill');
  aElement.setAttribute('data-bs-target', '#' + tabId + '-tab-content');
  aElement.setAttribute('aria-controls', tabId + '-tab-content');
  aElement.setAttribute('aria-selected', 'false');
  aElement.setAttribute(
    'onclick',
    "javascript:updatehash('" + tabId + "');loadStateChangeIframeSource();",
  );
  aElement.setAttribute('tabindex', '-1');
  aElement.setAttribute('role', 'tab');
  aElement.innerHTML = 'L1 to L2 info';

  if (status) {
    let iconClass = undefined;
    switch (status) {
      case 'success':
        iconClass = 'fa fa-check-circle text-success small';
        break;
      case 'pending':
        iconClass = 'fa fa-exclamation-circle text-warning small';
        break;
      case 'expired':
        iconClass = 'fa fa-times-circle text-danger small';
        break;
    }

    aElement.innerHTML += ' <i class="' + iconClass + '"></i>';
  }

  // Create list item
  const liElement = document.createElement('li');
  liElement.id = 'ContentPlaceHolder1_li_' + tabId;
  liElement.className = 'nav-item snap-align-start';
  liElement.setAttribute('role', 'presentation');
  liElement.appendChild(aElement);

  // Adding the new tab to the tab list
  tablistContainer.lastElementChild.before(liElement);

  // Creating tab content panel
  const divContainerElement = document.createElement('div');
  divContainerElement.className = 'card p-5 mb-3';

  const divContainerWrapper = document.createElement('div');
  divContainerWrapper.className = 'tab-pane fase';
  divContainerWrapper.id = tabId + '-tab-content';
  divContainerWrapper.setAttribute('role', 'tabpanel');
  divContainerWrapper.setAttribute('aria-labelledby', 'tab-8');
  divContainerWrapper.setAttribute('tabindex', '0');
  divContainerWrapper.appendChild(divContainerElement);

  // Adding the new content panel to the main container
  tabContentsContainer.appendChild(divContainerWrapper);

  return divContainerElement;
};

export const renderL1ToL2Tab = (transactionInformation: RenderableTransactionInformation) => {
  // Get status for the tab
  let status: RetryableStatus = undefined;
  switch (transactionInformation.status.value) {
    case 'Redeemed':
      status = 'success';
      break;
    case 'Expired':
    case 'Cancelled':
      status = 'expired';
      break;
    case 'Created':
    case 'RedeemFailed':
      status = 'pending';
      break;
  }

  const contentsElement = createNewTab(l1tol2TabId, status);
  if (!contentsElement) {
    console.log('Error creating the new tab');
    return;
  }

  // Loop through it to show the information we want to show
  for (const information of Object.values(transactionInformation)) {
    // Label
    //-------
    const labelElement = document.createElement('div');
    labelElement.className = 'col-md-3 text-dt mb-2 mb-md-0';
    labelElement.innerHTML = information.label;

    // Information
    //-------------
    const informationElement = document.createElement('div');
    informationElement.className = 'col-md-9';
    informationElement.innerHTML = information.value as string;
    if (information.link) {
      informationElement.innerHTML += ` <a target="_blank" href="${information.link}">${
        information.linkLabel ?? information.link
      }</a>`;
    }

    // Adding everything up
    const rowElement = document.createElement('div');
    rowElement.className = 'row mb-4';
    rowElement.appendChild(labelElement);
    rowElement.appendChild(informationElement);
    contentsElement.appendChild(rowElement);
  }
};
