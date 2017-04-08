import { shell } from 'electron';
import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { ProgressBar, Button, Intent } from '@blueprintjs/core';

import { UNINSTALLING, INSTALLING, INSTALLED, UPDATING } from '../constants/statuses';
import { LATEST_SSB_VERSION } from '../constants/versions';

import { installApp, uninstallApp, updateApp } from '../actions/appManagement';
import openApp from '../helpers/openApp';
import getAppStatus from '../helpers/getAppStatus';

const extractDomain = (url) => {
  try {
    const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
    const domain = matches && matches[1];
    return domain.replace('www.', '');
  } catch (err) {
    return null;
  }
};

const Card = ({
  app, managedApps,
  requestUninstallApp,
  requestInstallApp,
  requestUpdateApp,
}) => (
  <div className="col">
    <div className="custom-card pt-card pt-elevation-1" style={{ textAlign: 'center' }}>
      {app.get('id').startsWith('custom-') ? null : (
        <img
          src={`https://cdn.rawgit.com/webcatalog/backend/compiled/images/${app.get('id')}@128px.webp`}
          role="presentation"
          alt={app.get('name')}
          style={{
            height: 64,
            width: 64,
            marginBottom: 8,
          }}
        />
      )}
      <h5>{app.get('name')}</h5>
      <p>
        <a onClick={() => shell.openExternal(app.get('url'))}>
          {extractDomain(app.get('url'))}
        </a>
      </p>
      {(() => {
        const appStatus = getAppStatus(managedApps, app.get('id'));

        if (appStatus === INSTALLING || appStatus === UNINSTALLING || appStatus === UPDATING) {
          return (
            <ProgressBar intent={Intent.PRIMARY} className="card-progress-bar" />
          );
        }
        if (appStatus === INSTALLED) {
          return [
            app.get('version') >= LATEST_SSB_VERSION ? (
              <Button
                key="open"
                text="Open"
                onClick={() => openApp(app.get('name'), app.get('id'))}
              />
            ) : (
              <Button
                key="update"
                text="Update"
                iconName="download"
                intent={Intent.SUCCESS}
                onClick={() => requestUpdateApp(app)}
              />
            ),
            <Button
              key="uninstall"
              text="Uninstall"
              iconName="trash"
              intent={Intent.DANGER}
              onClick={() => requestUninstallApp(app)}
              style={{ marginLeft: 6 }}
            />,
          ];
        }
        return (
          <Button
            key="install"
            text="Install"
            iconName="download"
            intent={Intent.PRIMARY}
            onClick={() => requestInstallApp(app)}
          />
        );
      })()}
    </div>
  </div>
);

Card.propTypes = {
  app: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  managedApps: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  requestInstallApp: React.PropTypes.func.isRequired,
  requestUninstallApp: React.PropTypes.func.isRequired,
  requestUpdateApp: React.PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  managedApps: state.appManagement.get('managedApps'),
});

const mapDispatchToProps = dispatch => ({
  requestInstallApp: (app) => {
    dispatch(installApp(app));
  },
  requestUninstallApp: (app) => {
    dispatch(uninstallApp(app));
  },
  requestUpdateApp: (app) => {
    dispatch(updateApp(app));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Card);
