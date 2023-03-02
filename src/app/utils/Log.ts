// import logdna, { Logger, LogOptions } from '@logdna/logger';
import { pino, LoggerOptions } from 'pino';
import apiKeys from '../service/constants/apiKeys';
import { CommandContext } from 'slash-create';
import * as Sentry from '@sentry/node';


const transport = pino.transport({
	target: 'pino-loki',
	options: {
		batching: true,
		interval: 5,
		basicAuth: {
			username: apiKeys.lokiUserName,
			password: apiKeys.lokiPassword,
		},
	},
});

const logger = pino(transport);

const Log = {

	info(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.info) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.info(statement, options);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Info,
				message: statement,
			});
		}
	},

	warn(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.warn) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.warn(statement, options);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Warning,
				message: statement,
			});
		}
	},

	debug(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.debug) {
			// eslint-disable-next-line no-console
			console.debug(statement);
		} else {
			logger.debug(statement, options);
		}
	},

	error(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.error) {
			// eslint-disable-next-line no-console
			console.error(statement);
		} else {
			logger.error(statement, options);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Error,
				message: statement,
			});
		}
	},

	fatal(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.fatal) {
			// eslint-disable-next-line no-console
			console.error(statement);
		} else {
			logger.fatal(statement, options);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Fatal,
				message: statement,
			});
		}
	},

	trace(statement: string | any, options?: Omit<LoggerOptions, 'level'>): void {
		if (process.env.NODE_ENV != 'production' || !logger.trace) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.trace(statement, options);
		}
	},

	// log(statement: string | any, options?: Omit<LogOptions, 'level'>): void {
	// 	if (process.env.NODE_ENV != 'production') {
	// 		// eslint-disable-next-line no-console
	// 		console.log(statement);
	// 	}
	// 	logger.log(statement, options);
	// 	Sentry.addBreadcrumb({
	// 		level: Sentry.Severity.Log,
	// 		message: statement,
	// 	});
	// },

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	// addMetaProperty(key: string, value: any): void {
	// 	logger.addMetaProperty(key, value);
	// },

	// removeMetaProperty(key: string): void {
	// 	logger.removeMetaProperty(key);
	// },

	// flush(): void {
	// 	logger.flush();
	// },
};

export const LogUtils = {
	logCommandStart(ctx: CommandContext): void {
		Log.info(`/${ctx.commandName} ran ${ctx.user.username}#${ctx.user.discriminator}`, {
			enabled: true,
		});
	},

	logCommandEnd(ctx: CommandContext): void {
		Log.info(`/${ctx.commandName} ended ${ctx.user.username}#${ctx.user.discriminator}`, {
			enabled: true,
		});
	},

	logError(message: string, error: Error | any, guildId?: string): void {
		try {
			Sentry.captureException(error, {
				tags: {
					guildId: guildId,
				},
			});
			Log.error(message, {
				enabled: true,
			});
		} catch (e) {
			Log.error(message);
		}
	},
};

export default Log;