import _ from 'lodash';
import accountsUrls from './accounts.new.urls';

// import { apiFunctionWithUniqName } from '../../../helpers/api-function-name.helper';
// import authNetworkService from '../auth-network-service/auth-network.service';
import { mockApi } from '../../../dummy-data/mock-api';

const getChannelsWithValidAccounts = async () => {
  const url = accountsUrls.getChannelsWithAccountsUrl();
  const apiResponse = await mockApi.get(url);
  return _.get(apiResponse, 'data.municipalities', null);
};

const getAccountStatements = async (accountId) => {
  const url = accountsUrls.statementsUrl();
  const apiResponse = await mockApi.get(url, { data: { accountId } });
  return _.get(apiResponse, 'data.statements', null);
};

const validateAccount = async (email, accountNumber) => {
  const url = accountsUrls.validateUrl();
  const apiResponse = await mockApi.get(url, { data: { email, accountNumber } });
  return _.get(apiResponse, 'data', null);
};

export default {
  getChannelsWithValidAccounts,
  getAccountStatements,
  validateAccount,
};
