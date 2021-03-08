// DYNAMIC NAPBOTS ALLOCATION
//
// SEE README FOR DETAILS

const axios = require('axios').default;

//#region Account details

require('dotenv').config();

let email = process.env.NAPBOTS_EMAIL;
if (!email) {
  console.error('Missing NAPBOTS_EMAIL, please look at the README.md file to find out how to configure your environment before running this program.');
  return;
}
console.log('email', email)

let password = process.env.NAPBOTS_PASSWORD;
if (!password) {
  console.error('Missing NAPBOTS_PASSWORD, please look at the README.md file to find out how to configure your environment before running this program.');
  return;
}

let userId = process.env.NAPBOTS_USERID; // How to find userId: https://imgur.com/a/fW4I8Be
if (!userId) {
  console.error('Missing NAPBOTS_USERID, please look at the README.md file to find out how to configure your environment before running this program.');
  return;
}

//process.stdout.write('\x1bc');

//#endregion

//#region Weather dependent compositions

/*

- Total of allocations should be equal to 1 (e.g. 0.6 + 0.4)
- Leverage should be between 0.00 and 1.50
- How to find bot IDs: https://imgur.com/a/ayit9pR
- Assignments is based on Napbots recommendations: https://platform.napbots.com/crypto-weather and on bot performance

Bots:
  . NapoX BTC AR hourly: STRAT_BTC_USD_H_4_V2 (402%)
  . NapoX BTC Funding AR hourly: STRAT_BTC_USD_FUNDING_8H_1 (536%)
  . NapoX BTC Ultra flex AR hourly: STRAT_BTC_USD_H_3_V2 (336%)
  . NapoX BTC Volume AR daily: STRAT_BTC_USD_VOLUME_H_1 (224%)
  . NapoX ETH AR hourly: STRAT_ETH_USD_H_4_V2 (359%)
  . NapoX ETH Funding AR hourly: STRAT_ETH_USD_FUNDING_8H_1 (276%)
  . NapoX ETH Ultra flex AR hourly: STRAT_ETH_USD_H_3_V2 (632%)
  . NapoX ETH Volume AR daily: STRAT_BTC_ETH_VOLUME_H_1 (447%)
  . NapoX alloc ETH/BTC/USD AR hourly: STRAT_BTC_ETH_USD_H_1 (1230%)
  . NapoX alloc ETH/BTC/USD LO hourly: STRAT_BTC_ETH_USD_LO_H_1 (561%)


  */

let compositions = {
  mild_bear: {
    compo: {
      STRAT_BTC_USD_FUNDING_8H_1: 0.15,
      STRAT_ETH_USD_FUNDING_8H_1: 0.15,
      STRAT_BTC_ETH_USD_H_1: 0.7,
    },
    leverage: 1.0,
    botOnly: true,
  },
  mild_bull: {
    compo: {
      STRAT_BTC_USD_FUNDING_8H_1: 0.25,
      STRAT_ETH_USD_FUNDING_8H_1: 0.25,
      STRAT_BTC_ETH_USD_H_1: 0.5,
    },
    leverage: 1.5,
    botOnly: true,
  },
  extreme: {
    compo: {
      STRAT_ETH_USD_H_3_V2: 0.4,
      STRAT_BTC_USD_H_3_V2: 0.4,
      STRAT_BTC_ETH_USD_H_1: 0.2,
    },
    leverage: 1.0,
    botOnly: true,
  },
};

//#endregion

//#region Script (do not touch here)

const deepEqual = (x, y) => {
  if (x === y) {
    return true;
  } else if (
    typeof x == 'object' &&
    x != null &&
    typeof y == 'object' &&
    y != null
  ) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  } else return false;
};

const getCryptoWeater = async () => {
  let weatherApi = await axios({
    url: 'https://middle.napbots.com/v1/crypto-weather',
  });

  if (!weatherApi) {
    console.error('No weather information found.');
    return;
  }

  console.log('Current weather:', weatherApi.data.data.weather.weather);
  return weatherApi.data.data.weather.weather;
};

