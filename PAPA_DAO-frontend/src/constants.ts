export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/papadaoofficial/papagraph";
export const EPOCH_INTERVAL = 14400;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 2;

export const TOKEN_DECIMALS = 9;

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  43114: {
    MIM_ADDRESS: "0x130966628846bfd36ff31a822705796e8cb8c18d", // duplicate
    // USDC_ADDRESS: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    PAPA_ADDRESS: "0x70b33ebC5544C12691d055b49762D0F8365d99Fe",
    STAKING_ADDRESS: "0x3875AC1F19E05813000F02414b3141DC3Ff991B6", // The new staking contract
    STAKING_HELPER_ADDRESS: "0x166840A0f79326F74705DA4Ae0FeE085aEd89B7c", // Helper contract used for Staking only
    OLD_STAKING_ADDRESS: "0xde698Aa043F4A9548AAc041434473E9e53991430",
    OLD_STAKING_HELPER_ADDRESS: "0xeF70DA041AecbA26187191630275ba7519F4Cc5e",
    OLD_SPAPA_ADDRESS: "0x5Ee5fDd4077CaC9138BB854FAED2A40B2482cFd9",
    SPAPA_ADDRESS: "0xDd8E1245F8B285672111C9e4051504D654f4d43A",
    DISTRIBUTOR_ADDRESS: "0xA5f757325213910263010d11412Efdd5C580350D",
    BONDINGCALC_ADDRESS: "0xA55A711Cf7adE1552f77A7127135C5156f75c83C",
    BONDINGCALC_ADDRESS1: "0xA55A711Cf7adE1552f77A7127135C5156f75c83C",
    TREASURY_ADDRESS: "0x3C8e800B9f12771A5f150D0943De968ABc7A7bE1",
    REDEEM_HELPER_ADDRESS: "0xD4ec9b6E1325feb5d2E9dd4AFDF9187C9B717bC7",
    USDT_ADDRESS: "0xc7198437980c041c805a1edcba50c1ce5db95118",
  },
};

export const messages = {
  please_connect: "Please connect your wallet to the Avalanche network to use Wonderland.",
  please_connect_wallet: "Please connect your wallet.",
  try_mint_more: (value: string) => `You're trying to mint more than the maximum payout available! The maximum mint payout is ${value} PAPA.`,
  before_minting: "Before minting, enter a value.",
  existing_mint:
      "You have an existing mint. Minting will reset your vesting period and forfeit any pending claimable rewards. We recommend claiming rewards first or using a fresh wallet. Do you still wish to proceed?",
  before_stake: "Before staking, enter a value.",
  before_unstake: "Before un staking, enter a value.",
  tx_successfully_send: "Your transaction was successful",
  balance_updated: "Your balance was successfully updated",
  nothing_to_claim: "You have nothing to claim",
  something_wrong: "Something went wrong",
  switch_to_fantom: "Switch to the Avalanche network?",
  slippage_too_small: "Slippage too small",
  slippage_too_big: "Slippage too big",
  balance_update_soon: "Your balance will be updated soon",
};
