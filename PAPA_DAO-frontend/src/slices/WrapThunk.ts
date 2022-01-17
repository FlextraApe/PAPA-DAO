import { ethers, BigNumber } from "ethers";
import { addresses, messages } from "../constants";
import { abi as ierc20ABI } from "../abi/IERC20.json";
import { abi as wsPAPA } from "../abi/wsPapa.json";
import { clearPendingTxn, fetchPendingTxns, getWrappingTypeText } from "./PendingTxnsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, loadAccountDetails } from "./AccountSlice";
import { error, info, success } from "../slices/MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError } from "./interfaces";
import { sleep } from "src/helpers/Sleep";
import { metamaskErrorWrap } from "src/helpers/MetamaskErrorWrap";

interface IUAData {
  address: string;
  value: string;
  approved: boolean;
  txHash: string | null;
  type: string | null;
}

function alreadyApprovedToken(token: string, wrapAllowance: BigNumber, unwrapAllowance: BigNumber) {
  // set defaults
  let bigZero = BigNumber.from("0");
  let applicableAllowance = bigZero;

  // determine which allowance to check
  if (token === "spapa") {
    applicableAllowance = wrapAllowance;
  } else if (token === "wspapa") {
    applicableAllowance = unwrapAllowance;
  }

  // check if allowance exists
  if (applicableAllowance.gt(bigZero)) return true;

  return false;
}

export const changeApproval = createAsyncThunk(
  "wrap/changeApproval",
  async ({ token, provider, address, networkID }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const spapaContract = new ethers.Contract(addresses[networkID].SPAPA_ADDRESS as string, ierc20ABI, signer);
    const wspapaContract = new ethers.Contract(addresses[networkID].WSPAPA_ADDRESS as string, wsPAPA, signer);
    let approveTx;
    let wrapAllowance = await spapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);
    let unwrapAllowance = await wspapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);

    // return early if approval has already happened
    if (alreadyApprovedToken(token, wrapAllowance, unwrapAllowance)) {
      dispatch(info("Approval completed."));
      return dispatch(
        fetchAccountSuccess({
          wrapping: {
            papaWrap: +wrapAllowance,
            papaUnwrap: +unwrapAllowance,
          },
        }),
      );
    }

    try {
      if (token === "spapa") {
        // won't run if wrapAllowance > 0
        approveTx = await spapaContract.approve(
          addresses[networkID].WSPAPA_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      } else if (token === "wspapa") {
        approveTx = await wspapaContract.approve(
          addresses[networkID].WSPAPA_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      }

      const text = "Approve " + (token === "spapa" ? "Wrapping" : "Unwrapping");
      const pendingTxnType = token === "spapa" ? "approve_wrapping" : "approve_unwrapping";
      if (approveTx) {
        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

        await approveTx.wait();
        dispatch(success(messages.tx_successfully_send));
      }
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    await sleep(2);
    // go get fresh allowances
    wrapAllowance = await spapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);
    unwrapAllowance = await wspapaContract.allowance(address, addresses[networkID].WSPAPA_ADDRESS);

    return dispatch(
      fetchAccountSuccess({
        wrapping: {
          papaWrap: +wrapAllowance,
          papaUnwrap: +unwrapAllowance,
        },
      }),
    );
  },
);

export const changeWrap = createAsyncThunk(
  "wrap/changeWrap",
  async ({ action, value, provider, address, networkID }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const wspapaContract = new ethers.Contract(addresses[networkID].WSPAPA_ADDRESS as string, wsPAPA, signer);

    let wrapTx;
    let uaData: IUAData = {
      address: address,
      value: value,
      approved: true,
      txHash: null,
      type: null,
    };
    try {
      if (action === "wrap") {
        uaData.type = "wrap";
        wrapTx = await wspapaContract.wrap(ethers.utils.parseUnits(value, "gwei"));
      } else {
        uaData.type = "unwrap";
        wrapTx = await wspapaContract.unwrap(ethers.utils.parseUnits(value));
      }
      const pendingTxnType = action === "wrap" ? "wrapping" : "unwrapping";
      uaData.txHash = wrapTx.hash;
      dispatch(fetchPendingTxns({ txnHash: wrapTx.hash, text: getWrappingTypeText(action), type: pendingTxnType }));
      await wrapTx.wait();
      dispatch(success(messages.tx_successfully_send));
    } catch (e: unknown) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (wrapTx) {

        dispatch(clearPendingTxn(wrapTx.hash));
      }
    }
    await sleep(10);
    dispatch(info(messages.balance_update_soon));
    await sleep(15);
    await dispatch(loadAccountDetails({ address, networkID, provider }));
    dispatch(info(messages.balance_updated));
  },
);
