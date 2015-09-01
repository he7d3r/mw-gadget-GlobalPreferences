GlobalPreferences
===========================
An script to set global preferences when the user visits a wiki.

How it works
============
The script reads the preferences "userjs-global-preferences" and "userjs-global-preferences-exceptions" from a central wiki (Meta-wiki). The first of them contains the preferences the user wants to set on each wiki. The second one is for the user to set exceptions, to allow some wikis to have values different from the global ones.

Examples
========

* "userjs-global-preferences":
```javascript
{"language":"en","echo-email-format":"plain-text","watchdefault":"1"}
```

* "userjs-global-preferences-exceptions":
```javascript
{"ptwiki":["language"],"ptwikibooks":["language"]}
```

For now, in order to save JSON objects like these in the Meta-wiki preference, the script provides two links in the actions menu (the one which contains the "Move" link), which shows a simple prompt when activated. The user needs to copy/write a JSON string to the prompt, and press OK. In the future ([issue #1](/../../issues/1)), a better interface should be provided to help the users (and to avoid syntax errors).

If everything goes well, the choosen preferences should be copied to other wikis when you visit them (it will show a notification in the top right corner of the page).

Installation
===========================

1. Go to one of the js subpages of your user page. You can choose a page such as these:
  * [meta:User:`<Name>`/global.js](https://meta.wikimedia.org/wiki/Special:MyPage/global.js), which will be loaded in all wikis, in all skins
  * [meta:User:`<Name>`/common.js](https://meta.wikimedia.org/wiki/Special:MyPage/common.js), which will be loaded only on Meta-wiki, in all skins
  * [meta:User:`<Name>`/vector.js](https://meta.wikimedia.org/wiki/Special:MyPage/vector.js), which will be loaded only on Meta-wiki, in the vector skin
2. Copy the following to the page you have chosen:

  ```javascript
  // [[File:User:He7d3r/Tools/GlobalPreferences.js]] (workaround for [[phab:T35355]])
  mw.loader.load( '//meta.wikimedia.org/w/index.php?title=User:He7d3r/Tools/GlobalPreferences.js&action=raw&ctype=text/javascript' );
  ```

3. Clear the cache of your browser.

This will import the minified copy of the script I maintain on Meta-wiki.
