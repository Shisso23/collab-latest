import axios from 'axios';
import appConfig from '../../../config';
import { removeCountryFromAddress } from '../../../helpers/location-helpers';

const googleMapsApi = axios.create({
  timeout: 5000,
  baseURL: 'https://maps.googleapis.com/maps/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  responseType: 'json',
});

googleMapsApi.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.key = appConfig.googleMapsApiKey;
  console.log({ config });
  return config;
});

googleMapsApi.interceptors.response.use(
  (response) => {
    const {
      data,
      headers,
      config: { url, method },
    } = response;
    console.log(`✅ ${method.toUpperCase()} "${url}"`, { data, headers }); // eslint-disable-line no-console
    return response;
  },
  (error) => {
    console.log('❌', error); // eslint-disable-line no-console
    return Promise.reject(error);
  },
);

const getAddressFromCoordinates = async (region) => {
  const address = `${region.latitude},${region.longitude}`;
  const params = { address };
  let formattedAddress = '';
  const { data } = await googleMapsApi.get('/geocode/json', { params });
  try {
    formattedAddress = data.results[0]?.formatted_address;
  } catch (error) {
    console.warn({ error });
  }

  return removeCountryFromAddress(formattedAddress);
};

export default {
  getAddressFromCoordinates,
};
