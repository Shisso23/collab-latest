import authNetworkService from '../auth-network-service/auth-network.service';
import { userModel, apiUserModel } from '../../../models';
import globalUrl from '../global/global.service.urls';
import {
  apiFunctionWithUniqName,
  dataUpdateUserProfile,
} from '../../../helpers/api-function-name.helper';

const getUser = async () => {
  const url = globalUrl.globalFunctionUrl();
  const _createAndReturnUserModel = ({ data }) => {
    if (!data.profile) {
      throw Error('Could not get user profile');
    }
    return userModel(data.profile);
  };
  const data = await apiFunctionWithUniqName('get_user_profile');
  const apiResponse = await authNetworkService.post(url, data);
  return _createAndReturnUserModel(apiResponse);
};

const updateUser = async ({ formData }) => {
  const url = globalUrl.globalFunctionUrl();
  const apiUser = apiUserModel(formData);
  const data = await dataUpdateUserProfile('update_user_profile', apiUser.user);
  try {
    const response = await authNetworkService.post(url, data);
    return response;
  } catch (error) {
    error.errors = userModel(error.errors);
    // eslint-disable-next-line no-console
    console.warn(error);
    return Promise.reject(error);
  }
};

const invitedUserRecord = async (userId) => {
  const url = globalUrl.createUpdateRecordUrl();
  const subscriptionModel = `<Objects><User_News_Feed_Item_Activity> <F1>${userId}</F1><F3>Invited</F3> </User_News_Feed_Item_Activity></Objects>`;
  return authNetworkService.post(url, subscriptionModel);
};

export default {
  getUser,
  updateUser,
  invitedUserRecord,
};
