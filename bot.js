const Discord = require('discord.js');
require('dotenv').config();

// Create client instane
const client = new Discord.Client();

// Bot prefix
const prefix = "/";

// Login to server 
client.login(process.env.DISCORD_BOT_TOKEN);

// Confirm 
client.on('ready', () => console.log('The INVader Bot is ready!'));

// Global scope storage for mission data
var missions = {};


//-------------------------------------------------------------------------- Command Parser

client.on('message', (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    // Parse the command
    const commandBody = msg.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args[0].toLowerCase();

    // inv 
    if (command === 'inv') {

        // Check role
        if (msg.guild.roles.cache.find(role => role.name === "Admin")) {
            msg.channel.send(adminCommandsEmbed);
        } else {
            msg.channel.send(commandsEmbed);
        }

    }

    // accounts
    else if (command === 'accounts' || command === 'acc') {
        msg.channel.send(accountsEmbed);
    }

    // contracts
    else if (command === 'contracts' || command === 'con') {
        msg.channel.send(contractsEmbed);
    }

    // tokens 
    else if (command === 'tokens' || command === 'tok') {
        msg.channel.send(tokensEmbed);
    }

    // Add mission (admin only)
    else if (command === 'addmission' || command === 'am') {

        // Check role
        if (msg.guild.roles.cache.find(role => role.name === "Admin")) {

            // Only add if values present
            if (!args[1] || !args[2]) {
                msg.channel.send('Nothing to add. Provide both a key and a value.');
            }
            else {
                missions[args[1]] = args[2];

                msg.channel.send('Mission added: ' + args[1] + ': ' + args[2]);
            }
        }
    }

    // Remove mission (admin only) 
    else if (command === 'removemission' || command === 'rm') {

        // Check role
        if (msg.guild.roles.cache.find(role => role.name === "Admin")) {

            // Check if mission exists
            if (!missions[args[1]]) {
                msg.channel.send('No such mission. Use /miss to see a list of missions.');
            }
            else {
                msg.channel.send('Mission removed: ' + args[1] + ': ' + missions[args[1]]);

                delete missions[args[1]];
            }
        }
    }

    // list missions 
    else if (command === 'missions' || command === 'miss') {

        // Check if empty 
        if (isEmpty(missions)) {
            msg.channel.send('No missions at the moment.')
        }
        else {
            msg.channel.send('-- Missions --\n')
            for (var m in missions) {
                msg.channel.send(m + ': ' + missions[m]);
            }
        }
    }
});


//-------------------------------------------------------------------------- Commands

// Bot Command List
const commandsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('INVader Bot Commands')
    .addField('Accounts', '/accounts or /acc')
    .addField('Contracts', '/contracts or /con')
    .addField('Tokens', '/tokens or /tok')
    .addField('Missions', '/missions or /miss')


// Bot Command List (Admins)
const adminCommandsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('INVader Bot Commands')
    .addField('Accounts', '/accounts or /acc')
    .addField('Contracts', '/contracts or /con')
    .addField('Tokens', '/tokens or /tok')
    .addField('Missions', '/missions or /miss')
    .addField('Add Mission (Admin only)', '/addmission or /am')
    .addField('Remove Mission (Admin only)', '/removemission or /rm')


//-------------------------------------------------------------------------- Accounts

// Accounts Bot - Etherscan/Zerion 
const accountsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Inverse.Finance Accounts')
    .addField('Inverse Deployer', '[Etherscan](https://etherscan.io/address/0x3fcb35a1cbfb6007f9bc638d388958bc4550cb28) | [Zerion](https://app.zerion.io/0x3fcb35a1cbfb6007f9bc638d388958bc4550cb28/overview)')
    .addField('Inverse Treasury', '[Etherscan](https://etherscan.io/address/0x926df14a23be491164dcf93f4c468a50ef659d5b) | [Zerion](https://app.zerion.io/0x926df14a23be491164dcf93f4c468a50ef659d5b/overview)')
    .addField('Anchor Bank (ETH)', '[Etherscan](https://etherscan.io/address/0x697b4acaa24430f254224eb794d2a85ba1fa1fb8) | [Zerion](https://app.zerion.io/0x697b4acaa24430f254224eb794d2a85ba1fa1fb8/overview)')
    .addField('Anchor Bank (DOLA)', '[Etherscan](https://etherscan.io/address/0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670) | [Zerion](https://app.zerion.io/0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670/overview)')


//-------------------------------------------------------------------------- Contracts

// Contracts Bot - Etherscan
const contractsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Inverse.Finance Contracts')
    .addField('INV contract', '[0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68](https://etherscan.io/address/0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68)')
    .addField('DOLA contract', '[0x865377367054516e17014ccded1e7d814edc9ce4](https://etherscan.io/address/0x865377367054516e17014ccded1e7d814edc9ce4)')
    .addField('anETH contract', '[0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8](https://etherscan.io/address/0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8)')
    .addField('anDOLA contract', '[0x7fcb7dac61ee35b3d4a51117a7c58d53f0a8a670](https://etherscan.io/address/0x7fcb7dac61ee35b3d4a51117a7c58d53f0a8a670)')
    .addField('Anchor Stabilizer contract', '[0x7ec0d931affba01b77711c2cd07c76b970795cdd](https://etherscan.io/address/0x7ec0d931affba01b77711c2cd07c76b970795cdd)')
    .addField('DCA Vault - USDC-ETH contract', '[0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357](https://etherscan.io/address/0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357)')
    .addField('DCA Vault - DAI-wBTC contract', '[0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34](https://etherscan.io/address/0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34)')
    .addField('DCA Vault - DAI-YFI contract', '[0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B](https://etherscan.io/address/0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B)')
    .addField('DCA Vault - DAI-ETH contract', '[0x2dCdCA085af2E258654e47204e483127E0D8b277](https://etherscan.io/address/0x2dCdCA085af2E258654e47204e483127E0D8b277)')


//-------------------------------------------------------------------------- Tokens

// Tokens Bot - Etherscan 
const tokensEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Inverse.Finance Tokens')
    .addField('INV Token', '[0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68](https://etherscan.io/token/0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68)')
    .addField('DOLA Token', '[0x865377367054516e17014ccded1e7d814edc9ce4](https://etherscan.io/token/0x865377367054516e17014ccded1e7d814edc9ce4)')
    .addField('inUSDC->ETH Token', '[0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357](https://etherscan.io/token/0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357)')
    .addField('inDAI->wBTC Token', '[0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34](https://etherscan.io/token/0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34)')
    .addField('inDAI->YFI Token', '[0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B](https://etherscan.io/token/0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B)')
    .addField('inDAI->ETH Token', '[0x2dCdCA085af2E258654e47204e483127E0D8b277](https://etherscan.io/token/0x2dCdCA085af2E258654e47204e483127E0D8b277)')
    .addField('UniSwap_v2 INV-ETH Token', '[0x73e02eaab68a41ea63bdae9dbd4b7678827b2352](https://etherscan.io/token/0x73e02eaab68a41ea63bdae9dbd4b7678827b2352)')
    .addField('UniSwap_v2 DOLA-ETH Token', '[0xecfbe9b182f6477a93065c1c11271232147838e5](https://etherscan.io/token/0xecfbe9b182f6477a93065c1c11271232147838e5)')


//-------------------------------------------------------------------------- Helper Functions

// Checks if object is empty
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}