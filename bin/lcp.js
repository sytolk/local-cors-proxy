#!/usr/bin/env node -r esm
import lcp from '../lib/index';
import commandLineArgs from 'command-line-args';

const optionDefinitions = [
	{ name: 'port', alias: 'p', type: Number, defaultValue: 8010 },
	{
		name: 'proxyPartial',
		type: String,
		defaultValue: '/proxy',
	},
	{ name: 'proxyUrl', type: String },
	{ name: 'allowCredentials', type: Boolean, defaultValue: false },
	{ name: 'origin', type: String, defaultValue: '*' },
];

try {
	const options = commandLineArgs(optionDefinitions);
	if (!options.proxyUrl) {
		throw new Error('--proxyUrl is required');
	}
	lcp.startProxy(options);
} catch (error) {
	console.error(error);
}
