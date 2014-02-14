/**
 * Set my common preferences in the first time I visit some wiki
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/changeMyPrefs.js]] ([[File:User:Helder.wiki/Tools/changeMyPrefs.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 120, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

function setPrefs() {
	var api = new mw.Api();
	api.get( {
		action: 'tokens',
		type: 'options'
	} )
	.done( function ( data ) {
		api.post( {
			action: 'options',
			token: data.tokens.optionstoken,
			change: 'language=en|fancysig=1|userjs-already-set-common-preferences=1',
			optionname: 'nickname',
			optionvalue: '[[b:pt:User:' + mw.config.get('wgUserName') + '|' + mw.config.get('wgUserName') + ']]'
		} )
		.done( function () {
			mw.notify( 'Your "global" preferences were copied to this wiki.', { autoHide: false } );
		} );
	} );
}

mw.loader.using( 'user.options', function(){
	if( !mw.user.options.get( 'userjs-already-set-common-preferences' ) &&
		mw.config.get( 'wgContentLanguage' ) !== 'pt'
	){
		mw.loader.using( [ 'mediawiki.api', 'mediawiki.notify' ], function(){
			$( setPrefs );
		} );
	}
} );

}( mediaWiki, jQuery ) );