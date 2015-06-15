document.getElementsByTagName("h3")[0].innerHTML = "Unofficial DFO Firefox Launcher";
function addElement() {
  var ni = document.getElementById('container');
  var numi = document.getElementsByClassName('txt_def')[0];
  var num = (document.getElementsByClassName('txt_def')[0].value -1)+ 2;
  numi.value = num;
  var newdiv = document.createElement('div');
  var divIdName = 'my'+num+'Div';
  newdiv.setAttribute('id',divIdName);
  newdiv.innerHTML = '<b>By using this page outside of the official launcher,<br> you are willingly using an unofficial method and have read the disclaimer <a href=http://www.dfonexus.com/threads/firefox-dfo-launcher.2870>shown Here!</a>';
  ni.appendChild(newdiv);
  
}
addElement()

