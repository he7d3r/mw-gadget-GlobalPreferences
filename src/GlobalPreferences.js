/**
 * Set my common preferences in the first time I visit some wiki
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/changeMyPrefs.js]] ([[File:User:Helder.wiki/Tools/changeMyPrefs.js]])
 * TODO: Add ability to define a list of preferences whose values should be copied from a "home wiki". Store such a list as a preference in the home wiki.
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 120, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';
// FIXME: Allow users to customize this
var curVersion = 2,
	prefsVersion;

function updatePrefs() {
	var api = new mw.Api();
	api.get( {
		action: 'tokens',
		type: 'options'
	} )
	.done( function ( data ) {
		api.post( {
			action: 'options',
			token: data.tokens.optionstoken,
			change: 'language=en|fancysig=1|userjs-already-set-common-preferences=' + curVersion,
			optionname: 'nickname',
			optionvalue: '[[' +
				( /wikibooks$/.test( mw.config.get( 'wgDBname' ) ) ? '' : 'b' ) +
				':pt:User:' + mw.config.get('wgUserName') + '|' + mw.config.get('wgUserName') + ']]'
		} )
		.done( function () {
			mw.notify(
				'The version ' + curVersion + ' of your "global" preferences were copied to this wiki.',
				{ autoHide: false }
			);
		} );
	} );
}

mw.loader.using( 'user.options', function(){
	prefsVersion = parseInt( mw.user.options.get( 'userjs-already-set-common-preferences' ), 10 ) || 0;
	if( prefsVersion < curVersion && $.inArray( mw.config.get( 'wgContentLanguage' ), [ 'pt', 'pt-br' ] ) === -1 ){
		mw.loader.using( [ 'mediawiki.api', 'mediawiki.notify' ], function(){
			$( updatePrefs );
		} );
	}
} );

}( mediaWiki, jQuery ) );