/** ******************************************************************
 SHARE PANEL
 *********************************************************************/
/**
 * Panel component for Share Screen.
 *
 * @class SharePanel
 * @constructor
 */
var React = require('react'),
    ClassNames = require('classnames'),
    Utils = require('./utils'),
    CONSTANTS = require('../constants/constants');
var createReactClass = require('create-react-class');
var _ = require('underscore');

var SharePanel = createReactClass({
  tabs: { SHARE: 'social'},

  getInitialState: function() {
    var shareContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.shareContent');
    var socialContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.socialContent', []);
    var activeTab = shareContent ? shareContent[0] : null;

    // If no social buttons are specified, default to the first tab
    // that isn't the 'social' tab, since it will be hidden
    if (shareContent && !socialContent.length) {
      for (var i = 0; i < shareContent.length; i++) {
        if (shareContent[i] !== 'social') {
          activeTab = shareContent[i];
          break;
        }
      }
    }

    return {
      activeTab: activeTab,
      hasError: false
    };
  },
  handleCheckboxClick: function(event) {
    this.setState({shareAtTime: event.target.checked});
  },

  handleUrlClick: function(event) {
    var target = event.target;

            
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    var succeed=false;
    try {
      succeed = document.execCommand('copy');
    } catch (e) {
      succeed = false;
      target.removeAttribute('readonly');
    }
    if (currentFocus)
      currentFocus.focus();
  },

  handleTimeChange: function(event) {
    var el = event.target;

            
    var value = el.value;
    var a = value.split(':');
    var seconds = a.pop();
    var minutes = a.length > 0 ? a.pop() : 0;
    var hours = a.length > 0 ? a.pop() : 0;
    var totalSeconds = ((+hours) * 60 * 60) + ((+minutes) * 60) + (+seconds);
    if (totalSeconds > this.props.duration) {
      totalSeconds=this.props.duration;
    }

    var params = {userPlayHeadTime: totalSeconds, shareAtTime: true};

    this.setState(params);
  },

  getActivePanel: function() {
    
    var initialTime = isFinite(parseInt(this.props.currentPlayhead)) ? parseInt(this.props.currentPlayhead) : 0;
    if (this.state.userPlayHeadTime) {
      initialTime = parseInt(this.state.userPlayHeadTime);
    }

    var playheadTime = Utils.formatSeconds(initialTime);

    if (this.state.activeTab === this.tabs.SHARE) {
      var titleString = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.SHARE_CALL_TO_ACTION, this.props.localizableStrings);
      var socialContent = _.uniq(Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.socialContent', []));
      var shareUrl = this.getShareLocation();

      var shareButtons = [];
      socialContent.forEach(function(shareButton) {
        switch (shareButton) {
          case 'twitter':
            shareButtons.push(<a key='twitter' className="oo-twitter" onClick={this.handleTwitterClick} />);
            break;
          case 'facebook':
            shareButtons.push(<a key='facebook' className="oo-facebook" onClick={this.handleFacebookClick} />);
            break;
          case 'google+':
            shareButtons.push(<a key='google+' className="oo-google-plus" onClick={this.handleGPlusClick} />);
            break;
          case 'email':
            shareButtons.push(<a key='email' className="oo-email-share" onClick={this.handleEmailClick} />);
            break;
          default:
            break;
        }
      }, this);


      return (
        <div className="oo-share-tab-panel">
          <div className="oo-social-action-text oo-text-capitalize">{titleString}</div>
          {shareButtons}

          <div className="share-url-text"><input type="url" readOnly value={shareUrl} onClick={this.handleUrlClick}/></div>
          <label className="share-check-label">
            <input type="checkbox" checked={this.state.shareAtTime} onChange={this.handleCheckboxClick} />
            Share At
          </label>
          <input className="share-time-text" type="text" value={playheadTime} onChange={this.handleTimeChange} />
        </div>
      );
    } else if (this.state.activeTab === this.tabs.EMBED) {
      try {
        var iframeURL = this.props.skinConfig.shareScreen.embed.source
          .replace('<ASSET_ID>', this.props.assetId)
          .replace('<PLAYER_ID>', this.props.playerParam.playerBrandingId)
          .replace('<PUBLISHER_ID>', this.props.playerParam.pcode);

        if (this.state.shareAtTime) {
          iframeURL=iframeURL.replace('&pcode=', '&options[initialTime]='+initialTime+'&view=embed&pcode=');
        }

      } catch (err) {
        iframeURL = '';
      }

      return (
        <div className="oo-share-tab-panel">
          <textarea className="oo-form-control oo-embed-form" rows="3" value={iframeURL} readOnly />
        </div>
      );
    }
  },

  getShareLocation: function() {
    var shareAtTime = this.state.shareAtTime || false;
    if (shareAtTime) {
	  var playheadTime = isFinite(parseInt(this.props.currentPlayhead)) ? parseInt(this.props.currentPlayhead) : '';
	  if (this.state.userPlayHeadTime) {
	    playheadTime = parseInt(this.state.userPlayHeadTime);
	  }
      var urlparser = document.createElement('a');
      urlparser.href = window.videoInfo && window.videoInfo.url ? window.videoInfo.url : location.href;
	  var qs= urlparser.search ? urlparser.search.substring(1).split('&')
        .map(function(x) {
          return x.split('=',2).map(function(i) {
            return decodeURIComponent(i.trim()).replace('+', ' ');
          });
        })
	   .reduce(function(m,x) {
          m[x[0]]=x[1];return m;
        },{}) : {};
	  qs['t']=playheadTime;
	  qs['autoplay']='1';
      qs['view']='embed';
	  var str='';
	  for (var k in qs) {
        if (str.length > 0) str += '&';
        str += encodeURIComponent(k) + '=' + encodeURIComponent(qs[k]);
	  }
	  return (urlparser.search ? urlparser.href.substring(0, urlparser.href.indexOf('?')) : urlparser.href) + '?' + str;
    } else {
	  return location.href;
    }
  },

  handleEmailClick: function(event) {
    event.preventDefault();
    var emailBody = Utils.getLocalizedString(
      this.props.language,
      CONSTANTS.SKIN_TEXT.EMAIL_BODY,
      this.props.localizableStrings
    );
    var mailToUrl = 'mailto:';
    mailToUrl += '?subject=' + encodeURIComponent(this.props.contentTree.title);
    mailToUrl += '&body=' + encodeURIComponent(emailBody + this.getShareLocation());
    // location.href = mailToUrl; //same window
    // TODO: Add html5-common to html5-skin?
    if (OO.isIos && OO.isSafari) {
      document.location = mailToUrl;
    } else {
      var emailWindow = window.open(mailToUrl, 'email', 'height=315,width=780'); // new window
      setTimeout(function() {
        try {
          // If we can't access href, a web client has taken over and this will throw
          // an exception, preventing the window from being closed.
          var test = emailWindow.location.href;
          emailWindow.close();
        } catch (e) {
          console.log('email send error - ', e);
        }
        // Generous 2 second timeout to give the window time to redirect if it's going to a web client
      }, 2000);
    }
  },

  handleFacebookClick: function() {
    var facebookUrl = 'http://www.facebook.com/sharer.php';
    facebookUrl += '?u=' + encodeURIComponent(this.getShareLocation());
    window.open(facebookUrl, 'facebook window', 'height=315,width=780');
  },

  handleGPlusClick: function() {
    var gPlusUrl = 'https://plus.google.com/share';
    gPlusUrl += '?url=' + encodeURIComponent(this.getShareLocation());
    window.open(
      gPlusUrl,
      'google+ window',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
  },

  handleTwitterClick: function() {
    var twitterUrl = 'https://twitter.com/intent/tweet';
    twitterUrl += '?text=' + encodeURIComponent(this.props.contentTree.title + ': ');
    twitterUrl += '&url=' + encodeURIComponent(this.getShareLocation());
    window.open(twitterUrl, 'twitter window', 'height=300,width=750');
  },

  showPanel: function(panelToShow) {
    this.setState({ activeTab: panelToShow });
  },

  render: function() {
    var shareContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.shareContent');
    var socialContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.socialContent', []);
    if (!shareContent) return null;

    var showEmbedTab = false;
    var showShareTab = false;

    for (var i = 0; i < shareContent.length; i++) {
      if (shareContent[i] === this.tabs.EMBED) showEmbedTab = true;
      if (shareContent[i] === this.tabs.SHARE && socialContent.length) showShareTab = true;
    }

    var shareTab = ClassNames({
      'oo-share-tab': true,
      'oo-active': this.state.activeTab === this.tabs.SHARE,
      'oo-hidden': !showShareTab
    });
    var embedTab = ClassNames({
      'oo-embed-tab': true,
      'oo-active': this.state.activeTab === this.tabs.EMBED,
      'oo-hidden': !showEmbedTab
    });

    var shareString = Utils.getLocalizedString(
        this.props.language,
        CONSTANTS.SKIN_TEXT.SHARE,
        this.props.localizableStrings
      ),
        embedString = Utils.getLocalizedString(
        this.props.language,
        CONSTANTS.SKIN_TEXT.EMBED,
        this.props.localizableStrings
      );

    return (
      <div className="oo-content-panel oo-share-panel">
        <div className="oo-tab-row">
          <a className={shareTab} onClick={this.showPanel.bind(this, this.tabs.SHARE)}>
            {shareString}
          </a>
          <a className={embedTab} onClick={this.showPanel.bind(this, this.tabs.EMBED)}>
            {embedString}
          </a>
        </div>
        {this.getActivePanel()}
      </div>
    );
  }
});

SharePanel.defaultProps = {
  contentTree: {
    title: ''
  }
};

module.exports = SharePanel;
