import React, { useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FlatList, Text, View, ImageBackground, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import useTheme from '../../../theme/hooks/useTheme';
import { permissionsService } from '../../../services';
import { myChannelsSelector } from '../../../reducers/my-channels/my-channels.reducer';
import { getMyChannelsAction } from '../../../reducers/my-channels/my-channels.actions';
import { getContactDetailsAction } from '../../../reducers/contacts-reducer/contacts.actions';
import { Colors } from '../../../theme/Variables';

const ContactsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { Common, Gutters, Fonts, Layout, Images } = useTheme();
  const { myChannels, isLoadingMyChannels } = useSelector(myChannelsSelector);
  const { contactDetails } = useSelector((reducers) => reducers.contactsReducer);

  const _loadMyChannels = () => {
    dispatch(getMyChannelsAction());
  };

  useEffect(() => {
    dispatch(getContactDetailsAction('My location'));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      _loadMyChannels();
    }, []),
  );

  const _handleOnNewLocationPress = async () => {
    await permissionsService.checkLocationPermissions();
    navigation.navigate('channelsContacts');
  };

  const _getStatusIndicator = (status) => {
    switch (status) {
      case 'Subscribed':
        return Colors.primary;
      case 'pending':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  const viewSubscribedChannelsItem = ({ item }) => {
    return (
      <View style={[Common.textInputWithShadow, Gutters.tinyMargin]}>
        <List.Item
          title={item.name}
          titleStyle={Common.cardTitle}
          onPress={() => {
            navigation.navigate('ContactDetails', { contactDetails });
          }}
          description={() => (
            <View style={[Layout.column, Gutters.largeRMargin]}>
              <View style={[Layout.rowHCenter, Gutters.tinyTPadding]}>
                <View
                  style={[
                    Gutters.tinyHMargin,
                    Common.statusIndicator,
                    { backgroundColor: _getStatusIndicator(item.status) },
                  ]}
                />
                <Text style={[Fonts.textRegular, Common.cardDescription]}>Subscribed</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <>
      <ImageBackground
        source={Images.serviceRequest}
        style={[Layout.fullSize, Layout.fill]}
        resizeMode="cover"
      >
        <Text style={[Gutters.smallMargin, Fonts.titleTiny]}>My Channels</Text>
        <FlatList
          contentContainerStyle={Gutters.smallHMargin}
          data={myChannels}
          renderItem={viewSubscribedChannelsItem}
          keyExtractor={(item) => String(item.objId)}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingMyChannels}
              onRefresh={_loadMyChannels}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
        <Button
          mode="outlined"
          color={Colors.white}
          style={[styles.button, Layout.alignSelfCenter, Gutters.largeBMargin]}
          labelStyle={[Fonts.textRegular, Common.whiteText]}
          onPress={_handleOnNewLocationPress}
        >
          Choose from map
        </Button>
      </ImageBackground>
    </>
  );
};

ContactsScreen.propTypes = {};

ContactsScreen.defaultProps = {};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    marginTop: 10,
    width: '50%',
  },
});

export default ContactsScreen;