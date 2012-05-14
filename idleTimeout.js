//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0
//## United States License. To view a copy of this license,
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######

/*
This jQuery plugin is an extended version of Phil Palmieris work; http://philpalmieri.com/2009/09/jquery-session-auto-timeout-with-prompt/

My extension is listening to the jQuery event ajaxSend so that the timeout is reset when other ajax requests are sent (assuming they will reset the session timeout on the server)

/Jonas Myrenås, jonas@myrenas.se
*/

/*
This plugin is modified to open or not to open the dialog based on the value of a property. I have added the showDialog property to the defaults object, set the value of this field to true by default. If the value of the property showDialog is false, noconfirm is set to 0 and the dialog will not appear.

/S. Ravi Kiran, Twitter handle: @sravi_kiran
*/

(function($) {
    $.fn.idleTimeout = function(options) {
        var defaults = {
            inactivity: 1200000, //20 Minutes
            noconfirm: 10000, //10 Seconds
            sessionAlive: 30000, //10 Minutes
            redirect_url: '/js_sandbox/',
            click_reset: true,
            alive_url: '/js_sandbox/',
            logout_url: '/js_sandbox/',
            useAjaxSend: false,
			showDialog: true
        };

        //##############################
        //## Private Variables
        //##############################
        var opts = $.extend(defaults, options);
        var liveTimeout, confTimeout, sessionTimeout;
        var modal = "<div id='modal_pop'><p>You are about to be signed out due to inactivity.</p></div>";
		if (!opts.showDialog) {
            opts.noconfirm = 0;
        }
        //##############################
        //## Private Functions
        //##############################
        var start_liveTimeout = function() {
            clearTimeout(liveTimeout);
            clearTimeout(confTimeout);
            liveTimeout = setTimeout(logout, opts.inactivity);

            if (opts.sessionAlive) {
                clearTimeout(sessionTimeout);
                sessionTimeout = setTimeout(keep_session, opts.sessionAlive);
            }
        };

        var logout = function() {

            confTimeout = setTimeout(redirect, opts.noconfirm);
            if (opts.showDialog) {
				$(modal).dialog({
					buttons: {"Stay Logged In":  function() {
						$(this).dialog('close');
						stay_logged_in();
					}},
					modal: true,
					title: 'Auto Logout'
				});
			}
        };

        var redirect = function() {
            if (opts.logout_url) {
                $.get(opts.logout_url);
            }
            window.location.href = opts.redirect_url;
        };

        var stay_logged_in = function(el) {
            start_liveTimeout();
            if (opts.alive_url) {
                $.get(opts.alive_url);
            }
        };

        var keep_session = function() {
            opts.useAjaxSend = false;

            $.get(opts.alive_url);
            clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(keep_session, opts.sessionAlive);

            opts.useAjaxSend = true;
        };

        //Bind keep_alive to ajaxSend-event, so any ajax event resets the timer
        this.ajaxSend(function(){
            if(opts.useAjaxSend){
                //console.log("ajaxSend triggered");
                keep_session();
            }
        });

        //###############################
        //Build & Return the instance of the item as a plugin
        // This is basically your construct.
        //###############################
        return this.each(function() {
            obj = $(this);

            start_liveTimeout();
            if (opts.click_reset) {
                $(document).bind('click', start_liveTimeout);
            }
            if (opts.sessionAlive) {
                keep_session();
            }
            opts.useAjaxSend = true;
        });

    };
}(jQuery));
