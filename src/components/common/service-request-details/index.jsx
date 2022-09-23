import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button } from 'react-native-paper';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import useTheme from '../../../theme/hooks/useTheme';
import { Colors } from '../../../theme/Variables';
import { formatTime } from '../../../helpers/time.helper';
import { serviceRequestService } from '../../../services';

const screenWidth = Dimensions.get('screen').width;
const ServiceRequestDetails = ({ serviceRequest }) => {
  const { user } = useSelector((reducers) => reducers.userReducer);
  const [isLoadingFollowServiceRequest, setIsLoadingFollowServiceRequest] = useState(false);
  const navigation = useNavigation();
  const { Gutters, Layout, Fonts, Common } = useTheme();

  const _setImageUrl = (item) => {
    return _.isEmpty(item.serviceRequestImage) ? null : [item.serviceRequestImage].flat()[0];
  };

  const handleFollowSR = (serviceRequestObjId, following) => () => {
    setIsLoadingFollowServiceRequest(true);
    serviceRequestService
      .followServiceRequest({
        userId: user.user_id,
        serviceRequestId: serviceRequestObjId,
        followed: following,
      })
      .then(() => {
        navigation.goBack();
      })
      .finally(() => {
        setIsLoadingFollowServiceRequest(false);
      });
  };
  return (
    <View style={[Layout.row, Gutters.regularHMargin]}>
      <Avatar.Image rounded size={50} source={_setImageUrl(serviceRequest)} />
      <View style={[Gutters.tinyLMargin, Layout.column]}>
        <View
          style={[
            Layout.rowBetween,
            Layout.alignItemsCenter,
            ...[{ width: screenWidth - screenWidth * 0.18, height: 50 }],
          ]}
        >
          <Text
            style={[Fonts.textLarge, Gutters.tinyMargin]}
          >{`${serviceRequest.serviceType}`}</Text>
          {user.user_id?.trim() !== serviceRequest.ownerId.trim() && (
            <Button
              mode="outlined"
              color={Colors.white}
              style={[Gutters.smallRMargin, styles.unfollowButton]}
              labelStyle={[Fonts.textSmall, Common.whiteText]}
              loading={isLoadingFollowServiceRequest}
              onPress={handleFollowSR(serviceRequest.id, false)}
            >
              Unfollow
            </Button>
          )}
        </View>
        <Text
          style={[Fonts.textRegular, Gutters.tinyMargin]}
        >{`Reference Number: ${serviceRequest.referenceNumber}`}</Text>
        <Text
          style={[Fonts.textRegular, Gutters.tinyMargin]}
        >{`Description: ${serviceRequest.serviceDescription}`}</Text>
        <Text style={[Fonts.textRegular, Gutters.tinyMargin]}>{`Date Registered: ${formatTime(
          serviceRequest.requestedDate,
        )}`}</Text>
        <Text style={[Fonts.textRegular, Gutters.tinyMargin]}>{`${serviceRequest.address}`}</Text>
        <Text
          style={[Fonts.textRegular, Gutters.tinyMargin, styles.button]}
        >{`${serviceRequest.status}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    color: Colors.primary,
    width: 200,
  },
  unfollowButton: { backgroundColor: Colors.primary, height: 30, width: 130 },
});

ServiceRequestDetails.propTypes = {
  serviceRequest: PropTypes.object.isRequired,
};

ServiceRequestDetails.defaultProps = {};
export default ServiceRequestDetails;
