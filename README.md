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
