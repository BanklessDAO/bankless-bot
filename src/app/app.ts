import {
	SlashCreator,
	GatewayServer,
	SlashCommand,
	CommandContext,
} from 'slash-create';
import Discord, {
	Client,
	ClientOptions,
	Intents,
	WSEventType,
} from 'discord.js';
import path from 'path';
import fs from 'fs';
import constants from './service/constants/constants';
import './utils/SentryUtils';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import Log, { LogUtils } from './utils/Log';
import apiKeys from './service/constants/apiKeys';

initializeSentryIO();
const client: Client = initializeClient();
initializeDiscordEvents();

const creator = new SlashCreator({
	applicationID: process.env.DISCORD_BOT_APPLICATION_ID,
	publicKey: process.env.DISCORD_BOT_PUBLIC_KEY,
	token: process.env.DISCORD_BOT_TOKEN,
	disableTimeouts: true,
});

initializeSlashCreateEvents();

// Register command handlers
creator
	.withServer(
		new GatewayServer((handler) => client.ws.on(<WSEventType>'INTERACTION_CREATE', handler)),
	)
	.registerCommandsIn(path.join(__dirname, 'commands'))
	.syncCommands();

client.login(process.env.DISCORD_BOT_TOKEN).catch(Log.error);

function initializeClient(): Client {
	const clientOptions: ClientOptions = {
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_BANS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
			Intents.FLAGS.GUILD_VOICE_STATES,
			Intents.FLAGS.GUILD_PRESENCES,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.DIRECT_MESSAGES,
		],
		partials: ['MESSAGE', 'CHANNEL', 'USER'],
	};
	return new Discord.Client(clientOptions);
}

function initializeSentryIO() {
	Sentry.init({
		dsn: `${apiKeys.sentryDSN}`,
		tracesSampleRate: 1.0,
		release: `${constants.APP_NAME}@${constants.APP_VERSION}`,
		environment: process.env.SENTRY_ENVIRONMENT,
		integrations: [
			new RewriteFrames({
				root: __dirname,
			}),
			new Sentry.Integrations.Http({ tracing: true }),
		],
	});
}

function initializeDiscordEvents(): void {
	// Log client errors
	client.on('error', Log.error);

	// register other events
	const eventFiles = fs.readdirSync(path.join(__dirname, '/events/discordjs')).filter(file => file.endsWith('.js'));
	eventFiles.forEach(file => {
		const event = new (require(`./events/discordjs/${file}`).default)();
		try {
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => {
					event.execute(...args, client);
				});
			}
			Log.debug(`registered discordjs event ${event.name}`);
		} catch (e) {
			Log.error('Event failed to process', {
				enabled: true,
			});
		}
	});
}

function initializeSlashCreateEvents(): void {
	creator.on('debug', (message) => Log.debug(`debug: ${message}`));
	creator.on('warn', (message) => Log.warn(`warn: ${message}`));
	creator.on('error', (error: Error) => Log.error(`error: ${error}`));
	creator.on('synced', () => Log.debug('Commands synced!'));
	creator.on('commandRegister', (command: SlashCommand) => Log.debug(`Registered command ${command.commandName}`));
	// creator.on('commandError', (command: SlashCommand, error: Error) => Log.error(`Command ${command.commandName}:`, {
	// 	enabled: true,
	// }));
	// Ran after the command has completed
	creator.on('commandRun', (command: SlashCommand, result: Promise<any>, ctx: CommandContext) => {
		LogUtils.logCommandEnd(ctx);
	});

	const eventFiles = fs.readdirSync(path.join(__dirname, '/events/slash-create')).filter(file => file.endsWith('.js'));
	eventFiles.forEach(file => {
		const event = new (require(`./events/slash-create/${file}`).default)();
		try {
			if (event.once) {
				creator.once(event.name, (...args) => event.execute(...args, client));
			} else {
				creator.on(event.name, (...args) => event.execute(...args, client));
			}
			Log.debug(`Registered slash-create event ${event.name}`);
		} catch (e) {
			Log.error('Slash-create event failed to process', {
				enabled: true,
			});
		}
	});
}

export default client;