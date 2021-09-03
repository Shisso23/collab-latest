import React, { useEffect, useState } from 'react';
import MapView from 'react-native-maps';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Keyboard,
  TouchableHighlight,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, DefaultTheme } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';

import useTheme from '../../../theme/hooks/useTheme';
import { locationSelector } from '../../../reducers/location-reducer/location.reducer';
import {
  getAddressFromRegionAction,
  getCurrentPositionAction,
} from '../../../reducers/location-reducer/location.actions';
import appConfig from '../../../config';

const { width } = Dimensions.get('window');

const SelectLocation = ({ _handlePickLocation, _handleBackPress, onRegionChange }) => {
  const { Colors, Layout, Common, Gutters } = useTheme();
  const dispatch = useDispatch();
  const { region, selectedAddress } = useSelector(locationSelector);
  const [address, setAddress] = useState('');
  const [regionChange, setRegionChange] = useState({
    latitude: 30.5595,
    longitude: 22.9375,
    latitudeDelta: 0.011,
    longitudeDelta: 0.011,
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getCurrentPositionAction());
    }, []),
  );

  useEffect(() => {
    onRegionChange(region);
    setRegionChange(region);
  }, [region]);

  useEffect(() => {
    setAddress(selectedAddress);
  }, [selectedAddress]);

  const _setRegion = async (newRegion) => {
    if (
      newRegion.latitude.toFixed(5) !== region.latitude.toFixed(5) &&
      newRegion.longitude.toFixed(5) !== region.latitude.toFixed(5)
    ) {
      const addressSelected = await dispatch(getAddressFromRegionAction(newRegion));
      setAddress(addressSelected);
      setRegionChange(newRegion);
      onRegionChange(newRegion);
    }
  };

  const hitSlop = { top: 20, bottom: 20, left: 20, right: 20 };

  const _handleNewRegion = (details) => {
    const newRegion = _.get(details, 'geometry.location');
    setRegionChange({
      latitude: newRegion.lat,
      longitude: newRegion.lng,
      longitudeDelta: 0.011,
      latitudeDelta: 0.011,
    });
    onRegionChange({
      latitude: newRegion.lat,
      longitude: newRegion.lng,
      longitudeDelta: 0.011,
      latitudeDelta: 0.011,
    });
  };

  return region ? (
    <View style={[Layout.fullSize]}>
      <View style={[Common.headerSelectLocation]}>
        <View style={[Layout.rowBetween]}>
          <IconButton
            icon="arrow-left"
            size={30}
            color={Colors.black}
            onPress={_handleBackPress}
            style={Gutters.largeTMargin}
          />

          <View style={[Layout.center]}>
            <Text style={[Gutters.largeTMargin, Common.pickLocation]}>Pick Location</Text>
          </View>

          <View style={[Layout.center]}>
            <IconButton
              icon="map-marker-circle"
              size={30}
              color={Colors.transparent}
              style={Gutters.largeTMargin}
            />
          </View>
        </View>
      </View>

      <GooglePlacesAutocomplete
        placeholder="Location"
        enablePoweredByContainer={false}
        debounce={3}
        fetchDetails
        enableHighAccuracyLocation
        minLength={3}
        onPress={(data, details = null) => {
          _handleNewRegion(details);
        }}
        query={{
          key: appConfig.googleMapsApiKey,
          language: 'en',
          components: 'country:za',
        }}
        styles={{
          container: {
            position: 'absolute',
            width: '100%',
            marginTop: 80,
            zIndex: 1,
          },
          textInput: {
            height: 53,
          },
        }}
        textInputProps={{
          InputComp: TextInput,
          autoFocus: true,
          backgroundColor: DefaultTheme.colors.background,
          clearButtonMode: 'never',
          listViewDisplayed: true,
          underlineColor: Colors.transparent,
          autoCorrect: false,
          onChangeText: (text) => {
            setAddress(text);
          },
          value: address,
        }}
        renderRightButton={() => (
          <TouchableOpacity
            style={styles.clearContainer}
            hitSlop={hitSlop}
            onPress={() => {
              setAddress('');
            }}
          >
            <Icon name="clear" size={15} color={Colors.black} />
          </TouchableOpacity>
        )}
      />

      <MapView
        style={[Layout.fill]}
        initialRegion={region}
        region={regionChange}
        showsUserLocation
        onPress={Keyboard.dismiss}
        onRegionChangeComplete={(newRegion) => _setRegion(newRegion)}
        showsMyLocationButton={false}
      />

      <View style={[Common.pinContainer]}>
        <Icon type="ionicon" name="pin-outline" size={30} color={Colors.primary} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : ''}>
        <View style={Layout.fullWidth}>
          <TouchableHighlight onPress={_handlePickLocation}>
            <Button style={Common.buttonPickLocation} mode="contained">
              Pick this location
            </Button>
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </View>
  ) : (
    <View style={[Layout.center, Layout.fill]}>
      <ActivityIndicator size="large" animating color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  clearContainer: {
    alignSelf: 'center',
    backgroundColor: DefaultTheme.colors.background,
    height: 38,
    justifyContent: 'center',
    left: width - 35,
    position: 'absolute',
    width: 40,
  },
});

SelectLocation.propTypes = {
  _handlePickLocation: PropTypes.func.isRequired,
  _handleBackPress: PropTypes.func.isRequired,
  onRegionChange: PropTypes.func.isRequired,
};

SelectLocation.defaultProps = {};

export default SelectLocation;