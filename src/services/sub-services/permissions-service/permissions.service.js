// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform } from 'react-native';
import HMSLocation from '@hmscore/react-native-hms-location';
import { check, PERMISSIONS, RESULTS, request, openSettings } from 'react-native-permissions';
import _ from 'lodash';

import alertService from '../alert-service/alert.service';
import flashService from '../flash-service/flash.service';

const _hasPermissions = (permission) => permission === 'granted';

export const checkLocationPermissions = async () => {
  let permission;
  if (Platform.OS === 'android') {
    permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  } else {
    permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }
  return checkPlatformLocationPermissions(permission);
};

const checkPlatformLocationPermissions = async (permission) => {
  const permissionStatus = await check(permission);
  if (!_hasPermissions(permissionStatus)) {
    await requestLocationPermissions(permission);
  }
  return _hasPermissions(permissionStatus);
};

const requestLocationPermissions = (platform) => {
  return new Promise((resolve, reject) => {
    return request(platform).then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          flashService.info(
            'Location Services is not available (on this device / in this context)',
          );
          break;
        case RESULTS.DENIED:
          reject(new Error('Please grant permissions to select a location.'));
          break;
        case RESULTS.GRANTED:
          resolve();
          break;
        case RESULTS.BLOCKED:
          alertService.createTwoButtonAlert({
            title: 'Location Permissions Error',
            message: 'Open settings to change permissions?',
            onOk: async () => openSettings(),
            onCancel: () => {},
          });
          break;
        default: {
          break;
        }
      }
    });
  });
};

const requestHmsLocationPermissions = async () => {
  let hasPermission = await HMSLocation.FusedLocation.Native.hasPermission();
  if (!hasPermission.hasPermission) {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      hasPermission = await HMSLocation.FusedLocation.Native.hasPermission();
      return hasPermission;
    } catch (error) {
      flashService.error('Location permission not granted');
      return false;
    }
  }
  return _.get(hasPermission, 'hasPermission', false);
};

export default {
  checkLocationPermissions,
  requestHmsLocationPermissions,
};
