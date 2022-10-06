// NOTE this code was developed with discord.js 14.5.0
// express 4.18.1, node-fetch 3.2.6, @types/node 18.0.6
// it was meant to run on replit.com

// needed to import discord client, and intent permissions for the bot
const { Client, GatewayIntentBits } = require("discord.js");

// this "keepAlive" is really just an express server
const keepAlive = require("./server");

// start a new discord client instance. For documentation on the Client class,
// look at https://discord.js.org/#/docs/discord.js/main/class/Client
let client = new Client({
  // discord developer portal has a list of intents on the following page
  // https://discord.com/developers/docs/topics/gateway#list-of-intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// this is a very liberal url regex that has not been 100% tested
// you can easily have false positives with this as a warning
const domainNames = 'com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw';
const urlRegexString = `((https?)?:?(\\/{1,3})?([\\w.]+\\.(${domainNames})))([^\\s]*)`;

/**
 * @param {string} messageLink - the captured link as a string
 * @returns {string} the response for the bot to send
 */
function respondToLink(messageLink) {
  link = messageLink.toLowerCase();
  if (link.includes('discord.gg')) {
    return 'Please do not post discord invites.';
  }
  return 'You posted a link.';
}

/**
 * checks a message for a link, and if a link is detected, respond to it.
 * deletes discord invite links.
 * @param {string} msg - the message from the user to check for a link.
 */
function checkMessage(msg) {
  // don't make the bot delete its own messages by accident
  if (msg.author === client.user) {
    return;
  }

  // A new RegExp instance has to be created to prevent null results later on
  const urlRegEx = new RegExp(urlRegexString, 'gm');
  const regexResult = urlRegEx.exec(msg.content); // this will either return an array of results, or null
  if (!regexResult) {
    return; // if we didn't detect a link, no-op
  }
  try {
    // Now determine the response based on what was found in the URL
    const response = respondToLink(regexResult[0]);
    msg.channel.send(response);

    // if you would like to log the message to a channel called 'detected-links', uncomment below code
//      const linkChannel = msg.guild.channels.cache.find(channel => channel.name === 'detected-links');
//      if (linkChannel) {
//        const msgInCodeBlock = '```' + msg.content + '```';
//        const username = '`<username:' + msg.author.username + '>`';
//        const tag = '`<tag:' + msg.author.tag + '>`';
//        const userId = '`<userId:' + msg.author.id + '>`';
//        linkChannel.send(`Link message posted by:\n> [ ${username} / ${tag} / ${userId} ]\n${msgInCodeBlock}`);
//      }

    // only delete the message if it's a discord invite link
    if (msg.toLowerCase().includes('discord.gg')) {
      msg.delete();
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * Initializes event listeners for the discord client instance.
 */
function initHandlersForClient() {
  client.on("ready", () => {
    console.log(`\n===\nLogged in as ${client.user.tag}!\n===\n`);
    try {
      const { guilds } = client; // returns GuildManager, see https://discord.js.org/#/docs/discord.js/main/class/GuildManager
      // note below line will notify ALL guilds this bot is in -- be careful!
      console.log('\n> ready: Attempting to notify discord ping channel in guilds\n');
      const pingMsg = `${client.user.tag} successfully logged in!`;
      guilds.cache.each(guild => {
        const pingChannel = guild.channels.cache.find(channel => channel.name === 'ping');
        if (pingChannel) {
          ping.send(pingMsg);
        }
      });
    } catch (e) {
      console.log('\n> ready: error =>\n', e);
    }
  });

  // for new messages, and message edits, check to see if a link is included.
  client.on("messageUpdate", (old, msg) => {
    checkMessage(msg);
  });

  client.on("messageCreate", msg => {
    checkMessage(msg);
  });

  // logging handlers for investigation
  client.on('error', (e) => {
    console.log(e)
  })
  client.on('warn', (e) => {
    console.log(e)
  })
  client.on('debug', (e) => {
    // logs debug statements that usually provide dev related information. For example:
    // [WS => Shard 0] [ReadyHeartbeat] Sending a heartbeat.
    console.log(e);

    try {
      const { guilds } = client;
      console.log('> DEBUG: Guilds we are connected to listed below')
      guilds.cache.each(guild => {
        const { id, memberCount, name } = guild;
        console.log(`${name} <id:${id}>: ${memberCount} members`)
      });
      console.log('(end guild output)\n'); // formatting and readability purposes

      /* General purpose debugging about the bot. Destructure more properties as needed */
      const { shardCount } = client.options;
      console.log(`> DEBUG: options => shardCount ${shardCount}`)
      const { status } = client.presence; // e.g. 'online'
      console.log(`> DEBUG: presence => status ${status}`)
      
      // we must check if the bot is logged in first before destructuring. Otherwise we get a null client user
      if (client.user) {
        const { username, id, verified, mfaEnabled } = client.user;
        console.log(`> DEBUG: user => username ${username} / id ${id} / verified ${verified} / mfaEnabled ${mfaEnabled}\n`);
      } else {
        console.log('client.user is null (bot is not logged in).\n');
      }
    } catch (errorMsg) {
      console.log(errorMsg);
    }
  });
}

// This is needed to start the web server before the bot actually runs. See server.js
keepAlive()

// side note: you can also change TOKEN to instead read from a config.json import
initHandlersForClient();
console.log('Attempting to log in to the client.')
client.login(process.env.TOKEN).then().catch(reason => {
  console.log("Login failed: " + reason);
});

/**
 * checks if the user client is null (bot is not logged in).
 * if bot is not logged in, try destroying the client, and instantiating a new one.
 */
function checkNullUserClient() {
  try {
    if (client.user) {
      console.log(`\n> checkNullUserClient: User Client Check, bot is logged in as ${client.user.username}\n`);
    } else {
      // this means the bot isn't logged in. try logging in again
      console.log('client.user is still null. Attempting to login.');
      client.destroy();
      client = null;

      // create a new client with the same intents as before, and try logging in again
      client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
        ],
      });
      initHandlersForClient(); // also initialize the event listeners
      console.log('Recurring check: Attempting to log in to the client.')
      client.login(process.env.TOKEN).then().catch(reason => {
        console.log("Login failed: " + reason);
      });
    }
  } catch (e) {
    console.log('\ncheckNullUserClient: error =>\n', e)
  }
}

function sendPingToDiscord() {
  if (client.user) {
    try {
      const { guilds } = client; // GuildManager
      console.log('\n> sendPingToDiscord: Attempting to notify discord ping channel in guilds\n');
      const pingMsg = '15 minute ping interval successfully sent.';
      guilds.cache.each(guild => {
        const pingChannel = guild.channels.cache.find(channel => channel.name === 'ping');
        if (pingChannel) {
          pingChannel.send(pingMsg);
        }
      });
    } catch (e) {
      console.log('\n> sendPingToDiscord: error =>\n', e);
    }
  } else {
    console.log('\n> sendPingToDiscord: client.user is null (bot not logged in).\n');
  }
}

// every 2 minutes, check if the bot is online.
setInterval(checkNullUserClient, 120000);

// every 15 minutes, send a ping to discord if bot is logged in.
setInterval(sendPingToDiscord, 900000);
