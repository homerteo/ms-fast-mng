import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FusePageCarded, FuseLoading } from '@fuse';
import withReducer from 'app/store/withReducer';
import reducer from '../store/reducers';
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PublicIcon from '@material-ui/icons/Public';
import DateRangeIcon from '@material-ui/icons/DateRange';
import * as Actions from '../store/actions';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statisticValue: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  statisticLabel: {
    fontSize: '1.2rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  chartContainer: {
    height: 400,
    padding: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: 400,
    marginTop: theme.spacing(2),
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
    marginTop: theme.spacing(1),
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  }
}));

function Dashboard() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector(({ auth }) => auth.user);
  const { statistics, loading } = useSelector(({ FastMngSharkAttackManagementApp }) => FastMngSharkAttackManagementApp.sharkAttacks);
  
  const T = new MDText(i18n.get(user.locale));
  
  useEffect(() => {
    if (user && user.selectedOrganization) {
      dispatch(Actions.getSharkAttackStatistics({
        organizationId: user.selectedOrganization.id
      }));
    }
  }, [dispatch, user]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!statistics || !statistics.attacksByCountry || !statistics.attacksByYear) {
      return {
        attacksByCountry: [],
        attacksByYear: []
      };
    }

    // Sort countries by count (descending) and take top 5
    const sortedCountries = [...statistics.attacksByCountry]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort years by year (ascending)
    const sortedYears = [...statistics.attacksByYear]
      .sort((a, b) => a.year - b.year);

    return {
      attacksByCountry: sortedCountries,
      attacksByYear: sortedYears
    };
  }, [statistics]);

  if (!user.selectedOrganization) {
    return <FuseLoading />;
  }

  const DashboardContent = () => (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* Total Attacks Card */}
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon className={classes.headerIcon} />
                  <Typography variant="h6">{T['dashboard.total_attacks']}</Typography>
                </Box>
              }
            />
            <CardContent className={classes.cardContent}>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <Typography className={classes.statisticValue}>
                    {statistics.totalAttacks ? statistics.totalAttacks.toLocaleString() : '0'}
                  </Typography>
                  <Typography className={classes.statisticLabel}>
                    {T['dashboard.total_attacks_description']}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Countries Summary */}
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <PublicIcon className={classes.headerIcon} />
                  <Typography variant="h6">{T['dashboard.top_countries']}</Typography>
                </Box>
              }
            />
            <CardContent>
              {loading ? (
                <div className={classes.loadingContainer}>
                  <CircularProgress />
                </div>
              ) : (
                <div className={classes.chipContainer}>
                  {chartData.attacksByCountry.slice(0, 3).map((item, index) => (
                    <Chip
                      key={item.country}
                      label={`${item.country}: ${item.count}`}
                      color={index === 0 ? 'primary' : 'default'}
                      variant={index === 0 ? 'default' : 'outlined'}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Year Range Summary */}
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <DateRangeIcon className={classes.headerIcon} />
                  <Typography variant="h6">{T['dashboard.year_range']}</Typography>
                </Box>
              }
            />
            <CardContent className={classes.cardContent}>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <Typography className={classes.statisticValue}>
                    {chartData.attacksByYear.length > 0
                      ? `${Math.min(...chartData.attacksByYear.map(item => item.year))} - ${Math.max(...chartData.attacksByYear.map(item => item.year))}`
                      : 'N/A'
                    }
                  </Typography>
                  <Typography className={classes.statisticLabel}>
                    {T['dashboard.data_range']}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attacks by Country Table */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.chartContainer}>
            <Typography variant="h6" gutterBottom>
              {T['dashboard.top_countries_chart_title']}
            </Typography>
            {loading ? (
              <div className={classes.loadingContainer}>
                <CircularProgress />
              </div>
            ) : (
              chartData.attacksByCountry.length > 0 ? (
                <Table className={classes.tableContainer}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Attacks</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.attacksByCountry.map((row, index) => {
                      const maxCount = chartData.attacksByCountry.length > 0 ? chartData.attacksByCountry[0].count : 1;
                      const percentage = ((row.count / maxCount) * 100).toFixed(1);
                      return (
                        <TableRow key={row.country}>
                          <TableCell component="th" scope="row">
                            {row.country}
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(percentage)}
                                className={classes.progressBar}
                                style={{ width: '60px', marginRight: '8px' }}
                              />
                              {percentage}%
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  {T['dashboard.no_data']}
                </Typography>
              )
            )}
          </Paper>
        </Grid>

        {/* Attacks by Year Table */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.chartContainer}>
            <Typography variant="h6" gutterBottom>
              {T['dashboard.attacks_by_year_chart_title']}
            </Typography>
            {loading ? (
              <div className={classes.loadingContainer}>
                <CircularProgress />
              </div>
            ) : (
              chartData.attacksByYear.length > 0 ? (
                <Table className={classes.tableContainer}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Attacks</TableCell>
                      <TableCell align="right">Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.attacksByYear.slice(-10).map((row, index, array) => {
                      const maxCount = Math.max(...chartData.attacksByYear.map(item => item.count));
                      const percentage = ((row.count / maxCount) * 100).toFixed(1);
                      return (
                        <TableRow key={row.year}>
                          <TableCell component="th" scope="row">
                            {row.year}
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(percentage)}
                                className={classes.progressBar}
                                style={{ width: '60px', marginRight: '8px' }}
                              />
                              {percentage}%
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  {T['dashboard.no_data']}
                </Typography>
              )
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );

  return (
    <FusePageCarded
      classes={{
        content: "flex",
        header: "min-h-72 h-72 sm:h-72 sm:min-h-72"
      }}
      header={
        <div className="flex flex-1 items-center justify-between p-24">
          <div className="flex flex-col">
            <Typography variant="h4" className="text-24 md:text-32 font-600">
              {T['dashboard.title']}
            </Typography>
            <Typography variant="subtitle1" className="text-16 sm:text-20 text-gray-600">
              {T['dashboard.subtitle']}
            </Typography>
          </div>
        </div>
      }
      content={<DashboardContent />}
      innerScroll
    />
  );
}

export default withReducer('FastMngSharkAttackManagementApp', reducer)(Dashboard);
