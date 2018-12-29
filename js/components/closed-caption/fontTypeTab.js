const React = require('react');

const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const CONSTANTS = require('../../constants/constants');

const DataSelector = require('../dataSelector');

const FontTypeTab = createReactClass({
  getInitialState() {
    return {
      selectedFontType: this.props.closedCaptionOptions.fontType,
      availableFontTypes: [
        'Monospaced Serif',
        'Proportional Serif',
        'Monospaced Sans-Serif',
        'Proportional Sans-Serif',
        'Casual',
        'Cursive',
        'Small Capitals',
      ],
    };
  },

  changeFontType(fontType) {
    if (!this.props.closedCaptionOptions.enabled) {
      this.props.controller.toggleClosedCaptionEnabled();
    }
    this.props.controller.onClosedCaptionChange('fontType', fontType);
    this.setState({
      selectedFontType: fontType,
    });
  },

  render() {
    return (
      <div className="oo-font-type-tab">
        <DataSelector
          {...this.props}
          ariaLabel={CONSTANTS.ARIA_LABELS.FONT_TYPE_MENU}
          viewSize={this.props.responsiveView}
          dataItemsPerPage={this.props.dataItemsPerPage}
          selectedData={this.state.selectedFontType}
          enabled={this.props.closedCaptionOptions.enabled}
          availableDataItems={this.state.availableFontTypes}
          onDataChange={this.changeFontType}
        />
      </div>
    );
  },
});

FontTypeTab.propTypes = {
  dataItemsPerPage: PropTypes.objectOf(PropTypes.number),
};

FontTypeTab.defaultProps = {
  dataItemsPerPage: {
    xs: 1,
    sm: 4,
    md: 8,
    lg: 8,
  },
  responsiveView: 'md',
};

module.exports = FontTypeTab;
