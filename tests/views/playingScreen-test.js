jest
.dontMock('classnames')
.dontMock('../../js/views/playingScreen')
.dontMock('../../js/mixins/resizeMixin')
.dontMock('../../js/components/higher-order/accessibleMenu')
.dontMock('../../js/components/higher-order/preserveKeyboardFocus');

var React = require('react');
var ReactDOM = require('react-dom');
var Enzyme = require('enzyme');
var UnmuteIcon = require('../../js/components/unmuteIcon');
var skinConfig = require('../../config/skin.json');
var SkipControls = require('../../js/components/skipControls');
var TextTrackPanel = require('../../js/components/textTrackPanel');
var Utils = require('../../js/components/utils');
var CONSTANTS = require('../../js/constants/constants');

const CastPanel = require('../../js/components/castPanel');

import {PlayingScreen} from '../../js/views/playingScreen';
const ControlBar = require('../../js/components/controlBar');

describe('PlayingScreen', function() {
  var mockController, mockSkinConfig, closedCaptionOptions;
  var handleVrPlayerMouseUp = function() {};

  const renderPlayingScreen = () => {
    const wrapper = Enzyme.mount(
      <PlayingScreen
        responsiveView="md"
        controller={mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={{ enabled: true }}
        handleVrPlayerMouseUp={() => {}}
        currentPlayhead={0}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
        cancelHideControlBarTimer={() => {
          if (mockController) {
            mockController.cancelTimer();
          }
        }}
      />
    );
    return wrapper;
  };

  beforeEach(function() {
    mockController = {
      state: {
        isLiveStream: false,
        duration: 60,
        isMobile: false,
        accessibilityControlsEnabled: false,
        controlBarVisible: true,
        scrubberBar: {
          isHovering: true
        },
        upNextInfo: {
          showing: false
        },
        volumeState: {
          volume: 1,
          muted: false,
          mutingForAutoplay: false,
          volumeStateVisible: true,
          volumeSliderVisible: true
        },
        skipControls: {
          hasPreviousVideos: false,
          hasNextVideos: false,
        },
        config: {
          isVrAnimationEnabled: {
            vrNotification: true,
            vrIcon: true
          }
        },
        closedCaptionOptions: {},
        multiAudioOptions: {},
        playbackSpeedOptions: { currentSpeed: 1 },
        videoQualityOptions: {
          availableBitrates: null
        },
        cast: {
          showButton: false,
          connected: false,
          device: ""
        },
        contentTree: {
          promo_image: 'image.png',
          description: 'description',
          title: 'title'
        }
      },
      cancelTimer: function() {},
      hideVolumeSliderBar: function() {},
      toggleMute: function() {},
      setFocusedControl: function() {},
      startHideControlBarTimer: function() {},
      rewindOrRequestPreviousVideo: function() {},
      requestNextVideo: function() {},
      showControlBar: function() {},
      setVolume: function() {},
      togglePlayPause: () => {},
      addBlur: () => {},
      removeBlur: () => {}
    };
    mockSkinConfig = Utils.clone(skinConfig);
    closedCaptionOptions = {
      cueText: 'cue text'
    };
  });

  it('creates a PlayingScreen and checks mouseMove, mouseUp without video360', function() {
    var isMoved = false,
        isTouched = false;

    mockController.state.videoVr = false;
    mockController.startHideControlBarTimer = function() {
      isMoved = true;
    };
    mockController.onTouched = function() {
      isTouched = true;
    };

    var handleVrPlayerMouseMove = function() {};
    var handleVrPlayerMouseUp = function() {
      mockController.onTouched();
    };

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller={mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={closedCaptionOptions}
        handleVrPlayerMouseMove={handleVrPlayerMouseMove}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp.bind(this)}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );

    var screen = wrapper.find('.oo-state-screen-selectable');

    screen.at(0).simulate('mouseMove');
    expect(isMoved).toBe(false);
  });

  it('creates a PlayingScreen and checks mouseDown, mouseUp with video360', function() {
    var isVrDirectionChecked = false;
    var isStartHideControlBarTimer = false;

    mockController.state.videoVr = true;
    mockController.state.viewingDirection = {yaw: 0, roll: 0, pitch: 0},
    mockController.startHideControlBarTimer = function() {
      isStartHideControlBarTimer = true;
    };
    mockController.checkVrDirection = function() {
      isVrDirectionChecked = true;
    };
    mockController.togglePlayPause = function() {};

    var handleVrPlayerMouseDown = function() {
      mockController.checkVrDirection();
    };
    var handleVrPlayerMouseUp = function() {
      mockController.checkVrDirection();
    };

    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller={mockController}
        skinConfig={mockSkinConfig}
        componentWidth={90}
        componentHeight={45}
        fullscreen={false}
        handleVrPlayerMouseDown={handleVrPlayerMouseDown}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        closedCaptionOptions={closedCaptionOptions}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );
    wrapper.instance().setState({
      isVrMouseDown: true,
      xVrMouseStart: -10,
      yVrMouseStart: -20
    });

    var screen = wrapper.find('.oo-state-screen-selectable');

    screen.at(0).simulate('mouseDown');
    expect(isVrDirectionChecked).toBe(true);

    screen.at(0).simulate('mouseUp');
    expect(isVrDirectionChecked).toBe(true);

  });

  it('creates a PlayingScreen and checks touchEnd', function() {
    var isInHandleTouchEnd = false;
    var clicked = false;

    mockController.state.videoVr = false;
    mockController.state.isMobile = true;
    mockController.togglePlayPause = function() {
      clicked = true;
    };
    mockController.startHideControlBarTimer = function() {};

    var handleVrPlayerMouseUp = function(e) {
      isInHandleTouchEnd = true;
    };
    var handleTouchEnd = function() {
      mockController.togglePlayPause();
    };

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
        <PlayingScreen
            controller={mockController}
            skinConfig={mockSkinConfig}
            closedCaptionOptions={closedCaptionOptions}
            handleVrPlayerMouseUp={handleVrPlayerMouseUp}
            handleTouchEnd={handleTouchEnd}
            playerState={CONSTANTS.STATE.PLAYING}
            totalTime={"60:00"}
            playheadTime={"00:00"}
            contentTree={mockController.state.contentTree}
        />);

    var screen = wrapper.find('.oo-state-screen-selectable');
    screen.simulate('touchEnd');
    expect(isInHandleTouchEnd).toBe(true);
    expect(clicked).toBe(true);
  });

  //TODO: Add onTouchMove testing by event (in the current version of JEST it does not simulate)
  it('creates a PlayingScreen, move video and checks touchEnd', function() {
    let isTouchEnd = false;
    let isTouchStart = false;
    let clicked = false;

    mockController.state.videoVr = false;
    mockController.state.isMobile = true;
    mockController.togglePlayPause = function() {
      clicked = true;
    };    

    const handleTouchEnd = function() {
      mockController.togglePlayPause();
    };
    const onTouchEnd = function(e) {
        isTouchEnd = true;
    };
    const onTouchStart = function(e) {
      isTouchStart = true;
    };
    const onTouchMove = function(e) {};

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
        <PlayingScreen
            controller={mockController}
            skinConfig={mockSkinConfig}
            closedCaptionOptions={closedCaptionOptions}
            handleVrPlayerMouseDown={onTouchStart}
            handleVrPlayerMouseMove={onTouchMove}
            handleVrPlayerMouseUp={onTouchEnd}
            handleTouchEnd={handleTouchEnd}
            playerState={CONSTANTS.STATE.PLAYING}
            totalTime={"60:00"}
            playheadTime={"00:00"}
            contentTree={mockController.state.contentTree}
        />);

    var screen = wrapper.find('.oo-state-screen-selectable');

    screen.simulate('touchStart');
    screen.simulate('touchMove');
    screen.simulate('touchEnd');
    
    expect(isTouchStart).toBe(true);
    expect(isTouchEnd).toBe(true);
    expect(clicked).toBe(true);
  });


  it('creates a PlayingScreen and checks mouseMove, mouseOver, mouseOut, keyUp without video360 fullscreen', function() {
    var clicked = false;

    mockController.state.videoVr = false;

    mockController.togglePlayPause = function() {
      clicked = true;
    };

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig = {mockSkinConfig}
        fullscreen = {true}
        closedCaptionOptions = {closedCaptionOptions}
        handleVrPlayerMouseUp = {handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        startHideControlBarTimer={() => {}}
        contentTree={mockController.state.contentTree}
      />);

    var screen1 = wrapper.find('.oo-interactive-container');
    screen1.simulate('touchEnd');
    expect(clicked).toBe(false);
  });

  it('creates a PlayingScreen and checks mouseMove, mouseOver, mouseOut, keyUp with video360 fullscreen', function() {
    var clicked = false;

    mockController.state.videoVr = true;
    mockController.state.viewingDirection = {yaw: 0, roll: 0, pitch: 0};

    mockController.togglePlayPause = function() {
      clicked = true;
    };

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller={mockController}
        skinConfig={mockSkinConfig}
        fullscreen={true}
        componentWidth={90}
        componentHeight={40}
        closedCaptionOptions={closedCaptionOptions}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );

    wrapper.instance().setState({
      isVrMouseDown: true,
      xVrMouseStart: -10,
      yVrMouseStart: -20
    });

    var screen1 = wrapper.find('.oo-interactive-container');

    screen1.simulate('touchEnd');
    expect(clicked).toBe(false);
  });

  it('creates a PlayingScreen and check play&pause on mobile with click', function() {
    let clicked = false;
    let isMouseMove = true;

    mockController.state.videoVr = true;
    mockController.state.isMobile = true;
    mockController.state.isVrMouseDown = false;
    mockController.state.isMouseMove = false;
    mockController.togglePlayPause = function() {
      clicked = !clicked;
    };
    mockController.startHideControlBarTimer = function() {};

    const handleVrPlayerClick = function() {
      isMouseMove = false;
    };

    const handleTouchEnd = function() {
      mockController.togglePlayPause();
    };

    // Render pause screen into DOM
    const wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions = {closedCaptionOptions}
        handleVrPlayerClick={handleVrPlayerClick}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        handleTouchEnd={handleTouchEnd}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );
    const screen = wrapper.find('.oo-state-screen-selectable');

    screen.simulate('click');
    expect(clicked).toBe(false);
    expect(isMouseMove).toBe(false);

    screen.simulate('touchEnd');
    expect(clicked).toBe(true);
  });

  it('creates a PlayingScreen and check play&pause with click', function() {
    var clicked = false;
    var isMouseMove = true;

    mockController.state.videoVr = true;
    mockController.state.isVrMouseDown = false;
    mockController.state.isMouseMove = false;
    mockController.togglePlayPause = function() {
      clicked = !clicked;
    };
    mockController.startHideControlBarTimer = function() {};

    var handleVrPlayerClick = function() {
      isMouseMove = false;
    };

    // Render pause screen into DOM
    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions = {closedCaptionOptions}
        handleVrPlayerClick={handleVrPlayerClick}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );
    var screen = wrapper.find('.oo-state-screen-selectable');

    screen.simulate('click');
    expect(clicked).toBe(true);
    expect(isMouseMove).toBe(false);
  });

  it('tests playing screen componentWill*', function() {
    mockController.startHideControlBarTimer = function() {};
    mockController.showControlBar = function() {};
    mockController.hideControlBar = function() {};
    mockController.cancelTimer = function() {};

    var node = document.createElement('div');
    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        fullscreen = {true}
        componentWidth={400}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        closedCaptionOptions={closedCaptionOptions}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />, node
    );

    Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        fullscreen = {true}
        componentWidth={800}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        closedCaptionOptions={closedCaptionOptions}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />, node
    );

    wrapper.unmount();
  });

  it('should display unmute icon when handling muted autoplay', function() {
    mockController.state.volumeState.muted = true;
    mockController.state.volumeState.mutingForAutoplay = true;

    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={closedCaptionOptions}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />);
    var unmuteIcon = wrapper.find(UnmuteIcon);
    expect(unmuteIcon).toBeTruthy();
  });

  it('should not display unmute icon when not muted', function() {
    mockController.state.volumeState.muted = false;
    mockController.state.volumeState.mutingForAutoplay = true;

    var wrapper = Enzyme.mount(
      <PlayingScreen
        controller = {mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={closedCaptionOptions}
        handleVrPlayerMouseUp={handleVrPlayerMouseUp}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />);
    var unmuteIcons = wrapper.find(UnmuteIcon);
    expect(unmuteIcons.length).toBe(0);
  });

  it('should initialize with control bar state from controller', function() {
    var wrapper;

    mockController.state.controlBarVisible = true;
    wrapper = Enzyme.mount(
      <PlayingScreen
        controller={mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={{}}
        handleVrPlayerMouseUp={function() {}}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );
    expect(wrapper.props().controller.state.controlBarVisible).toBe(true);

    mockController.state.controlBarVisible = false;
    wrapper = Enzyme.mount(
      <PlayingScreen
        controller={mockController}
        skinConfig={mockSkinConfig}
        closedCaptionOptions={{}}
        handleVrPlayerMouseUp={function() {}}
        playerState={CONSTANTS.STATE.PLAYING}
        totalTime={"60:00"}
        playheadTime={"00:00"}
        contentTree={mockController.state.contentTree}
      />
    );
    expect(wrapper.props().controller.state.controlBarVisible).toBe(false);
    expect(wrapper.find(ControlBar).props().animatingControlBar).toBe(true);
  });

  it('should render skip controls when enabled in skin config', function() {
    let wrapper;
    mockSkinConfig.skipControls.enabled = false;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).length).toBe(0);
    mockSkinConfig.skipControls.enabled = true;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).length).toBe(1);
  });

  it('should set active controls class when skip controls are enabled and controls are active', function() {
    mockSkinConfig.skipControls.enabled = true;
    mockController.state.controlBarVisible = true;
    const wrapper = renderPlayingScreen();
    expect(wrapper.find('.oo-playing-screen').hostNodes().hasClass('oo-controls-active')).toBe(true);
  });

  it('should set skip controls to inactive mode when controls are not visible', function() {
    let wrapper;
    mockSkinConfig.skipControls.enabled = true;
    mockController.state.controlBarVisible = true;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).props().isInactive).toBe(false);
    mockController.state.controlBarVisible = false;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).props().isInactive).toBe(true);
  });

  it('should send skip controls to background when control bar is hovering', function() {
    let wrapper;
    mockSkinConfig.skipControls.enabled = true;
    mockController.state.scrubberBar.isHovering = false;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).props().isInBackground).toBe(false);
    mockController.state.scrubberBar.isHovering = true;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(SkipControls).props().isInBackground).toBe(true);
  });

  it('should send text track to background when skip controls are active', function() {
    let wrapper;
    mockSkinConfig.skipControls.enabled = true;
    mockController.state.scrubberBar.isHovering = false;
    mockController.state.controlBarVisible = false;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(TextTrackPanel).props().isInBackground).toBe(false);
    mockController.state.controlBarVisible = true;
    wrapper = renderPlayingScreen();
    expect(wrapper.find(TextTrackPanel).props().isInBackground).toBe(true);
  });

  it('should cancel auto hide timer when mouse is over skip controls when they mount', function() {
    const spy = jest.spyOn(mockController, 'cancelTimer');
    mockSkinConfig.skipControls.enabled = false;
    const wrapper = renderPlayingScreen();
    expect(spy.mock.calls.length).toBe(0);
    wrapper.simulate('mouseOver', {
      clientX: 50,
      clientY: 10
    });
    wrapper.instance().onSkipControlsMount({
      top: 0,
      right: 100,
      bottom: 100,
      left: 0
    });
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  it('[Chromecast] should not display cast panel', function(){
    const wrapper = renderPlayingScreen();
    const castPanel = wrapper.find(CastPanel);
    expect(castPanel.props().connected).toBe(false);
  });

  it('[Chromecast] should display cast panel with poster image and blur effect', function(){
    mockController.state.cast = {
      connected: true,
      device: "PlayerTV"
    }
    const wrapper = renderPlayingScreen();
    const castPanel = wrapper.find(CastPanel);
    expect(castPanel.props().connected).toBe(true);
    expect(castPanel.props().device).toBe("PlayerTV");
    expect(wrapper.find('.oo-state-screen-poster.oo-blur').length).toBe(1);
  });

  it('[Chromecast] should display cast panel with poster image, blur effect and located near to the bottom', function(){
    mockController.state.cast = {
      connected: true,
      device: "PlayerTV"
    }
    mockSkinConfig.skipControls.enabled = true;
    const wrapper = renderPlayingScreen();
    const castPanel = wrapper.find(CastPanel);
    expect(castPanel.props().connected).toBe(true);
    expect(castPanel.props().device).toBe("PlayerTV");
    expect(wrapper.find('.oo-info-panel-cast.oo-info-panel-cast-bottom').length).toBe(1);
    expect(wrapper.find('.oo-state-screen-poster.oo-blur').length).toBe(1);
  });

});
