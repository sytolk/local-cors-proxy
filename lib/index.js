import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = express();

function modifyResponseCorsHeaders(proxyRes, req) {
	// In order to avoid https://github.com/expressjs/cors/issues/134
	const proxyResAllowOriginHeader = proxyRes.headers['access-control-allow-origin'];
	if (proxyResAllowOriginHeader && proxyResAllowOriginHeader !== origin) {
		console.log(
			chalk.blue(
				'Override access-control-allow-origin header from proxified URL : ' +
					chalk.green(proxyResAllowOriginHeader) +
					'\n'
			)
		);
		proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin;
	}
}

function onProxyReq(proxyReq) {
	console.log(chalk.green('Request Received -> ' + proxyReq.url));
}

var startProxy = function ({ port, targetUrl, proxyPartial, credentials }) {
	proxy.use(cors({ credentials, origin: true }));
	proxy.options('*', cors());

	// remove trailing slash from target path
	var cleanProxyUrl = targetUrl.replace(/\/$/, '');

	const targetConfigs = {};

	// Add proxyPartial & targetUrl from CLI Params to targetConfigs structure
	if (
		targetUrl !== undefined &&
		targetUrl.length > 0 &&
		proxyPartial !== undefined &&
		proxyPartial.length > 0
	) {
		targetConfigs[proxyPartial] = {
			target: targetUrl,
			pathRewrite: `^${proxyPartial}`,
		};
	}

	Object.entries(targetConfigs).forEach(([proxyPath, targetConfig]) => {
		const proxyConfig = {
			secure: true,
			changeOrigin: true,
			logLevel: 'debug',
			onProxyRes: modifyResponseCorsHeaders,
			onProxyReq: onProxyReq,
			...targetConfig,
		};

		proxy.use(createProxyMiddleware(proxyPath, proxyConfig));
	});

	// This signals to browsers that this webserver is ready and healthy
	// This is needed besides changing the Access-Control-Allow-Origin Header
	// because browsers may reject the header if this server does not
	// react to this health check
	proxy.get('/', (req, res, next) => {
		res.sendStatus(200);
	});

	proxy.listen(port, () => {
		// Welcome Message
		console.log(chalk.bgGreen.black.bold.underline('\n Proxy Active \n'));
		console.log(chalk.blue('Proxy Url: ' + chalk.green(cleanProxyUrl)));
		console.log(chalk.blue('Proxy Partial: ' + chalk.green(cleanProxyPartial)));
		console.log(chalk.blue('PORT: ' + chalk.green(port)));
		console.log(chalk.blue('Credentials: ' + chalk.green(credentials)));
		console.log(chalk.blue('Origin: ' + chalk.green(origin) + '\n'));
		console.log(
			chalk.cyan(
				'To start using the proxy simply replace the proxied part of your url with: ' +
					chalk.bold('http://localhost:' + port + '/' + cleanProxyPartial + '\n')
			)
		);
	});
};

exports.startProxy = startProxy;
