import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

export function saveItem(key, value) {
  let saveValue = value;
  if (_.isObject(value)) {
    saveValue = JSON.stringify(value);
  }

  return AsyncStorage.setItem(key, saveValue).catch((error) => error);
}

// eslint-disable-next-line consistent-return
export async function getItem(key) {
  if (key) {
    return AsyncStorage.getItem(key).then((value) => {
      return value;
    });
  }

  return null;
}

export function removeItem(key) {
  return AsyncStorage.removeItem(key).catch(() => {
    return null;
  });
}
