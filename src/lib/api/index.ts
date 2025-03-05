import { env } from '$env/dynamic/public';

export * from './client';

export const API_URL = new URL(env.PUBLIC_API_SERVER);
