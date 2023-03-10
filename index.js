import 'react-native-gesture-handler';
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from 'react-native-elements';
import { Provider } from 'react-redux';
import { TourGuideProvider } from 'rn-tourguide';

import { paperTheme } from './src/theme/paperTheme';
import { name as appName } from './app.json';
import App from './src/App';
import theme from './src/theme/react-native-elements-theme';
import store from './src/reducers/store';
import { Tooltip } from './src/components/molecules/tour-guide-tooltip';

const Root = () => (
  <TourGuideProvider {...{ borderRadius: 16, tooltipComponent: Tooltip }} preventOutsideInteraction>
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <App />
            <Toast ref={(ref) => Toast.setRef(ref)} />
          </Provider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  </TourGuideProvider>
);

AppRegistry.registerComponent(appName, () => Root);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage');
