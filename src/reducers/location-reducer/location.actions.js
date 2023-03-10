import flashService from '../../services/sub-services/flash-service/flash.service';
import locationService from '../../services/sub-services/location-service/location.service';
import {
  setIsLoadingAction,
  setRegionAction,
  setSelectedAddressAction,
  setIsLoadingAddressAction,
} from './location.reducer';
import { getCurrentPosition } from './location.utils';

export const clearLocationAction = () => (dispatch) => {
  dispatch(setRegionAction(null));
  dispatch(setSelectedAddressAction(''));
};

export const getCurrentPositionAction = async () => async (dispatch) => {
  dispatch(setIsLoadingAction(true));

  try {
    const region = await getCurrentPosition();
    dispatch(setRegionAction(region));
    await dispatch(getAddressFromRegionAction(region));
    return region;
  } catch (err) {
    flashService.error(err.message);
    return null;
  } finally {
    setIsLoadingAction(false);
  }
};

export const getAddressFromRegionAction = async (newRegion) => async (dispatch) => {
  dispatch(setIsLoadingAddressAction(true));
  try {
    const address = await locationService.getAddressFromCoordinates(newRegion);
    dispatch(setSelectedAddressAction(address));
    return address;
  } catch (err) {
    flashService.error(err.message);
    return null;
  } finally {
    dispatch(setIsLoadingAddressAction(false));
  }
};
