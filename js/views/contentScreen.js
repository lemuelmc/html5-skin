let React = require('react');

let CloseButton = require('../components/closeButton');

let Utils = require('../components/utils');

let CONSTANTS = require('../constants/constants');

let Icon = require('../components/icon');

let Watermark = require('../components/watermark');

let AccessibilityMixin = require('../mixins/accessibilityMixin');
let classNames = require('classnames');
let createReactClass = require('create-react-class');
let PropTypes = require('prop-types');

let ContentScreen = createReactClass({
  mixins: [AccessibilityMixin],

  componentDidMount: function() {
    if (this.props.autoFocus) {
      Utils.autoFocusFirstElement(this.domElement);
    }
  },

  storeRef: function(ref) {
    this.domElement = ref;
  },

  /**
   * Handles the keydown event while the screen is active.
   * @private
   * @param {event} event description
   */
  handleKeyDown: function(event) {
    switch (event.key) {
      case CONSTANTS.KEY_VALUES.ESCAPE:
        this.handleClose();
        break;
      default:
        break;
    }
  },

  handleClose: function() {
    switch (this.props.screen) {
      case CONSTANTS.SCREEN.DISCOVERY_SCREEN:
        this.props.controller.toggleDiscoveryScreen();
        break;
      case CONSTANTS.SCREEN.MULTI_AUDIO_SCREEN:
        this.props.controller.toggleMultiAudioScreen();
        break;
      default:
        this.props.controller.toggleScreen(this.props.screen);
    }
  },

  render: function() {
    // overlay only for the closed captions screen. Needs to be different than the other screens because of closed caption preview.
    let closedCaptionOverlay =
      this.props.screen === CONSTANTS.SCREEN.CLOSED_CAPTION_SCREEN ? (
        <div className="oo-closed-caption-overlay" />
      ) : null;

    let titleBarStyle = {};
    if (this.props.screen === CONSTANTS.SCREEN.DISCOVERY_SCREEN) {
      titleBarStyle.fontFamily = Utils.getPropertyValue(
        this.props.skinConfig,
        'discoveryScreen.panelTitle.titleFont.fontFamily'
      );
      titleBarStyle.color = Utils.getPropertyValue(
        this.props.skinConfig,
        'discoveryScreen.panelTitle.titleFont.color'
      );
    }

    // localized title bar, show nothing if no title text
    let titleBar = this.props.titleText ? (
      <div className="oo-content-screen-title" style={titleBarStyle}>
        {Utils.getLocalizedString(this.props.language, this.props.titleText, this.props.localizableStrings)}
        {this.props.icon &&
          <Icon {...this.props} icon={this.props.icon} />
        }
        {this.props.element}
      </div>
    ) : null;

    return (
      <div
        onKeyDown={this.handleKeyDown}
        ref={this.storeRef}>
        <Watermark {...this.props} controlBarVisible={false} nonClickable={true} />
        <div className={classNames('oo-content-screen', this.props.screenClassName)}>
          {closedCaptionOverlay}
          <div className={this.props.titleBarClassName}>{titleBar}</div>
          {this.props.children}
          <CloseButton {...this.props} closeAction={this.handleClose} />
        </div>
      </div>
    );
  },
});

ContentScreen.propTypes = {
  element: PropTypes.element,
  skinConfig: PropTypes.shape({
    discoveryScreen: PropTypes.shape({
      panelTitle: PropTypes.shape({
        titleFont: PropTypes.shape({
          color: PropTypes.string,
          fontFamily: PropTypes.string,
        }),
      }),
    }),
  }),
};

ContentScreen.defaultProps = {
  screen: CONSTANTS.SCREEN.SHARE_SCREEN,
  titleBarClassName: 'oo-content-screen-title-bar',
  titleText: '',
  element: null,
  icon: null,
  controller: {
    toggleScreen: function() {},
    state: {
      accessibilityControlsEnabled: true,
    },
  },
};

module.exports = ContentScreen;
