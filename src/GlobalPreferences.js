/**
 * Set global preferences when I visit some wiki
 * 
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/GlobalPreferences.js]] ([[File:User:Helder.wiki/Tools/GlobalPreferences.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 120, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

mw.messages.set( {
	'global-preferences-changed': 'Some of your preferences were changed on this wiki: $1.',
	'global-preferences-set': 'Set global preferences',
	'global-preferences-set-desc': 'Set the your global preferences by providing a ' +
		'string in JSON format',
	'global-preferences-set-prompt': 'Provide JSON string representing the preferences ' +
		'you want to set as global preferences.'
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
		$.each( prefs, function( pref, value ){
			var str = typeof value === 'object' ? JSON.stringify( value ) : value.toString();
			if( str.toString().indexOf( '|' ) !== -1 ) {
				promises.push( api.post( {
					action: 'options',
					optionname: pref,
					optionvalue: value,
					token: data.tokens.optionstoken
				} ) );
			} else {
				grouped.push( pref + '=' + value );
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
				mw.msg(
					'global-preferences-changed',
					JSON.stringify( prefs, null, 2 )
				),
				{ autoHide: false }
			);
		} );
	} );
}
function setGlobalPreferences( e ){
	var prefs = prompt( mw.msg( 'global-preferences-set-prompt' ) );
	e.preventDefault();
	if ( prefs ){
		try {
			JSON.parse( prefs );
		} catch ( err ) {
			alert( err );
			return;
		}
	}
	setPreferences( { 'userjs-global-preferences': prefs } );
}

function getGlobalPreferences(){
	var localServer = mw.config.get( 'wgServer' ),
		// Change this using mw.user.options.set( 'global-preferences-server', '//some.wiki.org' )
		globalServer = mw.user.options.get( 'global-preferences-server', '//meta.wikimedia.org' ),
		ajaxParams = {},
		params = {
			action: 'query',
			meta: 'userinfo',
			uiprop: 'options'
		};

	if( globalServer === localServer ){
		$( function(){
			$( mw.util.addPortletLink(
				'p-cactions',
				'#',
				mw.msg( 'global-preferences-set' ),
				'ca-global-preferences',
				mw.msg( 'global-preferences-set-desc' )
			) ).click( setGlobalPreferences );
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
	.done( function( data ){
		var i, opts = data.query.userinfo.options,
			prefs = opts[ 'userjs-global-preferences' ],
			exceptions = opts[ 'userjs-global-preferences-exceptions' ];
		if( !prefs ) {
			return;
		}
		prefs = JSON.parse( prefs );
		if( exceptions ) {
			exceptions = JSON.parse( exceptions )[ mw.config.get( 'wgDBname' ) ];
			if( exceptions === '*' ) {
				return;
			}
			if( $.isArray( exceptions ) ) {
				for( i = 0; i < exceptions.length; i++ ){
					delete prefs[ exceptions[i] ];
				}
			}
		}
		for( i in prefs ){
			if ( prefs[ i ] === mw.user.options.get( i ) ){
				delete prefs[ i ];
			}
		}
		if( $.isEmptyObject( prefs ) ) {
			return;
		}
		$.when( $.ready, mw.loader.using( 'mediawiki.notify' ) )
		.then( function(){
			setPreferences( prefs );
		} );
	} );
}

mw.loader.using( [ 'mediawiki.api', 'user.options' ], getGlobalPreferences );

}( mediaWiki, jQuery ) );