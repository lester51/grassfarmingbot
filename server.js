require('colors')
require('dotenv').config()
const fs = require('fs')
const inquirer = require('inquirer')
const Bot = require('./src/Bot')
const Config = require('./src/Config')
const {
  fetchProxies,
  readLines,
  selectProxySource,
  selectProxySource2,
} = require('./src/ProxyManager')
const { delay, displayHeader } = require('./src/utils')
const express = require('express')
const app = express()
const port = process.env.EXPRESS_PORT

async function main(sv) {
  displayHeader()
  console.log(`Please wait...\n`.yellow)

  await delay(1000)

  const config = new Config()
  const bot = new Bot(config)

  const proxySource = await selectProxySource2(sv)

  let proxies = []
  if (proxySource.type === 'url') {
    proxies = await fetchProxies(proxySource.source)
  } else if (proxySource.type === 'none') {
    console.log('No proxy selected. Connecting directly.'.cyan)
  }

  if (proxySource.type !== 'none' && proxies.length === 0)
    return console.error('No proxies found. Exiting...'.red)

  console.log(
    proxySource.type !== 'none'
      ? `Loaded ${proxies.length} proxies`.green
      : 'Direct connection mode enabled.'.green,
  )

  /***
   * UID format in .env: UID=['id1','id2','id3']
   * Parses single or multiple UIDs
   */

  let userIDs = process.env.UID.replace(/[\[\]']/g, '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  userIDs.forEach((id, index) => {
    console.log(`Loaded User ID #${id}`.green)
  })

  if (proxySource.type !== 'none')
    return await Promise.all(
      userIDs.flatMap((userID) => proxies.map((proxy) => bot.connectToProxy(proxy, userID))),
    )

  await Promise.all(userIDs.map((userID) => bot.connectDirectly(userID)))
}

app.get('/', (req, res) =>
  res.send('SERVER FOR GRASS NODE AUTOFARMING SCRIPT\nMADE\nBY\nHackMeSenpai(HMS)'),
)

app.listen(port, () => {
  console.log(`Express Server Started\nlistening on port ${port}`.green)
  /*
  let svlist = ["SERVER 1","SERVER 2","SERVER 3","SERVER 4","SERVER 5","SERVER 6","SERVER 7","SERVER 8","SERVER 9"];
  for (let el of svlist) {
    main(el).catch(console.error);
  }
  */
})

main('SERVER 1').catch(console.error)

module.exports = app
