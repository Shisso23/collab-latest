import _ from 'lodash';

export const serviceTypeModel = (_apiServiceTypeModel = {}) => ({
  id: _.get(_apiServiceTypeModel, 'obj_id', ''),
  name: _.get(_apiServiceTypeModel, 'name', ''),
  category: _.get(_apiServiceTypeModel, 'category', ''),
});

const constructServiceTypeModelsArr = (apiServiceTypes) =>
  apiServiceTypes.map((serviceType) => serviceTypeModel(serviceType));

export const constructServiceTypeModels = (apiServiceTypes) =>
  apiServiceTypes.reduce((acc, current) => {
    return {
      ...acc,
      [current.category]: constructServiceTypeModelsArr(
        apiServiceTypes.filter((item) => item.category === current.category),
      ),
    };
  }, {});