//Written by DenwaOtoko over a night of sleep deprivation
//THIS SOFTWARE IS NOT ENDORSED NOR SUPPORTED BY NEOPLE
//ALL RIGHTS RESERVED TO THEIR RESPECTIVE OWNERS
const {Cc, Ci, Cu, components} = require("chrome");
Cu.import("resource://gre/modules/Downloads.jsm");
const { OS } = Cu.import("resource://gre/modules/osfile.jsm", {});

//Easily change in the future in case Neople changes things around
const ip = "52.0.226.21"
const port = "7101"

var dfolaunch = ""
var dfoi = "" 
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var preferences = require("sdk/simple-prefs").prefs;

//Create BATCH file
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");

// file is nsIFile, data is a string

// You can also optionally pass a flags parameter here. It defaults to
// FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
var nsifile   = new FileUtils.File( OS.Constants.Path.tmpDir+"\\test.bat" )
var ostream = FileUtils.openSafeFileOutputStream(nsifile);
var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Ci.nsIScriptableUnicodeConverter);
converter.charset = "UTF-8";
var istream = converter.convertToInputStream("@ECHO OFF\r\n%3:\r\ncd %2\r\nstart DFO.exe %1");

// The last argument (the callback) is optional.
NetUtil.asyncCopy(istream, ostream, function(status) {
  if (!components.isSuccessCode(status)) {
    // Handle error!
    return;
  }

  // Data has been written to the file.
});
var nsifile   = new FileUtils.File( OS.Constants.Path.tmpDir+"\\patch.bat" )
var ostream = FileUtils.openSafeFileOutputStream(nsifile);
var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Ci.nsIScriptableUnicodeConverter);
converter.charset = "UTF-8";
var istream = converter.convertToInputStream("@ECHO OFF\r\n%2:\r\ncd %1\r\nstart LauncherUpdator.exe");

// The last argument (the callback) is optional.
NetUtil.asyncCopy(istream, ostream, function(status) {
  if (!components.isSuccessCode(status)) {
    // Handle error!
    return;
  }

  // Data has been written to the file.
});

//REGISTRY
var wrk = Cc["@mozilla.org/windows-registry-key;1"]
                    .createInstance(Ci.nsIWindowsRegKey);
wrk.open(wrk.ROOT_KEY_CURRENT_USER,
         "SOFTWARE\\Neople_DFO",
         wrk.ACCESS_READ);
var dfoDir = wrk.readStringValue("Path");
//console.log(dfoDir)
wrk.close();

//MD5 SECTION -- Used to prevent outdated clients from launching


function toHexString(charCode) {
  return ("0" + charCode.toString(16)).slice(-2);
}

//Stolen code from Mozilla's Development site: https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_reusable_modules
function md5File(path) { 
  var f = Cc["@mozilla.org/file/local;1"]
          .createInstance(Ci.nsILocalFile);
  f.initWithPath(path);
  var istream = Cc["@mozilla.org/network/file-input-stream;1"]           
                .createInstance(Ci.nsIFileInputStream);
  // open for reading
  istream.init(f, 0x01, 0444, 0);
  var ch = Cc["@mozilla.org/security/hash;1"]
           .createInstance(Ci.nsICryptoHash);
  // we want to use the MD5 algorithm
  ch.init(ch.MD5);
  // this tells updateFromStream to read the entire file
  const PR_UINT32_MAX = 0xffffffff;
  ch.updateFromStream(istream, PR_UINT32_MAX);
  // pass false here to get binary data back
  var hash = ch.finish(false);

  // convert the binary hash data to a hex string.
  var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
  return s;
}
//END OF MD5


var button = buttons.ActionButton({
  id: "dfolauncherbutton",
  label: "Open DFOG Login",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick

});
button.state("window", { //disables the button to prevent accidental launch
    //disabled: true
});
button.badgeColor = "#000000"
button.badge = 0; //sets it to 0 for n0 g0
//

require("sdk/tabs").on("ready", logURL);
var self = require("sdk/self");



