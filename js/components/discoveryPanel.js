/**
 * Panel component for Discovery Screen
 *
 * @module DiscoveryPanel
 */
var React = require('react'),
    ReactDOM = require('react-dom'),
    ClassNames = require('classnames'),
    Utils = require('./utils'),
    CONSTANTS = require('../constants/constants'),
    CountDownClock = require('./countDownClock'),
    DiscoverItem = require('./discoverItem'),
    ResizeMixin = require('../mixins/resizeMixin'),
    Icon = require('../components/icon');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

var DiscoveryPanel = createReactClass({
  mixins: [ResizeMixin],

  getInitialState: function() {
    return {
      showDiscoveryCountDown:
        this.props.skinConfig.discoveryScreen.showCountDownTimerOnEndScreen || this.props.forceCountDownTimer,
      currentPage: 1,
      componentHeight: null,
      shownAssets: -1
    };
  },

  componentDidMount: function() {
    this.detectHeight();
  },

  handleResize: function(nextProps) {
    // If we are changing view sizes, adjust the currentPage number to reflect the new number of items per page.
    var currentViewSize = this.props.responsiveView;
    var nextViewSize = nextProps.responsiveView;
    var firstDiscoverIndex =
      this.state.currentPage * this.props.videosPerPage[currentViewSize] -
      this.props.videosPerPage[currentViewSize];
    var newCurrentPage = Math.floor(firstDiscoverIndex / nextProps.videosPerPage[nextViewSize]) + 1;
    this.setState({
      currentPage: newCurrentPage
    });
    this.detectHeight();
  },

  handleLeftButtonClick: function(event) {
    event.preventDefault();
    this.setState({
      currentPage: this.state.currentPage - 1
    });
  },

  handleRightButtonClick: function(event) {
    event.preventDefault();
    this.setState({
      currentPage: this.state.currentPage + 1
    });
  },

  handleDiscoveryContentClick: function(index) {
    const currentViewSize = this.props.responsiveView;
    const videosPerPage = this.props.videosPerPage[currentViewSize];
    const assetPosition = (index % videosPerPage) + 1;
    const asset = this.props.discoveryData.relatedVideos[index];
    const customData = {
      source: CONSTANTS.SCREEN.DISCOVERY_SCREEN,
      autoplay: false
    };
    const eventData = {
      clickedVideo: asset,
      custom: customData,
      metadata : Utils.getDiscoveryEventData(assetPosition, videosPerPage, CONSTANTS.UI_TAG.DISCOVERY, asset, customData)
    };
    // TODO: figure out countdown value
    // eventData.custom.countdown = 0;
    this.props.controller.sendDiscoveryClickEvent(eventData, false);
  },

  shouldShowCountdownTimer: function() {
    return this.state.showDiscoveryCountDown && this.props.playerState === CONSTANTS.STATE.END;
  },

  handleDiscoveryCountDownClick: function(event) {
    event.preventDefault();
    this.setState({
      showDiscoveryCountDown: false
    });
    this.refs.CountDownClock.handleClick(event);
  },

  // detect height of component
  detectHeight: function() {
    var discoveryPanel = ReactDOM.findDOMNode(this.refs.discoveryPanel);
    this.setState({
      componentHeight: discoveryPanel.getBoundingClientRect().height
    });
  },

  render: function() {
    var relatedVideos = this.props.discoveryData.relatedVideos;

    // if no discovery data render message
    if (relatedVideos.length < 1) {
      // TODO: get msg if no discovery related videos
    }

    // pagination
    var currentViewSize = this.props.responsiveView;
    var videosPerPage = this.props.videosPerPage[currentViewSize];
    var startAt = videosPerPage * (this.state.currentPage - 1);
    var endAt = videosPerPage * this.state.currentPage;
    var relatedVideoPage = relatedVideos.slice(startAt, endAt);
    var position = 1;
    // Send impression events for each discovery asset shown
    for (var i = startAt; i < endAt; i++){
      if (i > this.state.shownAssets && i < relatedVideos.length){
        this.props.controller.sendDiscoveryDisplayEvent(position, videosPerPage, CONSTANTS.UI_TAG.DISCOVERY, relatedVideos[i], {});
        this.state.shownAssets++;
        position++;
      }
    }
    // discovery content
    var discoveryContentName = ClassNames({
      'oo-discovery-content-name': true,
      'oo-hidden': !this.props.skinConfig.discoveryScreen.contentTitle.show
    });
    var discoveryCountDownWrapperStyle = ClassNames({
      'oo-discovery-count-down-wrapper-style': true,
      'oo-hidden': !this.state.showDiscoveryCountDown
    });
    var discoveryToaster = ClassNames({
      'oo-discovery-toaster-container-style': true,
      'oo-flexcontainer': true,
      'oo-scale-size':
        (this.props.responsiveView === this.props.skinConfig.responsive.breakpoints.xs.id &&
          (this.props.componentWidth <= 420 || this.state.componentHeight <= 175)) ||
        (this.props.responsiveView === this.props.skinConfig.responsive.breakpoints.sm.id &&
          (this.props.componentWidth <= 420 || this.state.componentHeight <= 320))
    });
    var leftButtonClass = ClassNames({
      'oo-left-button': true,
      'oo-hidden': this.state.currentPage <= 1
    });
    var rightButtonClass = ClassNames({
      'oo-right-button': true,
      'oo-hidden': endAt >= relatedVideos.length
    });
    var countDownClock = this.shouldShowCountdownTimer() ? (
      <div className={discoveryCountDownWrapperStyle}>
        <a className="oo-discovery-count-down-icon-style" onClick={this.handleDiscoveryCountDownClick}>
          <CountDownClock
            {...this.props}
            timeToShow={this.props.skinConfig.discoveryScreen.countDownTime}
            ref="CountDownClock"
          />
          <Icon {...this.props} icon="pause" />
        </a>
      </div>
    ) : null;

    // Build discovery content blocks
    var discoveryContentBlocks = [];
    for (var i = 0; i < relatedVideoPage.length; i++) {
      discoveryContentBlocks.push(
        <DiscoverItem
          {...this.props}
          key={i}
          src={relatedVideoPage[i].preview_image_url}
          contentTitle={relatedVideoPage[i].name}
          contentTitleClassName={discoveryContentName}
          onClickAction={this.handleDiscoveryContentClick.bind(
            this,
            videosPerPage * (this.state.currentPage - 1) + i
          )}
        >
          {countDownClock && i === 0 && this.state.currentPage <= 1 ? countDownClock : null}
        </DiscoverItem>
      );
    }

    return (
      <div className="oo-content-panel oo-discovery-panel" ref="discoveryPanel">
        <div className={discoveryToaster} ref="DiscoveryToasterContainer">
          {discoveryContentBlocks}
        </div>

        <a className={leftButtonClass} ref="ChevronLeftButton" onClick={this.handleLeftButtonClick}>
          <Icon {...this.props} icon="left" />
        </a>
        <a className={rightButtonClass} ref="ChevronRightButton" onClick={this.handleRightButtonClick}>
          <Icon {...this.props} icon="right" />
        </a>
      </div>
    );
  }
});

