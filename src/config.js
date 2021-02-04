import Config from 'react-native-config';

const { API_LOCATION, HOST_URL, GOOGLE_MAPS_API_KEY } = Config;

export default {
  accessTokenKey: 'access_token',
  hostUrl: HOST_URL,
  apiUrl: `${HOST_URL}/${API_LOCATION}`,
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
};