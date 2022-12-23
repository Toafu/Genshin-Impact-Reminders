const Discord = require('discord.js');
const fetch = require('node-fetch');
const {charDict, skinDict} = require('@helper/dictionary');
function elementEmote(element) {
    switch(element) {
        case 'Anemo':
            return '<:anemo:1041200472104640532>';
        case 'Cryo':
            return '<:cryo:1041200473128046592>';
        case 'Dendro':
            return '<:dendro:1041200474138890250>';
        case 'Electro':
            return '<:electro:1041200475258761296>';
        case 'Geo':
            return '<:geo:1041200476672249876>';
        case 'Hydro':
            return '<:hydro:1041200477896982599>';
        case 'Pyro':
            return '<:pyro:1041200478928781352>';
        case 'Multi':
            return '⚪';
    }
}

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
        .then(response => response.json()) // Convert Response object into JSON
        .then(data => { // data is your JSON object
            console.log(`Looking for UID: ${args[0]}`);
            const profileMainId = data.playerInfo.profilePicture.avatarId;
            let embedColor;
            switch(charDict[profileMainId].element) {
                case 'Anemo':
                    embedColor = '#72e2c2';
                    break;
                case 'Cryo':
                    embedColor = '#a0e9e5';
                    break;
                case 'Dendro':
                    embedColor = '#23c18a';
                    break;
                case 'Electro':
                    embedColor = '#a757cb';
                    break;
                case 'Geo':
                    embedColor = '#e3b342';
                    break;
                case 'Hydro':
                    embedColor = '#21e1eb';
                    break;
                case 'Pyro':
                    embedColor = '#fe925d';
                    break;
                case 'Multi':
                    embedColor = '#ffffff';
                    break;
            }
            var charList = '';
            data.playerInfo.showAvatarInfoList.forEach(showcaseChar => {
                var charID = showcaseChar.avatarId;
                var charName = charDict[charID].name;
                var charElement = charDict[charID].element;
                charList += `> ${elementEmote(charElement)} ${charName}\n`;
            })
            charList = charList.trim();
            const embed = new Discord.MessageEmbed()
                .setTitle(data.playerInfo.nickname)
                .setColor(embedColor)
                .setThumbnail(`https://enka.network/ui/UI_AvatarIcon_${charDict[profileMainId].icon}.png`)
                .addFields(
                {
                    name: 'AR',
                    value: String(data.playerInfo.level),
                    inline: true
                },
                {
                    name: 'WL',
                    value: String(data.playerInfo.worldLevel),
                    inline: true,
                },
                {
                    name: 'Abyss',
                    value: `${data.playerInfo.towerFloorIndex}-${data.playerInfo.towerLevelIndex}`,
                    inline: true,
                },
                {
                    name: 'Signature',
                    value: data.playerInfo.signature,
                },
                {
                    name: 'Characters',
                    value: charList,
                })
                .setFooter({ text: `UID: ${args[0]}` });
            msgInt.reply({ embeds: [embed] });
            // console.log(charDict[profileMainId].element);
        })
        // .catch(() => { 
        //     msgInt.reply(`${args[0]} does not exist`);
        //     console.log(`An error occured. Embarassing...`);
        // });
    }
}