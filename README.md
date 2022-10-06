# DiscordStarterBot
A starter bot using discord.js 14.5.0 that can be run on replit.com with uptime robot.
Based off of the tutorial on freecodecamp:
https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/

There are some updates here to clarify what's different from the article linked above.

In short, the bot tries to:
- check links from user messages, and deletes what it considers discord invite links
- sends a ping every 15 minutes to a 'ping' channel if it exists
- tries to automatically log back in if it's not logged in

This is also meant to help diagnose an open issue with discord bots randomly exiting process or
going offline/unresponsive as of https://github.com/discordjs/discord.js/issues/8486
- Someone at the bottom of the thread mentioned discordjs 13.8.1 is stable.
- The person in the OP was using discord.js@14.1.2
- A person reported v13.10.3 has the same problem.

## OAuth2 Link Generation
Left sidebar in [Discord developer portal](https://discord.com/developers/applications) ⇒ OAuth2 ⇒ URL Generator

Then for the checklist
```
Scopes:
Bot
```
Which should show a "Bot Permissions" section
```
General Permissions:
Read Messages/View Channels

Text Permissions:
Send Messages
Send Messages in Threads
Manage Messages
Manage Threads
Read Message History
```

## Enabling Gateway Intents
Left sidebar in [Discord developer portal](https://discord.com/developers/applications) ⇒ Bot

Look for "Server Members Intent" and "Message Content Intent" toggles and turn them on.

## Going to replit
This code was meant to be hosted on the cloud on replit, based off the freecodecamp article.

