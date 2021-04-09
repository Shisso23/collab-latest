import _ from 'lodash';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { constructServiceRequestModels, apiCreateServiceRequestModel } from '../../../models';
import globalUrl from '../global/global.service.urls';
import { apiFunctionWithUniqName } from '../../../helpers/api-function-name.helper';
import authNetworkService from '../auth-network-service/auth-network.service';
import srUrls from './service-request.urls';
import { flashService } from '../../index';
import storageService from '../storage-service/storage.service';

const createServiceRequest = async (createServiceRequestForm, userInfo) => {
  const url = srUrls.createSrUrl();
  const apiModel = apiCreateServiceRequestModel(createServiceRequestForm, userInfo);
  try {
    return authNetworkService.post(url, apiModel);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(err, null, 2));
    throw err;
  }
};

const uploadServiceRequestPhoto = async (objId, photo) => {
  const fileUploadUrl = srUrls.upLoadFile();
  try {
    const authToken = await storageService.getAccessToken();
    const path = Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri;
    await RNFetchBlob.fetch(
      'POST',
      `${fileUploadUrl}`,
      {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
      [
        { name: 'Obj_Id', data: `${objId}` },
        {
          name: 'Attachment',
          filename: `${objId}.jpg`,
          data: RNFetchBlob.wrap(path),
        },
      ],
    )
      .then(() => flashService.success('Upload completed successfully'))
      .catch(() => flashService.error('Upload did not complete!'));
  } catch (err) {
    console.warn(JSON.stringify(err, null, 2));
    throw err;
  }
};

const getServiceRequests = async () => {
  const url = globalUrl.globalFunctionUrl();
  const data = await apiFunctionWithUniqName('get_service_requests');
  const apiResponse = await authNetworkService.post(url, data);
  const serviceRequests = _.get(apiResponse.data, 'service_requests', []);
  if (!serviceRequests) {
    throw Error('Could not load service requests.');
  }
  if (serviceRequests.length === 0 || !serviceRequests) {
    flashService.info('You have no service requests.');
  }

  return constructServiceRequestModels(serviceRequests);
};

export default {
  createServiceRequest,
  getServiceRequests,
  uploadServiceRequestPhoto,
};
