import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Text, CheckBox } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome5';
import _ from 'lodash';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';
import moment from 'moment';
import useTheme from '../../../theme/hooks/useTheme';
import ScreenContainer from '../../../components/containers/screen-container/screen.container';
import Notification from '../../../components/molecules/notification';
import {
  deleteNotificationAction,
  getNotificationsAction,
} from '../../../reducers/notification-reducer/notification.actions';
import { promptConfirm } from '../../../helpers/prompt.helper';

const InboxScreen = () => {
  const { Colors } = useTheme();
  const { notifications, isLoading } = useSelector((reducers) => reducers.notificationReducer);
  const { Fonts, Layout, Images, Common, Gutters } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((reducers) => reducers.userReducer);
  const [selectedCounter, setSelectedCounter] = useState(0);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [expandedNotification, setExpandeNotification] = useState(null);
  const [allNotificationsSelected, setAllNotificationsSelected] = useState(false);
  const [userNotifications, setUserNotifications] = useState(_.get(notifications, 'Feed', []));

  useEffect(() => {
    dispatch(getNotificationsAction());
  }, []);
  useEffect(() => {
    setUserNotifications(_.get(notifications, 'Feed', []));
  }, [JSON.stringify(notifications)]);

  useEffect(() => {
    if (selectedNotifications.length === 0) {
      setMultiSelectEnabled(false);
    } else {
      if (selectedNotifications.length !== userNotifications.length) {
        setAllNotificationsSelected(false);
      } else {
        setAllNotificationsSelected(true);
      }
      setMultiSelectEnabled(true);
    }
  }, [JSON.stringify(selectedNotifications)]);

  useEffect(() => {
    if (allNotificationsSelected) {
      setSelectedNotifications(userNotifications);
    }
  }, [allNotificationsSelected]);

  const handleNotificationLongPress = (notification) => () => {
    setSelectedNotifications([...selectedNotifications, notification]);
  };

  const handleNotificationPress = (notification) => () => {
    if (multiSelectEnabled) {
      if (
        selectedNotifications.some(
          (notification_) => _.get(notification_, 'obj_id') === _.get(notification, 'obj_id'),
        )
      ) {
        setSelectedNotifications(
          selectedNotifications.filter(
            (notification_) => _.get(notification_, 'obj_id') !== _.get(notification, 'obj_id'),
          ),
        );
      } else {
        setSelectedNotifications([...selectedNotifications, notification]);
      }
    } else if (
      !multiSelectEnabled &&
      expandedNotification &&
      _.get(expandedNotification, 'obj_id') === _.get(notification, 'obj_id')
    ) {
      setExpandeNotification(null);
    } else {
      setExpandeNotification(notification);
    }
  };

  const renderPlaceHolders = () => {
    const dummyArray = [1, 2, 3, 4, 5, 6, 7];
    return (
      <View>
        {isLoading ? (
          dummyArray.map((i) => {
            return (
              <View
                key={`${i}`}
                style={[
                  Common.textInputWithShadow,
                  Gutters.tinyMargin,
                  Gutters.smallVMargin,
                  ...[{ height: 90 }],
                ]}
              >
                <Placeholder Animation={Fade} Left={PlaceholderMedia} Right={PlaceholderMedia}>
                  <PlaceholderLine width={80} />
                  <PlaceholderLine />
                  <PlaceholderLine width={30} />
                </Placeholder>
              </View>
            );
          })
        ) : (
          <Text style={Fonts.titleRegular}>
            There are no Notifications here. Please subscribe to a channel to receive notifications.
          </Text>
        )}
      </View>
    );
  };

  const handleDeleteNotification = (notificationToDelete) => () => {
    setUserNotifications(
      userNotifications.filter(
        (notification) => _.get(notificationToDelete, 'obj_id') !== _.get(notification, 'obj_id'),
      ),
    );
  };

  const deleteNotificationsSelected = () => {
    promptConfirm(
      'Are you sure?',
      'Are you sure you want to delete all selected items?',
      'Delete',
      () => {
        setUserNotifications(
          userNotifications.filter((notification) => {
            if (
              selectedNotifications.every(
                (selectedNotification) =>
                  _.get(selectedNotification, 'obj_id') !== _.get(notification, 'obj_id'),
              )
            ) {
              return true;
            }
            return false;
          }),
        );
        setMultiSelectEnabled(false);
        Promise.all(
          selectedNotifications.map((notification) =>
            dispatch(
              deleteNotificationAction(
                _.get(notification, 'obj_id'),
                moment(new Date()).format('yyyy-mm-DD hh:mm:ss'),
                _.get(user, 'user_id', ''),
              ),
            ),
          ),
        );
      },
    );
  };

  const toggleSelectAll = () => {
    if (allNotificationsSelected) {
      setSelectedNotifications([]);
    }
    setAllNotificationsSelected(!allNotificationsSelected);
  };

  return (
    <ImageBackground
      source={Images.serviceRequest}
      style={[Layout.fullSize, Layout.fill]}
      resizeMode="cover"
    >
      <Text style={[Layout.alignSelfCenter, Fonts.titleTiny, Gutters.regularTMargin]}>
        Notifications
      </Text>
      {!isLoading ? (
        <ScreenContainer>
          <View
            style={[
              Layout.alignSelfEnd,
              Gutters.tinyHPadding,
              Layout.alignItemsCenter,
              Layout.rowBetween,
              styles.selectNotificationView,
            ]}
          >
            <CheckBox
              onPress={toggleSelectAll}
              checked={allNotificationsSelected}
              containerStyle={styles.checkbox}
              size={32}
              title="Select all"
            />
            {(multiSelectEnabled && (
              <Icon
                name="trash"
                size={27}
                backgroundColor="transparent"
                color={Colors.gray}
                onPress={deleteNotificationsSelected}
              />
            )) || <View />}
          </View>

          {userNotifications.map((notification, index) => {
            return (
              <Notification
                notification={notification}
                key={_.get(notification, 'obj_id', index)}
                index={index}
                selectedCounter={selectedCounter}
                setSelectedCounter={setSelectedCounter}
                onPress={handleNotificationPress(notification)}
                onLongPress={handleNotificationLongPress(notification)}
                multiSelectEnabled={multiSelectEnabled}
                handleDeleteNotification={handleDeleteNotification(notification)}
                expanded={
                  !multiSelectEnabled &&
                  _.get(expandedNotification, 'obj_id') === _.get(notification, 'obj_id')
                }
                isSelected={
                  !selectedNotifications
                    ? false
                    : selectedNotifications.some(
                        (notification_) =>
                          _.get(notification_, 'obj_id', index) === _.get(notification, 'obj_id'),
                      )
                }
              />
            );
          })}
        </ScreenContainer>
      ) : (
        renderPlaceHolders()
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  checkbox: { padding: 0 },
  selectNotificationView: {
    width: '100%',
  },
});

InboxScreen.propTypes = {};

InboxScreen.defaultProps = {};

export default InboxScreen;
