var express = require('express');
var cors = require('cors');
var chalk = require('chalk');
// replace npm 'request' package with gaxios
// Stack OVerflow Help: https://stackoverflow.com/questions/60532289/piping-requests-using-gaxios-or-axios
const { request } = require('gaxios');
var proxy = express();

var startProxy = function (port, proxyUrl, proxyPartial, credentials, origin) {
	proxy.use(cors({ credentials: credentials, origin: origin }));
	proxy.options('*', cors({ credentials: credentials, origin: origin }));

	// remove trailing slash
	var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
	// remove all forward slashes
	var cleanProxyPartial = proxyPartial.replace(/\//g, '');

	proxy.use('/' + cleanProxyPartial, function (req, res) {
		try {
			console.log(chalk.green('Request Received -> ' + req.url));
		} catch (e) {}

		// fire new request to target API an pipe response to res
		request({
			url: cleanProxyUrl + req.url,
			method: req.method,
			data: req,
			responseType: 'stream',
		}).then((response) => {
			const dataStream = response.data;

			// In order to avoid https://github.com/expressjs/cors/issues/134
			const accessControlAllowOriginHeader = response.headers['access-control-allow-origin'];
			if (accessControlAllowOriginHeader && accessControlAllowOriginHeader !== origin) {
				console.log(
					chalk.blue(
						'Override access-control-allow-origin header from proxified URL : ' +
							chalk.green(accessControlAllowOriginHeader) +
							'\n'
					)
				);
				response.headers['access-control-allow-origin'] = origin;
			}

			dataStream.on('end', function () {
				// do optional stuff on end
			});

			// pipe response from gaxios to res...
			const readableB = dataStream.pipe(res);
			readableB.on('end', function () {
				// do optional stuff on end
			});
		});
	});

	proxy.listen(port);

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
};

exports.startProxy = startProxy;
