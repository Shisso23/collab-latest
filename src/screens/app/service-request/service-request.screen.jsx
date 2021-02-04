import React, { useEffect } from 'react';
import { Avatar, FAB, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import useTheme from '../../../theme/hooks/useTheme';
import { serviceRequestSelector } from '../../../reducers/service-request-reducer/service-request.reducer';
import { getServiceRequestsAction } from '../../../reducers/service-request-reducer/service-request.actions';

const ServiceRequestScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { serviceRequests, isLoadingServiceRequests } = useSelector(serviceRequestSelector);
  const { Common, Gutters } = useTheme();

  const _loadServiceRequests = () => {
    dispatch(getServiceRequestsAction());
  };

  useEffect(() => {
    _loadServiceRequests();
  }, []);

  const serviceRequestItem = ({ item }) => {
    return (
      <List.Item
        title={item.compliantType}
        description={item.address}
        onPress={() => {}}
        left={() => <Avatar.Image rounded size={50} source={{ uri: item.avatarUrl }} />}
      />
    );
  };

  return (
    <>
      <FlatList
        contentContainerStyle={[Gutters.regularTMargin, Gutters.tinyHMargin]}
        data={serviceRequests}
        renderItem={serviceRequestItem}
        keyExtractor={(item) => String(item.id)}
        refreshing={isLoadingServiceRequests}
        onRefresh={_loadServiceRequests}
      />

      <FAB
        style={[Common.fabAlignment]}
        icon="plus"
        onPress={() => navigation.push('CreateServiceRequest')}
      />
    </>
  );
};

ServiceRequestScreen.propTypes = {};

ServiceRequestScreen.defaultProps = {};

export default ServiceRequestScreen;