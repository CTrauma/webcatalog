import React from 'react';

import PropTypes from 'prop-types';

import { LinearProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';

import connectComponent from '../../helpers/connect-component';

import AppCard from '../../shared/app-card';
import getCategoryLabel from '../../helpers/get-category-label';
import {
  getApps,
  resetAndGetApps,
  setSortBy,
} from '../../actions/pages/top-charts/actions';

import {
  STRING_NEW_APPS_IN_CATEGORY,
  STRING_NEW_APPS,
  STRING_TOP_APPS_IN_CATEGORY,
  STRING_TOP_APPS,
} from '../../constants/strings';

import NoConnection from '../../shared/no-connection';
import PromoBar from '../../shared/promo-bar';

import FilterMenuButton from './filter-menu-button';

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tab: {
    width: 225,
  },
  paper: {
    zIndex: 1,
    display: 'flex',
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  tabs: {
    flex: 1,
    boxSizing: 'border-box',
  },
  buttonContainer: {
    flex: '0 0 48px',
  },
  scrollContainer: {
    flex: 1,
    padding: theme.spacing.unit * 2,
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  grid: {
    marginBottom: theme.spacing.unit,
  },
});

class TopCharts extends React.Component {
  componentDidMount() {
    const {
      onGetApps,
      onResetAndGetApps,
    } = this.props;

    onResetAndGetApps();

    const el = this.scrollContainer;

    el.onscroll = () => {
      // Plus 300 to run ahead.
      if (el.scrollTop + 300 >= el.scrollHeight - el.offsetHeight) {
        onGetApps();
      }
    };
  }

  render() {
    const {
      apps,
      category,
      classes,
      hasFailed,
      isGetting,
      onGetApps,
      onSetSortBy,
      sortBy,
    } = this.props;

    let tabIndex = 0;
    if (sortBy === 'createdAt') tabIndex = 1;

    const categoryLabel = getCategoryLabel(category);

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <div className={classes.buttonContainer} />

          <Tabs
            className={classes.tabs}
            value={tabIndex}
            indicatorColor="primary"
            textColor="primary"
            centered
            onChange={(event, index) => {
              if (index === 0) return onSetSortBy('installCount', 'desc');

              return onSetSortBy('createdAt', 'desc');
            }}
          >
            <Tab
              className={classes.tab}
              label={category ? STRING_TOP_APPS_IN_CATEGORY.replace('{category}', categoryLabel) : STRING_TOP_APPS}
            />
            <Tab
              className={classes.tab}
              label={category ? STRING_NEW_APPS_IN_CATEGORY.replace('{category}', categoryLabel) : STRING_NEW_APPS}
            />
          </Tabs>

          <div className={classes.buttonContainer}>
            <FilterMenuButton />
          </div>
        </Paper>
        <div
          className={classes.scrollContainer}
          ref={(container) => { this.scrollContainer = container; }}
        >
          {hasFailed ? (
            <NoConnection
              onTryAgainButtonClick={onGetApps}
            />
          ) : (
            <Grid container className={classes.grid}>
              <Grid item xs={12}>
                <PromoBar />
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="center" spacing={24}>
                  {apps.map(app => <AppCard key={app.id} app={app} />)}
                </Grid>
              </Grid>
            </Grid>
          )}
          {isGetting && (<LinearProgress />)}
        </div>
      </div>
    );
  }
}

TopCharts.defaultProps = {
  category: null,
  sortBy: null,
};

TopCharts.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  category: PropTypes.string,
  classes: PropTypes.object.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  isGetting: PropTypes.bool.isRequired,
  onGetApps: PropTypes.func.isRequired,
  onResetAndGetApps: PropTypes.func.isRequired,
  onSetSortBy: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
};

const mapStateToProps = (state) => {
  const {
    apiData,
    hasFailed,
    isGetting,
    queryParams,
  } = state.pages.topCharts;

  const {
    apps,
  } = apiData;

  const {
    category,
    sortBy,
  } = queryParams;

  return {
    apps,
    category,
    hasFailed,
    isGetting,
    sortBy,
  };
};

const actionCreators = {
  resetAndGetApps,
  getApps,
  setSortBy,
};

export default connectComponent(
  TopCharts,
  mapStateToProps,
  actionCreators,
  styles,
);
