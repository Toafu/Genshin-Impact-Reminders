const fetch = require('node-fetch');
module.exports = {
    slash: true,
    name: 'profile',
    category: 'Profile',
    description: 'Enter Genshin UID',
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '(UID)',
    testOnly: true,
    callback: async ({ args, interaction: msgInt }) => {
        await fetch(`https://enka.network/u/${args[0]}/__data.json`)
        .then(response => response.json())
        .then(data => { // data is your JSON object
            console.log(data);
            msgInt.reply(data.playerInfo.nickname); // Use the . to access properties
        })
        .catch(() => { msgInt.reply(`${args[0]} does not exist`); });
    }
}