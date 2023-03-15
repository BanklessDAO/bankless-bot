import { pino } from 'pino';
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

	info(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.info) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.info(statement);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Info,
				message: statement,
			});
		}
	},

	warn(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.warn) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.warn(statement);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Warning,
				message: statement,
			});
		}
	},

	debug(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.debug) {
			// eslint-disable-next-line no-console
			console.debug(statement);
		} else {
			logger.debug(statement);
		}
	},

	error(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.error) {
			// eslint-disable-next-line no-console
			console.error(statement);
		} else {
			logger.error(statement);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Error,
				message: statement,
			});
		}
	},

	fatal(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.fatal) {
			// eslint-disable-next-line no-console
			console.error(statement);
		} else {
			logger.fatal(statement);
			Sentry.addBreadcrumb({
				level: Sentry.Severity.Fatal,
				message: statement,
			});
		}
	},

	trace(statement: string | any): void {
		if (process.env.NODE_ENV != 'production' || !logger.trace) {
			// eslint-disable-next-line no-console
			console.log(statement);
		} else {
			logger.trace(statement);
		}
	},

	flush(): void {
		logger.flush();
	},
};

export const LogUtils = {
	logCommandStart(ctx: CommandContext): void {
		Log.info(`/${ctx.commandName} ran ${ctx.user.username}#${ctx.user.discriminator}`);
	},

	logCommandEnd(ctx: CommandContext): void {
		Log.info(`/${ctx.commandName} ended ${ctx.user.username}#${ctx.user.discriminator}`);
	},

	logError(message: string, error: Error | any, guildId?: string): void {
		try {
			Sentry.captureException(error, {
				tags: {
					guildId: guildId,
				},
			});
			Log.error(message);
		} catch (e) {
			Log.error(message);
		}
	},
};

export default Log;