// ==UserScript==
// @match http://*/*
// ==/UserScript==

window.addEventListener('load', function() {
var images = document.getElementsByTagName('img');
for (var i = 0; i < images.length; i++) {
images[i].src = images[i].src.replace('http://www.dfonexus.com/data/avatars/l/0/664.jpg', 'http://a.pomf.se/jqpwic.png');
images[i].src = images[i].src.replace('http://www.dfonexus.com/data/avatars/s/0/664.jpg', 'http://a.pomf.se/jqpwic.png');
images[i].src = images[i].src.replace('http://www.dfonexus.com/data/avatars/l/0/587.jpg', 'http://i2.kym-cdn.com/entries/icons/original/000/001/030/dickbutt.jpg');
}
}, false);

