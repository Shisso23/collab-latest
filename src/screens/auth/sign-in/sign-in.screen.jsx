import React, { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';
import { useDispatch } from 'react-redux';
import { ImageBackground, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterLink, ForgotPasswordLink } from '../../../components/atoms';
import { SignInForm } from '../../../components/forms';

import { userAuthService } from '../../../services';
import { signInModel } from '../../../models';
import { isAuthenticatedFlowAction } from '../../../reducers/app-reducer/app.actions';
import useTheme from '../../../theme/hooks/useTheme';
import { FormScreenContainer } from '../../../components';
import LoginLogo from '../../../components/atoms/login-logo';
import { getMyChannelsAction } from '../../../reducers/my-channels/my-channels.actions';

const SignInScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem('isFirstTimeUserKey').then((response) => {
      if (response === null) {
        AsyncStorage.setItem(`isFirstTimeUserKey`, `${true}`);
      }
    });
  }, []);

  const { Gutters, Layout, Images, Common } = useTheme();

  const _onSignInSuccess = async () => {
    RNBootSplash.show({ fade: true });
    await dispatch(getMyChannelsAction());
    await dispatch(isAuthenticatedFlowAction());
    RNBootSplash.hide({ fade: true });
  };

  return (
    <ImageBackground source={Images.loginBackground} style={Layout.fullSize} resizeMode="cover">
      <FormScreenContainer contentContainerStyle={[Layout.scrollCenter]}>
        <LoginLogo containerStyle={[Gutters.largeMargin]} />
        <View style={[Gutters.largeBMargin]}>
          <Text style={[Common.loginLogo, Layout.alignSelfCenter, Gutters.largeBMargin]}>
            Login
          </Text>
        </View>
        <SignInForm
          submitForm={userAuthService.signIn}
          onSuccess={_onSignInSuccess}
          initialValues={signInModel()}
          containerStyle={[Gutters.largeHMargin]}
        />
        <RegisterLink containerStyle={[Gutters.regularMargin]} />
        <ForgotPasswordLink containerStyle={[Gutters.largeBMargin]} />
      </FormScreenContainer>
    </ImageBackground>
  );
};

export default SignInScreen;
