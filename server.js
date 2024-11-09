require('colors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const inquirer = require('inquirer');
const Bot = require('./src/Bot');
const Config = require('./src/Config');
const {
  fetchProxies,
  readLines,
  selectProxySource,
  selectProxySource2
} = require('./src/ProxyManager');
const { delay, displayHeader } = require('./src/utils');
const express = require('express');
const app = express();
const port = 3000;

async function main(sv) {
  displayHeader();
  console.log(`Please wait...\n`.yellow);

  await delay(1000);

  const config = new Config();
  const bot = new Bot(config);

  const proxySource = await selectProxySource2(sv);

  let proxies = [];
  if (proxySource.type === 'url') {
    proxies = await fetchProxies(proxySource.source);
  } else if (proxySource.type === 'none') {
    console.log('No proxy selected. Connecting directly.'.cyan);
  }

  if (proxySource.type !== 'none' && proxies.length === 0) {
    console.error('No proxies found. Exiting...'.red);
    return;
  }

  console.log(
    proxySource.type !== 'none'
      ? `Loaded ${proxies.length} proxies`.green
      : 'Direct connection mode enabled.'.green
  );

  /***
 * UID format in .env: UID=['id1','id2','id3']
 * Parses single or multiple UIDs
 */

  let userIDs = [];
  if (process.env.UID) {
    userIDs = process.env.UID.replace(/[\[\]']/g, '').split(',').map(id => id.trim());
  }

  if (userIDs.length === 0) {
    console.error('No user IDs found in UID environment variable. Exiting...'.red);
    return;
  }

  console.log(`Loaded ${userIDs.length} user ID(s)\n`.green);

  if (proxySource.type !== 'none') {
    await Promise.all(userIDs.flatMap(userID =>
      proxies.map(proxy => bot.connectToProxy(proxy, userID))
    ));
  } else {
    await Promise.all(userIDs.map(userID => bot.connectDirectly(userID)));
  }
}

app.get('/', (req, res) => {
  res.send('SERVER FOR GRASS NODE AUTOFARMING SCRIPT\nMADE\nBY\nHackMeSenpai(HMS)');
});

app.listen(port, () => {
  console.log(`Express Server Started\nlistening on port ${port}`.green);
  /*
  let svlist = ["SERVER 1","SERVER 2","SERVER 3","SERVER 4","SERVER 5","SERVER 6","SERVER 7","SERVER 8","SERVER 9"];
  for (let el of svlist) {
    main(el).catch(console.error);
  }
  */
});

main('NO PROXY').catch(console.error);

module.exports = app;