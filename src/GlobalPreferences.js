/**
 * Set global preferences when I visit some wiki
 *
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
	'use strict';
	mw.messages.set( {
		'global-preferences-changed': 'Some of your preferences were changed on this wiki: $1.',
		'global-preferences-set': 'Set global preferences',
		'global-preferences-set-desc': 'Set the your global preferences by providing a ' +
			'string in JSON format',
		'global-preferences-set-prompt': 'Provide a JSON string representing the preferences ' +
			'you want to set as global preferences.',
		'global-preferences-exceptions-set': 'Set preference exceptions',
		'global-preferences-exceptions-set-desc': 'Set the exceptions to your global ' +
			'preferences by providing a string in JSON format',
		'global-preferences-exceptions-set-prompt': 'Provide a JSON string with database names ' +
			'as keys and "*" or arrays of preference names (the exceptions) as its values.'
	} );

	function setPreferences( prefs ) {
		var api = new mw.Api();
		api.get( {
			action: 'tokens',
			type: 'options'
		} )
		.done( function ( data ) {
			var promises = [],
				grouped = [];
			// Based on [[pl:MediaWiki:Gadget-gConfig.js]]
			$.each( prefs, function ( pref, value ) {
				var formatted = typeof value === 'object' ?
					JSON.stringify( value ) :
					value;
				if ( value.toString().indexOf( '|' ) !== -1 ) {
					promises.push( api.post( {
						action: 'options',
						optionname: pref,
						optionvalue: formatted,
						token: data.tokens.optionstoken
					} ) );
				} else {
					grouped.push( pref + '=' + formatted );
				}
			} );
			if ( grouped.length ) {
				promises.push( api.post( {
					action: 'options',
					change: grouped.join( '|' ),
					token: data.tokens.optionstoken
				} ) );
			}
			$.when.apply( $, promises )
			.done( function () {
				mw.notify(
					$( '<p></p>').append(
						mw.msg(
							'global-preferences-changed',
							'<pre style="white-space: pre-wrap;">' +
							JSON.stringify( prefs, null, 2 ) +
							'</pre>'
						)
					),
					{ autoHide: false }
				);
			} );
		} );
	}

	function setJsonPrefFromPrompt( msgName, prefName ) {
		var prefs = prompt( mw.msg( msgName ) ),
			obj = {};
		if ( prefs ) {
			try {
				JSON.parse( prefs );
			} catch ( err ) {
				alert( err );
				return;
			}
			obj[ prefName ] = prefs;
			setPreferences( obj );
		}
	}

	function setGlobalPreferencesExceptions( e ) {
		e.preventDefault();
		setJsonPrefFromPrompt(
			'global-preferences-exceptions-set-prompt',
			'userjs-global-preferences-exceptions'
		);
	}

	function setGlobalPreferences( e ) {
		e.preventDefault();
		setJsonPrefFromPrompt(
			'global-preferences-set-prompt',
			'userjs-global-preferences'
		);
	}

	function getGlobalPreferences() {
		var localServer = mw.config.get( 'wgServer' ),
			// Change this using mw.user.options.set( 'global-preferences-server', '//some.wiki.org' )
			globalServer = mw.user.options.get( 'global-preferences-server', '//meta.wikimedia.org' ),
			ajaxParams = {},
			params = {
				action: 'query',
				meta: 'userinfo',
				uiprop: 'options'
			};

		if ( globalServer === localServer ) {
			$( function () {
				$( mw.util.addPortletLink(
					'p-cactions',
					'#',
					mw.msg( 'global-preferences-set' ),
					'ca-global-preferences',
					mw.msg( 'global-preferences-set-desc' )
				) ).click( setGlobalPreferences );
				$( mw.util.addPortletLink(
					'p-cactions',
					'#',
					mw.msg( 'global-preferences-exceptions-set' ),
					'ca-global-preferences',
					mw.msg( 'global-preferences-exceptions-set-desc' )
				) ).click( setGlobalPreferencesExceptions );
			} );
		} else {
			params.origin = 'https:' + localServer;
			ajaxParams.url = globalServer + '/w/api.php';
			ajaxParams.xhrFields = {
				'withCredentials': true
			};
		}
		// Get the user preferences in the global server
		( new mw.Api( { ajax: ajaxParams } ) ).get( params )
		.done( function ( data ) {
			var i, opts = data.query.userinfo.options,
				prefs = opts[ 'userjs-global-preferences' ],
				exceptions = opts[ 'userjs-global-preferences-exceptions' ];
			if ( !prefs ) {
				return;
			}
			try {
				prefs = JSON.parse( prefs );
			} catch ( err ) {
				alert( err );
				return;
			}
			if ( exceptions ) {
				try {
					exceptions = JSON.parse( exceptions )[ mw.config.get( 'wgDBname' ) ];
				} catch ( err ) {
					alert( err );
					return;
				}
				if ( exceptions === '*' ) {
					return;
				}
				if ( $.isArray( exceptions ) ) {
					for ( i = 0; i < exceptions.length; i++ ) {
						delete prefs[ exceptions[i] ];
					}
				}
			}
			for ( i in prefs ) {
				// The use of strict comparison (===) seems to be problematic:
				// setting the 'searchNs0="1"' on metawiki (or ptwikibooks)
				// actually sets 'searchNs0=true' so, if the global
				// preference uses 'searchNs0="1"', it
				// would try to change the preference every time!
				// On the other hand, setting the 'searchNs9=true' on metawiki (or ptwikibooks)
				// actually sets 'searchNs9="true"', so if the global preference
				// uses 'searchNs9=true', it would also try to change the preference every time!
				// Moreover, the type of the saved values depend on the wiki:
				// * Setting searchNs12 to true on metawiki results in the bolean true
				// * Setting searchNs12 to true on ptwikibooks results in the string "true"
				// * Setting searchNs0 to true on both results in the bolean true
				// Será um bug na $wgUser->getOptions()? [[phab:T54542]]?
				/*jshint eqeqeq: false */
				if ( prefs[ i ] == mw.user.options.get( i ) ) {
					delete prefs[ i ];
				}
				/*jshint eqeqeq: true */
			}
			if ( $.isEmptyObject( prefs ) ) {
				return;
			}
			$.when( $.ready, mw.loader.using( 'mediawiki.notify' ) )
			.then( function () {
				setPreferences( prefs );
			} );
		} );
	}

	if ( mw.config.get( 'wgAction' ) === 'view' ) {
		mw.loader.using( [ 'mediawiki.api', 'user.options' ], getGlobalPreferences );
	}

}( mediaWiki, jQuery ) );
