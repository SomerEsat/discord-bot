//
// Inverse.Finance Discord Bot
//
// By Somer, March 2021
//

const Discord = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Create client instance
const client = new Discord.Client();

// Load config data
let config = loadConfigData();

// Bot prefix
const prefix = config.prefix; 

// Message delete timeout 
const msgTimeout = config.msg_delete_timeout;

// IF Discord Role IDs
const adminRoleId = config.inv_admin_role_id;
const moderatorRoleId = config.inv_mod_role_id;
const invaderOnDutyRoleId = config.inv_invader_onduty_role_id;

// Test Role IDs
//const adminRoleId = config.test_admin_role_id;
//const moderatorRoleId = config.test_mod_role_id;
//const invaderOnDutyRoleId = config.test_member_role_id;

// Global scope storage for mission data 
var missions = config.missions_data;

// Login to server 
client.login(process.env.DISCORD_BOT_TOKEN);

// Confirm connection 
client.on('ready', () => console.log('The INVader Bot is ready!'));

console.log(config);


//-------------------------------------------------------------------------- Command Parser

client.on('message', (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    // Parse the command
    const commandBody = msg.content.slice(prefix.length);
    const args = commandBody.split('|');
    const command = args[0].toLowerCase();

    // inv 
    if (command === 'inv') {
        sendMessageWithTimeout(msg, commandsEmbed, msgTimeout);
    }

    // links
    else if (command === 'links' || command === 'ln') {
        sendMessageWithTimeout(msg, officialLinks, msgTimeout);
    }

    // accounts
    else if (command === 'accounts' || command === 'acc') {
        sendMessageWithTimeout(msg, accountsEmbed, msgTimeout);
    }

    // contracts
    else if (command === 'contracts' || command === 'con') {
        sendMessageWithTimeout(msg, contractsEmbed, msgTimeout);
    }

    // tokens
    else if (command === 'tokens' || command === 'tok') {
        sendMessageWithTimeout(msg, tokensEmbed, msgTimeout);
    }

    // Add mission (admin only)
    else if (command === 'addmission' || command === 'am') {

        // Check for Admin or Moderator role
        if (!(msg.member.roles.cache.has(adminRoleId) || msg.member.roles.cache.has(moderatorRoleId))) {
            sendMessageWithTimeout(msg, 'Adding missions requires the Admin or Moderator role.', msgTimeout);
        }
        else {
            // Only add if values present
            if (!args[1] || !args[2]) {
                sendMessageWithTimeout(msg, 'Nothing to add. Provide both a title and a description. E.g. /am|Mission 1|The first mission', msgTimeout);
            }
            else {
                missions[args[1]] = args[2];
                sendMessageWithTimeout(msg, 'Mission added: ' + args[1] + ': ' + args[2], msgTimeout);

                // Save the change to the config json file 
                updateConfigData('missions_data', missions);
            }
        }
    }

    // Remove mission (admin only) 
    else if (command === 'removemission' || command === 'rm') {

        // Check for Admin or Moderator role
        if (!(msg.member.roles.cache.has(adminRoleId) || msg.member.roles.cache.has(moderatorRoleId))) {
            sendMessageWithTimeout(msg, 'Removing missions requires the Admin or Moderator role.', msgTimeout);
        }
        else {
            // Check if mission exists
            if (!missions[args[1]]) {
                sendMessageWithTimeout(msg, 'No such mission. Use /miss to see a list of missions.', msgTimeout);
            }
            else {
                sendMessageWithTimeout(msg, 'Mission removed: ' + args[1] + ': ' + missions[args[1]], msgTimeout);

                delete missions[args[1]];

                // Save the change to the config json file 
                updateConfigData('missions_data', missions);
            }
        }
    }

    // Clear all missions (admin only)
    else if (command === 'clearmissions' || command === 'cm') {

        // Check for Admin or Moderator role
        if (!(msg.member.roles.cache.has(adminRoleId) || msg.member.roles.cache.has(moderatorRoleId))) {
            sendMessageWithTimeout(msg, 'Clearing missions requires the Admin or Moderator role.', msgTimeout);
        }
        else {
            // Check if empty
            if (isEmpty(missions)) {
                sendMessageWithTimeout(msg, 'No missions to clear.', msgTimeout);
            }
            else {
                missions = {};
                sendMessageWithTimeout(msg, 'Missions cleared.', msgTimeout);

                // Save the change to the config json file 
                updateConfigData('missions_data', missions);
            }
        }
    }

    // List missions (admin only)
    else if (command === 'missions' || command === 'miss') {

        // Check for Admin or Moderator role
        if (!(msg.member.roles.cache.has(adminRoleId) || msg.member.roles.cache.has(moderatorRoleId))) {
            sendMessageWithTimeout(msg, 'Listing missions requires the Admin or Moderator role.', msgTimeout);
        }
        else {
            // Check if empty
            if (isEmpty(missions)) {
                sendMessageWithTimeout(msg, 'No missions at the moment.', msgTimeout);
            }
            else {
                // Remove original call
                msg.delete();

                // No timeout
                var missionMsg = config.missions_header;
                for (var m in missions) {
                    missionMsg += m + ': ' + missions[m] + '\n\n';
                }
                missionMsg += config.missions_footer;
                msg.channel.send(missionMsg);
            }
        }
    }

    // List missions + announce (admin only)
    else if (command === 'missionsblast' || command === 'missb') {

        // Check for Admin or Moderator role
        if (!(msg.member.roles.cache.has(adminRoleId) || msg.member.roles.cache.has(moderatorRoleId))) {
            sendMessageWithTimeout(msg, 'Blasting missions requires the Admin or Moderator role.', msgTimeout);
        }
        else {
            // Check if empty
            if (isEmpty(missions)) {
                sendMessageWithTimeout(msg, 'No missions at the moment.', msgTimeout);
            }
            else {
                // Remove original call 
                msg.delete();

                // No timeout
                var missionMsg = config.missions_header;
                for (var m in missions) {
                    missionMsg += m + ': ' + missions[m] + '\n\n';
                }
                missionMsg += config.missions_footer;
                missionMsg += '<@&' + invaderOnDutyRoleId + '>';
                msg.channel.send(missionMsg);
            }
        }
    }
});


