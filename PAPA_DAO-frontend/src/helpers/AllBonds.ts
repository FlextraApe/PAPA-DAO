import { StableBond, LPBond, NetworkID, CustomBond, BondType } from "src/lib/Bond";
import { addresses } from "src/constants";

import { ReactComponent as PAPAMimimg } from "src/assets/tokens/PAPA-MIM.svg";
import { ReactComponent as wAVAXImg } from "src/assets/tokens/wAVAX.svg";
import { ReactComponent as MimImg } from "src/assets/tokens/MIM.svg";
import { ReactComponent as UsdtImg } from "src/assets/tokens/USDT.svg";
import { ReactComponent as PapaAvaxImg } from "src/assets/tokens/PAPA-wAVAX.svg";

import { abi as BondPapaMimContract } from "src/abi/bonds/PapaMimContract.json";
import { abi as BondPapaAvaxContract } from "src/abi/bonds/BondPapaAvaxContract.json";
import { abi as ReservePapaAvaxContract } from "src/abi/reserves/ReservePapaAvax.json";
import { abi as UsdtBondContract } from "src/abi/bonds/UsdtContrat.json";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { abi as MimBondContract4 } from "src/abi/bonds/MimBondContract_4.json";
import { abi as MimBondContract4V2 } from "src/abi/bonds/Mim4V2Contract.json";
import { abi as PapaMimBondContract4 } from "src/abi/bonds/PapaMimBondContract_4.json";
import { abi as PapaMimBondContract4V2 } from "src/abi/bonds/PapaMim4V2Contract.json";
import { abi as ReservePapaMimContract } from "src/abi/reserves/PapaMim.json";
import { getBondCalculator } from "src/helpers/BondCalculator";

import { abi as EthBondContract } from "src/abi/bonds/AvaxContract.json";

import { abi as ierc20Abi } from "src/abi/IERC20.json";

// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const mim = new StableBond({
  name: "mim",
  displayName: "MIM",
  bondToken: "MIM",
  bondIconSvg: MimImg,
  bondContractABI: MimBondContract,
  fourAddress: "0xe416939731c5d308CBA5B6FA0C4A32A9d2f125B4",
  additionValue: -1150261659697897638102474,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x654d5796B2C70D24eD7402e87D8a72BddF87ccca",
      reserveAddress: "0x130966628846bfd36ff31a822705796e8cb8c18d",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xDea5668E815dAF058e3ecB30F645b04ad26374Cf",
      reserveAddress: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C",
    },
  },
});
export const usdt = new StableBond({
  name: "usdt",
  displayName: "USDT",
  bondToken: "USDT",
  decimals: 6,
  bondIconSvg: UsdtImg,
  bondContractABI: UsdtBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x3e185190f044B3c887b65c11657B0d5433560618",
      reserveAddress: "0xc7198437980c041c805a1edcba50c1ce5db95118"
    },
    [NetworkID.Testnet]: {
      bondAddress: "",
      reserveAddress: "",
    },
  },
});
export const avax = new CustomBond({
  name: "avax",
  displayName: "wAVAX",
  lpUrl: "",
  bondType: BondType.StableAsset,
  bondToken: "WAVAX",
  bondIconSvg: wAVAXImg,
  bondContractABI: EthBondContract,
  reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x63933d4e91C84baE6577744fd75c4f4f2C44d901",
      reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xca7b90f8158A4FAA606952c023596EE6d322bcf0",
      reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    },
  },
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    const ethBondContract = this.getContractForBond(networkID, provider);
    let ethPrice = await ethBondContract.assetPrice();
    ethPrice = ethPrice / Math.pow(10, 8);
    const token = this.getContractForReserve(networkID, provider);
    let avaxAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    avaxAmount = avaxAmount / Math.pow(10, 18);
    return avaxAmount * ethPrice;
  },
});

export const papa_mim = new LPBond({
  name: "papa_mim_lp",
  displayName: "PAPA-MIM LP",
  bondToken: "MIM",
  bondIconSvg: PAPAMimimg,
  bondContractABI: BondPapaMimContract,
  reserveContract: ReservePapaMimContract,
  fourAddress: "0x72B6623055Cf0205A652773F8d2d6aA00229a030",
  substractionValue: 3626460866383219298,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x35B912024f639757bE4f1A11e4420412af34E661",
      reserveAddress: "0xA03a99CD3d553fE9EbBcCecAbcB8c47100482F72",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://traderjoexyz.com/#/pool/0x70b33ebC5544C12691d055b49762D0F8365d99Fe/0x130966628846BFd36ff31a822705796e8cb8C18D",
});

