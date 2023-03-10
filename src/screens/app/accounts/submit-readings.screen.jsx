import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, HelperText, Button } from 'react-native-paper';
import { Icon, ListItem } from 'react-native-elements';
import ActionSheet from 'react-native-actions-sheet';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import useTheme from '../../../theme/hooks/useTheme';
import { Colors } from '../../../theme/Variables';
import UploadDocumentButton from '../../../components/molecules/upload-document-button';
import DateTimeInput from '../../../components/molecules/date-time-input';
import { setImagesSources } from '../../../reducers/service-request-reducer/service-request.actions';
import ConfirmReadingActionSheetContent from '../../../components/molecules/meters/confirm-reading-actionsheet-content';
import { flashService, metersService } from '../../../services';
import ImageThumbnail from '../../../components/molecules/image-thumbnail';
import { getMeterReadingsAction } from '../../../reducers/account-meters/account-meters.actions';

const SubmitMeterReadingScreen = ({ route }) => {
  const { Gutters, Common, Layout } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const actionSheetRef = useRef();
  const [readingNumber, setReadingNumber] = useState('');
  const [readingNumberError, setReadingNumberError] = useState('');
  const [readingPhoto, setReadingPhoto] = useState('');
  const [readingPhotoError, setReadingPhotoError] = useState('');
  const [readingDate, setReadingDate] = useState(moment(new Date()).toDate());
  const [warningMessage, setWarningMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const channelRef = _.get(route, 'params.channelRef', '');
  const selectedMeter = _.get(route, 'params.meter', {});
  const meterType = _.get(selectedMeter, 'type', '').toLowerCase();
  const meterSerialNo = _.get(selectedMeter, 'meterNumber', '');
  const readingsDetails = _.get(route, 'params.readingsDetails', {});

  const meterObjId = _.get(selectedMeter, 'objId', '');
  const lastReading = _.get(readingsDetails, 'meterReadings', undefined)?.slice(-1)[0];

  const onImageSelect = (images) => {
    setReadingPhoto(images[images.length - 1] || {});
    setReadingPhotoError('');
    return images[0];
  };

  const getMeterReadings = async () => {
    return dispatch(getMeterReadingsAction({ meterObjId }));
  };

  const submitReading = async ({ confirmedReading = false }) => {
    if (
      `${readingNumberError}`.length > 0 ||
      `${readingNumber}`.length === 0 ||
      _.get(readingPhoto, 'uri', '').length === 0
    ) {
      if (readingPhoto.length === 0) {
        return setReadingPhotoError('Please upload a proof of your reading!');
      }
      setReadingNumberError('No reading value entered!');
      return null;
    }

    setIsSubmitting(true);

    return metersService
      .validateReading({
        readingValue: readingNumber,
        meterObjId: _.get(selectedMeter, 'objId', ''),
      })
      .then(async (response) => {
        if (response.warning && !confirmedReading) {
          flashService.info(response.message);
          await setWarningMessage(response.message);
          openActionSheet();
          return setIsSubmitting(false);
        }
        await metersService.submitReading({
          channelRef,
          readingValue: readingNumber,
          meterObjId,
          photo: _.get(readingPhoto, 'uri', ''),
          readingDate,
        });
        return setIsSubmitting(false);
      });
  };

  const removeMedia = () => {
    setReadingPhoto({});
  };

  const handleConfirmReading = async () => {
    await submitReading({ confirmedReading: true });
    await getMeterReadings();
    setIsSubmitting(false);
    closeActionSheet();
    return navigation.goBack();
  };

  const handleDateChange = setReadingDate;

  const openActionSheet = () => {
    return actionSheetRef.current.setModalVisible(true);
  };

  const closeActionSheet = () => {
    return actionSheetRef.current?.setModalVisible(false);
  };

  useEffect(() => {
    dispatch(setImagesSources([]));
  }, []);

  const renderMeterDetails = () => {
    return (
      <>
        <View style={Gutters.smallMargin}>
          <View style={[Layout.alignItemsCenter, Layout.justifyContentCenter]}>
            <Icon
              name="flash"
              type="entypo"
              backgroundColor={Colors.white}
              color={Colors.softBlue}
              size={26}
              containerStyle={[styles.flashIcon, Gutters.regularBMargin]}
            />
            <Text style={[{ color: Colors.softBlue }, Gutters.smallBMargin]}>
              Enter your {meterType} meter reading:
            </Text>
            <Text style={[styles.instruction]}>Meter serial no:{meterSerialNo}</Text>
          </View>

          <TextInput
            labelStyle={Layout.alignItemsCenter}
            placeholder="Reading"
            style={[Common.textInput, styles.accountInput]}
            onChangeText={(value) => {
              setReadingNumber(value);
              if (`${readingNumber}`.length > 0) setReadingNumberError('');
              else {
                setReadingNumberError('No reading value entered!');
              }
            }}
            maxLength={10}
            value={readingNumber}
            multiline={false}
            error={`${readingNumberError}`.length > 0}
            onEndEditing={() => {
              if (`${readingNumber}`.length === 0) {
                setReadingNumberError('No reading value entered!');
              }
            }}
            textAlign="center"
            keyboardType="numeric"
          />
          <HelperText
            type="error"
            style={styles.errorStyle}
            visible={`${readingNumberError}`.length > 0}
          >
            {readingNumberError}
          </HelperText>
          {lastReading && (
            <Text style={styles.lastReadingInfo}>{`Last submitted reading ${_.get(
              lastReading,
              'readingNumber',
              '',
            )} on ${moment(_.get(lastReading, 'date', new Date())).format('YYYY-MMMM-DD')}`}</Text>
          )}
          <DateTimeInput
            value={`${readingDate}`}
            onChange={handleDateChange}
            placeholder="Latest Date of Delivery"
            errorMessage=""
            label="Select Reading date"
            mode="datetime"
            format="YYYY-MM-DD HH:mm"
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={[Gutters.smallPadding]}>
        <Text style={[Gutters.smallMargin, styles.title]}>Submit reading</Text>
        {renderMeterDetails()}
        <ListItem
          topDivider
          bottomDivider
          style={[Gutters.largeVMargin, Gutters.regularHMargin, styles.takePhotoButton]}
        >
          <View style={Layout.row}>
            <Icon
              name="camera"
              color={Colors.softBlue}
              style={styles.photoIcon}
              size={22}
              type="feather"
            />
            <UploadDocumentButton
              title="Take photo of your reading*"
              mode="default"
              color={Colors.black}
              icon={null}
              labelStyle={styles.buttonLabel}
              uppercase={false}
              style={[styles.button, Gutters.largeRPadding]}
              onImageSelect={onImageSelect}
            />
            <Icon name="chevron-right" style={Gutters.tinyTMargin} color={Colors.darkgray} />
          </View>
        </ListItem>
        {`${readingPhotoError}`.length > 0 && (
          <View style={[Layout.row, Gutters.largeHMargin]}>
            <Icon
              name="info"
              color={Colors.danger}
              style={Gutters.tinyRMargin}
              size={17}
              type="feather"
            />
            <Text style={[styles.instruction, styles.photoError]}>{readingPhotoError}</Text>
          </View>
        )}
        {_.get(readingPhoto, 'uri', '').length > 0 && (
          <ImageThumbnail
            key={readingPhoto.uri}
            media={readingPhoto}
            deleteImage={() => {
              removeMedia();
            }}
          />
        )}
        <Button
          mode="contained"
          style={[Layout.fill, Gutters.tinyLMargin, Gutters.largeTMargin]}
          onPress={submitReading}
          loading={isSubmitting}
          disabled={isSubmitting}
          color={Colors.softBlue}
        >
          Submit Reading
        </Button>
      </KeyboardAwareScrollView>
      <ActionSheet ref={actionSheetRef} gestureEnabled>
        <ConfirmReadingActionSheetContent
          loading={isSubmitting}
          onConfirmReading={handleConfirmReading}
          onCancel={() => {
            closeActionSheet();
          }}
          warningMessage={warningMessage}
        />
      </ActionSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  accountInput: {
    marginHorizontal: '15%',
  },
  button: {
    backgroundColor: Colors.transparent,
  },
  buttonLabel: { fontSize: 14, fontWeight: '300' },
  container: { marginBottom: 110 },
  errorStyle: {
    color: Colors.danger,
    marginHorizontal: '12%',
  },
  flashIcon: {
    borderColor: Colors.black,
    borderRadius: 20,
    borderWidth: 1,
  },
  instruction: { fontSize: 12.5, fontWeight: '200', textAlign: 'center' },
  lastReadingInfo: {
    color: Colors.darkgray,
    fontSize: 14,
    marginLeft: '14%',
    marginTop: 10,
    textAlign: 'center',
    width: '75%',
  },
  photoError: { color: Colors.danger, fontWeight: '400' },
  photoIcon: { marginTop: 8.5 },
  takePhotoButton: { marginTop: '15%' },
  title: { fontSize: 16, fontWeight: '400' },
});

SubmitMeterReadingScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

SubmitMeterReadingScreen.defaultProps = {};

export default SubmitMeterReadingScreen;
