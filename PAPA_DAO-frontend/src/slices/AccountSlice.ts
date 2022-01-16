import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sPAPAv2 } from "../abi/sPapav2.json";
import { abi as wsPAPA } from "../abi/wsPapa.json";
import { abi as PapaStakingv2 } from "../abi/PapaStakingv2.json";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const papaContract = new ethers.Contract(addresses[networkID].PAPA_ADDRESS as string, ierc20Abi, provider);
    const papaBalance = await papaContract.balanceOf(address);
    const spapaContract = new ethers.Contract(addresses[networkID].SPAPA_ADDRESS as string, ierc20Abi, provider);
    const spapaBalance = await spapaContract.balanceOf(address);
    const wspapaContract = new ethers.Contract(addresses[networkID].WSPAPA_ADDRESS as string, wsPAPA, provider);
    const wspapaBalance = await wspapaContract.balanceOf(address);
    const wspapaAsSpapa = await wspapaContract.wsPAPATosPAPA(wspapaBalance);

    return {
      balances: {
        hec: ethers.utils.formatUnits(papaBalance, "gwei"),
        shec: ethers.utils.formatUnits(spapaBalance, "gwei"),
        wshec: ethers.utils.formatEther(wspapaBalance),
        wspapaAsSpapa: ethers.utils.formatUnits(wspapaAsSpapa, "gwei"),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {
    let papaBalance = 0;
    let spapaBalance = 0;
    let oldspapaBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let oldunstakeAllowance = 0;
    let daiBondAllowance = 0;
    let depositAmount = 0;
    let warmUpAmount = 0;
    let expiry = 0;

    const daiContract = new ethers.Contract(addresses[networkID].MIM_ADDRESS as string, ierc20Abi, provider);
    const daiBalance = await daiContract.balanceOf(address);

    const papaContract = new ethers.Contract(addresses[networkID].PAPA_ADDRESS as string, ierc20Abi, provider);
    papaBalance = await papaContract.balanceOf(address);
    stakeAllowance = await papaContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    const spapaContract = new ethers.Contract(addresses[networkID].SPAPA_ADDRESS as string, sPAPAv2, provider);
    spapaBalance = await spapaContract.balanceOf(address);
    unstakeAllowance = await spapaContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    const wrapAllowance = await spapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);

    const oldspapaContract = new ethers.Contract(addresses[networkID].OLD_SPAPA_ADDRESS as string, sPAPAv2, provider);
    oldspapaBalance = await oldspapaContract.balanceOf(address);
    oldunstakeAllowance = await oldspapaContract.allowance(address, addresses[networkID].OLD_STAKING_ADDRESS);

    const wspapaContract = new ethers.Contract(addresses[networkID].WSPAPA_ADDRESS as string, wsPAPA, provider);
    const unwrapAllowance = await wspapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);
    const wspapaBalance = await wspapaContract.balanceOf(address);

    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, PapaStakingv2, provider,);
    const warmupInfo = (await stakingContract.warmupInfo(address));
    depositAmount = warmupInfo.deposit;
    warmUpAmount = +ethers.utils.formatUnits((await spapaContract.balanceForGons(warmupInfo.gons)), "gwei");
    expiry = warmupInfo.expiry;

    return {
      balances: {
        dai: ethers.utils.formatEther(daiBalance),
        hec: ethers.utils.formatUnits(papaBalance, "gwei"),
        shec: ethers.utils.formatUnits(spapaBalance, "gwei"),
        oldshec: ethers.utils.formatUnits(oldspapaBalance, "gwei"),
        wspapa: ethers.utils.formatEther(wspapaBalance),
      },
      staking: {
        hecStake: +stakeAllowance,
        hecUnstake: +unstakeAllowance,
        oldhecUnstake: +oldunstakeAllowance,
      },
      wrapping: {
        hecWrap: +wrapAllowance,
        hecUnwrap: +unwrapAllowance,
      },
      warmup: {
        depositAmount: ethers.utils.formatUnits(depositAmount, "gwei"),
        warmUpAmount,
        expiryBlock: expiry,
      },
      bonding: {
        daiAllowance: daiBondAllowance,
      },
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        isFour: false,
        isOld: undefined,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
      balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    // let balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    let deciamls = 18;
    let balanceVal;
    if (bond.isLP) {
      deciamls = 18;
    }
    balanceVal = ethers.utils.formatEther(balance);
    if (bond.decimals) {
      balanceVal = ethers.utils.formatUnits(balance, "mwei");
    }
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      isFour: bond.isFour,
      isOld: bond.isOld,
      allowance: Number(allowance),
      balance: balanceVal.toString(),
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    hec: string;
    shec: string;
    dai: string;
    oldshec: string;
    wshec: string;
    wspapaAsSpapa: string;
  };
  wrapping: {
    shecWrap: number;
    wshecUnwrap: number;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { hec: "", shec: "", dai: "", oldshec: "", wshec: "", wspapaAsSpapa: "" },
  wrapping: { shecWrap: 0, wshecUnwrap: 0 },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