const getAuthToken = async () => {
  let loginResponse = await axios({
    url: 'https://middle.napbots.com/v1/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      email: email,
      password: password,
    },
  });

  let authToken = loginResponse.data.data.accessToken;
  if (!authToken) {
    console.error('No Auth Token');
    return;
  }
  return authToken;
};

const getCurrentAllocations = async (authToken) => {
  // Get current allocation for all exchanges
  let currentAllocationResponse = await axios({
    url: 'https://middle.napbots.com/v1/account/for-user/' + userId,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: authToken,
    },
  });

  let currentAllocation = currentAllocationResponse.data.data;

  // Rebuild exchanges array
  let exchanges = [];
  for (let index = 0; index < currentAllocation.length; index++) {
    const allocation = currentAllocation[index];
    if (!allocation.accountId || !allocation.compo || !allocation.tradingActive) {
      continue; // Next
    }
    exchanges.push({
      id: allocation.accountId,
      compo: allocation.compo,
    });
  }

  return exchanges;
};

const main = async () => {

  //#region Check command-line arguments

  let args = process.argv;

  let forcedComposition;
  if (args.length > 2) {
    switch (args[2]) {
      case 'force_mild_bull':
        forcedComposition = 'mild_bull';
    }
  }

  //#endregion

  let compositionToSet;

  if (!forcedComposition) {
    //#region Get weather

    let weather;
    try {
      weather = await getCryptoWeater();
    } catch (error) {
      console.error(error);
      return;
    }

    //#endregion

    //#region Set composition based on weather

    switch (weather) {
      case 'Extreme markets':
        compositionToSet = compositions.extreme;
        break;
      case 'Mild bull markets':
        compositionToSet = compositions.mild_bull;
        break;
      case 'Mild bear or range markets':
        compositionToSet = compositions.mild_bear;
        break;
      default:
        console.error('Unknown weather condition:', weather);
        return;
    }
  } else {
    console.log('Forcing composition to:', forcedComposition);
    compositionToSet = compositions[forcedComposition];
  }

  //#endregion

  //#region Login

  let authToken;
  console.log('Authenticating...');
  try {
    authToken = await getAuthToken();
  } catch (error) {
    console.error(error);
    return;
  }

  //#endregion

  //#region Get Exchanges

  let exchanges;
  try {
    exchanges = await getCurrentAllocations(authToken);
  } catch (error) {
    console.error(error);
    return;
  }

  //#endregion

  //#region Update allocations

  // For each exchange, update allocation if different from the current crypto weather
  for (let index = 0; index < exchanges.length; index++) {
    const exchange = exchanges[index];
    let toUpdate = false;

    // If leverage different, set to update
    if (exchange.compo.leverage !== compositionToSet.leverage) {
      console.log('=> Leverage is different');
      toUpdate = true;
    }

    // If composition different, set to update
    let equalCompos = deepEqual(exchange.compo.compo, compositionToSet.compo);
    if (!equalCompos) {
      console.log('=> Compositions are different');
      toUpdate = true;
    }

    // If composition different, update allocation for this exchange
    if (toUpdate) {
      // Rebuild string for composition
      let params = {
        botOnly: compositionToSet.botOnly,
        compo: {
          leverage: compositionToSet.leverage.toFixed(2).toString(),
          compo: compositionToSet.compo,
        },
      };

      try {
        console.log('Updating allocation to:', params, 'for', exchange);
        await axios({
          url: 'https://middle.napbots.com/v1/account/' + exchange.id,
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            token: authToken,
          },
          data: params,
        });
        console.log('Success!');
      } catch (error) {
        console.error(error.response ? error.response.data : error);
      }
    } else {
      console.log('No updates are necessary.');
    }
  }

  //#endregion
};

main();

//#endregion