export const papa_wavax = new CustomBond({
  name: "papa_wavax_lp",
  displayName: "PAPA-wAVAX LP",
  bondToken: "WAVAX",
  bondIconSvg: PapaAvaxImg,
  bondContractABI: BondPapaAvaxContract,
  reserveContract: ReservePapaAvaxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x6045dd16eE5CBE4a0D09FD28AbBc68DCD71f2bf6",
      reserveAddress: "0x29828626CA711B0E13de1031aaE1F5423100E642",
    },
    [NetworkID.Testnet]: {
      // NOTE (unbanksy): using ohm-dai rinkeby contracts
      bondAddress: "",
      reserveAddress: "",
    },
  },
  bondType: BondType.LP,
  lpUrl:
    "https://traderjoexyz.com/#/pool/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/0x70b33ebC5544C12691d055b49762D0F8365d99Fe",
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
      const ethBondContract = this.getContractForBond(networkID, provider);
      let ethPrice = await ethBondContract.assetPrice();
      ethPrice = Number(ethPrice.toString()) / Math.pow(10, 8);
      const token = this.getContractForReserve(networkID, provider);
      const tokenAddress = this.getAddressForReserve(networkID);
      const bondCalculator = getBondCalculator(networkID, provider);
      const tokenAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
      const valuation = await bondCalculator.valuation(tokenAddress || "", tokenAmount);
      const markdown = await bondCalculator.markdown(tokenAddress || "");
      let tokenUSD =
        (Number(valuation.toString()) / Math.pow(10, 9)) * (Number(markdown.toString()) / Math.pow(10, 18));
      return tokenUSD * Number(ethPrice.toString());
    },
});

export const mim4 = new StableBond({
  name: "mim4",
  displayName: "MIM",
  bondToken: "MIM",
  bondIconSvg: MimImg,
  isFour: true,
  isTotal: true,
  isOld: true,
  bondContractABI: MimBondContract4,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xb5e4a9002b060d29D6752297e4ffd335bab34ba3",
      reserveAddress: "0x130966628846bfd36ff31a822705796e8cb8c18d",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xDea5668E815dAF058e3ecB30F645b04ad26374Cf",
      reserveAddress: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C",
    },
  },
});

export const mim4_v2 = new StableBond({
  name: "mim4_v2",
  displayName: "MIM",
  bondToken: "MIM",
  bondIconSvg: MimImg,
  isFour: true,
  isTotal: true,
  bondContractABI: MimBondContract4V2,
  additionValue: 1150261659697897638102474,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xe416939731c5d308CBA5B6FA0C4A32A9d2f125B4",
      reserveAddress: "0x130966628846bfd36ff31a822705796e8cb8c18d",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xDea5668E815dAF058e3ecB30F645b04ad26374Cf",
      reserveAddress: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C",
    },
  },
});

export const papa_mim_4 = new LPBond({
  name: "papa_mim_lp4",
  displayName: "PAPA-MIM LP",
  bondToken: "MIM",
  bondIconSvg: PAPAMimimg,
  isFour: true,
  isTotal: true,
  bondContractABI: PapaMimBondContract4,
  reserveContract: ReservePapaMimContract,
  isOld: true,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x04B0dB0bD9BaB2E5854ff5Cca0A30D0C56459B9b",
      reserveAddress: "0xA03a99CD3d553fE9EbBcCecAbcB8c47100482F72",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://traderjoexyz.com/#/pool/0x70b33ebC5544C12691d055b49762D0F8365d99Fe/0x130966628846BFd36ff31a822705796e8cb8C18D",
});

export const papa_mim_4_v2 = new LPBond({
  name: "papa_mim_lp4_v2",
  displayName: "PAPA-MIM LP",
  bondToken: "MIM",
  bondIconSvg: PAPAMimimg,
  isFour: true,
  isTotal: true,
  bondContractABI: PapaMimBondContract4V2,
  reserveContract: ReservePapaMimContract,
  additionValue: 3626460866383219298,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x72B6623055Cf0205A652773F8d2d6aA00229a030",
      reserveAddress: "0xA03a99CD3d553fE9EbBcCecAbcB8c47100482F72",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://traderjoexyz.com/#/pool/0x70b33ebC5544C12691d055b49762D0F8365d99Fe/0x130966628846BFd36ff31a822705796e8cb8C18D",
});

// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
export const allBonds = [papa_mim, mim, usdt, avax, papa_wavax, mim4_v2, papa_mim_4_v2];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
// console.log(allBondsMap);
export default allBonds;
