import axios from 'axios';
import env from '../env';

export const vercelAxios = axios.create({
	baseURL: 'https://api.vercel.com/',
	timeout: 10000,
	headers: { Authorization: `Bearer ${env.vercelApiKey}` },
});
