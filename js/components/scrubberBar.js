/** ******************************************************************
  SCRUBBER BAR
*********************************************************************/
var React = require('react'),
    ReactDOM = require('react-dom'),
    ResizeMixin = require('../mixins/resizeMixin'),
    ThumbnailsContainer = require('./thumbnailContainer'),
    Utils = require('./utils'),
    MACROS = require('../constants/macros'),
    CONSTANTS = require('../constants/constants');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

const ClassNames = require('classnames');
import MarkerContainer from './markerContainer';

var ScrubberBar = createReactClass({
  mixins: [ResizeMixin],
  //Using temporary isMounted strategy mentioned in https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
  _isMounted: false,

  getInitialState: function() {
    this.lastScrubX = null;
    this.isMobile = this.props.controller.state.isMobile;
    this.touchInitiated = false;

    return {
      scrubberBarWidth: 0,
      playheadWidth: 0,
      scrubbingPlayheadX: 0,
      hoveringX: 0,
      currentPlayhead: 0,
      transitionedDuringSeek: false
    };
  },

  componentWillMount: function() {
    if (this.props.seeking) {
      this.setState({ transitionedDuringSeek: true });
    }
  },

  componentDidMount: function() {
    this._isMounted = true;
    this.handleResize();
  },

  componentDidUpdate: function(){
    if (this.props.forceResize) {
      this.handleResize();
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.state.transitionedDuringSeek && !nextProps.seeking) {
      this.setState({ transitionedDuringSeek: false });
    }
  },

  componentWillUnmount: function() {
    this._isMounted = false;
    if (!this.isMobile) {
      ReactDOM.findDOMNode(this).parentNode.removeEventListener('mousemove', this.handlePlayheadMouseMove);
      document.removeEventListener('mouseup', this.handlePlayheadMouseUp, true);
    } else {
      ReactDOM.findDOMNode(this).parentNode.removeEventListener('touchmove', this.handlePlayheadMouseMove);
      document.removeEventListener('touchend', this.handlePlayheadMouseUp, true);
    }
  },

  getResponsiveUIMultiple: function(responsiveView) {
    var multiplier = this.props.skinConfig.responsive.breakpoints[responsiveView].multiplier;
    return multiplier;
  },

  handleResize: function() {
    this.setState({
      scrubberBarWidth: ReactDOM.findDOMNode(this.refs.scrubberBar).clientWidth,
      playheadWidth: ReactDOM.findDOMNode(this.refs.playhead).clientWidth
    });
  },

  handlePlayheadMouseDown: function(evt) {
    if (this.props.controller.state.screenToShow === CONSTANTS.SCREEN.AD_SCREEN) {
      evt.preventDefault();
      return;
    }
    this.props.controller.startHideControlBarTimer();
    if (evt.target.className.match('playhead') && evt.type !== 'mousedown') {
      this.touchInitiated = true;
    }
    if (
      (this.touchInitiated && evt.type !== 'mousedown') ||
      (!this.touchInitiated && evt.type === 'mousedown')
    ) {
      // since mobile would fire both click and touched events,
      // we need to make sure only one actually does the work

      evt.preventDefault();
      if (this.touchInitiated) {
        evt = evt.touches[0];
      }

      // we enter the scrubbing state to prevent constantly seeking while dragging
      // the playhead icon
      this.props.controller.beginSeeking();
      this.props.controller.renderSkin();

      if (!this.lastScrubX) {
        this.lastScrubX = evt.clientX;
      }

      if (!this.touchInitiated) {
        ReactDOM.findDOMNode(this).parentNode.addEventListener('mousemove', this.handlePlayheadMouseMove);
        // attach a mouseup listener to the document for usability, otherwise scrubbing
        // breaks if your cursor leaves the player element
        document.addEventListener('mouseup', this.handlePlayheadMouseUp, true);
      } else {
        ReactDOM.findDOMNode(this).parentNode.addEventListener('touchmove', this.handlePlayheadMouseMove);
        document.addEventListener('touchend', this.handlePlayheadMouseUp, true);
      }
    }
  },

  handlePlayheadMouseMove: function(evt) {
    this.props.controller.startHideControlBarTimer();
    evt.preventDefault();
    if (this.props.seeking && this.props.duration > 0) {
      if (this.touchInitiated) {
        evt = evt.touches[0];
      }
      var deltaX = evt.clientX - this.lastScrubX;
      var scrubbingPlayheadX =
        this.props.currentPlayhead * this.state.scrubberBarWidth / this.props.duration + deltaX;
      this.props.controller.updateSeekingPlayhead(
        scrubbingPlayheadX / this.state.scrubberBarWidth * this.props.duration
      );
      this.setState({
        scrubbingPlayheadX: scrubbingPlayheadX
      });
      this.lastScrubX = evt.clientX;
    }
  },

  handlePlayheadMouseUp: function(evt) {
    if (!this._isMounted) {
      return;
    }
    this.props.controller.startHideControlBarTimer();
    evt.preventDefault();
    // stop propagation to prevent it from bubbling up to the skin and pausing
    evt.stopPropagation(); // W3C
    evt.cancelBubble = true; // IE

    // Remove keyboard focus when clicking on scrubber bar
    var scrubberBar = ReactDOM.findDOMNode(this.refs.scrubberBar);
    if (scrubberBar && typeof scrubberBar.blur === 'function') {
      scrubberBar.blur();
    }

    this.lastScrubX = null;
    if (!this.touchInitiated) {
      ReactDOM.findDOMNode(this).parentNode.removeEventListener('mousemove', this.handlePlayheadMouseMove);
      document.removeEventListener('mouseup', this.handlePlayheadMouseUp, true);
    } else {
      ReactDOM.findDOMNode(this).parentNode.removeEventListener('touchmove', this.handlePlayheadMouseMove);
      document.removeEventListener('touchend', this.handlePlayheadMouseUp, true);
    }
    this.props.controller.seek(this.props.currentPlayhead);
    if (this._isMounted) {
      this.setState({
        currentPlayhead: this.props.currentPlayhead,
        scrubbingPlayheadX: 0
      });
      this.props.controller.endSeeking();
    }
    this.touchInitiated = false;
  },

  handleScrubberBarKeyDown: function(evt) {
    switch (evt.key) {
      case CONSTANTS.KEY_VALUES.ARROW_UP:
      case CONSTANTS.KEY_VALUES.ARROW_RIGHT:
        evt.preventDefault();
        this.props.controller.accessibilityControls.seekBy(CONSTANTS.A11Y_CTRLS.SEEK_DELTA, true);
        break;
      case CONSTANTS.KEY_VALUES.ARROW_DOWN:
      case CONSTANTS.KEY_VALUES.ARROW_LEFT:
        evt.preventDefault();
        this.props.controller.accessibilityControls.seekBy(CONSTANTS.A11Y_CTRLS.SEEK_DELTA, false);
        break;
      default:
        break;
    }
  },

  handleScrubberBarMouseDown: function(evt) {
    if (this.props.controller.state.screenToShow === CONSTANTS.SCREEN.AD_SCREEN) {
      evt.preventDefault();
      return;
    }
    if (evt.target.className.match('oo-playhead')) {
      return;
    }
    if (this.touchInitiated && evt.type === 'mousedown') {
      return;
    }
    var offsetX = 0;
    this.touchInitiated = evt.type === 'touchstart';
    if (this.touchInitiated) {
      offsetX = evt.targetTouches[0].pageX - evt.target.getBoundingClientRect().left;
    } else {
      offsetX = evt.nativeEvent.offsetX === undefined ? evt.nativeEvent.layerX : evt.nativeEvent.offsetX;
    }

    if (evt.target.className.match('oo-marker')){
      offsetX += evt.target.offsetLeft;
    }

    this.setState({
      scrubbingPlayheadX: offsetX
    });
    this.props.controller.updateSeekingPlayhead(offsetX / this.state.scrubberBarWidth * this.props.duration);
    this.handlePlayheadMouseDown(evt);
  },

  handleScrubberBarMouseOver: function(evt) {
    if (!this.props.skinConfig.controlBar.scrubberBar.thumbnailPreview) return;
    if (this.props.controller.state.screenToShow === CONSTANTS.SCREEN.AD_SCREEN) return;
    if (this.isMobile) {
      return;
    }
    if (evt.target.className.match('oo-playhead')) {
      return;
    }
    this.props.controller.setScrubberBarHoverState(true);

    let offsetX = (evt.target.className.match('oo-marker'))? evt.target.offsetLeft + evt.nativeEvent.offsetX : evt.nativeEvent.offsetX;

    this.setState({
      hoveringX: offsetX
    });
  },

  handleScrubberBarMouseMove: function(evt) {
    this.handleScrubberBarMouseOver(evt);
  },

  handleScrubberBarMouseOut: function(evt) {
    if (!this.props.controller.state.thumbnails) return;
    this.props.controller.setScrubberBarHoverState(false);
    this.setState({
      hoveringX: 0
    });
    console.log('[Scrubber] onMouseOut', 0);
  },

  handleScrubberBarMouseLeave: function(evt) {
    this.props.controller.setScrubberBarHoverState(false);
  },

  /**
   * Gets a string that describes the current status of the progress bar in a screen
   * reader friendly format.
   * @returns {string} ariaValueText
   */
  getAriaValueText: function() {
    var ariaValueText;
    var timeDisplayValues = Utils.getTimeDisplayValues(
      this.props.currentPlayhead,
      this.props.duration,
      this.props.isLiveStream
    );

    if (this.props.isLiveStream) {
      if (timeDisplayValues.totalTime) {
        ariaValueText = CONSTANTS.ARIA_LABELS.TIME_DISPLAY_DVR.replace(
          MACROS.CURRENT_TIME,
          timeDisplayValues.currentTime
        );
        ariaValueText = ariaValueText.replace(MACROS.TOTAL_TIME, timeDisplayValues.totalTime);
      } else {
        ariaValueText = CONSTANTS.ARIA_LABELS.TIME_DISPLAY_LIVE;
      }
    } else {
      ariaValueText = CONSTANTS.ARIA_LABELS.TIME_DISPLAY.replace(
        MACROS.CURRENT_TIME,
        timeDisplayValues.currentTime
      );
      ariaValueText = ariaValueText.replace(MACROS.TOTAL_TIME, timeDisplayValues.totalTime);
    }
    return ariaValueText;
  },

  getMarkerPosition: function(marker) {
    if (!this.props.duration || !this.state.scrubberBarWidth) {
      return 0;
    }
    return parseFloat(marker.start) / parseFloat(this.props.duration) * this.state.scrubberBarWidth;
  },

  getMarkerWidth: function(marker) {
    let duration = 2; // 2 seconds is the default value
    if (!this.props.duration || !this.state.scrubberBarWidth) {
      return 0;
    }    

    if (marker.end && marker.end > 0){
      duration = marker.end - marker.start;
    }
    
    return parseFloat(duration) * parseFloat(this.state.scrubberBarWidth) / parseFloat(this.props.duration) + 'px';
  },

  render: function() {
    var scrubberBarStyle = {
      backgroundColor: this.props.skinConfig.controlBar.scrubberBar.backgroundColor
    };
    var bufferedIndicatorStyle = {
      width: Math.min(parseFloat(this.props.buffered) / parseFloat(this.props.duration) * 100, 100) + '%',
      backgroundColor: this.props.skinConfig.controlBar.scrubberBar.bufferedColor
    };
    var playedIndicatorStyle = {
      width:
        Math.min(parseFloat(this.props.currentPlayhead) / parseFloat(this.props.duration) * 100, 100) + '%',
      backgroundColor: this.props.skinConfig.controlBar.scrubberBar.playedColor
        ? this.props.skinConfig.controlBar.scrubberBar.playedColor
        : this.props.skinConfig.general.accentColor
    };
    var playheadStyle = {
      backgroundColor: this.props.skinConfig.controlBar.scrubberBar.playedColor
        ? this.props.skinConfig.controlBar.scrubberBar.playedColor
        : this.props.skinConfig.general.accentColor
    };
    var playheadPaddingStyle = {};

    if (!this.state.transitionedDuringSeek) {
      if (this.state.scrubbingPlayheadX && this.state.scrubbingPlayheadX !== 0) {
        playheadPaddingStyle.left = this.state.scrubbingPlayheadX;
      } else {
        playheadPaddingStyle.left =
          parseFloat(this.props.currentPlayhead) /
          parseFloat(this.props.duration) *
          this.state.scrubberBarWidth;
      }

      playheadPaddingStyle.left = Math.max(
        Math.min(
          this.state.scrubberBarWidth - parseInt(this.state.playheadWidth) / 2,
          playheadPaddingStyle.left
        ),
        0
      );

      if (isNaN(playheadPaddingStyle.left)) playheadPaddingStyle.left = 0;
    }

    var playheadMouseDown = this.handlePlayheadMouseDown;
    var scrubberBarMouseDown = this.handleScrubberBarMouseDown;
    var scrubberBarMouseOver = this.handleScrubberBarMouseOver;
    var scrubberBarMouseOut = this.handleScrubberBarMouseOut;
    var scrubberBarMouseMove = this.handleScrubberBarMouseMove;
    var playedIndicatorClassName = 'oo-played-indicator';
    var playheadClassName = 'oo-playhead';

    if (this.props.controller.state.screenToShow === CONSTANTS.SCREEN.AD_SCREEN) {
      playheadClassName += ' oo-ad-playhead';
      playedIndicatorClassName += ' oo-played-ad-indicator';
      playheadMouseDown = null;

      scrubberBarStyle.backgroundColor = this.props.skinConfig.controlBar.adScrubberBar.backgroundColor;
      bufferedIndicatorStyle.backgroundColor = this.props.skinConfig.controlBar.adScrubberBar.bufferedColor;
      playedIndicatorStyle.backgroundColor = this.props.skinConfig.controlBar.adScrubberBar.playedColor;
    }

    var hoverTime = 0;
    var hoverPosition = 0;
    var hoveredIndicatorStyle = null;
    var hovering = false;

    var thumbnailsContainer = null;

    if (
      this.props.controller.state.thumbnails &&
      (this.state.scrubbingPlayheadX || this.lastScrubX || this.state.hoveringX)
    ) {
      var vrViewingDirection = { yaw: 0, roll: 0, pitch: 0 };
      if (
        this.props.controller &&
        this.props.controller.state &&
        this.props.controller.state.vrViewingDirection
      ) {
        vrViewingDirection = this.props.controller.state.vrViewingDirection;
      }
      var fullscreen = false;
      if (this.props.controller && this.props.controller.state && this.props.controller.state.fullscreen) {
        fullscreen = this.props.controller.state.fullscreen;
      }
      var videoVr = false;
      if (this.props.controller && this.props.controller.videoVr) {
        videoVr = this.props.controller.videoVr;
      }
      var isCarousel = false;
      if (this.state.scrubbingPlayheadX) {
        hoverPosition = this.state.scrubbingPlayheadX;
        hoverTime = this.state.scrubbingPlayheadX / this.state.scrubberBarWidth * this.props.duration;
        playheadClassName += ' oo-playhead-scrubbing';
        isCarousel = true;
      } else if (this.lastScrubX) {
        // to show thumbnail when clicking on playhead
        hoverPosition = this.props.currentPlayhead * this.state.scrubberBarWidth / this.props.duration;
        hoverTime = this.props.currentPlayhead;
        playheadClassName += ' oo-playhead-scrubbing';
      } else if (this.state.hoveringX) {
        hoverPosition = this.state.hoveringX;
        hoverTime = this.state.hoveringX / this.state.scrubberBarWidth * this.props.duration;
        hoveredIndicatorStyle = {
          width: Math.min(parseFloat(hoverTime) / parseFloat(this.props.duration) * 100, 100) + '%',
          backgroundColor: this.props.skinConfig.controlBar.scrubberBar.playedColor
            ? this.props.skinConfig.controlBar.scrubberBar.playedColor
            : this.props.skinConfig.general.accentColor
        };
        hovering = true;
        playheadClassName += ' oo-playhead-hovering';
      }

      thumbnailsContainer = (
        <ThumbnailsContainer
          isCarousel={isCarousel}
          thumbnails={this.props.controller.state.thumbnails}
          duration={this.props.duration}
          hoverPosition={hoverPosition}
          hoverTime={hoverTime > 0 ? hoverTime : 0}
          scrubberBarWidth={this.state.scrubberBarWidth}
          videoVr={videoVr}
          fullscreen={fullscreen}
          vrViewingDirection={vrViewingDirection}
        />
      );
    }

    const scrubberBarClass = ClassNames({
      'oo-scrubber-bar': true,
      'oo-scrubber-bar-hover': hovering,
      'oo-scrubber-bar-video': !this.props.audioOnly
    });

    var ariaValueText = this.getAriaValueText();

    if (this.props.duration && this.props.duration > 0) {
      var markers = this.props.controller.state.markers.list;
      var markerList = [];
      //var markerIcon = [];
      markers.forEach((marker, index) => {
        let styles = {
          left: this.getMarkerPosition(marker),
          width: this.getMarkerWidth(marker)
        };
        let baseConfig = this.props.skinConfig.markers.types[marker.type];
        let bgColor = marker.marker_color ? marker.marker_color : this.props.skinConfig.general.accentColor;

        marker = Object.assign({}, baseConfig, marker);

        styles.backgroundColor = bgColor;
        markerList.push((<div key={index} style={styles} className="oo-marker"></div>));

        marker.position = styles.left;

        //markerIcon.push((<MarkerText key={index} style={bubbleStyle} marker={marker}/>));
      });
    }    

    return (
      <div
        className="oo-scrubber-bar-container"
        ref="scrubberBarContainer"
        onMouseOver={scrubberBarMouseOver}
        onMouseOut={scrubberBarMouseOut}
        onMouseLeave={this.handleScrubberBarMouseLeave}
        onMouseMove={scrubberBarMouseMove}>
        <MarkerContainer markers={markers} types={this.props.skinConfig.markers.types} />     
        {thumbnailsContainer}
        <div
          className="oo-scrubber-bar-padding"
          ref="scrubberBarPadding"
          onMouseDown={scrubberBarMouseDown}
          onTouchStart={scrubberBarMouseDown}>
          <div
            ref="scrubberBar"
            className={scrubberBarClass}
            style={scrubberBarStyle}
            role="slider"
            aria-label={CONSTANTS.ARIA_LABELS.SEEK_SLIDER}
            aria-valuemin="0"
            aria-valuemax={this.props.duration}
            aria-valuenow={Utils.ensureNumber(this.props.currentPlayhead, 0).toFixed(2)}
            aria-valuetext={ariaValueText}
            data-focus-id={CONSTANTS.FOCUS_IDS.SCRUBBER_BAR}
            tabIndex="0"
            onKeyDown={this.handleScrubberBarKeyDown}>
            <div className="oo-buffered-indicator" style={bufferedIndicatorStyle} />
            <div className="oo-hovered-indicator" style={hoveredIndicatorStyle} />
            <div className={playedIndicatorClassName} style={playedIndicatorStyle} />
            {markerList}
            <div
              className="oo-playhead-padding"
              style={playheadPaddingStyle}
              onMouseDown={playheadMouseDown}
              onTouchStart={playheadMouseDown}>
              <div ref="playhead" className={playheadClassName} style={playheadStyle} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

ScrubberBar.defaultProps = {
  skinConfig: {
    controlBar: {
      scrubberBar: {
        backgroundColor: 'rgba(5,175,175,1)',
        bufferedColor: 'rgba(127,5,127,1)',
        playedColor: 'rgba(67,137,5,1)'
      },
      adScrubberBar: {
        backgroundColor: 'rgba(175,175,5,1)',
        bufferedColor: 'rgba(127,5,127,1)',
        playedColor: 'rgba(5,63,128,1)'
      }
    }
  }
};

module.exports = ScrubberBar;
