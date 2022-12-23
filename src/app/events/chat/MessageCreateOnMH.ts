import { Message } from 'discord.js';
import madHatterPhrases from '../../service/constants/madHatterPhrases';
import Log, { LogUtils } from '../../utils/Log';
import constants from '../../service/constants/constants';

const MessageCreateOnMH = async (message: Message): Promise<void> => {
	try {
		const content: string = message.content;
		
		// tea
		if (content.match(/tea/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			const randomNum = Math.random();
			if (randomNum >= 0.75) {
				await message.channel.sendTyping();
				await message.channel.send({
					content: `${madHatterPhrases.tea[Math.floor(Math.random() * madHatterPhrases.tea.length)]}`,
				}).catch(Log.error);
			}
			return;
		}

		// mad
		if (content.match(/mad/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			const randomNum = Math.random();
			if (randomNum >= 0.75) {
				await message.channel.sendTyping();
				await message.channel.send({
					content: `${madHatterPhrases.mad[Math.floor(Math.random() * madHatterPhrases.mad.length)]}`,
				}).catch(Log.error);
			}
			return;
		}

		// down
		if (content.match(/down/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			const randomNum = Math.random();
			if (randomNum >= 0.75) {
				await message.channel.sendTyping();
				await message.channel.send({
					content: `${madHatterPhrases.down[Math.floor(Math.random() * madHatterPhrases.down.length)]}`,
				}).catch(Log.error);
			}
			return;
		}
		
		// POAP
		if (content.match(/POAP/gi)) {
			const randomNum = Math.random();
			if (randomNum <= 0.25) {
				await message.channel.sendTyping();
				await message.channel.send({
					content: `${madHatterPhrases.poap[Math.floor(Math.random() * madHatterPhrases.poap.length)]}`,
				}).catch(Log.error);
			}
			return;
		}
	
		// APP name
		if (content.match(/Mad Hatter/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			const randomNum = Math.random();
			if (randomNum >= 0.75) {
				await message.channel.sendTyping();
				await message.channel.send({
					content: `${madHatterPhrases.app[Math.floor(Math.random() * madHatterPhrases.app.length)]}`,
				}).catch(Log.error);
			}
			return;
		}
		
	} catch (e) {
		LogUtils.logError('failed to reply back message in channel regex', e);
	}
};

export default MessageCreateOnMH;