//-------------------------------------------------------------------------- Commands

// Bot Command List
const commandsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('INVader Bot Commands')
    .addField('Official Links', "/links or /ln")
    .addField('Accounts', '/accounts or /acc')
    .addField('Contracts', '/contracts or /con')
    .addField('Tokens', '/tokens or /tok')
    .addField('List Missions*', '/missions or /miss')
    .addField('List Missions & Blast*', '/missionsblast or /missb - List missions and @ the INVader_OnDuty role')
    .addField('Add Mission*', '/addmission or /am  - Use | to separate. E.g. /am|Task 1|The first mission')
    .addField('Remove Mission*', '/removemission or /rm - Use | to separate. E.g. /rm|Task 1')
    .addField('Clear Missions*', '/clearmissions or /cm')
    .setFooter('* = Admin/Moderator only. Embed timeout: ' + (msgTimeout / 1000) + 'sec');


//-------------------------------------------------------------------------- Accounts

// Accounts Bot - Etherscan/Zerion 
const accountsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Inverse.Finance Accounts')
    .addField('Inverse Deployer', '[Etherscan](https://etherscan.io/address/0x3fcb35a1cbfb6007f9bc638d388958bc4550cb28) | [Zerion](https://app.zerion.io/0x3fcb35a1cbfb6007f9bc638d388958bc4550cb28/overview)')
    .addField('Inverse Treasury', '[Etherscan](https://etherscan.io/address/0x926df14a23be491164dcf93f4c468a50ef659d5b) | [Zerion](https://app.zerion.io/0x926df14a23be491164dcf93f4c468a50ef659d5b/overview)')
    .addField('Anchor Bank (ETH)', '[Etherscan](https://etherscan.io/address/0x697b4acaa24430f254224eb794d2a85ba1fa1fb8) | [Zerion](https://app.zerion.io/0x697b4acaa24430f254224eb794d2a85ba1fa1fb8/overview)')
    .addField('Anchor Bank (DOLA)', '[Etherscan](https://etherscan.io/address/0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670) | [Zerion](https://app.zerion.io/0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670/overview)')
    .setFooter('Embed timeout: ' + (msgTimeout / 1000) + 'sec');


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
    .setFooter('Embed timeout: ' + (msgTimeout / 1000) + 'sec');


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
    .setFooter('Embed timeout: ' + (msgTimeout / 1000) + 'sec');


