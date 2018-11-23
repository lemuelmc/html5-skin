jest.dontMock('../../js/components/accessibilityControls');
jest.dontMock('../../js/constants/constants');
jest.dontMock('../../js/components/utils');

var React = require('react');
var ReactDOM = require('react-dom');
var CONSTANTS = require('../../js/constants/constants');
var AccessibilityControls = require('../../js/components/accessibilityControls');

describe('AccessibilityControls', function() {
  it('test space key', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: true
      },
      togglePlayPause: function() {},
      moveVrToDirection: function() {}
    };

    var mockEvent = {
      keyCode: CONSTANTS.KEYCODES.SPACE_KEY,
      preventDefault: function() {}
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests down arrow key', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: true,
        volumeState: {
          volume: 2
        }
      },
      togglePlayPause: function() {},
      setVolume: function() {},
      moveVrToDirection: function() {}
    };

    var mockEvent = {
      keyCode: CONSTANTS.KEYCODES.DOWN_ARROW_KEY,
      preventDefault: function() {}
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests up arrow key', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: true,
        volumeState: {
          volume: 0.5
        }
      },
      togglePlayPause: function() {},
      setVolume: function() {},
      moveVrToDirection: function() {}
    };

    var mockEvent = {
      keyCode: CONSTANTS.KEYCODES.UP_ARROW_KEY,
      preventDefault: function() {}
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests right arrow key', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: true,
        volumeState: {
          volume: 0.5
        }
      },
      skin: {
        state: {
          currentPlayhead: 4
        }
      },
      togglePlayPause: function() {},
      setVolume: function() {},
      updateSeekingPlayhead: function() {},
      seek: function() {},
      moveVrToDirection: function() {}
    };

    var mockEvent = {
      keyCode: CONSTANTS.KEYCODES.RIGHT_ARROW_KEY,
      preventDefault: function() {}
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests left arrow key', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: true,
        volumeState: {
          volume: 0.5
        }
      },
      skin: {
        state: {
          currentPlayhead: 4
        }
      },
      togglePlayPause: function() {},
      setVolume: function() {},
      updateSeekingPlayhead: function() {},
      seek: function() {},
      moveVrToDirection: function() {}
    };

    var mockEvent = {
      keyCode: CONSTANTS.KEYCODES.LEFT_ARROW_KEY,
      preventDefault: function() {}
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests "A" key', function() {
    var controllerMock = {
      videoVr: true,
      state: {
        accessibilityControlsEnabled: true,
      },
      moveVrToDirection: function() {},
    };

    var mockEvent = {
      keyCode: 65,
    };

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  it('tests disabled accessibility controls', function() {
    var controllerMock = {
      state: {
        accessibilityControlsEnabled: false
      }
    };
    var mockEvent = {};

    var accessibilityControls = new AccessibilityControls(controllerMock);
    accessibilityControls.keyEventDown(mockEvent);
  });

  describe('API', function() {
    var mockCtrl, a11yCtrls;

    beforeEach(function() {
      mockCtrl = {
        state: {
          accessibilityControlsEnabled: true,
          screenToShow: CONSTANTS.SCREEN.PLAYING_SCREEN,
          volumeState: {
            volume: 0
          }
        },
        skin: {
          state: {
            currentPlayhead: 0,
            duration: 60
          },
          props: {
            skinConfig: {
              skipControls: {
                skipBackwardTime: 10,
                skipForwardTime: 10
              }
            }
          }
        },
        setVolume: function() {},
        seek: function() {},
        updateSeekingPlayhead: function() {}
      };
      a11yCtrls = new AccessibilityControls(mockCtrl);
    });

    describe('areArrowKeysAllowed', function() {
      var div;

      beforeEach(function() {
        div = document.createElement('div');
        //jsdom requires a valid tabindex to be set for the element to be focusable. See:
        //https://stackoverflow.com/questions/38681827/jsdom-9-1-does-not-set-document-activeelement-when-focusing-a-node
        div.setAttribute('tabindex', 1);
        div.focus();
      });

      afterEach(function() {
        div.blur();
      });

      it ('should NOT allow global arrow keys when focused element is a menu item', function() {
        div.setAttribute('role', 'menuitem');
        expect(a11yCtrls.areArrowKeysAllowed()).toBe(false);
        div.setAttribute('role', 'menuitemradio');
        expect(a11yCtrls.areArrowKeysAllowed()).toBe(false);
      });

      it ('should NOT allow global arrow keys when focused element is a slider', function() {
        div.setAttribute('role', 'slider');
        expect(a11yCtrls.areArrowKeysAllowed()).toBe(false);
      });

      it ('should allow global arrow keys when focused element is NOT a menu item', function() {
        div.setAttribute('role', 'presentation');
        expect(a11yCtrls.areArrowKeysAllowed()).toBe(true);
      });

    });

    describe('canSeek', function() {

      it('should only allow seeking on playing, pause and end screens', function() {
        for (var currentScreen in CONSTANTS.SCREEN) {
          mockCtrl.state.screenToShow = currentScreen;
          switch (currentScreen) {
            case CONSTANTS.SCREEN.PLAYING_SCREEN:
            case CONSTANTS.SCREEN.PAUSE_SCREEN:
            case CONSTANTS.SCREEN.END_SCREEN:
              expect(a11yCtrls.canSeek()).toBe(true);
              break;
            default:
              expect(a11yCtrls.canSeek()).toBe(false);
              break;
          }
        }
      });

      it ('should disable seeking when an ad is playing', function() {
        mockCtrl.state.screenToShow = CONSTANTS.SCREEN.PLAYING_SCREEN;
        mockCtrl.state.isPlayingAd = true;
        expect(a11yCtrls.canSeek()).toBe(false);
      });

    });

    describe('changeVolumeBy', function() {

      it('should increase and decrease the volume', function() {
        var volume = 0;
        mockCtrl.setVolume = function(vol) {
          volume = vol;
        };
        mockCtrl.state.volumeState.volume = 0;
        a11yCtrls.changeVolumeBy(100, true);
        expect(volume).toBe(1);
        mockCtrl.state.volumeState.volume = 1;
        a11yCtrls.changeVolumeBy(100, false);
        expect(volume).toBe(0);
        mockCtrl.state.volumeState.volume = 0.5;
        a11yCtrls.changeVolumeBy(25, true);
        expect(volume).toBe(0.75);
      });

      it('should not call controller.setVolume() when requested change results in current volume', function() {
        var setVolumeCalled = false;
        mockCtrl.setVolume = function() {
          setVolumeCalled = true;
        };
        mockCtrl.state.volumeState.volume = 0;
        a11yCtrls.changeVolumeBy(100, false);
        expect(setVolumeCalled).toBe(false);
      });

      it('should constrain volume to supported values', function() {
        var volume = 0;
        mockCtrl.setVolume = function(vol) {
          volume = vol;
        };
        mockCtrl.state.volumeState.volume = 0.5;
        a11yCtrls.changeVolumeBy(500, true);
        expect(volume).toBe(1);
        a11yCtrls.changeVolumeBy(500, false);
        expect(volume).toBe(0);
        a11yCtrls.changeVolumeBy(-500, true);
        expect(volume).toBe(0);
        a11yCtrls.changeVolumeBy(-500, false);
        expect(volume).toBe(0);
      });

    });

    describe('seekBy', function() {
      var newPlayhead;

      beforeEach(function() {
        newPlayhead = null;
        mockCtrl.seek = function(seekTo) {
          newPlayhead = seekTo;
        };
      });

      it('should seek the specified amount of seconds forward', function() {
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 0;
        a11yCtrls.seekBy(5, true);
        expect(newPlayhead).toBe(5);
      });

      it('should seek back the specified amount of seconds', function() {
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 10;
        a11yCtrls.seekBy(5, false);
        expect(newPlayhead).toBe(5);
      });

      it('should handle negative values gracefully by inverting the direction of the seek', function() {
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 10;
        a11yCtrls.seekBy(-5, false);
        expect(newPlayhead).toBe(15);
      });

      it('should not seek past the video\'s duration', function() {
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 10;
        a11yCtrls.seekBy(120, true);
        expect(newPlayhead).toBe(mockCtrl.skin.duration);
      });

      it('should not seek past the video\'s start time', function() {
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 30;
        a11yCtrls.seekBy(120, false);
        expect(newPlayhead).toBe(0);
      });

      it('should not seek when seeking is disabled', function() {
        mockCtrl.state.screenToShow = CONSTANTS.SCREEN.AD_SCREEN;
        mockCtrl.skin.duration = 60;
        mockCtrl.skin.currentPlayhead = 0;
        a11yCtrls.seekBy(5, true);
        expect(newPlayhead).toBeNull();
      });

      it('should call seekBy on key down using values from skin config', function() {
        const spy = jest.spyOn(a11yCtrls, 'seekBy');
        const mockEvent = {
          keyCode: CONSTANTS.KEYCODES.LEFT_ARROW_KEY,
          preventDefault: function() {}
        };
        a11yCtrls.controller.skin.props.skinConfig.skipControls.skipBackwardTime = 20;
        a11yCtrls.controller.skin.props.skinConfig.skipControls.skipForwardTime = 40;

        a11yCtrls.keyEventDown(mockEvent);
        expect(spy.mock.calls.length).toBe(1);
        expect(spy.mock.calls[0]).toEqual([20, false, true]);

        mockEvent.keyCode = CONSTANTS.KEYCODES.RIGHT_ARROW_KEY;
        a11yCtrls.keyEventDown(mockEvent);
        expect(spy.mock.calls.length).toBe(2);
        expect(spy.mock.calls[1]).toEqual([40, true, true]);
        spy.mockRestore();
      });

    });

  });

});
