// Copyright (c) 2009, Scott Ferguson
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the software nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY SCOTT FERGUSON ''AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL SCOTT FERGUSON BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function QuickReplyBox(forum_post_key) {
    this.forum_post_key = forum_post_key;
    this.create();
}

QuickReplyBox.prototype.create = function(username, quote) {

    // window.open("chrome-extension://lbeflkohppahphcnpjfgffckhcmgelfo/quick-reply.html", "Quick Reply","menubar=no,width=720,height=425,toolbar=no");
    var html = '<div id="quick-reply"> ' + 
                '   <form enctype="multipart/form-data" action="newreply.php" name="vbform" method="POST" onsubmit="return validate(this)">' +
                '       <input type="hidden" name="action" value="postreply">' + 
                '       <input type="hidden" name="threadid" value="' + findThreadID() + '">' + 
                '       <input type="hidden" name="formkey" value="' + this.forum_post_key + '">' + 
                '       <input type="hidden" name="form_cookie" value="postreply">' + 
                '       <div id="title-bar">' + 
                '           Quick Reply' + 
                '       </div>' +
                '       <div id="view-buttons">' + 
                '          <a id="toggle-view"><img id="quick-reply-rollbutton" class="quick-reply-image" src="' + chrome.extension.getURL("images/") + "quick-reply-rolldown.gif" + '"></a>' +
                '          <a id="dismiss-quick-reply"><img class="quick-reply-image" src="' + chrome.extension.getURL("images/") + "quick-reply-close.gif" + '"></a>' +
                '       </div>' +
                '       <div id="post-input-field">' +
                '<textarea name="message" rows="18" size="10" id="post-message">' +
                '</textarea>' +
                '       </div>' +
                '       <div id="post-options">' +
                '           <input type="checkbox" name="parseurl" value="yes" checked>' +
                '              <span class="post-options">Automatically parse URLs</span>' +
                '           </input>' + 
                // TODO: Make the "bookmark threads" default an option
                '           <input type="checkbox" name="bookmark" value="yes">' + 
                '              <span class="post-options">Bookmark thread</span>' +
                '           </input>' + 
                '           <input type="checkbox" name="disablesmilies" value="yes">' + 
                '               <span class="post-options">Disable smilies</span>' +
                '           </input>' + 
                '           <input type="checkbox" name="signature" value="yes">' + 
                '               <span class="post-options">Show signature</span>' +
                '          </input>' + 
                '       </div>' +
                '       <div id="submit-buttons">' +
                '           <input type="submit" class="bginput" name="preview" value="Preview Reply">' + 
                '           <input type="submit" class="bginput" name="submit" value="Submit Reply">' + 
                '       </div>' +
                '   </form>' +
               '</div>';
               
    // Only append it if we haven't already
    if (jQuery('#quick-reply').length == 0) {
        jQuery('body').append(html);
    }

    jQuery('#dismiss-quick-reply').click(this.hide);
    
    jQuery('div#quick-reply').addClass('modal');

    var rollMin = "18px";
    var rollMax = jQuery(".modal").first().css("height");
    
    var that = this;
    
    jQuery('#toggle-view').click(function() {
        that.toggleView(rollMin, rollMax);
    });
    
    jQuery('#quick-reply').hide();
};

QuickReplyBox.prototype.appendQuote = function(username, quote) {

    username = username || false;
    quote = this.parseQuote(quote) || false;

    var quote_string = '';

    if (username && quote) {
        var current_message = jQuery('#post-message').html();

        quote_string += '[quote="' + username + '"]\n' + jQuery.trim(quote) + '\n[/quote]\n\n';

        jQuery('#post-message').html(current_message + quote_string);
    }
};

QuickReplyBox.prototype.show = function() {
    jQuery('#quick-reply').show("slow");
};

QuickReplyBox.prototype.hide = function() {
    jQuery('#quick-reply').hide("slow");
};

QuickReplyBox.prototype.parseQuote = function(quote_string) {
    var result = quote_string;
    var that = this;

    // Remove any quote blocks within the quote
    jQuery('div.bbc-block', result).each(function() {
        jQuery(this).remove();
    });

    jQuery('img', result).each(function() {
        var emoticon = that.parseSmilies(jQuery(this).attr('title'));

        if (emoticon) {
            jQuery(this).replaceWith(emoticon);
        }
    });

    // TODO: Need additional parsers

    return result.text();
};

QuickReplyBox.prototype.parseSmilies = function(quote_string) {
    var result = false;
    var end_index = quote_string.length - 1;

    var smilies = {
        ':(': '',
        ':)': '',
        ':D': '',
        ';)': '',
        ';-*': '',
    };

    if (quote_string[0] == ':' && quote_string[end_index] == ':') {
        result = quote_string;
    } else if (quote_string in smilies) {
        result = quote_string;
    }

    return result;
};

QuickReplyBox.prototype.toggleView = function(min, max) {
    divClass = jQuery(".modal").first();

    var imgId = jQuery("img#quick-reply-rollbutton").first();

    if( (divClass).css("height") == max ) {
        (divClass).animate( { height: min } );
        (imgId).attr("src", chrome.extension.getURL("images/") + "quick-reply-rollup.gif");
    } else {
        (divClass).animate( { height: max } );
        (imgId).attr("src", chrome.extension.getURL("images/") + "quick-reply-rolldown.gif");
    }
};
