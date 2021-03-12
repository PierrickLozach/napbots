/*
- Total of allocations should be equal to 1 (e.g. 0.6 + 0.4)
- Leverage should be between 0.00 and 1.50
- How to find bot IDs: https://imgur.com/a/ayit9pR

Bots:
  . NapoX BTC AR hourly: STRAT_BTC_USD_H_4_V2
  . NapoX BTC Funding AR hourly: STRAT_BTC_USD_FUNDING_8H_1
  . NapoX BTC Ultra flex AR hourly: STRAT_BTC_USD_H_3_V2
  . NapoX BTC Volume AR daily: STRAT_BTC_USD_VOLUME_H_1
  . NapoX ETH AR hourly: STRAT_ETH_USD_H_4_V2
  . NapoX ETH Funding AR hourly: STRAT_ETH_USD_FUNDING_8H_1
  . NapoX ETH Ultra flex AR hourly: STRAT_ETH_USD_H_3_V2
  . NapoX ETH Volume AR daily: STRAT_BTC_ETH_VOLUME_H_1
  . NapoX alloc ETH/BTC/USD AR hourly: STRAT_BTC_ETH_USD_H_1
  . NapoX alloc ETH/BTC/USD LO hourly: STRAT_BTC_ETH_USD_LO_H_1

2 compositions are available:
  0 => Napbots default composition
  1 => Thomas (from Telegram) composition

To select a composition, set the 'selectedComposition' variable below

*/

let selectedComposition = 1;

let compositions = [
  // Napbots recommended composition
  {
    mild_bear: {
      compo: {
        STRAT_BTC_USD_FUNDING_8H_1: 0.15,
        STRAT_ETH_USD_FUNDING_8H_1: 0.15,
        STRAT_BTC_USD_H_4_V2: 0.15,
        STRAT_BTC_ETH_USD_H_1: 0.55,
      },
      leverage: 1.0,
      botOnly: true,
    },
    mild_bull: {
      compo: {
        STRAT_ETH_USD_H_3_V2: 0.25,
        STRAT_BTC_USD_H_3_V2: 0.25,
        STRAT_BTC_ETH_USD_H_1: 0.5,
      },
      leverage: 1.5,
      botOnly: true,
    },
    extreme: {
      compo: {
        STRAT_BTC_ETH_USD_H_1: 0.2,
        STRAT_ETH_USD_H_3_V2: 0.4,
        STRAT_BTC_USD_H_3_V2: 0.4,
      },
      leverage: 0.5,
      botOnly: true,
    },
  },
  // Thomas (from Telegram) composition
  {
    mild_bear: {
      compo: {
        STRAT_BTC_ETH_USD_H_1: 0.12,
        STRAT_BTC_ETH_USD_LO_H_1: 0.12,
        STRAT_ETH_USD_VOLUME_H_1: 0.11,
        STRAT_BTC_USD_VOLUME_H_1: 0.11,
        STRAT_BTC_USD_FUNDING_8H_1: 0.11,
        STRAT_ETH_USD_FUNDING_8H_1: 0.11,
        STRAT_ETH_USD_H_4_V2: 0.11,
        STRAT_BTC_USD_H_4_V2: 0.11,
        STRAT_BNB_USD_LO_D_1: 0.10,
      },
      leverage: 1.0,
      botOnly: true
    },
    mild_bull: {
      compo: {
        STRAT_BTC_ETH_USD_H_1: 0.15,
        STRAT_BTC_ETH_USD_LO_H_1: 0.25,
        STRAT_ETH_USD_VOLUME_H_1: 0.06,
        STRAT_BTC_USD_VOLUME_H_1: 0.06,
        STRAT_BTC_USD_FUNDING_8H_1: 0.06,
        STRAT_ETH_USD_FUNDING_8H_1: 0.06,
        STRAT_ETH_USD_H_4_V2: 0.13,
        STRAT_BTC_USD_H_4_V2: 0.13,
        STRAT_BNB_USD_LO_D_1: 0.10,
      },
      leverage: 1.5,
      botOnly: true
    },
    extreme: {
      compo: {
        STRAT_ETH_USD_H_3_V2: 0.26,
        STRAT_BTC_USD_H_3_V2: 0.26,
        STRAT_BTC_ETH_USD_H_1: 0.24,
        STRAT_ETH_USD_VOLUME_H_1: 0.02,
        STRAT_BTC_USD_VOLUME_H_1: 0.02,
        STRAT_BTC_USD_FUNDING_8H_1: 0.02,
        STRAT_ETH_USD_FUNDING_8H_1: 0.02,
        STRAT_ETH_USD_H_4_V2: 0.08,
        STRAT_BTC_USD_H_4_V2: 0.08,
      },
      leverage: 0.5,
      botOnly: true
    }
  }
];

exports.compositions = compositions[selectedComposition];
