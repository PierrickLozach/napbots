// DYNAMIC NAPBOTS ALLOCATION
//
// SEE README FOR DETAILS

const axios = require('axios').default;
const compositions = require('./compositions').compositions;

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

//#endregion

//#region Script (do not change)

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

    console.log('Compositions:', compositions)
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
    if (exchange.compo.leverage.toFixed(2) !== compositionToSet.leverage.toFixed(2)) {
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
        console.log('Updating allocation to:', params);
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
