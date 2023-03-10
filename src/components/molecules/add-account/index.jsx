import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Keyboard, Dimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import _ from 'lodash';
import useTheme from '../../../theme/hooks/useTheme';
import { accountsSelector } from '../../../reducers/accounts-reducer/accounts.reducer';
import { accountActions } from '../../../reducers/accounts-reducer';
import flashService from '../../../services/sub-services/flash-service/flash.service';
import FormScreenContainer from '../../containers/form-screen-container/form-screen.container';

const AddAccounts = ({ selectedChannel }) => {
  const dispatch = useDispatch();
  const screenHeight = Dimensions.get('window').height;
  const { isLoadingAddAccount, isLoadingValidateAccount } = useSelector(accountsSelector);
  const { user } = useSelector((reducer) => reducer.userReducer);
  const { Common, Gutters, Layout } = useTheme();
  const [accountNumber, setAccountNumber] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(undefined);
  const channelId = useMemo(() => _.get(selectedChannel, 'objId', ''), []);
  const [accountNumberError, setAccountNumberError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (!accountNumber || `${accountNumber}`.length < 1) {
      return setAccountNumberError(true);
    }
    return dispatch(accountActions.validateAccountAction(accountNumber, channelId))
      .then((accountValid) => {
        if (accountValid) {
          dispatch(accountActions.addAccountAction(channelId, user, accountNumber))
            .then(() => {
              flashService.success('Account successfully validated!');
              navigation.navigate('Accounts');
            })
            .catch(() => {
              flashService.error('Could not verify Account!');
            });
        } else {
          flashService.error('Invalid account Number!');
        }
      })
      .catch(() => {
        flashService.error('Invalid account Number!');
      });
  };

  const handleAccountNumberChange = (accNumber) => {
    setAccountNumberError(false);
    setAccountNumber(accNumber);
  };

  return (
    <FormScreenContainer
      contentContainerStyle={[Layout.fill, Gutters.largeBMargin, Gutters.largeBPadding]}
    >
      <TextInput
        label="Account Number"
        style={[Common.textInput, styles.accountInput]}
        onChangeText={handleAccountNumberChange}
        value={accountNumber}
        error={accountNumberError}
        multiline={false}
        onSubmitEditing={() => Keyboard.dismiss()}
      />
      {accountNumberError && (
        <Text style={[Gutters.smallMargin, Common.errorStyle]}>Invalid account number</Text>
      )}

      <Button
        mode="contained"
        style={[
          Gutters.largeMargin,
          Gutters.tinyVPadding,
          Layout.alignSelfCenter,
          Gutters.largeHPadding,
          {
            marginBottom: keyboardVisible
              ? screenHeight - screenHeight * 0.6
              : screenHeight - screenHeight * 0.88,
          },
          styles.submitBUtton,
        ]}
        onPress={handleSubmit}
        loading={isLoadingAddAccount || isLoadingValidateAccount}
        disabled={isLoadingAddAccount || isLoadingValidateAccount}
      >
        Verify
      </Button>
    </FormScreenContainer>
  );
};

AddAccounts.propTypes = {
  selectedChannel: PropTypes.object.isRequired,
};

AddAccounts.defaultProps = {};

const styles = StyleSheet.create({
  accountInput: {
    marginHorizontal: '3.5%',
  },
  submitBUtton: {
    bottom: 15,
    position: 'absolute',
  },
});

export default AddAccounts;
