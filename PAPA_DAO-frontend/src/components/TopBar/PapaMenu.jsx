import { useState, useEffect } from "react";
import { addresses, TOKEN_DECIMALS } from "../../constants";
import { Link, SvgIcon, Popper, Button, Paper, Typography, Divider, Box, Fade, Slide } from "@material-ui/core";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as spapaTokenImg } from "../../assets/tokens/SPAPA.svg";
import { ReactComponent as papaTokenImg } from "../../assets/tokens/PAPA.svg";
import { ReactComponent as wspapaTokenImg } from "../../assets/tokens/PAPA.svg";

import "./papamenu.scss";
import { useWeb3Context } from "../../hooks/web3Context";

import PAPAImg from "src/assets/tokens/PAPA.png";
import sPAPAImg from "src/assets/tokens/SPAPA.png";
import wsPAPAImg from "src/assets/tokens/SPAPA.png";
import { NavLink } from "react-router-dom";

const addTokenToWallet = (tokenSymbol, tokenAddress) => async () => {
  if (window.ethereum) {
    const host = window.location.origin;
    // NOTE (appleseed): 33T token defaults to sPAPA logo since we don't have a 33T logo yet
    let tokenPath, decimals;
    switch (tokenSymbol) {
      case "wsPAPA":
        tokenPath = wsPAPAImg;
        decimals = 18;
        break;
      case "PAPA":
        tokenPath = PAPAImg;
        decimals = 9;
        break;
      default:
        tokenPath = sPAPAImg;
    }
    const imageURL = `${host}/${tokenPath}`;

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: TOKEN_DECIMALS,
            image: imageURL,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

function PapaMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isEthereumAPIAvailable = window.ethereum;
  const { chainID } = useWeb3Context();

  const networkID = chainID;

  const SPAPA_ADDRESS = addresses[networkID].SPAPA_ADDRESS;
  const PAPA_ADDRESS = addresses[networkID].PAPA_ADDRESS;
  const WSPAPA_ADDRESS = addresses[networkID].WSPAPA_ADDRESS;

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = "papa-popper";
  return (
    <Box
      component="div"
      onMouseEnter={e => handleClick(e)}
      onMouseLeave={e => handleClick(e)}
      id="papa-menu-button-hover"
    >
      <Button id="papa-menu-button" size="large" variant="contained" color="secondary" title="PAPA" aria-describedby={id}>
        <SvgIcon component={InfoIcon} color="primary" />
        <Typography>PAPA</Typography>
      </Button>

      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition>
        {({ TransitionProps }) => {
          return (
            <Fade {...TransitionProps} timeout={100}>
              <Paper className="papa-menu" elevation={1}>
                <Box component="div" className="buy-tokens">
                  <Link
                    href={`https://traderjoexyz.com/#/trade?inputCurrency=&outputCurrency=${PAPA_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Buy on Trader Joe <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link>

                  <Link component={NavLink} to="/wrap" style={{ textDecoration: "none" }}>
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">Wrap sPAPA</Typography>
                    </Button>
                  </Link>
                </Box>

                {isEthereumAPIAvailable ? (
                  <Box className="add-tokens">
                    <Divider color="secondary" />
                    <p>ADD TOKEN TO WALLET</p>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                      <Button variant="contained" color="secondary" onClick={addTokenToWallet("PAPA", PAPA_ADDRESS)}>
                        <SvgIcon
                          component={papaTokenImg}
                          viewBox="0 0 100 100"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">PAPA</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" onClick={addTokenToWallet("sPAPA", SPAPA_ADDRESS)}>
                        <SvgIcon
                          component={spapaTokenImg}
                          viewBox="0 0 100 100"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">sPAPA</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" onClick={addTokenToWallet("wsHPAPA", WSPAPA_ADDRESS)}>
                        <SvgIcon
                          component={wspapaTokenImg}
                          viewBox="0 0 100 100"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">wsPAPA</Typography>
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Paper>
            </Fade>
          );
        }}
      </Popper>
    </Box>
  );
}

export default PapaMenu;
