const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');

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
            var profileMainId = data.playerInfo.profilePicture.avatarId;

        // MESSAGE EMBED FAILS AND GOES TO CATCH
        // const embed = new Discord.MessageEmbed()
        //     .setTitle(data.playerInfo.nickname)
        //     .addFields(
        //     {
        //         name: 'AR',
        //         value: data.playerInfo.level,
        //     })
        //     .addFields(
        //     {
        //         name: 'WL',
        //         value: data.playerInfo.worldLevel,
        //     })
        //     .addFields(
        //     {
        //         name: 'Abyss',
        //         value: `${data.playerInfo.towerFloorIndex}-${data.playerInfo.towerLevelIndex}`,
        //     })
        //     .addFields(
        //     {
        //         name: 'Signature',
        //         value: data.playerInfo.signature,
        //     })
        //     .setFooter({ text: 'UID: ' });
        // message.channel.send({ embeds: [embed] });

        msgInt.reply(data.playerInfo.nickname);
        console.log(profileMainId)
        })
        .catch(() => { 
            msgInt.reply(`${args[0]} does not exist`);
            console.log(`An error occured. Embarassing...`);
        });
    }
}