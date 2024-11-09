const colors = require('colors');
const axios = require('axios');
const fs = require('fs');

const PROXY_SOURCES = {
  'SERVER 1': 'https://files.ramanode.top/airdrop/grass/server_1.txt',
  'SERVER 2': 'https://files.ramanode.top/airdrop/grass/server_2.txt',
  'SERVER 3': 'https://files.ramanode.top/airdrop/grass/server_3.txt',
  'SERVER 4': 'https://files.ramanode.top/airdrop/grass/server_4.txt',
  'SERVER 5': 'https://files.ramanode.top/airdrop/grass/server_5.txt',
  'SERVER 6': 'https://files.ramanode.top/airdrop/grass/server_6.txt',
  'SERVER 7': 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt',
  'SERVER 8': 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt',
  'SERVER 9': 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
};

async function fetchProxies(url) {
  try {
    const response = await axios.get(url);
    console.log(`\nFetched proxies from ${url}`.green);
    if (url.includes("githubusercontent")) {
      if (url.includes("http.txt")) return response.data.split('\n').map(e => `http://${e}`).filter(Boolean);
      else if (url.includes("socks4.txt")) return response.data.split('\n').map(e => `socks4://${e}`).filter(Boolean);
      else return response.data.split('\n').map(e => `socks5://${e}`).filter(Boolean);
    }
    else return response.data.split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch proxies from ${url}: ${error.message}`.red);
    return [];
  }
}

async function readLines(filename) {
  try {
    const data = await fs.promises.readFile(filename, 'utf-8');
    console.log(`Loaded data from ${filename}`.green);
    return data.split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Failed to read ${filename}: ${error.message}`.red);
    return [];
  }
}

async function selectProxySource(inquirer) {
  const choices = [...Object.keys(PROXY_SOURCES), 'CUSTOM', 'NO PROXY'];
  const { source } = await inquirer.prompt([
    {
      type: 'list',
      name: 'source',
      message: 'Select proxy source:'.cyan,
      choices,
    },
  ]);

  if (source === 'CUSTOM') {
    const { filename } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Enter the path to your proxy.txt file:'.cyan,
        default: 'proxy.txt',
      },
    ]);
    return { type: 'file', source: filename };
  } else if (source === 'NO PROXY') {
    return { type: 'none' };
  }

  return { type: 'url', source: PROXY_SOURCES[source] };
}

async function selectProxySource2(svname) {
  if (typeof svname === 'string' && ["SERVER 1", "SERVER 2", "SERVER 3", "SERVER 4", "SERVER 5", "SERVER 6", "SERVER 7", "SERVER 8", "SERVER 9"].includes(svname.toUpperCase())) {
    return { type: 'url', source: PROXY_SOURCES[svname.toUpperCase()] };
  } else {
    return { type: 'none' };
  }
}

module.exports = { fetchProxies, readLines, selectProxySource, selectProxySource2 };