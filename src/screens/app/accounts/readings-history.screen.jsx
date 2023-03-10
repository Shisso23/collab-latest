import React from 'react';
import { FlatList, Text, View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { List, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import { meterReadingsSelector } from '../../../reducers/account-meters/account-meters.reducer';
import useTheme from '../../../theme/hooks/useTheme';
import { Colors } from '../../../theme/Variables';
import { getMeterReadingsAction } from '../../../reducers/account-meters/account-meters.actions';

const screenHeight = Dimensions.get('window').height;

const ReadingsHistoryScreen = ({ route }) => {
  const dispatch = useDispatch();
  const { meterReadings, isLoadingMeterReadings } = useSelector(meterReadingsSelector);
  const meter = _.get(route, 'params.meter', '');
  const meterType = _.get(meter, 'type', '').toLowerCase();
  const meterNumber = _.get(meter, 'meterNumber', '');
  const channelRef = _.get(route, 'params.channelRef', '');
  const navigation = useNavigation();

  const { Gutters, Common, Layout, Fonts } = useTheme();

  const getMeterReadings = async (meterObjId) => {
    return dispatch(getMeterReadingsAction({ meterObjId }));
  };

  const renderDescription = (item) => {
    return (
      <View style={[Layout.rowBetween, Gutters.smallTMargin]}>
        <Text style={[Common.cardDescription, { color: Colors.darkgray }]}>Reading</Text>
        <Text style={Common.cardDescription}>{_.get(item, 'readingNumber')}</Text>
      </View>
    );
  };

  const _handleOpenreading = () => {};

  const addMeterReading = () => {
    navigation.navigate('SubmitReading', {
      meter,
      channelRef,
      readingsDetails: meterReadings,
    });
  };

  const renderReadingItem = ({ item }) => {
    return (
      <>
        <View style={[Common.textInputWithShadow, Gutters.smallVMargin, styles.readingItem]}>
          <List.Item
            title={moment(_.get(item, 'date', new Date())).format('DD MMMM YYYY')}
            description={() => renderDescription(item)}
            onPress={() => _handleOpenreading(item)}
            titleStyle={Common.cardTitle}
          />
        </View>
      </>
    );
  };

  return (
    <>
      <SafeAreaView style={[Gutters.smallPadding, styles.container]}>
        <Text style={[Gutters.smallMargin, Fonts.titleTiny]}>
          {meterType.toLowerCase() === 'electricity' ? 'Electricity History' : 'Water History'}
        </Text>
        <Text style={[styles.meterDetails, Gutters.smallLMargin]}>{meterNumber}</Text>

        <FlatList
          contentContainerStyle={[Gutters.smallHMargin, Gutters.largeBPadding]}
          data={meterReadings.meterReadings}
          renderItem={renderReadingItem}
          keyExtractor={(item, index) => `${_.get(item, 'readingNumber', index)}`}
          refreshing={isLoadingMeterReadings}
          onRefresh={() => getMeterReadings(_.get(meter, 'objId', ''))}
        />
      </SafeAreaView>
      <FAB
        style={[Common.fabAlignment, { marginBottom: screenHeight - screenHeight * 0.85 }]}
        icon="plus"
        onPress={addMeterReading}
      />
    </>
  );
};

ReadingsHistoryScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: { marginBottom: 130 },
  meterDetails: {
    color: Colors.darkgray,
  },
  readingItem: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 0.16,
  },
});

ReadingsHistoryScreen.defaultProps = {};

export default ReadingsHistoryScreen;
