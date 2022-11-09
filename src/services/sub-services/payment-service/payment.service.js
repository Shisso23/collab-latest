import axios from 'axios';
import _ from 'lodash';
import { dataRecordPayment } from '../../../helpers/api-function-name.helper';
import paymentUrls from './payment.urls';
import authNetworkService from '../auth-network-service/auth-network.service';

const paymentAuthAdapter = axios.create({
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'content-type': 'application/json',
  },
  responseType: 'json',
});

const getUserToken = async ({ username, password }) => {
  const url = paymentUrls.getUserTokenUrl();

  return paymentAuthAdapter.post(url, { username, password }).then((response) => {
    return _.get(response, 'data', null);
  });
};

const getAccountDetails = async ({ accountNumber, token }) => {
  const url = paymentUrls.getAccountDetailsUrl();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return paymentAuthAdapter
    .post(
      url,
      {
        ACCOUNTNUMBER: accountNumber,
      },
      config,
    )
    .then((response) => {
      return _.get(response, 'data', null);
    });
};

const initiatePayment = async ({ accountNumber, amount, token, authToken }) => {
  const url = paymentUrls.initPaymentUrl();
  const config = {
    headers: { Authorization: `Bearer ${authToken}` },
  };

  return paymentAuthAdapter
    .post(
      url,
      {
        ACCOUNTNUMBER: accountNumber,
        AMOUNT: amount,
        token,
        clientReference: 'accountrefernce0001',
        successUrl: 'https://pay.collaboratoronline.com/success',
        failedUrl: 'https://pay.collaboratoronline.com/failed',
        cancelledUrl: 'https://pay.collaboratoronline.com/cancelled',
      },
      config,
    )
    .then((response) => {
      return _.get(response, 'data', null);
    });
};

const recordPayment = ({ accountNumber, paymentStatus, paymentAmount, channelRef, paymentRef }) => {
  const url = paymentUrls.createUpdateRecordUrl();
  const data = dataRecordPayment({
    accountNumber,
    paymentStatus,
    paymentAmount,
    channelRef,
    paymentRef,
  });
  authNetworkService.post(url, data);
};

export default {
  getUserToken,
  getAccountDetails,
  initiatePayment,
  recordPayment,
};
