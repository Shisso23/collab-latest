import _ from 'lodash';
import { flashService, serviceRequestService } from '../../services';
import {
  setIsLoadingServiceRequestsAction,
  setServiceRequestsAction,
  setImagesSourcesAction,
  setDeleteServiceRequestPreviewAction,
  setIsLoadingDeleteServiceRequestAction,
  setServiceRequestCommentsAction,
  setIsLoadingCommentsAction,
  setIsLoadingNearbyPinLocationsAction,
  setNearbyPinLocationsAction,
} from './service-request.reducer';

export const getServiceRequestsAction = () => (dispatch) => {
  dispatch(setIsLoadingServiceRequestsAction(true));
  return serviceRequestService
    .getServiceRequests()
    .then((serviceRequests) => {
      dispatch(setServiceRequestsAction(serviceRequests));
    })
    .catch((error) => flashService.error(_.get(error, 'message', '')))
    .finally(() => {
      dispatch(setIsLoadingServiceRequestsAction(false));
    });
};

export const getNearbyPinLocationsAction =
  async (currentLatitude, currentLongitude) => async (dispatch) => {
    dispatch(setIsLoadingNearbyPinLocationsAction(true));
    return serviceRequestService
      .getServiceRequestPins(currentLatitude, currentLongitude)
      .then(async (locations) => {
        return dispatch(setNearbyPinLocationsAction(locations));
      })
      .catch((error) => flashService.error(_.get(error, 'message', '')))
      .finally(() => {
        dispatch(setIsLoadingNearbyPinLocationsAction(false));
      });
  };

export const createServiceRequestAction =
  (newServiceRequestForm) => async (_dispatch, getState) => {
    const { user } = getState().userReducer;
    await serviceRequestService
      .createServiceRequest(newServiceRequestForm, user)
      .then(async (response) => {
        const objID = _.get(response.data.Data, 'ObjID');
        const fileAttachments = _.get(newServiceRequestForm, 'images');
        if (fileAttachments && fileAttachments?.length > 0) {
          await _dispatch(uploadServiceRequestImages(objID, fileAttachments));
        } else {
          await serviceRequestService.confirmCreateServiceRequest({
            uploadCompleted: 'Yes',
            serviceRequestId: objID,
          });
        }
      });
  };

export const uploadServiceRequestImages = (objId, fileAttachments) => async (dispatch) => {
  try {
    dispatch(setIsLoadingServiceRequestsAction(true));
    Promise.all(
      fileAttachments.map((attachment) => {
        return serviceRequestService.uploadServiceRequestPhoto(objId, attachment);
      }),
    ).then(async () => {
      await serviceRequestService.confirmCreateServiceRequest({
        uploadCompleted: 'Yes',
        serviceRequestId: objId,
      });
      dispatch(getServiceRequestsAction());
    });
    flashService.success('Upload completed successfully');
  } catch (error) {
    flashService.error('Upload did not complete!');
  } finally {
    dispatch(setIsLoadingServiceRequestsAction(false));
  }
};

export const setImagesSources = (images) => async (dispatch) => {
  try {
    return dispatch(setImagesSourcesAction(images));
  } catch (error) {
    return error;
  }
};

export const deleteServiceRequestAction = (channelId, serviceRequestId) => (dispatch) => {
  dispatch(setIsLoadingDeleteServiceRequestAction(true));
  return serviceRequestService
    .deleteServiceRequest(channelId, serviceRequestId)
    .then(async () => {
      dispatch(getServiceRequestsAction());
    })
    .finally(() => dispatch(setIsLoadingDeleteServiceRequestAction(false)));
};

export const getCommentsAction = (serviceRequestId) => (dispatch) => {
  dispatch(setIsLoadingCommentsAction(true));
  return serviceRequestService
    .getServiceRequestComments(serviceRequestId)
    .then(async (comments) => {
      dispatch(setServiceRequestCommentsAction(comments));
    })
    .finally(() => dispatch(setIsLoadingCommentsAction(false)));
};

export const previewDeleteServiceRequestAction = (shoudlPreview) => {
  return (dispatch) => dispatch(setDeleteServiceRequestPreviewAction(shoudlPreview));
};
