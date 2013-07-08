/**
 * Changes my preferences on several wikis
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/changeMyPrefs.js]] ([[File:User:Helder.wiki/Tools/changeMyPrefs.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, devel: true, maxlen: 120, evil: true, onevar: true */
/*global mediaWiki */
( function ( mw ) {
'use strict';

var wikis = [ '//ja.wikipedia.org', '//xal.wikipedia.org' ];

function changeMyPrefsOn( server ) {
	var api = new mw.Api( {
		ajax: {
			url: server + '/w/api.php',
			dataType: 'jsonp'
		}
	} );

	api.get( {
		action: 'tokens',
		type: 'options'
	} )
	.done( function ( data ) {
		console.log( data );
		api.post( {
			action: 'options',
			token: data.tokens.optionstoken,
			change: 'language=en|fancysig=1',
			optionname: 'nickname',
			optionvalue: '[[b:pt:User:' + mw.config.get('wgUserName') + '|' + mw.config.get('wgUserName') + ']]'
		} )
		.done( function ( data ) {
			console.log( data );
		} )
		.fail( function ( data ) {
			console.log( data );
		} );
	} )
	.fail( function ( data ) {
		console.log( data );
	} );
}

mw.loader.using( 'mediawiki.api', function(){
	var i;
	for ( i = 0; i < wikis.length; i++) {
		changeMyPrefsOn( wikis[i] );
	}
} );

}( mediaWiki ) );