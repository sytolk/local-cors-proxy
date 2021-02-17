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
	{ name: 'targetUrl', type: String },
	// the file which will be loaded for multi-target configuration
	{ name: 'config', alias: 'c', type: String },
	{ name: 'credentials', type: Boolean, defaultValue: false },
];

try {
	const options = commandLineArgs(optionDefinitions);
	if (!options.targetUrl) {
		throw new Error('--targetUrl is required');
	}
	lcp.startProxy(options);
} catch (error) {
	console.error(error);
}
