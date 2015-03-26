// ==UserScript==
// @name DFOG LAUNCHER
// @namespace http://www.example.com/ juliet/
// @description does dirty magic
// @include https://member.dfoneople.com/launcher/main*
// ==/UserScript== 
$(document).ready(function(){
  //do work
	var dfolaunch = $("iframe").attr('src');
	dfolaunch = dfolaunch.replace('dfoglobal://0/','')
	dfolaunch = dfolaunch.replace('/','?')
	dfolaunch = ("start dfo.exe 9?52.0.226.21?7101?" + dfolaunch + "?0?0?0?0?0?2?0?0?0?0?0?0?0")
	document.write(dfolaunch)
});
