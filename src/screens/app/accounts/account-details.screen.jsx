/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { Tab } from 'react-native-elements';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';

import { useDispatch } from 'react-redux';
import useTheme from '../../../theme/hooks/useTheme';
import { Colors } from '../../../theme/Variables';
import StatementsTabContent from '../../../components/molecules/add-account/statements-tab-content';
import MetersTabContent from '../../../components/molecules/meters/meters-tab-content';
import ScreenContainer from '../../../components/containers/screen-container/screen.container';
import { flashService, paymentService } from '../../../services';
import { getUserTokenAction } from '../../../reducers/payment-reducer/payment.actions';
import LoadingOverlay from '../../../components/molecules/loading-overlay';

const AccountDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const accountDetails = _.get(route, 'params.account', {});
  const accountChannel = _.get(route, 'params.accountChannel.name', '');
  const payAtNumber = _.get(route, 'params.accountChannel.payAtNumber', false);
  const channelRef = _.get(route, 'params.accountChannel.objectId', '');
  const statements = _.get(route, 'params.statements', []);
  const dispatch = useDispatch();
  const loadingImageSource = require('../../../assets/lottie-files/rings-loading.json');
  const [accountPaymentDetails, setAccountPaymentDetails] = useState(null);
  const [isLoadingGetAccountDetails, setIsLoadingGetAccountDetails] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [disableIndicator, setDisableIndicator] = useState(false);
  const { Gutters, Fonts, Layout, Images } = useTheme();
  const meters = _.get(accountDetails, 'meters', '');
  const accountNumber = _.get(accountDetails, 'accountNumber', '');
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    if (meters.length === 0) {
      setDisableIndicator(true);
    }
    if (payAtNumber) {
      setIsLoadingGetAccountDetails(true);
      dispatch(getUserTokenAction())
        .then((tokenResponse) => {
          setUserToken(tokenResponse.payload);
          paymentService
            .getAccountDetails({
              accountNumber: `${payAtNumber}${accountNumber}`,
              token: tokenResponse.payload,
            })
            .then((accountDetailsResponse) => {
              setAccountPaymentDetails({
                accountNumber: _.get(accountDetailsResponse, 'accountNumber', null),
                amount: _.get(accountDetailsResponse, 'amount', null),
                minAmount: _.get(accountDetailsResponse, 'paymentRules.minAmount', null),
                maxAmount: _.get(accountDetailsResponse, 'paymentRules.maxAmount', null),
                token: _.get(accountDetailsResponse, 'token', null),
              });
            })
            .catch(() => {
              flashService.error('Failed fetching account details!');
            });
        })
        .finally(() => {
          setIsLoadingGetAccountDetails(false);
        });
    }
  }, []);

  const onMakePaymentPress = () => {
    navigation.navigate('AccountPayment', {
      accountPaymentDetails,
      channelRef,
      userToken,
    });
  };

  useEffect(() => {
    if (meters.length === 0) {
      setDisableIndicator(true);
    }
  }, [meters.length]);

  return (
    <>
      <ImageBackground
        source={Images.serviceRequest}
        style={[Layout.fullSize, Layout.fill]}
        resizeMode="cover"
      >
        <ScreenContainer>
          <Text style={[Gutters.smallMargin, Fonts.titleTiny]}>Account</Text>
          <Text style={[styles.accountDetails, Gutters.smallLMargin]}>{accountNumber}</Text>
          <Text style={[styles.accountDetails, Gutters.tinyVMargin, Gutters.smallLMargin]}>
            {accountChannel}
          </Text>
          <Tab
            value={tabIndex}
            onChange={(index) => {
              setTabIndex(index);
            }}
            indicatorStyle={[
              { backgroundColor: Colors.softBlue },
              Platform.select({ android: { borderWidth: 15 }, ios: {} }),
            ]}
            disableIndicator={disableIndicator}
          >
            <Tab.Item
              titleStyle={[{ color: tabIndex === 0 ? Colors.black : Colors.gray }, styles.tabItem]}
              title="Statements"
            />
            {meters.length > 0 ? (
              <Tab.Item
                titleStyle={[
                  { color: tabIndex === 1 ? Colors.black : Colors.gray },
                  styles.tabItem,
                ]}
                title="Meters"
              />
            ) : (
              <></>
            )}
          </Tab>
          {tabIndex === 0 ? (
            <StatementsTabContent account={accountDetails} statements={statements} />
          ) : (
            <MetersTabContent
              meters={meters}
              accountNumber={accountNumber}
              channelRef={channelRef}
            />
          )}
        </ScreenContainer>
        {(accountPaymentDetails && tabIndex === 0 && (
          <Button
            mode="contained"
            color={Colors.primary}
            style={[
              Layout.fill,
              Gutters.tinyLMargin,
              styles.submitButton,
              Layout.alignItemsCenter,
              Gutters.smallVPadding,
              Gutters.regularHMargin,
            ]}
            contentStyle={{ backgroundColor: Colors.primary }}
            onPress={onMakePaymentPress}
          >
            Make a payment
          </Button>
        )) || <></>}

        <LoadingOverlay
          source={loadingImageSource}
          visible={isLoadingGetAccountDetails}
          transparent
        />
      </ImageBackground>
    </>
  );
};
const styles = StyleSheet.create({
  accountCard: { width: '42%' },
  accountDetails: { color: Colors.darkgray, fontSize: 15 },
  submitButton: {
    borderRadius: 10,
    bottom: '15%',
    left: '15%',
    position: 'absolute',
    width: '65%',
  },
  tabItem: { fontSize: 14 },
});

AccountDetailsScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

export default AccountDetailsScreen;