function logURL(tab) {
	button.badgeColor = "#000";
	button.badge = 0;
		button.state("window", {
					//disabled: true
	});
	dfoi = dfoDir;
	//dfoi = dfoi.replace("\\", "\\\\"); //properly parses directories
	var urly = tab.url;
	//console.log(urly)
	if (urly == "https://member.dfoneople.com/launcher/login" || urly == "https://member.dfoneople.com/launcher/main" || urly == "https://member.dfoneople.com/maintenance/launcher"){ 
	//I realized I needed the urly before the 2nd OR, but I'm too scared to remove it at this point
		//console.log("Grabbing package.lst")
		Downloads.fetch("http://download.dfoneople.com/Patch/package.lst", dfoi + "XignCode\\package.lst"); //Grabs a copy of the patch summary from Neople to check for file discrepancy
		var md5remote = (md5File(dfoi + "XignCode\\package.lst"));
		try {
			
			var md5localhash = (md5File(dfoi + "localpackage.lst"));
			//console.log("Remote " + md5remote)
			//console.log("Local " + md5localhash)
			
			if (md5localhash == md5remote){
				
				button.badgeColor = "#00FF44"; //notifies user that patch is not required, ready to login!
				//console.log("No patch required!");
				//console.log(tab.url);
				var urlx = tab.url;
				if (urlx == "https://member.dfoneople.com/launcher/main"){ //if we are at post-login, allow DFO to launch
					var worker = require("sdk/tabs").activeTab.attach({
							contentScriptFile: self.data.url("dfolhelper.js") //idk why I bothered to separate it
					});
					//button.label("Launch DFOG!")
					////console.log("We are on the page.");
					button.state("window", {
						disabled: false,
						label: ("Launch DFOG!")
					});
					button.badge = 5; //Five means GO
					button.badgeColor = "#0000FF";
				worker.port.on("dfoglobal", setdfolaunch); //gets login credentials
				}
			}
			else{ //DFO isn't patched, sets it to RED0
				button.badge = 0;
				button.badgeColor = "#FF0000";
				button.state("window", {
					//disabled: true
				});
				//console.log("DFO not patched")
				
			}
			
		}
		catch(err){
			//console.log("Compare FAILED");
			var worker = require("sdk/tabs").activeTab.attach({
							contentScriptFile: self.data.url("headerchanger2.js") //idk why I bothered to separate it
			});
			button.badge = 0;
				button.badgeColor = "#FF0000";
				button.state("window", {
					//disabled: true
			});
		}
		if (urly == "https://member.dfoneople.com/launcher/login"){
			if (md5localhash != md5remote){
				//console.log("Launching updater");
				try{
					var file = Cc["@mozilla.org/file/local;1"]
						.createInstance(Ci.nsIFile);
					file.initWithPath(OS.Constants.Path.tmpDir+"\\patch.bat"); //Launches patcher since game is outdated/corrupted
					var process = Cc["@mozilla.org/process/util;1"]
						.createInstance(Ci.nsIProcess);
					process.init(file);
					var dfoDrive = dfoi.substring(0, dfoi.indexOf(':'));
					var arg = [dfoi,dfoDrive];
					process.run(false, arg, arg.length); //and away you patch
				}
				catch(err){
					button.badgeColor = "#000";
					button.badge = 0;
					//console.log("Game directory not set?");
				}	
			}
			if (md5localhash == md5remote){
				var worker = require("sdk/tabs").activeTab.attach({
								contentScriptFile: self.data.url("headerchanger1.js") //idk why I bothered to separate it
				});
				
				var autoFill = preferences.autoFill;
				var autoLogin = preferences.autoLogin;
				if (autoFill == true){
					var testStr = "document.getElementById('e_mail').value = '" + preferences.accemail + "'";
					var testStr2 = "document.getElementById('pw').value = '" + preferences.accpass + "'";
					//console.log(testStr);
					//console.log(testStr2);
					var contentScriptString = String(testStr);
					var contentScriptString2 = String(testStr2);
					
					tabs.activeTab.attach({
						contentScript: [contentScriptString2, contentScriptString]
					});
					if (autoLogin == true){
						var worker = require("sdk/tabs").activeTab.attach({
								contentScriptFile: self.data.url("autologin.js") //it works !
						});
					}
					
				}
				
				
			}
		}
		else if (urly == "https://member.dfoneople.com/maintenance/launcher"){
			
		}
	}
	////console.log(md5localhash);
	////console.log(md5remote);
}
function setdfolaunch(heh){ //heh
	dfolaunch = heh;
	////console.log(tab.url);
}

function handleClick(state){
	var tabs = require('sdk/tabs');
	var urly = tabs.activeTab.url;
	//console.log(urly);
	if (urly == "https://member.dfoneople.com/launcher/main"){
		launchDFO();
	}
	else if (urly == "https://member.dfoneople.com/launcher/login" || urly == "https://member.dfoneople.com/maintenance/launcher"){
		
	}
	else {
		tabs.open("https://member.dfoneople.com/launcher/login");
	}
}

function launchDFO(){
		dfolaunch = dfolaunch.replace('dfoglobal://0/','') //removes extra crap
		dfolaunch = dfolaunch.replace('/','?') //replaces /'s with ?'s
		dfolaunch = "9?" + ip + "?" + port + "?" + dfolaunch + "?0?0?0?0?0?2?0?0?0?0?0?0?0" //adds IP/PORT info, might change idk hope not
		var file = Cc["@mozilla.org/file/local;1"]
			.createInstance(Ci.nsIFile);
			
		
		//Downloads.fetch("http://pastebin.com/raw.php?i=xY4hSGVH",OS.Path.join(OS.Constants.Path.tmpDir,
        //                             "test.bat")); //Grabs a copy of the patch summary from Neople to check for file discrepancy
		file.initWithPath(OS.Constants.Path.tmpDir+"\\test.bat"); //passes parameters to batch file to launch DFO, since DFO doesn't like being directly launched
		var process = Cc["@mozilla.org/process/util;1"]
			.createInstance(Ci.nsIProcess);
		process.init(file);
		var dfoDrive = dfoi.substring(0, dfoi.indexOf(':'));
		//console.log(dfoDrive);
		var arg = [dfolaunch,dfoi,dfoDrive];
		process.run(false, arg, arg.length); //and away you go
}