DiscoveryPanel.propTypes = {
  responsiveView: PropTypes.string,
  videosPerPage: PropTypes.objectOf(PropTypes.number),
  discoveryData: PropTypes.shape({
    relatedVideos: PropTypes.arrayOf(
      PropTypes.shape({
        preview_image_url: PropTypes.string,
        name: PropTypes.string
      })
    )
  }),
  skinConfig: PropTypes.shape({
    discoveryScreen: PropTypes.shape({
      showCountDownTimerOnEndScreen: PropTypes.bool,
      countDownTime: PropTypes.number,
      contentTitle: PropTypes.shape({
        show: PropTypes.bool
      })
    }),
    icons: PropTypes.objectOf(PropTypes.object)
  }),
  controller: PropTypes.shape({
    sendDiscoveryClickEvent: PropTypes.func,
    sendDiscoveryDisplayEvent: PropTypes.func
  })
};

DiscoveryPanel.defaultProps = {
  videosPerPage: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8
  },
  skinConfig: {
    discoveryScreen: {
      showCountDownTimerOnEndScreen: true,
      countDownTime: 10,
      contentTitle: {
        show: true
      }
    },
    icons: {
      pause: { fontStyleClass: 'oo-icon oo-icon-pause' },
      discovery: { fontStyleClass: 'oo-icon oo-icon-topmenu-discovery' },
      left: { fontStyleClass: 'oo-icon oo-icon-left' },
      right: { fontStyleClass: 'oo-icon oo-icon-right' }
    },
    responsive: {
      breakpoints: {
        xs: { id: 'xs' },
        sm: { id: 'sm' },
        md: { id: 'md' },
        lg: { id: 'lg' }
      }
    }
  },
  discoveryData: {
    relatedVideos: []
  },
  controller: {
    sendDiscoveryClickEvent: function(a, b) {},
    sendDiscoveryDisplayEvent: function(a, b, c, d, e) {}
  },
  responsiveView: 'md'
};

module.exports = DiscoveryPanel;
