import { useEffect, useState } from "react";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency } from "../../helpers";
import {
  treasuryDataQuery,
  rebasesV1DataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/AllBonds";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState([]);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const rebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const backingPerPapa = useSelector(state => {
    if (state.bonding.loading === false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      const backingperpapa = tokenBalances / state.app.circSupply + 0.3;
      return backingperpapa;
    }
  });

  const wsHecPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  useEffect(() => {
    apollo(treasuryDataQuery).then(r => {
      let metrics = r?.data?.protocolMetrics.map(entry =>
        Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
      );
      let staked = r?.data?.protocolMetrics.map(entry => ({
        staked: (parseFloat(entry.sPapaCirculatingSupply) / parseFloat(entry.papaCirculatingSupply)) * 100,
        timestamp: entry.timestamp,
      }));

      if (staked) {
        staked = staked.filter(pm => pm.staked < 100);
        setStaked(staked);
      }

      if (metrics) {
        metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
        setData(metrics);
        const runway = metrics.filter(pm => (pm.runwayCurrent > 5 && pm.runwayCurrent < 2000));
        setRunway(runway);
      }
    });

    apollo(rebasesV1DataQuery).then(r => {
      let apy = r?.data?.rebases.map(entry => ({
        apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 3) * 100,
        timestamp: entry.timestamp - (entry.timestamp % (3600 * 4)),
      }));
      if (apy) {
        apy = apy.filter(pm => pm.apy < 5000000);
        setApy(apy);
      }
    });
  }, []);

  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className={`hero-metrics`}>
          <Paper className="papa-card">
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
              <Box className="metric market">
                <Typography variant="h6" color="textSecondary">
                  Market Cap
                </Typography>
                <Typography variant="h5">
                  {marketCap && formatCurrency(marketCap, 0)}
                  {!marketCap && <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric price">
                <Typography variant="h6" color="textSecondary">
                  PAPA Price
                </Typography>
                <Typography variant="h5">
                  {/* appleseed-fix */}
                  {marketPrice ? formatCurrency(marketPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric wsoprice">
                <Typography variant="h6" color="textSecondary">
                  wsPAPA Price
                  <InfoTooltip
                    message={
                      "wsPAPA = sPAPA * index\n\nThe price of wsPAPA is equal to the price of PAPA multiplied by the current index"
                    }
                  />
                </Typography>

                <Typography variant="h5">
                  {wsHecPrice ? formatCurrency(wsHecPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric circ">
                <Typography variant="h6" color="textSecondary">
                  Circulating Supply (total)
                </Typography>
                <Typography variant="h5">
                  {circSupply && totalSupply ? (
                    parseInt(circSupply) + " / " + parseInt(totalSupply)
                  ) : (
                    <Skeleton type="text" />
                  )}
                </Typography>
              </Box>

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                  Backing per PAPA
                </Typography>
                <Typography variant="h5">
                  {backingPerPapa ? formatCurrency(backingPerPapa, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric index">
                <Typography variant="h6" color="textSecondary">
                  Current Index
                  <InfoTooltip
                    message={
                      "The current index tracks the amount of sPAPA accumulated since the beginning of staking. Basically, how much sPAPA one would have if they staked and held a single PAPA from day 1."
                    }
                  />
                </Typography>
                <Typography variant="h5">
                  {currentIndex ? trim(currentIndex, 2) + " sPAPA" : <Skeleton type="text" />}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Zoom in={true}>
          <Grid container spacing={2} className="data-grid">
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["totalValueLocked"]}
                  stopColor={[["#768299", "#98B3E9"]]}
                  headerText="Total Value Deposited"
                  headerSubText={`${data && formatCurrency(data[0].totalValueLocked)}`}
                  bulletpointColors={bulletpoints.tvl}
                  itemNames={tooltipItems.tvl}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.tvl}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  dataKey={[
                    "treasuryMIMMarketValue",
                    "treasuryUsdtMarketValue",
                    "treasuryWAVAXMarketValue",
                  ]}
                  stopColor={[
                    ["#F5AC37", "#EA9276"],
                    ["#768299", "#98B3E9"],
                    ["#8351ff", "#b151ff"],
                    ["#c6c6c6", "#545454"],
                    ["#ffffff", "#d5d5d5"],
                    ["#22d5e7", "#18919d"],
                  ]}
                  headerText="Market Value of Treasury Assets"
                  headerSubText={`${data && formatCurrency(data[0].treasuryMarketValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.mvt}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  format="currency"
                  dataKey={[
                    "treasuryMIMRiskFreeValue",
                    "treasuryUsdtRiskFreeValue",
                    "treasuryWAVAXRiskFreeValue",
                  ]}
                  stopColor={[
                    ["#F5AC37", "#EA9276"],
                    ["#768299", "#98B3E9"],
                    ["#8351ff", "#b151ff"],
                    ["#c6c6c6", "#545454"],
                    ["#ffffff", "#d5d5d5"],
                    ["#22d5e7", "#18919d"],
                  ]}
                  headerText="Risk Free Value of Treasury Assets"
                  headerSubText={`${data && formatCurrency(data[0].treasuryRiskFreeValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.rfv}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["treasuryPapaMimPOL"]}
                  stopColor={[["rgba(128, 204, 131, 1)", "rgba(128, 204, 131, 0)"]]}
                  headerText="Protocol Owned Liquidity PAPA-MIM"
                  headerSubText={`${data && trim(data[0].treasuryPapaMimPOL, 2)}% `}
                  dataFormat="percent"
                  bulletpointColors={bulletpoints.pol}
                  itemNames={tooltipItems.pol}
                  itemType={itemType.percentage}
                  infoTooltipMessage={tooltipInfoMessages.pol}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  isPOL={true}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="area"
                  data={staked}
                  dataKey={["staked"]}
                  stopColor={[["#55EBC7", "#47ACEB"]]}
                  headerText="PAPA Staked"
                  dataFormat="percent"
                  headerSubText={`${staked && trim(staked[0].staked, 2)}% `}
                  isStaked={true}
                  bulletpointColors={bulletpoints.staked}
                  infoTooltipMessage={tooltipInfoMessages.staked}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="papa-card papa-chart-card">
                <Chart
                  type="line"
                  data={runway}
                  dataKey={["runwayCurrent"]}
                  color={theme.palette.text.primary}
                  stroke={[theme.palette.text.primary]}
                  headerText="Runway Available"
                  headerSubText={`${data && trim(data[0].runwayCurrent, 1)} Days`}
                  dataFormat="days"
                  bulletpointColors={bulletpoints.runway}
                  itemNames={tooltipItems.runway}
                  itemType={""}
                  infoTooltipMessage={tooltipInfoMessages.runway}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>
          </Grid>
        </Zoom>
      </Container>
    </div>
  );
}

export default TreasuryDashboard;
