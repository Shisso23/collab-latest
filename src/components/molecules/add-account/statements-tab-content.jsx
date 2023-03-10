import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { List } from 'react-native-paper';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Moment from 'moment';

import useTheme from '../../../theme/hooks/useTheme';
import { constructStatementModels } from '../../../models/app/accounts/statement.model';
import { flashService } from '../../../services';

const StatementsTabContent = ({ account, statements }) => {
  const navigation = useNavigation();
  const statusText = useMemo(() => _.get(account, 'statusText', ''), []);
  const [statementsWithPdfFiles, setStatementsWithPdfFiles] = useState([]);
  const { Gutters, Common, Layout } = useTheme();

  useEffect(() => {
    constructStatementModels(statements).then((newStatements) => {
      setStatementsWithPdfFiles(newStatements);
    });
  }, []);

  const onSelectStatement = (statement) => {
    if (statusText.length > 1) {
      return flashService.info(statusText);
    }
    if (!_.get(statement, 'statementPdf')) {
      return flashService.info('Statement not yet Available!');
    }
    return navigation.navigate('StatementView', { statement });
  };

  const renderDescription = (item) => {
    return (
      <View style={[Layout.rowBetween, Gutters.smallTMargin]}>
        <Text style={Common.cardDescription}>Balance</Text>
        <Text style={Common.cardDescription}>
          R{_.get(item, 'outstandingBalance', 0).toFixed(2)}
        </Text>
      </View>
    );
  };

  const _handleOpenStatement = (item) => {
    onSelectStatement(item);
  };
  const viewStatementItem = ({ item }) => {
    const year = _.get(item, 'year', '');
    const month = _.get(item, 'month', '');
    const dateString = `${year}/${month}`;
    return (
      <View style={[Common.textInputWithShadow, Gutters.smallVMargin, styles.statementItem]}>
        <List.Item
          title={Moment(dateString, 'YYYY/MM').format('MMMM YYYY')}
          description={() => renderDescription(item)}
          onPress={() => _handleOpenStatement(item)}
          titleStyle={Common.cardTitle}
        />
      </View>
    );
  };

  return (
    <>
      <View style={[Layout.fullSize, Layout.fill, Gutters.smallPadding]}>
        <Text style={[Gutters.smallMargin, styles.title]}>My Statements</Text>
        <FlatList
          contentContainerStyle={Gutters.smallHMargin}
          data={statementsWithPdfFiles}
          renderItem={viewStatementItem}
          keyExtractor={(item, index) => `${_.get(item, 'objectId', index)}`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
};

StatementsTabContent.propTypes = {
  account: PropTypes.object.isRequired,
  statements: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
  statementItem: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 0.16,
  },
  title: { fontSize: 16, fontWeight: '500' },
});

StatementsTabContent.defaultProps = {};

export default StatementsTabContent;
