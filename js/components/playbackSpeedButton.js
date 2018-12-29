const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const ControlButton = require('./controlButton');
const Utils = require('./utils');
const CONSTANTS = require('../constants/constants');
const MACROS = require('../constants/macros');

class PlaybackSpeedButton extends React.Component {
  render() {
    const currentSpeed = Utils.getPropertyValue(
      this.props.controller,
      'state.playbackSpeedOptions.currentSpeed',
      1
    );
    const ariaLabel = CONSTANTS.ARIA_LABELS.PLAYBACK_SPEED_OPTION;

    return (
      <ControlButton
        {...this.props}
        className={classNames('oo-playback-speed', this.props.className)}
        ariaLabel={ariaLabel}
      >
        <span className="oo-current-speed oo-icon">
          {currentSpeed}
x
        </span>
        {this.props.children}
      </ControlButton>
    );
  }
}

PlaybackSpeedButton.propTypes = {
  controller: PropTypes.shape({
    state: PropTypes.shape({
      playbackSpeedOptions: PropTypes.shape({
        currentSpeed: PropTypes.number.isRequired,
      }),
    }),
  }),
};

module.exports = PlaybackSpeedButton;
