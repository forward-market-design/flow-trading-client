// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token?: string;
		}
		interface PageData {
			title?: string;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
