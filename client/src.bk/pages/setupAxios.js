import axios from 'axios';
import { baseAPIUrl } from '@/constants/constants';

const setupAxios = () => {
  axios.defaults.baseURL = baseAPIUrl;
};

export default setupAxios;
