# Genshin Impact Reminders Discord Bot

<img src=https://user-images.githubusercontent.com/71936834/120877644-54400e00-c57d-11eb-9d3f-62b11ac876f4.png>

In Genshin Impact, all characters and weapons need certain materials that can only be obtained on certain days. This Discord bot aggregates all that information together into one place.
Users can input which characters and weapons they need to track, and each day, they can request or schedule an agenda that provides a daily to-do list.

## Features
•Automated daily agenda that displays available talent and ascension materials and where to obtain them

•Detailed descriptions of characters and weapons with additional information about recommended builds and strategies

•Dynamic server time zone support

•Custom message slot so you can remember that one thing you always forget

## How can I use this bot?
Join the Discord server with this link: https://discord.gg/JpUuxQRxnV

## Getting Started - Important Commands (Default prefix `b!` | Full slash command support)

`help` will open an interactive help menu. Select the reaction that corresponds with the type of command you need. Information about the command and how to use it will be provided.

`characters` will display the list of supported characters and `b!weapons` will display the list of supported weapons.

`track <Character Name/ID>` and `b!untrack <Character Name/ID>` add and remove characters from your tracking list, respectively.

`equip <Weapon Name/ID>` and `b!unequip <Weapon Name/ID>` does likewise but for weapons.

`schedule <Time (24h)> <Timezone/GMT Offset>` will schedule your daily agenda to automatically be sent to your Direct Messages.

Once you are done creating your tracking lists, run `agenda` to receive an agenda similar to the image at the top of this README.

For example, if I need talent books for Zhongli:  
`b!track Zhongli` | `/track Zhongli`  
Maybe I need to ascend the Staff of Homa as well:  
`b!equip Staff of Homa` | `/equip Staff of Homa`  
Once I add and equip everything I need, `b!agenda` | `/agenda` will compile and display today's to-do list.

## What Makes This Bot Run
•Discord.js | Javascript

•Heroku Deployment for Hosting

•MongoDB for database queries
