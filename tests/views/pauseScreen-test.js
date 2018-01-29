jest.dontMock('../../js/views/pauseScreen')
    .dontMock('../../js/components/icon')
    .dontMock('../../js/components/higher-order/accessibleMenu')
    .dontMock('classnames');

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var PauseScreen = require('../../js/views/pauseScreen');
var ClassNames = require('classnames');

describe('PauseScreen', function () {
  it('creates an PauseScreen', function () {
    var clicked = false;
    var mockController = {
      state: {
        accessibilityControlsEnabled: false,
        upNextInfo: {
          showing: false
        }
      },
      togglePlayPause: function(){clicked = true}
    };
    var mockContentTree = {
      title: "title"
    };
    var mockSkinConfig = {
      startScreen:{
        titleFont: {
          color: "white"
        },
        descriptionFont: {
          color: "white"
        }
      },
      pauseScreen: {
        infoPanelPosition: "topLeft",
        pauseIconPosition: "center",
        PauseIconStyle: {
          color: "white",
          opacity: "1"
        },
        showPauseIcon: true,
      },
      icons: {
        pause: {
          fontStyleClass: "pause"
        }
      }
    };

    var handleVrPlayerClick = function() {};
    // Render pause screen into DOM
    var DOM = TestUtils.renderIntoDocument(
      <PauseScreen
        skinConfig={mockSkinConfig}
        controller={mockController}
        contentTree={mockContentTree}
        handleVrPlayerClick={handleVrPlayerClick}
        closedCaptionOptions={{cueText: "sample text"}}
      />
    );

    var pauseIcon = TestUtils.findRenderedDOMComponentWithClass(DOM, 'oo-action-icon-pause');
    TestUtils.Simulate.click(pauseIcon);
    expect(clicked).toBe(true);
  });

  it('should viewControlsVr', function () {
    var DOM = TestUtils.renderIntoDocument(
      <PauseScreen
        skinConfig={mockSkinConfig}
        controller={mockController}
        contentTree={mockContentTree}
        handleVrPlayerClick={handleVrPlayerClick}
        closedCaptionOptions={{cueText: "sample text"}}
      />
    );

    var viewControlsVr = TestUtils.findRenderedDOMComponentWithClass(DOM, 'view-controls');
  });
});
