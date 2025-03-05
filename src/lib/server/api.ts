import { env } from '$env/dynamic/private';
import { BidderId } from '$lib/api/types';
import * as jose from 'jose';

const secret = env.API_SECRET ? new TextEncoder().encode(env.API_SECRET) : null;

export async function token(bidder: BidderId, admin: boolean = false) {
	if (secret === null) {
		throw new Error('API_SECRET not set');
	} else {
		const jwt = await new jose.SignJWT({ admin })
			.setProtectedHeader({ alg: 'HS256' })
			.setSubject(bidder)
			.setExpirationTime('24h')
			.sign(secret);
		return jwt;
	}
}