//-------------------------------------------------------------------------- Links

// Official Links
const officialLinks = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Inverse.Finance Official Links')
    .addField('Website', '[https://inverse.finance/](https://inverse.finance/)')
    .addField('Discord', '[https://discord.com/invite/YpYJC7R5nv](https://discord.com/invite/YpYJC7R5nv)')
    .addField('Telegram', '[https://t.me/InverseFinance](https://t.me/InverseFinance)')
    .addField('Telegram Announcements', '[https://t.me/InverseFinanceAnn](https://t.me/InverseFinanceAnn)')
    .addField('Twitter', '[https://twitter.com/InverseFinance](https://twitter.com/InverseFinance)')
    .addField('Medium', '[https://medium.com/inversefinance ](https://medium.com/inversefinance )')
    .addField('Github', '[https://github.com/InverseFinance](https://github.com/InverseFinance)')
    .addField('Dune Analytics', '[http://bit.ly/INV_DUNE](http://bit.ly/INV_DUNE)')
    .addField('Tally Governance', '[https://www.withtally.com/governance/inverse](https://www.withtally.com/governance/inverse)')
    .addField('Dex Tools WETH-INV', '[Dex Tools](https://www.dextools.io/app/uniswap/pair-explorer/0x73e02eaab68a41ea63bdae9dbd4b7678827b2352)')
    .addField('Dex Tools WETH-DOLA', '[Dex Tools](https://www.dextools.io/app/uniswap/pair-explorer/0xecfbe9b182f6477a93065c1c11271232147838e5)')
    .addField('INV-ETH Uniswap Trade', '[Uniswap](https://app.uniswap.org/#/swap?inputCurrency=0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68)')
    .addField('INV-ETH Uniswap Pair', '[Uniswap](https://info.uniswap.org/pair/0x73e02eaab68a41ea63bdae9dbd4b7678827b2352)')
    .addField('DOLA-ETH Uniswap Trade', '[Uniswap](https://app.uniswap.org/#/swap?inputCurrency=0x865377367054516e17014ccded1e7d814edc9ce4&outputCurrency=ETH)')
    .addField('DOLA-ETH Uniswap Pair', '[Uniswap](https://info.uniswap.org/pair/0xecfbe9b182f6477a93065c1c11271232147838e5)')
    .addField('Buy DOLA', '[https://inverse.finance/stabilizer](https://inverse.finance/stabilizer)')
    .setFooter('Embed timeout: ' + (msgTimeout / 1000) + 'sec');


//-------------------------------------------------------------------------- Helper Functions

// Send an embed message with a timeout to delete it 
function sendMessageWithTimeout(msgObj, msgToSend, timeout) {
    msgObj.channel.send(msgToSend).then(embedMessage => {
        setTimeout(() => msgObj.delete(), timeout);
        setTimeout(() => embedMessage.delete(), timeout);
    });
}

// Load config data
function loadConfigData() {
    return JSON.parse(fs.readFileSync('config.json', 'utf-8'));
}

// Update config data
function updateConfigData(key, value) {
    config[key] = value;
    saveConfigData();
}

// Save config data
function saveConfigData() {
    const json = JSON.stringify(config);
    fs.writeFile('config.json', json, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

// Check if object is empty
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}