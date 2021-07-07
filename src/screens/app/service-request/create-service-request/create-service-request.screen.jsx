import _ from 'lodash';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';

import useTheme from '../../../../theme/hooks/useTheme';
import { LoadingComponent } from '../../../../components/molecules';
import { CreateServiceRequestForm } from '../../../../components/forms';
import {
  createServiceRequestAction,
  getServiceRequestsAction,
} from '../../../../reducers/service-request-reducer/service-request.actions';
import { flashService } from '../../../../services';
import { createServiceRequestModel } from '../../../../models';
import { municipalitiesSelector } from '../../../../reducers/municipalities-reducer/municipalities.reducer';
import HeaderBackGround from '../../../../components/atoms/header-background/index';

const CreateServiceRequestScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { municipalities } = useSelector(municipalitiesSelector);

  const { Gutters, Common } = useTheme();

  const _onFormSuccess = async () => {
    flashService.success('Successfully created request');
    await dispatch(getServiceRequestsAction());
    navigation.navigate('ServiceRequests');
  };

  const _handleFormSubmit = (form) => {
    return dispatch(createServiceRequestAction(form));
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      style={[Common.defaultBackGround]}
      extraHeight={150}
      enableOnAndroid
    >
      <HeaderBackGround backButton />
      {!_.isEmpty(municipalities) ? (
        <CreateServiceRequestForm
          submitForm={_handleFormSubmit}
          onSuccess={_onFormSuccess}
          municipalities={municipalities}
          initialValues={createServiceRequestModel()}
          containerStyle={[Gutters.regularHMargin, Gutters.regularTMargin]}
        />
      ) : (
        <LoadingComponent />
      )}
    </KeyboardAwareScrollView>
  );
};

CreateServiceRequestScreen.propTypes = {};

CreateServiceRequestScreen.defaultProps = {};

export default CreateServiceRequestScreen;
