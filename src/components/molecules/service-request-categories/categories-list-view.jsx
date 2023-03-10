import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { List } from 'react-native-paper';
import { ListItem, Text } from 'react-native-elements';

import useTheme from '../../../theme/hooks/useTheme';
import { Colors } from '../../../theme/Variables';

const CategoriesListView = ({
  municipalities,
  onCategorySelected,
  setSelectedChanne,
  onServiceTypeSelected,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const { Gutters, Common, Layout, Fonts } = useTheme();

  const handleServiceTypeSelected = (serviceType, category, municipality) => () => {
    onCategorySelected(category);
    onServiceTypeSelected(serviceType);
    setSelectedChanne(municipality);
  };

  useEffect(() => {
    setSelectedChanne(municipalities[0]);
  }, []);

  const renderServiceTypes = (serviceTypes, category, municipality) => {
    return (
      <View style={[Gutters.largeHMargin]}>
        {serviceTypes.map((serviceTypeObject) => {
          return (
            <View
              key={`${serviceTypeObject.id}`}
              style={[Common.viewWithShadow, Gutters.largeBMargin]}
            >
              <List.Item
                style={[Layout.fill]}
                title={serviceTypeObject.name}
                titleNumberOfLines={3}
                onPress={handleServiceTypeSelected(serviceTypeObject, category, municipality)}
                titleStyle={[Common.cardTitle, ...[{ textAlign: 'center' }]]}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderCategoryAccordion = (municipality) => {
    return (
      <View style={styles.mainView} key={`${municipality.id}`}>
        <Text style={[Fonts.textLarge, styles.categoryText]}>{municipality.name}</Text>
        {municipality.categories.map((category) => {
          return (
            <ListItem.Accordion
              key={`${category.id}`}
              underlayColor={Colors.transparent}
              noIcon
              style={[styles.accordion]}
              content={
                <View style={styles.categoryTextContainer}>
                  <Text style={[Fonts.textSmall, styles.categoryText]}>{category.name}</Text>
                </View>
              }
              containerStyle={{ backgroundColor: Colors.transparent }}
              isExpanded
            >
              {renderServiceTypes(category.serviceTypes, category, municipality)}
            </ListItem.Accordion>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ paddingBottom: screenHeight - screenHeight * 0.8 }}>
      {municipalities.map((municipality) => renderCategoryAccordion(municipality))}
    </View>
  );
};

CategoriesListView.propTypes = {
  municipalities: PropTypes.array.isRequired,
  onCategorySelected: PropTypes.func.isRequired,
  onServiceTypeSelected: PropTypes.func.isRequired,
  setSelectedChanne: PropTypes.func.isRequired,
};

CategoriesListView.defaultProps = {};

const styles = StyleSheet.create({
  accordion: {
    marginTop: 5,
  },

  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  categoryTextContainer: {
    borderBottomWidth: 0,
    borderColor: Colors.gray,
    borderLeftWidth: 0,
    borderRadius: 0,
    borderRightWidth: 0,
    borderWidth: 0.3,
    paddingTop: 5,
    width: '100%',
  },
  mainView: {
    borderColor: Colors.gray,
    borderWidth: 0.3,
    paddingVertical: 8,
  },
});

export default CategoriesListView;
