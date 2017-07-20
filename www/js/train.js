
$(document).ready(function(){
	// written by Sean Megason, megason@hms.harvard.edu
	
	/*  Copyright (c) 2016, Sean Gregory Megason, Harvard Univeristy
		All rights reserved.
		
		Redistribution and use in source and binary forms, with or without
		modification, are permitted provided that the following conditions are met:
		    * Redistributions of source code must retain the above copyright
		      notice, this list of conditions and the following disclaimer.
		    * Redistributions in binary form must reproduce the above copyright
		      notice, this list of conditions and the following disclaimer in the
		      documentation and/or other materials provided with the distribution.
		    * Neither the name of the organization nor the
		      names of its contributors may be used to endorse or promote products
		      derived from this software without specific prior written permission.
		
		THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
		ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
		WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
		DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
		DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
		LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
		ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
		SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        
---------------
        Licenses for art:
        Bear- made by Oriole from http://www.blendswap.com/blends/view/76070 is CC-BY
	 */
	
	console.debug("readyXXXXX");
	console.log("READY");
/*	console.log("w = write tracks to console");
	console.log("l = load tracks from trx array");
	console.log("n = new user");
	console.log("s = sign in user");
	console.log("f = forgot password");
	console.log("b = browse tracks to download");
	console.log("left = decrement trx array");
	console.log("right = increment trx array");
*/	console.log("up = upload current track");
	console.log("down = download track by trackID");
		
	//console.log ("Document="+ document.URL);
	var newUserLink = document.getElementById('newuserlink');
	//console.log(newUserLink);
	newUserLink.style.cursor = 'pointer';
	newUserLink.onclick = function() {
	    console.log("New user clicked");
       	newUserDialog();
 	};

//    navigator.notification.alert("Ready");
    window.addEventListener('orientationchange', doOnOrientationChange);
 //   window.addEventListener('touchstart', doTouchStart(e));
    window.addEventListener('touchstart', function(e){
        doTouchStart(e);
    }, false)
    
    window.addEventListener('touchend', function(e){
        doTouchEnd(e);
    }, false)
    
    window.addEventListener('touchmove', function(e){
        doTouchMove(e);
    }, false)
 
 	window.addEventListener('keydown', function(event) {
 		//console.log ("Key="+event.keyCode);
        if (!showToolBar) return; //if toolbar hidden then ignore events

    	if(event.keyCode == 37) {
        	//console.log('Left was pressed');
        	nCurrentTrx--;
        	if (nCurrentTrx < 1) nCurrentTrx =1;
			openTrxJSON(trx[nCurrentTrx]);
			buildTrains();
			draw();
    	}
    	else if(event.keyCode == 38) {
        	console.log('Up was pressed');
        	zoomScale = zoomScale * zoomMultiplier;
        	draw();
 		}
    	else if(event.keyCode == 40) {
        	console.log('Down was pressed');
        	zoomScale = zoomScale / zoomMultiplier;
        	draw();
 		}
/*    	else if(event.keyCode == 76) {
        	//console.log('l pressed');
        	loadTracks();
 		}
    	else if(event.keyCode == 87) {
        	//console.log('w pressed');
        	writeTrx();
 		}
     	else if(event.keyCode == 78) {
        	//console.log('n pressed');
        	newUserDialog();
 		}
     	else if(event.keyCode == 83) {
        	//console.log('s pressed');
        	signinUserDialog();
 		}
     	else if(event.keyCode == 70) {
        	//console.log('f pressed');
        	forgotPasswordDialog();
 		}
     	else if(event.keyCode == 66) {
        	//console.log('b pressed');
        	browseTracksDialog();
 		}
 */    	else if(event.keyCode == 39) {
        	nCurrentTrx++;
        	//console.log('Right was pressed/ CurrentTrx='+nCurrentTrx);
 //       	if (nCurrentTrx > trx.length) nCurrentTrx = trx.length;
			openTrxJSON(trx[nCurrentTrx]);
			buildTrains();
			draw();
		}
	});   
          
    var useSprites = true;
 
	// "constants"
	var oct1 = Math.SQRT2/(2+2*Math.SQRT2);
	var oct2 = (Math.SQRT2 + 2)/(2+2*Math.SQRT2);

	//globals
	//Canvas stuff
    var canvas = $("#canvas")[0];
 
 	//passed params
 	// options:
 	//e.g. train.html?resize=0&toolbar=0&trx=[[[null%2Cn...
 	// resize=boolean  Allow automatic resizing?
 	// toolbar=boolean    Show toolbar?
 	// scale=percent Zoom level of canvas. 100%=normal
 	// trx=URIencoded(JSONstringified(trx)   If pass a trx it will display this in the trx[1] position. Can't be too long for URL though...
 	// trackID=111  Display trx with the given trackID
 	
 	//console.log ("href=" + location.href);
 	var params, data;
 	if (location.href.split('?')[1]) {
		params = location.href.split('?')[1].split('&');
		data = {};
		for (x in params) {
			data[params[x].split('=')[0]] = params[x].split('=')[1];
		}
	}
//	console.log("Data=");
//	console.log (data);

	var resizeCanvas = true;
	var showToolBar = true;
	var passedTrx;
	var passedTrackID;
	var zoomScale = 1;
	var zoomMultiplier = 1.1;	
	if (data) {
		if (data["resize"]) {
			if (data["resize"]==0) {
				resizeCanvas = false;
			}
		}
		passedStrTrx = data["trx"];
		if (passedStrTrx) {
			passedTrx = decodeURIComponent(passedStrTrx);
		}
		if (data["toolbar"]) {
			if (data["toolbar"]==0) {
				showToolBar = false;
			}
		}
		passedTrackID = data["trackID"];
		if (data["scale"]) {
			zoomScale = data["scale"]/100;
		}
	}
	console.log ("resize="+resizeCanvas);
	//console.log("trx="+passedTrx);
   
    var windowWidth = 100;
    var windowHeight = 100;
    var pixelRatio = 1; /// get pixel ratio of device
//    console.log ("width="+windowWidth+" height="+windowHeight+" ratio="+pixelRatio);
//    canvas.width = windowWidth;// * pixelRatio;   /// resolution of canvas
//    canvas.height = windowHeight;// * pixelRatio;
//    canvas.style.width = windowWidth + 'px';   /// CSS size of canvas
//    canvas.style.height = windowHeight + 'px';

	var ctx = canvas.getContext("2d");
    var canvasWidth;
    var canvasHeight;
	var numTilesX = 5;
	var numTilesY = 4; //recalcultated in calculateLayout()
	var buttonWidth = 76;
	var buttonPadding = 10;
	var toolBarWidth = buttonWidth+2*buttonPadding; //width of toolbar in pixels
	var toolBarHeight; //height of toolbar in pixels
	var tracksWidth; //width of the tracks area in pixels
	var tracksHeight; //height of the tracks area in pixels
    var tileRatio = 1.00; //aspect ratio of tiles
	var tileWidth=60;
	calculateLayout();
    var globalAlpha = 0.5;
    if (useSprites) {
        tileRatio = 57/63;
        globalAlpha = 1;
    }
	var insetWidth = 0.35*tileWidth;
	//var numTilesX = Math.floor(tracksWidth/tileWidth);
	//var numTilesY = Math.floor(tracksHeight/tileRatio/tileWidth);
    var trackArrayWidth = 10;
    var trackArrayHeight = 10;
	var tracks = createArray(trackArrayWidth, trackArrayHeight);
//	var tracks = createArray(Math.max(numTilesX, numTilesY), Math.max(numTilesX, numTilesY));
	var engines = [];
	var cars = [];
	var trains = []
	
	var interval = 0;	
	var skip = 10; // only interpret and draw every skip steps so as to allow acceleration of train
	var nIterations = 0;
	var isDrawingTrack = false;
	var isDrawingEngine = false;
	var isDrawingCar = false;
	var isErasing = false;
	var isSelecting = false;
	var isMoving = false; //for moving a selection
	var drawingPointsTrackX = new Array();
	var drawingPointsTrackY = new Array();
	var drawingPointsECX = new Array();
	var drawingPointsECY = new Array();
	var currentXTile; //for drawing track
	var currentYTile;
	var enteringOrientation; //for drawing track
	var exitingOrientation;
	var startXPoint; //for drawing engine
	var startYPoint;
	var startSelectX; //for drawing selection
	var startSelectY;
	var endSelectX; //for drawing selection
	var endSelectY;
	var startMoveX; //for moving selection
	var startMoveY;
	var endMoveX; //for moving selection
	var endMoveY;
	var currentCaptionedObject; //for making caption bubble for engine or car
	var captionX; //upper left x,y tile for caption bubble
	var captionY; //upper left x,y tile for caption bubble
	var secondaryCaption; //reference to array containing info about secondary caption
	var captionSecondaryX; //upper left x,y tile for secondary caption bubble (caption bubble off of primary bubble used as submenu)
	var captionSecondaryY; //upper left x,y tile for secondary caption bubble
	var maxEngineSpeed = 200; //in millitiles/iteration
	var nNumSpeeds = 20; //number of tick marks on speed controller for engine. Rounds to nearest tick mark
	var currentCaptionedButton;
	var buttonCaptionX;
	var buttonCaptionY;
	
	var currentUserID = 1; // userID for uploading tracks to database
	var currentUsername = "X"; // username for uploading tracks to database
		
	//cargo
	var cargoValues = []; // array of arrays of different types of cargo
	cargoValues.push( ['numbers', '0','1','2','3','4','5','6','7','8','9']);
	cargoValues.push( ['uppercase','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']); //26
	cargoValues.push( ['lowercase','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']); //26
	cargoValues.push( ['colors','white', 'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple']); //10
	var gColors = ['white', 'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple'];
	//cargoValues.push( ['binary','yes', 'no']); //2
	//cargoValues.push( ['shapes', 'point', 'line', 'triangle', 'square', 'pentagon', 'hexagon']); //6
	//cargoValues.push( ['safariAnimals','aardvark', 'cheetah', 'elephant', 'giraffe', 'hippo', 'lion', 'osterich', 'rhino', 'warthog', 'zebra']); //10
	cargoValues.push( ['dinosaurs', 'raptor', 'triceratops', 'stegosaurus', 'tyranisaurus', 'brontosaurus']); //5
	cargoValues.push( ['stuffedAnimals', 'bunny']);
	//var cargoJungleAnimals
	//var cargoAustralianAnimals
	//var cargoAmericanAnimals
	
	//buttonArrays - used to store the order in which buttons are displayed in captions
	var buttonsStation = [["none","pickDrop","supply","dump"],["increment","decrement","slingshot","catapult"],["add","subtract","multiply","divide"],["home","greentunnel","redtunnel","bluetunnel"]];
 	var buttonsWye = [["sprung", "lazy","alternate"],["prompt","compareLess","compareGreater"]];
 	var buttonsCargoTypes = [["numbers","uppercase","lowercase"],["colors","dinosaurs","stuffedAnimals"]] //needs to match the 0th element of each cargo subarray

	//images
	console.log("load images");
    var imgTerrain = new Image();
	imgTerrain.onload = function() {
    	//ctx.drawImage(imgTerrain, 0, 0);
    	draw();
  	};
        imgTerrain.src = 'img/WoodShutterstockLightSmall.jpg';
//        imgTerrain.src = 'img/rug-flower-720h.jpg';
//  	imgTerrain.src = 'img/rug-flower-880.jpg';
//  	imgTerrain.src = 'img/sisal-rug-880.jpg';
//  	imgTerrain.src = 'img/grass2.jpg';
//  	imgTerrain.src = 'img/cracked.png';
//  	imgTerrain.src = 'img/dirt.jpg';
	
	//load images for buttons in captions for choosing station type
	var imgCaptionNone = new Image(); imgCaptionNone.src = 'img/renders/CaptionButtons/none.png';
	var imgCaptionAdd = new Image(); imgCaptionAdd.src = 'img/renders/CaptionButtons/add.png';
	var imgCaptionCatapult = new Image(); imgCaptionCatapult.src = 'img/renders/CaptionButtons/catapult.png';
	var imgCaptionDecrement = new Image(); imgCaptionDecrement.src = 'img/renders/CaptionButtons/decrement.png';
	var imgCaptionDivide = new Image(); imgCaptionDivide.src = 'img/renders/CaptionButtons/divide.png';
	var imgCaptionDump = new Image(); imgCaptionDump.src = 'img/renders/CaptionButtons/dump.png';
	var imgCaptionIncrement = new Image(); imgCaptionIncrement.src = 'img/renders/CaptionButtons/increment.png';
	var imgCaptionMultiply = new Image(); imgCaptionMultiply.src = 'img/renders/CaptionButtons/multiply.png';
	var imgCaptionPickDrop = new Image(); imgCaptionPickDrop.src = 'img/renders/CaptionButtons/pickDrop.png';
	var imgCaptionSlingshot = new Image(); imgCaptionSlingshot.src = 'img/renders/CaptionButtons/slingshot.png';
	var imgCaptionSubtract = new Image(); imgCaptionSubtract.src = 'img/renders/CaptionButtons/subtract.png';
	var imgCaptionSupply = new Image(); imgCaptionSupply.src = 'img/renders/CaptionButtons/supply.png';
	var imgCaptionHome = new Image(); imgCaptionHome.src = 'img/renders/CaptionButtons/home.png';
	var imgCaptionGreenTunnel = new Image(); imgCaptionGreenTunnel.src = 'img/renders/CaptionButtons/greenTunnel.png';
	var imgCaptionRedTunnel = new Image(); imgCaptionRedTunnel.src = 'img/renders/CaptionButtons/redTunnel.png';
	var imgCaptionBlueTunnel = new Image(); imgCaptionBlueTunnel.src = 'img/renders/CaptionButtons/blueTunnel.png';

	//load images for buttons in captions for choosing wye type
	var imgCaptionAlternate = new Image(); imgCaptionAlternate.src = 'img/renders/CaptionButtons/alternate.png';
	var imgCaptionGreater = new Image(); imgCaptionGreater.src = 'img/renders/CaptionButtons/greater.png';
	var imgCaptionLazy = new Image(); imgCaptionLazy.src = 'img/renders/CaptionButtons/lazy.png';
	var imgCaptionLesser = new Image(); imgCaptionLesser.src = 'img/renders/CaptionButtons/lesser.png';
	var imgCaptionPrompt = new Image(); imgCaptionPrompt.src = 'img/renders/CaptionButtons/prompt.png';
	var imgCaptionSprung = new Image(); imgCaptionSprung.src = 'img/renders/CaptionButtons/sprung.png';

	//load the array of images for animating the engines. The images are renderings of a model from Blender from 64 different angles
	var imgEngine = [];
	for (var i=0; i<64; i++) {
		imgEngine[i] = new Image();
		var name = 'img/renders/Engine/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgEngine[i].src = name;
		//console.log("NAme="+name);
	}
	var imgEngineWidth = 92;
	
	//load the array of images for animating the cars. The images are renderings of a model from Blender from 64 different angles
	var imgCar = [];
	for (var i=0; i<32; i++) { //cars are symetrical front to back so just need 32 instead of 64 angles
		imgCar[i] = new Image();
		var name = 'img/renders/Car/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgCar[i].src = name;
	}
	var imgCarWidth = 92;

	//tracks
	//load the array of images for TrackStraight. The images are renderings of a model from Blender from 8 different angles
	var imgTrackStraight = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackStraight[i] = new Image();
		var name = 'img/renders/TrackStraight/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackStraight[i].src = name;
	}
	var imgTrackWidth = 92;
	
	var imgTrack90 = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrack90[i] = new Image();
		var name = 'img/renders/Track90/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrack90[i].src = name;
	}

	var imgTrack45 = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrack45[i] = new Image();
		var name = 'img/renders/Track45/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrack45[i].src = name;
	}

	var imgTrackCross = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackCross[i] = new Image();
		var name = 'img/renders/TrackCross/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackCross[i].src = name;
	}
	
	var imgRedTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgRedTunnel[i] = new Image();
		var name = 'img/renders/TunnelRed/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgRedTunnel[i].src = name;
	}
	
	var imgGreenTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgGreenTunnel[i] = new Image();
		var name = 'img/renders/TunnelGreen/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgGreenTunnel[i].src = name;
	}
	
	var imgBlueTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgBlueTunnel[i] = new Image();
		var name = 'img/renders/TunnelBlue/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgBlueTunnel[i].src = name;
	}
	
// WyeLeft
	var imgTrackWyeLeftAlternateL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftAlternateL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftAlternateL[i].src = name;
	}

	var imgTrackWyeLeftAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftAlternateR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftAlternateR[i].src = name;
	}

	var imgTrackWyeLeftLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLazyL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLazyL[i].src = name;
	}

	var imgTrackWyeLeftLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLazyR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLazyR[i].src = name;
	}	

	var imgTrackWyeLeftLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLesserL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLesserL[i].src = name;
	}

	var imgTrackWyeLeftLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLesserR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLesserR[i].src = name;
	}

	var imgTrackWyeLeftGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftGreaterL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftGreaterL[i].src = name;
	}

	var imgTrackWyeLeftGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftGreaterR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftGreaterR[i].src = name;
	}

	var imgTrackWyeLeftPromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftPromptL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftPromptL[i].src = name;
	}

	var imgTrackWyeLeftPromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftPromptR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftPromptR[i].src = name;
	}

	var imgTrackWyeLeftSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftSprungL[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftSprungL[i].src = name;
	}

	var imgTrackWyeLeftSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftSprungR[i] = new Image();
		var name = 'img/renders/TrackWyeLeft-Sprung-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftSprungR[i].src = name;
	}
	console.log("Loading wyes");
	
// WyeRight
	var imgTrackWyeRightAlternateL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightAlternateL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightAlternateL[i].src = name;
	}

	var imgTrackWyeRightAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightAlternateR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightAlternateR[i].src = name;
	}

	var imgTrackWyeRightLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLazyL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLazyL[i].src = name;
	}

	var imgTrackWyeRightLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLazyR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLazyR[i].src = name;
	}

	var imgTrackWyeRightLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLesserL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLesserL[i].src = name;
	}

	var imgTrackWyeRightLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLesserR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLesserR[i].src = name;
	}

	var imgTrackWyeRightGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightGreaterL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightGreaterL[i].src = name;
	}

	var imgTrackWyeRightGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightGreaterR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightGreaterR[i].src = name;
	}

	var imgTrackWyeRightPromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightPromptL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightPromptL[i].src = name;
	}

	var imgTrackWyeRightPromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightPromptR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightPromptR[i].src = name;
	}

	var imgTrackWyeRightSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightSprungL[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightSprungL[i].src = name;
	}

	var imgTrackWyeRightSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightSprungR[i] = new Image();
		var name = 'img/renders/TrackWyeRight-Sprung-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightSprungR[i].src = name;
	}

// Wye
	var imgTrackWyeAlternateL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeAlternateL[i] = new Image();
		var name = 'img/renders/TrackWye-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeAlternateL[i].src = name;
	}

	var imgTrackWyeAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeAlternateR[i] = new Image();
		var name = 'img/renders/TrackWye-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeAlternateR[i].src = name;
	}

	var imgTrackWyeLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLazyL[i] = new Image();
		var name = 'img/renders/TrackWye-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLazyL[i].src = name;
	}

	var imgTrackWyeLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLazyR[i] = new Image();
		var name = 'img/renders/TrackWye-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLazyR[i].src = name;
	}

	var imgTrackWyeLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLesserL[i] = new Image();
		var name = 'img/renders/TrackWye-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLesserL[i].src = name;
	}

	var imgTrackWyeLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLesserR[i] = new Image();
		var name = 'img/renders/TrackWye-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLesserR[i].src = name;
	}

	var imgTrackWyeGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeGreaterL[i] = new Image();
		var name = 'img/renders/TrackWye-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeGreaterL[i].src = name;
	}

	var imgTrackWyeGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeGreaterR[i] = new Image();
		var name = 'img/renders/TrackWye-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeGreaterR[i].src = name;
	}

	var imgTrackWyePromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyePromptL[i] = new Image();
		var name = 'img/renders/TrackWye-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyePromptL[i].src = name;
	}

	var imgTrackWyePromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyePromptR[i] = new Image();
		var name = 'img/renders/TrackWye-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyePromptR[i].src = name;
	}

	var imgTrackWyeSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeSprungL[i] = new Image();
		var name = 'img/renders/TrackWye-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeSprungL[i].src = name;
	}

	var imgTrackWyeSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeSprungR[i] = new Image();
		var name = 'img/renders/TrackWye-Sprung-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeSprungR[i].src = name;
	}
//
	var imgTrackCargo = [];
	for (var i=0; i<2; i++) { //one for each orientation
		imgTrackCargo[i] = new Image();
		var name = 'img/renders/TrackCargo/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackCargo[i].src = name;
	}

//stations
	console.log("Loading stations");
	var imgStationIncrement = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationIncrement[i] = new Image();
		var name = 'img/renders/StationIncrement/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationIncrement[i].src = name;
	}

	var imgStationDecrement = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDecrement[i] = new Image();
		var name = 'img/renders/StationDecrement/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDecrement[i].src = name;
	}

	var imgStationSupply = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSupply[i] = new Image();
		var name = 'img/renders/StationSupply/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSupply[i].src = name;
	}

	var imgStationDump = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDump[i] = new Image();
		var name = 'img/renders/StationDump/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDump[i].src = name;
	}

	var imgStationSlingshot = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSlingshot[i] = new Image();
		var name = 'img/renders/StationSlingshot/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSlingshot[i].src = name;
	}

	var imgStationCatapult = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationCatapult[i] = new Image();
		var name = 'img/renders/StationCatapult/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationCatapult[i].src = name;
	}

	var imgStationMultiply = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationMultiply[i] = new Image();
		var name = 'img/renders/StationMultiply/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationMultiply[i].src = name;
	}

	var imgStationDivide = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDivide[i] = new Image();
		var name = 'img/renders/StationDivide/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDivide[i].src = name;
	}

	var imgStationAdd = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationAdd[i] = new Image();
		var name = 'img/renders/StationAdd/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationAdd[i].src = name;
	}

	var imgStationSubtract = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSubtract[i] = new Image();
		var name = 'img/renders/StationSubtract/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSubtract[i].src = name;
	}

	var imgStationPickDrop = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationPickDrop[i] = new Image();
		var name = 'img/renders/StationPickDrop/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationPickDrop[i].src = name;
	}

	var imgStationHome = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationHome[i] = new Image();
		var name = 'img/renders/StationHome/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationHome[i].src = name;
	}

//cargo
	var imgCargoStuffedAnimals = [];
	for (var j=0; j<1; j++) {
		imgCargoStuffedAnimals[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoStuffedAnimals[j][i] = new Image();
			var name = 'img/renders/CargoBunny/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoStuffedAnimals[j][i].src = name;
//			console.log ("name="+name);
		}
	}

	console.log ("Loading cargo lower");

	lowercase = "abcdefghijklmnopqrstuvwxyz";
	uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var imgCargoLowercase = [];
	for (var j=0; j<26; j++) {
		imgCargoLowercase[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoLowercase[j][i] = new Image();
			var name = 'img/renders/CargoLowercase/Cargo-' + lowercase.charAt(j) + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoLowercase[j][i].src = name;
		}
	}

	console.log ("Loading cargo Upper");
	var imgCargoUppercase = []; ///need to render uppercase and switch this from lower to upper
	for (var j=0; j<26; j++) {
		imgCargoUppercase[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoUppercase[j][i] = new Image();
			var name = 'img/renders/CargoUppercase/Cargo-' + uppercase.charAt(j) + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoUppercase[j][i].src = name;
			//console.log("name="+name);
		}
	}

	console.log ("Loading cargo dino");
	var imgCargoDinosaurs = [];
	for (var j=0; j<5; j++) {
		imgCargoDinosaurs[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoDinosaurs[j][i] = new Image();
			var name = 'img/renders/CargoDinosaurs/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoDinosaurs[j][i].src = name;
			//console.log("file="+name);
		}
	}

	console.log ("Loading cargo numbers");
	var imgCargoNumbers = [];
	for (var j=0; j<10; j++) {
		imgCargoNumbers[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoNumbers[j][i] = new Image();
			var name = 'img/renders/CargoNumbers/Cargo-' + j + '/00';
//			var name = 'img/renders/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoNumbers[j][i].src = name;
			//console.log ("name="+name);
		}
	}

	console.log ("Loading cargo color");
	var imgCargoColors = [];
	for (var j=0; j<10; j++) {
		imgCargoColors[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoColors[j][i] = new Image();
			var name = 'img/renders/CargoColors/Cargo-' + gColors[j] + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			//console.log("name="+name);
			imgCargoColors[j][i].src = name;
		}
	}

	var imgCargoSafariAnimals = [];
/*	for (var j=0; j<10; j++) {
		imgCargoSafariAnimals[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoSafariAnimals[j][i] = new Image();
			var name = 'img/renders/CargoSafariAnimals/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoSafariAnimals[j][i].src = name;
		}
	}
*/
	console.log ("Done loading images");
	
	//colors
	var toolBarBackColor = "gray";
	var tracksBackColor = "DarkOliveGreen";
	var gridColor = "rgba(122,106,49,0.2)";
//	var gridColor = "rgba(220,255,220,0.4)";
	var tieColor = "#2A1506";
	var railColor = "Gray";
	var engineColor = "FireBrick";
	var captionColor = "lightyellow";
	var secondaryCaptionColor = "#CCCCB3";
	var insetStrokeColor = "lightslategray";
	var insetFillColor = "gainsboro";
	var highlightColor = "yellow";
	var carColor = "brown"; //"lightsteelblue";
	var cargoColor = "lightyellow";
	var saveButtonColors= [];
	saveButtonColors[0] = "red";
	saveButtonColors[1] = "orange";
	saveButtonColors[2] = "yellow";
	saveButtonColors[3] = "green";
	saveButtonColors[4] = "blue";
	saveButtonColors[5] = "indigo";
	saveButtonColors[6] = "violet";
	saveButtonColors[7] = "brown";
	saveButtonColors[8] = "black";
	
	var toolButtons = [];

	//Sounds
	var sounds = [];
	sounds["crash"] = new Audio("sound/crashShort.wav");
	sounds["switch"] = new Audio("sound/switch.wav");
	sounds["connect"] = new Audio("sound/TrainConnect.wav");
	sounds["choochoo"] = new Audio("sound/ChooChoo.wav");
	sounds["stop"] = new Audio("sound/TrainStop.wav");
	sounds["increment"] = new Audio("sound/BeepUp.wav");
	sounds["decrement"] = new Audio("sound/BeepDown.wav");
	sounds["dump"] = new Audio("sound/dump.wav");
	sounds["slingshot"] = new Audio("sound/sloop.wav");
	sounds["catapult"] = new Audio("sound/catapult-launch.wav");
	sounds["catapultWindup"] = new Audio("sound/catapult-windup.wav");
	sounds["supply"] = new Audio("sound/supply.wav");
	sounds["pickdrop"] = new Audio("sound/pickdrop.wav");
	sounds["pickdropReverse"] = new Audio("sound/pickdrop-reverse.wav");
	sounds["home"] = new Audio("sound/tada.wav");
	sounds["tunnel"] = new Audio("sound/Tunnel.wav");
	
	console.log("Load trx");
	var nCurrentTrx =1;
	var trx = [];
	var trxName = [];
//	trx[0] = '[[[{"gridx":0,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":0,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":0,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"lazy"},{"gridx":0,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"supply","cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":0,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":0,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},null,null,null],[{"gridx":1,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":1,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":2,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"decrement"},null,null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"compareLess","cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null,null],[{"gridx":5,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":0,"type":"EngineBasic","orientation":2,"state":"","speed":40,"position":0.5800000000000017}],[{"gridx":1,"gridy":0,"type":"CarBasic","orientation":2,"state":"","speed":40,"position":0.5800000000000017,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	trxName[1] = 'for loop';
	//set trx{1] to passedTrx if defined
	trx[1] = '[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"lazy"},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":7,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":8,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"compareGreater"},{"gridx":8,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":6,"gridy":5,"type":"EngineBasic","orientation":0,"state":"","speed":20,"position":0.5}],[{"gridx":6,"gridy":6,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5}]]';
	if (passedTrx) trx[1] = passedTrx;
	
	if (passedTrackID) {
		
	}
	
	//Hello World
	trx[2]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":1,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"slingshot"},{"gridx":1,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"slingshot"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":4,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":5,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":1,"gridy":2,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":2,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":4,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":4,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":7,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":4,"gridy":4,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":3,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":5,"gridy":4,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":6,"gridy":4,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":17,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":7,"gridy":3,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":22,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":7,"gridy":4,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}}]]';
	//Hello World with alternate switch
	trx[3]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackWye","orientation":6,"state":"left","subtype":"lazy"},{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"slingshot"},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":3,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"slingshot"},{"gridx":8,"gridy":3,"type":"TrackWye","orientation":2,"state":"left","subtype":"alternate"},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":7,"gridy":3,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":3,"gridy":1,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":4,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":3,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":2,"gridy":3,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":5,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":4,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":6,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":7,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":8,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":22,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":7,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":6,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":17,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":5,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":4,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":3,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}}]]';
	//Hellow World with if then
	trx[4]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackWye","orientation":6,"state":"left","subtype":"lazy"},{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":3,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"slingshot"},{"gridx":8,"gridy":3,"type":"TrackWye","orientation":2,"state":"right","subtype":"compareLess"},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"slingshot"},{"gridx":8,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":9,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":3,"type":"EngineBasic","orientation":2,"state":"","speed":40,"position":0.6599999999999988},{"gridx":3,"gridy":1,"type":"EngineBasic","orientation":6,"state":"","speed":40,"position":0.5}],[{"gridx":2,"gridy":3,"type":"CarBasic","orientation":0,"state":"","speed":40,"position":0.6599999999999988,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":2,"gridy":4,"type":"CarBasic","orientation":0,"state":"","speed":40,"position":0.6599999999999988,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":2,"gridy":5,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.6599999999999988,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":3,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":40,"position":0.6599999999999988,"cargo":{"value":4,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":4,"gridy":3,"type":"CarBasic","orientation":2,"state":"","speed":40,"position":0.6599999999999988,"cargo":{"value":7,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":8,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":40,"position":0.5,"cargo":{"value":3,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":7,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.5,"cargo":{"value":11,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":6,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.5,"cargo":{"value":17,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":5,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.5,"cargo":{"value":14,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":4,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.5,"cargo":{"value":22,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}}]]';	
	//Distributor
	trx[5]='[[[null,null,{"gridx":0,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":0,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":0,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":0,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":0,"gridy":7,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":0,"gridy":8,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":0,"gridy":9,"type":"Track90","orientation":4,"state":"left","subtype":""}],[{"gridx":1,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":1,"gridy":2,"type":"TrackCross","orientation":6,"state":"left","subtype":""},{"gridx":1,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,{"gridx":1,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":""}],[{"gridx":2,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"TrackWyeRight","orientation":0,"state":"right","subtype":"sprung"},{"gridx":2,"gridy":6,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":""}],[{"gridx":3,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackWye","orientation":2,"state":"right","subtype":"lazy"},{"gridx":3,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":3,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"}],[{"gridx":4,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":4,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":4,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"}],[{"gridx":5,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":5,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":6,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":7,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":5,"gridy":8,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":9,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"}],[{"gridx":6,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackWye","orientation":2,"state":"right","subtype":"lazy"},{"gridx":6,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":9,"type":"TrackStraight","orientation":2,"state":"left","subtype":""}],[{"gridx":7,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":9,"type":"TrackStraight","orientation":2,"state":"left","subtype":""}],[{"gridx":8,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":9,"type":"TrackStraight","orientation":2,"state":"left","subtype":""}],[{"gridx":9,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackWye","orientation":2,"state":"right","subtype":"lazy"},{"gridx":9,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":9,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":8,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":9,"type":"Track90","orientation":2,"state":"left","subtype":""}],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":0,"type":"EngineBasic","orientation":6,"state":"","speed":40,"position":0.5},{"gridx":5,"gridy":0,"type":"EngineBasic","orientation":6,"state":"","speed":0,"position":0.5},{"gridx":8,"gridy":0,"type":"EngineBasic","orientation":6,"state":"","speed":0,"position":0.5},{"gridx":11,"gridy":0,"type":"EngineBasic","orientation":6,"state":"","speed":0,"position":0.5}],[{"gridx":3,"gridy":0,"type":"CarBasic","orientation":6,"state":"","speed":40,"position":0.5,"cargo":{"value":3,"type":["colors","white","black","brown","red","orange","yellow","green","blue","cyan","purple"]}},{"gridx":6,"gridy":0,"type":"CarBasic","orientation":6,"state":"","speed":0,"position":0.5,"cargo":{"value":7,"type":["colors","white","black","brown","red","orange","yellow","green","blue","cyan","purple"]}},{"gridx":9,"gridy":0,"type":"CarBasic","orientation":6,"state":"","speed":0,"position":0.5,"cargo":{"value":3,"type":["colors","white","black","brown","red","orange","yellow","green","blue","cyan","purple"]}},{"gridx":12,"gridy":0,"type":"CarBasic","orientation":6,"state":"","speed":0,"position":0.5,"cargo":{"value":7,"type":["colors","white","black","brown","red","orange","yellow","green","blue","cyan","purple"]}}]]';
	
	
	//function (doesn't do anything interesting)
    trx[6]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"greentunnel"},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"greentunnel"},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":10,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":11,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":2,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';
	// two nested functions that dont do anything
    trx[7]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"greentunnel"},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":8,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":9,"type":"Track90","orientation":4,"state":"left","subtype":""}],[null,null,null,null,null,null,null,{"gridx":7,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":""}],[null,null,null,null,null,null,null,{"gridx":8,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"redtunnel"},null,{"gridx":8,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":""}],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"greentunnel"},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":9,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"}],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":10,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,{"gridx":10,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"increment"},null,{"gridx":10,"gridy":9,"type":"TrackStraight","orientation":6,"state":"left","subtype":""}],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"redtunnel"},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":11,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":11,"gridy":7,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":8,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":9,"type":"Track90","orientation":2,"state":"left","subtype":""}],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":2,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';
    //cargo types
    trx[8]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":4,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"increment"},null,null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["uppercase","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]}},{"gridx":2,"gridy":2,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["lowercase","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]}},{"gridx":2,"gridy":3,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["colors","white","black","brown","red","orange","yellow","green","blue","cyan","purple"]}},{"gridx":2,"gridy":4,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["dinosaurs","raptor","triceratops","stegosaurus","tyranisaurus","brontosaurus"]}}]]';
            	
	//Triceratops training
	//draw single gap straight
	//trx[6]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw bigger gap straight
	//trx[7]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":2,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":3,"gridy":7,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":8,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":4,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":9,"type":"TrackCargo","orientation":0,"state":"left","subtype":""}],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw single curve
	//trx[8]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw 2 curve fill gap
	trx[9]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw cross to fill gap
	trx[10]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw multiple crosses to fill gap
	trx[11]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//draw 45 to fill single gap
	trx[12]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"Track45","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//multiple gaps and crosses
	trx[13]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"TrackCross","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":5,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":11,"gridy":1,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//large gaps free draw
	trx[14]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":3,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"gridx":12,"gridy":6,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":7,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null],[null,null,null,null,null,null,{"gridx":13,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';	
	
	
	//connections- choose which car to connect to
	trx[15]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":12,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":10,"gridy":3,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":9,"gridy":3,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":0,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":11,"gridy":3,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":8,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":12,"gridy":3,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":6,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//connection- connect 3 cars in right order so triceratops is dropped off in last pd
	trx[16]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":9,"gridy":2,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":0,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":10,"gridy":2,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":11,"gridy":2,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":8,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":12,"gridy":2,"type":"CarBasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":6,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	
	
	//multithreaded- first train reverses lazy wye for second train
	trx[17]='[[[{"gridx":0,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":1,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":2,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":3,"gridy":3,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"TrackCross","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWye","orientation":0,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":5,"gridy":3,"type":"TrackWye","orientation":2,"state":"right","subtype":"lazy"},{"gridx":5,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,{"gridx":8,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":10,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":11,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":12,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":12,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":11,"gridy":6,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":7,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":12,"gridy":7,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//4 trains used to flip alternate wyes until they are lined up for triceratops
	trx[18]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":1,"type":"TrackWye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":3,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":4,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"TrackWye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":5,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":5,"gridy":4,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[{"gridx":7,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackWye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":8,"gridy":4,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"alternate"},{"gridx":8,"gridy":5,"type":"TrackWyeLeft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":6,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackWye","orientation":6,"state":"left","subtype":"prompt"},{"gridx":9,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":5,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null],[{"gridx":10,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":4,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"alternate"},{"gridx":10,"gridy":5,"type":"TrackWyeLeft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":6,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":0,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":8,"gridy":0,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":6,"gridy":0,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":4,"gridy":0,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":9,"gridy":0,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	


	//introduction to wyes
	//showing spring wyes but not using
	trx[15]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//showing spring wyes but not using-sprung other way
	trx[16]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//choose right wye
	trx[17]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"left","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//choose right wye other way
	trx[18]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//converging and diverging wyes, choose right branch
	trx[19]='[[[null,null,{"gridx":0,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//converging and diverging wyes, choose a different branch
	trx[20]='[[[null,null,{"gridx":0,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//lazy wye- send dummy engine through first to flip wye
	trx[21]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":3,"type":"TrackWyeLeft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,{"gridx":9,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":10,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":11,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":5,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":6,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":11,"gridy":5,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//lazy wyes- choose order to go through
	trx[22]='[[[null,{"gridx":0,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":1,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"TrackWye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackWye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5}]]';
	//prompts wye
	trx[23]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"TrackWye","orientation":2,"state":"left","subtype":"prompt"},{"gridx":7,"gridy":5,"type":"TrackWye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":6,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":7,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"right","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackCross","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":5,"type":"TrackCross","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackCross","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackWye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":5,"type":"TrackWye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":6,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":7,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":10,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":11,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":12,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":4,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":4,"gridy":4,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//compare wye to choose fork in track to station or not
	trx[24]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//compare wye at fork as above but other way
	trx[25]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//compare wye as above but greater than
	trx[26]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareGreater"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareGreater"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add two numbers and then choose wye
	trx[27]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add same as above but opposite choice for wye
	trx[28]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//increment and add then choose wye
	trx[29]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"increment"},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":11,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//subtraxt and then choose wye
	trx[30]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"subtract"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":7,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//multiply and then choose wye
	trx[31]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"multiply"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//divide and then choose wye
	trx[32]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"divide"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//for loop then choose wye
	trx[33]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"EngineBasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":7,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":2,"gridy":5,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
	//for loop as above but decrement rather than increment
	trx[34]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":"decrement"},{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareGreater"},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"EngineBasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":15,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":2,"gridy":5,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
	
	//catapult triceratops after 4 prompts
	trx[35]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":1,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":"increment"},{"gridx":4,"gridy":4,"type":"TrackWyeLeft","orientation":2,"state":"right","subtype":"prompt"},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeLeft","orientation":0,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"catapult"},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":13,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null]],[{"gridx":2,"gridy":4,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":4,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//test loop
	trx[36]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":3,"gridy":3,"type":"Track45","orientation":5,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"Track45","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":1,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":6,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,null,null],[null,{"gridx":5,"gridy":1,"type":"Track45","orientation":6,"state":"left","subtype":""},null,null,null,null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":6,"gridy":8,"type":"Track45","orientation":3,"state":"left","subtype":""},null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":7,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":8,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":9,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":10,"gridy":1,"type":"Track45","orientation":7,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":10,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,null,{"gridx":11,"gridy":2,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,{"gridx":11,"gridy":8,"type":"Track45","orientation":2,"state":"left","subtype":""},null],[null,null,null,{"gridx":12,"gridy":3,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,{"gridx":12,"gridy":7,"type":"TrackStraight","orientation":5,"state":"left","subtype":""},null,null],[null,null,null,null,{"gridx":13,"gridy":4,"type":"Track45","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":6,"type":"Track45","orientation":1,"state":"left","subtype":""},null,null,null]],[{"gridx":6,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[]]';
	// test loop diagonal
	trx[37]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[{"gridx":2,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":1,"type":"Track45","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"Track45","orientation":7,"state":"left","subtype":""},null,{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,{"gridx":8,"gridy":7,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":7,"state":"left","subtype":""},null,{"gridx":9,"gridy":8,"type":"Track90","orientation":3,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":10,"gridy":7,"type":"Track90","orientation":1,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":3,"state":"","speed":20,"position":0.5}],[]]';
	//handoff
    trx[38]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":5,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":6,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":7,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":8,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.7400000000001935},{"gridx":7,"gridy":2,"type":"EngineBasic","orientation":4,"state":"","speed":20,"position":0.04000000000019318}],[{"gridx":7,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.04000000000019318,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":8,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":2,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":3,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":4,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":5,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":4,"gridy":1,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":2,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":3,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":4,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":5,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":6,"type":"CarBasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935}]]';
 		
	//bunny rescue simple one gap
    trx[50]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":4,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';	
//    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":4,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"lazy"},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":0,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":6,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":7,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":8,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"compareGreater"},{"gridx":8,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":9,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"TrackCross","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":6,"gridy":5,"type":"EngineBasic","orientation":0,"state":"","speed":20,"position":0.5}],[{"gridx":6,"gridy":6,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5}]]';	
//    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';	nCurrentTrx = 50;
    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[52]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":2,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":3,"gridy":7,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":8,"type":"TrackWyeLeft","orientation":2,"state":"left","subtype":"sprung"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":4,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":9,"type":"TrackCargo","orientation":0,"state":"left","subtype":""}],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[53]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[54]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    

    trx[55]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[56]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[57]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"Track45","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[58]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"TrackCross","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":5,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":11,"gridy":1,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[59]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":3,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"gridx":12,"gridy":6,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":7,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null],[null,null,null,null,null,null,{"gridx":13,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[60]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":5,"gridy":5,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[61]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"left","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"home"},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[62]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"TrackWyeLeft","orientation":4,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":"home"},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[63]='[[[null,null,{"gridx":0,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":12,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[64]='[[[null,null,{"gridx":0,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":12,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[65]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":3,"type":"TrackWyeLeft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},{"gridx":6,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,{"gridx":9,"gridy":5,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":10,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":11,"gridy":5,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":6,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":5,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":6,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":11,"gridy":5,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[66]='[[[null,{"gridx":0,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":1,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"lazy"},null,null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":2,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"TrackWyeRight","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"TrackWye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackWye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"EngineBasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"CarBasic","orientation":6,"state":"","speed":20,"position":0.5}]]';
                                            

    trx[67]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":4,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"TrackWye","orientation":2,"state":"left","subtype":"prompt"},{"gridx":7,"gridy":5,"type":"TrackWye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":6,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":7,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeRight","orientation":0,"state":"right","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackCross","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"TrackWye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":5,"type":"TrackCross","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"TrackCross","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"TrackWye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":3,"type":"Track90","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"TrackWyeRight","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":5,"type":"TrackWye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":6,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":7,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":10,"gridy":6,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":11,"gridy":1,"type":"TrackWyeLeft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":12,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":4,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":4,"gridy":4,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[68]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';

    trx[69]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add
    trx[70]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add
    trx[71]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//increment + add
    trx[72]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"increment"},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//subtract
    trx[73]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"subtract"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":7,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//multiply
    trx[74]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"multiply"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
    //divide
    trx[75]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"TrackStraight","orientation":2,"state":"left","subtype":"divide"},{"gridx":6,"gridy":8,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
    //loop+compare
    trx[76]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"EngineBasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":2,"gridy":5,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":null}]]';
    //loop with decrement then switch                                                    
    trx[77]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"Track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"TrackWyeRight","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"TrackStraight","orientation":6,"state":"left","subtype":"decrement"},{"gridx":5,"gridy":8,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"TrackWyeRight","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"TrackWye","orientation":0,"state":"left","subtype":"compareGreater"},{"gridx":6,"gridy":8,"type":"Track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"TrackWyeLeft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"TrackStraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"Track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"TrackWye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"TrackStraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"EngineBasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":2,"gridy":5,"type":"CarBasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
 	//propmt loop with catapult
    trx[78]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":1,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":2,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"TrackWyeRight","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"TrackStraight","orientation":0,"state":"left","subtype":"increment"},{"gridx":4,"gridy":4,"type":"TrackWyeLeft","orientation":2,"state":"right","subtype":"prompt"},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"Track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"TrackCargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":6,"gridy":1,"type":"TrackStraight","orientation":6,"state":"left","subtype":"supply"},{"gridx":6,"gridy":2,"type":"TrackStraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"TrackStraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"TrackWyeLeft","orientation":0,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"catapult"},{"gridx":7,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"TrackCargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"Track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":4,"type":"Track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":13,"gridy":2,"type":"Track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":3,"type":"TrackStraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":4,"type":"Track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null]],[{"gridx":2,"gridy":4,"type":"EngineBasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":4,"type":"CarBasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
    
    openTrxJSON(trx[nCurrentTrx]);
	console.log("Done loading trx");
	buildTrains();
	console.log("Done building trains");
//	currentCaptionedObject = undefined;
	new ToolButton(buttonPadding, 8+1*buttonPadding+0*(1.1*buttonWidth), buttonWidth, buttonWidth, "Play", 0);

	new ToolButton(buttonPadding, 14+2*buttonPadding+1*(1.1*buttonWidth), buttonWidth, buttonWidth, "Track", 1);
	new ToolButton(buttonPadding, 14+2*buttonPadding+2*(1.1*buttonWidth), buttonWidth, buttonWidth, "Engine", 1);
	new ToolButton(buttonPadding, 14+2*buttonPadding+3*(1.1*buttonWidth), buttonWidth, buttonWidth, "Car", 1);
	new ToolButton(buttonPadding, 14+2*buttonPadding+4*(1.1*buttonWidth), buttonWidth, buttonWidth, "Cargo", 1);
	new ToolButton(buttonPadding, 14+2*buttonPadding+5*(1.1*buttonWidth), buttonWidth, buttonWidth, "Eraser", 1);
//	new ToolButton(padding, 3*buttonPadding+5*(1.1*buttonWidth), buttonWidth, buttonWidth, "Select", 1);

//	new ToolButton(padding, 4*buttonPadding+6*(1.1*buttonWidth), buttonWidth, buttonWidth, "Clear");
//	new ToolButton(padding, 4*buttonPadding+6*(1.1*buttonWidth), buttonWidth, buttonWidth, "Save");
//	new ToolButton(padding, 4*buttonPadding+7*(1.1*buttonWidth), buttonWidth, buttonWidth, "Open");
//	new ToolButton(padding, 4*buttonPadding+8*(1.1*buttonWidth), buttonWidth, buttonWidth, "Upload");
	new ToolButton(buttonPadding, 20+3*buttonPadding+6*(1.1*buttonWidth), buttonWidth, buttonWidth, "Download", 2);
	new ToolButton(buttonPadding, 20+3*buttonPadding+7*(1.1*buttonWidth), buttonWidth, buttonWidth, "Upload", 2);
	
	getButton("Track").down = true;
	console.log ("Done making buttons");
	//download trx for a trackID passed through URL
	if (passedTrackID) downloadTrackID(passedTrackID);
	console.log("Done download tracks");
	////// extend builtin methods
    ctx.dashedLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);       
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            draw ? this.lineTo(x, 0): this.moveTo(x, 0);
            draw = !draw;
        }       
        this.restore();
    }

                 
	//tracks ///////////////////////////////////////////
	function Track(gridx, gridy, type, orientation, state, subtype) { //this object is stored by JSON.stringify so no functions allowed in object
        if (tracks[gridx] == undefined) tracks[gridx]=[];//bbbb
		tracks[gridx][gridy] = this;
		this.gridx = gridx || 0;
		this.gridy = gridy || 0;
		this.type = type || "TrackStraight";
		this.orientation = orientation || 0;
		this.state = state || "left"; //left or right
		this.subtype = subtype || ""; //for TrackWye, TrackWyeLeft, TrackWyeRight subtype can be sprung, lazy, prompt, alternate, compareLess, compareGreater
		//for TrackStraight- subtype can be increment, decrement, add, subtract, divide, multiply, sligshot, catapult
		this.cargo = undefined;// a reference to a Cargo object carried by this track
	}	

	function drawTrack(track) {  //draws this track
		if (!track) return;
		
		if (!useSprites) drawTileBorder(track.gridx, track.gridy);

		ctx.save();
		ctx.translate((0.5+track.gridx)*tileWidth, (0.5+track.gridy)*tileWidth*tileRatio); //center origin on tile
			
		//rotate tile
		ctx.rotate(track.orientation * Math.PI/4);
			
		//make orientation line at North
		if (!useSprites) {
			ctx.beginPath();
			ctx.moveTo(0, -0.5*tileWidth);
			ctx.lineTo(0, -0.25*tileWidth); //  -
			ctx.stroke();
		}
			
		//draw tile interior specific to type of track
		switch (track.type) {
			case "Track90":
			case "Track45":
			case "TrackCargo":
			case "TrackBlank":
			case "TrackCross":
				drawSprite(track.type, track.orientation);
				break; 
			case "TrackStraight":
				if (track.subtype == "none" || track.subtype == "") drawSprite("TrackStraight", track.orientation);
				else drawSprite(track.subtype, track.orientation);
				break;
			case "TrackWyeLeft":
			case "TrackWyeRight":
			case "TrackWye":
				var name = track.type + "-";
				switch (track.subtype) {
					case "prompt":
						name += "Prompt";
						break;
//							if (track.state == "left") drawSprite("TrackWyeLeft-Prompt-L", track.orientation);
//							else drawSprite("TrackWyeLeft-Prompt-R", track.orientation);
					case "alternate":
						name += "Alternate";
						break;
					case "compareGreater":
						name += "Greater";
						break;
					case "compareLess":
						name += "Less";
						break;
					case "sprung":
						name += "Sprung";
						break;
					case "lazy":
						name += "Lazy";
						break;
					default:
						name += "Lazy";
						console.log("ERROR-uncaught case track.subtype="+track.subtype+" type="+track.type);
						break;
				}
				if (track.state == "left") name += "-L";
				else name += "-R";
				
//				console.log("name="+name);
				drawSprite(name, track.orientation);
				break; 
/*				if (useSprites) { //see above
				} else {
					if (track.state == "left") {
						ctx.globalAlpha = globalAlpha;
						drawSprite("TrackStraight", track.orientation);
						if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
						else ctx.globalAlpha = 1.0;
						drawSprite("Track90", track.orientation);
						ctx.globalAlpha = 1.0;
					} else {
						ctx.globalAlpha = globalAlpha;
						drawSprite("Track90", track.orientation);
						if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
						else ctx.globalAlpha = 1.0;
						drawSprite("TrackStraight", track.orientation);
						ctx.globalAlpha = 1.0;
					}
				}
				break;
			case "TrackWyeRight":
				if (track.state == "left") {
					ctx.globalAlpha = globalAlpha;
					ctx.rotate(-Math.PI/2);
					drawSprite("Track90", track.orientation);
					if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
					else ctx.globalAlpha = 1.0;
					ctx.rotate(Math.PI/2);
					drawSprite("TrackStraight", track.orientation);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.globalAlpha = globalAlpha;
					drawSprite("TrackStraight", track.orientation);
					ctx.rotate(-Math.PI/2);
					if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
					else ctx.globalAlpha = 1.0;
					drawSprite("Track90", track.orientation);
					ctx.globalAlpha = 1.0;
				}
				break;
			case "TrackWye":
				if (track.state == "left") {
					ctx.globalAlpha = globalAlpha;
					ctx.rotate(-Math.PI/2);
					drawSprite("Track90", track.orientation);
					if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
					else ctx.globalAlpha = 1.0;
					ctx.rotate(Math.PI/2);
					drawSprite("Track90", track.orientation);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.globalAlpha = globalAlpha;
					drawSprite("Track90", track.orientation);
					ctx.rotate(-Math.PI/2);
					if (track.subtype == "prompt") ctx.globalAlpha = globalAlpha;
					else ctx.globalAlpha = 1.0;
						drawSprite("Track90", track.orientation);
					ctx.globalAlpha = 1.0;
				}
				break;
*/		}
		
		drawCargo(track, Math.PI/4*track.orientation);
		
		//draw insets for wyes and stations
		if (!useSprites) {
			if (track.subtype != "" && track.subtype != "sprung") {	
				//console.log("Type="+track.type+" subtype="+track.subtype);
			switch (track.subtype) {
				case "increment":
				case "supply":
					drawSprite(track.subtype, track.orientation); //XXXX
					break;
				default:
					ctx.restore();
					ctx.save();
					ctx.translate((0.5+track.gridx)*tileWidth, (0.5+track.gridy)*tileWidth*tileRatio); //center origin on tile
					ctx.rotate(track.orientation * Math.PI/4);
		
					switch (track.type) {
						case "TrackWyeLeft":
							ctx.translate( 0.45*tileWidth-insetWidth, -0.2*tileWidth);
							break;
						case "TrackWyeRight":
							ctx.translate( -0.45*tileWidth, -0.2*tileWidth);
							break;
						case "TrackWye":
							ctx.translate(-0.2*tileWidth, -0.45*tileWidth);
							break;
						case "TrackStraight":
							ctx.translate(0.1*tileWidth, -insetWidth/2); //center origin on tile
							break;
					}
					// rotate around inset center so label is always upright
					ctx.translate(insetWidth/2, insetWidth/2*tileRatio);
					ctx.rotate(-track.orientation * Math.PI/4);
					ctx.translate(-insetWidth/2, -insetWidth/2*tileRatio);
		
				    drawTrackInset();
					drawSprite(track.subtype, track.orientation); //XXXX
				}
			}
		}
			
		ctx.restore();
	
	}		
	
	function drawTrackInset() {
		ctx.lineWidth = 1;
		roundRect (ctx, 0,0, insetWidth, insetWidth, insetWidth/8, insetFillColor, insetStrokeColor);	
//		roundRect (ctx, 0.1*tileWidth, -0.125*tileWidth, 0.35*tileWidth, 0.35*tileWidth, 0.05*tileWidth, insetFillColor, insetStrokeColor);	
		
	}		    

	function drawSprite(name, ori, value) { //draws an image either from scratch or via a loaded image at the current position. ori used for choosing image from array of renders from different angles. Value for choosing from array of values for cargo type
	//	if (useSprites) {
			ctx.rotate(-ori * Math.PI/4);
			//console.log("drawSprite="+name); //kkk
            var cargoOffsetX = -37;
            var cargoOffsetY = -26;
			switch (name) {
				case "Captionuppercase":
                    ctx.drawImage(imgCargoUppercase[0][16], cargoOffsetX, cargoOffsetY);
					break;
				case "CaptionA":
                    ctx.drawImage(imgCargoUppercase[value][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionlowercase":
					ctx.drawImage(imgCargoLowercase[0][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captiona":
					ctx.drawImage(imgCargoLowercase[value][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captioncolors":
					ctx.drawImage(imgCargoColors[0][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionwhite":
					ctx.drawImage(imgCargoColors[value][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionraptor":
					ctx.drawImage(imgCargoDinosaurs[value][5], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionbunny":
					ctx.drawImage(imgCargoStuffedAnimals[value][34], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionnumbers":
					ctx.drawImage(imgCargoNumbers[0][16], cargoOffsetX, cargoOffsetY);
					break;
				case "CaptionstuffedAnimals":
					ctx.drawImage(imgCargoStuffedAnimals[0][34], cargoOffsetX, cargoOffsetY);
					break;
				case "Caption0":
					ctx.drawImage(imgCargoNumbers[value][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captiondinosaurs":
					ctx.drawImage(imgCargoDinosaurs[0][5], cargoOffsetX, cargoOffsetY);
					break;
				case "CaptionsafariAnimals":
					//ctx.drawImage(imgCargoSafariAnimals[0][16], cargoOffsetX, cargoOffsetY);
					break;
				case "Captionnone":
					ctx.drawImage(imgCaptionNone, 0, -11);
					break;
				case "Captionalternate":
					ctx.drawImage(imgCaptionAlternate, 0, -11);
					break;
				case "CaptioncompareGreater":
					ctx.drawImage(imgCaptionGreater, 0, -11);
					break;
				case "Captionlazy":
					ctx.drawImage(imgCaptionLazy, 0, -11);
					break;
				case "CaptioncompareLess":
					ctx.drawImage(imgCaptionLesser, 0, -11);
					break;
				case "Captionprompt":
					ctx.drawImage(imgCaptionPrompt, 0, -11);
					break;
				case "Captionsprung":
					ctx.drawImage(imgCaptionSprung, 0, -11);
					break;
				case "Captionadd":
					ctx.drawImage(imgCaptionAdd, 0, -11);
					break;
				case "Captioncatapult":
					ctx.drawImage(imgCaptionCatapult, 0, -11);
					break;
				case "Captiondecrement":
					ctx.drawImage(imgCaptionDecrement, 0, -11);
					break;
				case "Captiondivide":
					ctx.drawImage(imgCaptionDivide, 0, -11);
					break;
				case "Captiondump":
					ctx.drawImage(imgCaptionDump, 0, -11);
					break;
				case "Captionincrement":
					ctx.drawImage(imgCaptionIncrement, 0, -11);
					break;
				case "Captionmultiply":
					ctx.drawImage(imgCaptionMultiply, 0, -11);
					break;
				case "Captionhome":
					ctx.drawImage(imgCaptionHome, 0, -11);
					break;
				case "Captionredtunnel":
					ctx.drawImage(imgCaptionRedTunnel, -4, -5);
					break;
				case "Captiongreentunnel":
					ctx.drawImage(imgCaptionGreenTunnel, -4, -4);
					break;
				case "Captionbluetunnel":
					ctx.drawImage(imgCaptionBlueTunnel, -4, -5);
					break;
				case "CaptionpickDrop":
					ctx.drawImage(imgCaptionPickDrop, 0, -11);
					break;
				case "Captionslingshot":
					ctx.drawImage(imgCaptionSlingshot, 0, -11);
					break;
				case "Captionsubtract":
					ctx.drawImage(imgCaptionSubtract, 0, -11);
					break;
				case "Captionsupply":
					ctx.drawImage(imgCaptionSupply, 0, -11);
					break;
				case "Track90":
					ctx.drawImage(imgTrack90[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "Track45":
					ctx.drawImage(imgTrack45[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackStraight":
					var oriRot = (ori+4)%8; // this is to correct an error in the rendering angle
					ctx.drawImage(imgTrackStraight[oriRot], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Alternate-L":
					ctx.drawImage(imgTrackWyeRightAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Alternate-R":
					ctx.drawImage(imgTrackWyeRightAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Lazy-L":
					ctx.drawImage(imgTrackWyeRightLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Lazy-R":
					ctx.drawImage(imgTrackWyeRightLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Less-L":
					ctx.drawImage(imgTrackWyeRightLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Less-R":
					ctx.drawImage(imgTrackWyeRightLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Greater-L":
					ctx.drawImage(imgTrackWyeRightGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Greater-R":
					ctx.drawImage(imgTrackWyeRightGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Sprung-L":
					ctx.drawImage(imgTrackWyeRightSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Sprung-R":
					ctx.drawImage(imgTrackWyeRightSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Prompt-L":
					ctx.drawImage(imgTrackWyeRightPromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeRight-Prompt-R":
					ctx.drawImage(imgTrackWyeRightPromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Alternate-L":
					ctx.drawImage(imgTrackWyeLeftAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Alternate-R":
					ctx.drawImage(imgTrackWyeLeftAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Lazy-L":
					ctx.drawImage(imgTrackWyeLeftLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Lazy-R":
					ctx.drawImage(imgTrackWyeLeftLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Less-L":
					ctx.drawImage(imgTrackWyeLeftLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Less-R":
					ctx.drawImage(imgTrackWyeLeftLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Greater-L":
					ctx.drawImage(imgTrackWyeLeftGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Greater-R":
					ctx.drawImage(imgTrackWyeLeftGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Prompt-L":
					ctx.drawImage(imgTrackWyeLeftPromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Prompt-R":
					ctx.drawImage(imgTrackWyeLeftPromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Sprung-L":
					ctx.drawImage(imgTrackWyeLeftSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWyeLeft-Sprung-R":
					ctx.drawImage(imgTrackWyeLeftSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Alternate-L":
					ctx.drawImage(imgTrackWyeAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Alternate-R":
					ctx.drawImage(imgTrackWyeAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Less-L":
					ctx.drawImage(imgTrackWyeLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Less-R":
					ctx.drawImage(imgTrackWyeLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Lazy-L":
					ctx.drawImage(imgTrackWyeLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Lazy-R":
					ctx.drawImage(imgTrackWyeLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Greater-L":
					console.log("GREATER-L");
					ctx.drawImage(imgTrackWyeGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Greater-R":
					console.log ("GREATER-R");
					ctx.drawImage(imgTrackWyeGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Sprung-L":
					ctx.drawImage(imgTrackWyeSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Sprung-R":
					ctx.drawImage(imgTrackWyeSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Prompt-L":
					ctx.drawImage(imgTrackWyePromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackWye-Prompt-R":
					ctx.drawImage(imgTrackWyePromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackCross":
					var oriRot = (ori+4)%8; // this is to correct an error in the rendering angle
					ctx.drawImage(imgTrackCross[oriRot], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "TrackBlank":
					break;
				case "TrackCargo":
					var oriRot = ori%2;
					ctx.drawImage(imgTrackCargo[oriRot], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "increment":
					ctx.drawImage(imgStationIncrement[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "decrement":
					ctx.drawImage(imgStationDecrement[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "add":
					ctx.drawImage(imgStationAdd[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "subtract":
					ctx.drawImage(imgStationSubtract[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "multiply":
					ctx.drawImage(imgStationMultiply[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "divide":
					ctx.drawImage(imgStationDivide[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "catapult":
					ctx.drawImage(imgStationCatapult[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "slingshot":
					ctx.drawImage(imgStationSlingshot[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "supply":
					ctx.drawImage(imgStationSupply[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "pickDrop":
					console.log ("PickDrop ori=" + ori);
					ctx.drawImage(imgStationPickDrop[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "dump":
					ctx.drawImage(imgStationDump[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "home":
					ctx.drawImage(imgStationHome[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "redtunnel":
					ctx.drawImage(imgRedTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "greentunnel":
					ctx.drawImage(imgGreenTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "bluetunnel":
					ctx.drawImage(imgBlueTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2);
					break;
				case "speedController":
				 	//draw engine speed controller
				 	ctx.save();
				 	ctx.translate((captionX+1)*tileWidth, (captionY+1.6)*tileWidth*tileRatio); //move origin to center of dial
				 	ctx.beginPath();
				 	ctx.lineWidth = 15;
				 	ctx.strokeStyle = "red";
				 	ctx.arc (0,0, 0.7*tileWidth, 0, Math.PI, true);
					var linearGradient = ctx.createLinearGradient(-tileWidth, 0, tileWidth, 0);
					linearGradient.addColorStop(0, "red");
					linearGradient.addColorStop(0.5, "black");
					linearGradient.addColorStop(1, "green");
					ctx.strokeStyle = linearGradient;
				 	ctx.stroke(); //speed indicator strip
				 	ctx.lineWidth = 1;
				 	ctx.fillStyle = "silver";
				 	ctx.beginPath();
				 	ctx.arc (0,0, 0.12*tileWidth, 0, 2*Math.PI, true);
				 	ctx.fill(); //small circle at base of dial
				 	
				 	//make tick marks
				 	var r=0.7; //short radius
				 	for (var theta=0; theta<= Math.PI; theta+=Math.PI/nNumSpeeds) {
				 		ctx.beginPath();
				 		ctx.moveTo(Math.cos(theta)*r*tileWidth, -Math.sin(theta)*r*tileWidth);
				 		ctx.lineTo(Math.cos(theta)*0.9*tileWidth, -Math.sin(theta)*0.9*tileWidth);
				 		ctx.stroke();
				 		if (r==0.7) r=0.85;
				 		else r=0.7;
				 	}
				 	ctx.beginPath();
				 	ctx.lineWidth= 7;
				 	ctx.strokeStyle = "silver";
				 	ctx.moveTo(0,0);
				 	var angle = (1-currentCaptionedObject.speed/maxEngineSpeed)/2*Math.PI;
				 	ctx.lineTo (0.7*tileWidth*Math.cos(angle), -0.7*tileWidth*Math.sin(angle));
				 	ctx.stroke();
				 	ctx.beginPath();
				 	ctx.lineWidth =1
				 	ctx.moveTo (0.85*tileWidth*Math.cos(angle), -0.85*tileWidth*Math.sin(angle));
				 	ctx.lineTo (0.65*tileWidth*Math.cos(angle+0.25), -0.65*tileWidth*Math.sin(angle+0.25));
				 	ctx.lineTo (0.65*tileWidth*Math.cos(angle-0.25), -0.65*tileWidth*Math.sin(angle-0.25));
				 	ctx.fill();
				 	
				 	ctx.restore();
				 	break;
				default:
					ctx.beginPath();
				    ctx.fillStyle    = tieColor;
				    ctx.font         = 'Bold ' + 0.25*tileWidth + 'px Sans-Serif';
				    ctx.textBaseline = 'Top';
				    ctx.textAlign    = 'Center';
					ctx.fillText  (name, 0.04*tileWidth, 0.225*tileWidth);
					break;
					console.log("ERROR-unhandled case for drawSprite name="+name);
			}
			ctx.rotate(ori * Math.PI/4);
	}
	
	function trackConnects(track, orientation) { //returns true if track connects in orientation, else false
		var dif = (track.orientation - orientation + 8)%8;
		switch (track.type) {
			case "TrackStraight":
				if (dif == 0 || dif == 4) return true;
				else return false;
			case "Track90":
				if (dif == 2 || dif == 4) return true;
				else return false;
			case "Track45":
				if (dif == 1 || dif == 4) return true;
				else return false;
			case "TrackCross":
			case "TrackBridge":
				if (dif == 0 || dif == 2 || dif == 4 || dif == 6) return true;
				else return false;
			case "TrackWyeLeft":
				if (dif == 2 || dif == 4 || dif == 0) return true;
				else return false;
			case "TrackWyeRight":
				if (dif == 6 || dif == 4 || dif == 0) return true;
				else return false;
			case "TrackWye":
				if (dif == 6 || dif == 2 || dif == 4) return true;
				else return false;
			case "TrackBlank":
			case "TrackCargo":
				return false;
			default:
				console.log("ERROR: trackConnect didn't detect track type");
				return false;
		}
	}
	
	function EC(gridx, gridy, type, orientation, state, speed, position) { //object representing an Engine or Car
		//this object is stored by JSON.stringify so no functions allowed in object
		this.gridx = gridx || 0; //integer. location of engine or car in grid coordinates
		this.gridy = gridy || 0; //integer. location of engine or car in grid coordinates
		this.type = type || "EngineBasic";
		this.orientation = orientation || 0; //orientation when entering a track 0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SW, 6=W, 7=NW
		this.state = state || "";
		this.speed = speed || 0; //can be + or -. In millitiles/iteration
		this.position = position || 0.50; //position across tile in range of [0,1) with respect to orientation of engine. 0=begining, 1=end
		this.cargo = undefined;// a reference to a Cargo object carried by this EC

		if (type == "EngineBasic") engines.push(this);
		else cars.push(this);
		
		return this;
	}

	function drawEC(ec) {  
		if (!ec) return;
		if (tracks[ec.gridx] == undefined || tracks[ec.gridx][ec.gridy] == undefined) {
			alert ("Draw ec- Undefined track. gridx=" + ec.gridx + ", gridy=" + ec.gridy + " ec ori=" + ec.orientation);
			return;
		}
		var track=tracks[ec.gridx][ec.gridy];

		ctx.save();
		ctx.translate((0.5+ec.gridx)*tileWidth, (0.5+ec.gridy)*tileWidth*tileRatio); //center origin on tile
			
		//rotate tile
		ctx.rotate(ec.orientation * Math.PI/4);

		//calculate offset
//		var offsetx = 0, offsety = 0; // fraction of tile bbb
		var offset = getOffset(ec);
		ctx.translate(offset.X*tileWidth, offset.Y*tileWidth*tileRatio);
		
		var type = getTypeForWye(ec, track);

		//rotate ec
		var rotation = 0;
		switch (type) {
			case "Track90":
				if (ec.speed>=0) {
					if (ec.orientation != track.orientation) rotation = (Math.PI/2*ec.position); 
					else rotation = (-Math.PI/2*ec.position); 
				} else {
					if ((ec.orientation - track.orientation+8)%8 == 4) rotation = (-Math.PI/2*(1-ec.position)); 
					else rotation = (Math.PI/2*(1-ec.position));
				}
				break;
			case "Track90Right":
				if (ec.speed>=0) {
					if (ec.orientation != track.orientation) rotation = (-Math.PI/2*ec.position); 
					else rotation = (Math.PI/2*ec.position); 
				} else {
					if ((ec.orientation - track.orientation+8)%8 == 4) rotation = (Math.PI/2*(1-ec.position)); 
					else rotation = (-Math.PI/2*(1-ec.position));
				}
				break;
			case "Track45":
				if (ec.speed>=0) {
					if (ec.orientation != track.orientation) rotation = (Math.PI/4*ec.position); 
					else rotation = (-Math.PI/4*ec.position); 
				} else {
					//console.log("oriDif track45="+(ec.orientation - track.orientation+8)%8);
					if ((ec.orientation - track.orientation+8)%8 == 4) rotation = (-Math.PI/4*(1-ec.position)); 
					else rotation = (Math.PI/4*(1-ec.position));
				}
				break;
		}

		if (ec.type == "EngineBasic") {
			if (useSprites) {
				ctx.rotate(-ec.orientation * Math.PI/4); //rotate back to normal
				var frame = (ec.orientation/8*imgEngine.length  + Math.round(rotation/(2*Math.PI/imgEngine.length)) +imgEngine.length)%imgEngine.length;
				ctx.drawImage(imgEngine[frame], -imgEngineWidth/2, -imgEngineWidth/2);
				//console.log("Draw engine frame="+frame);
			} else {
				//draw triangle
				ctx.rotate(rotation);
				ctx.fillStyle = engineColor;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(0.25*tileWidth - 0.5*tileWidth, 0.9*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.75*tileWidth - 0.5*tileWidth, 0.9*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.5*tileWidth - 0.5*tileWidth, 0.1*tileWidth - 0.5*tileWidth);
				ctx.fill();
			}
					
		} else	if (ec.type == "CarBasic") {
			if (useSprites) {
				ctx.rotate(-ec.orientation * Math.PI/4); //rotate back to normal
				var frame = (ec.orientation/8*imgCar.length*2  + Math.round(rotation/(2*Math.PI/imgCar.length/2)) +imgCar.length)%imgCar.length;
				ctx.drawImage(imgCar[frame], -imgCarWidth/2, -imgCarWidth/2);
			} else {
				//draw rectangle
				ctx.rotate(rotation);
				ctx.fillStyle = carColor;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(0.75*tileWidth - 0.5*tileWidth, 0.9*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.75*tileWidth - 0.5*tileWidth, 0.2*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.5*tileWidth - 0.5*tileWidth, 0.1*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.25*tileWidth - 0.5*tileWidth, 0.2*tileWidth - 0.5*tileWidth);
				ctx.lineTo(0.25*tileWidth - 0.5*tileWidth, 0.9*tileWidth - 0.5*tileWidth);
				ctx.fill();
			}
		} else {
			console.log ("EC is not an instance of anything");
		}
		
		//draw cargo
		drawCargo(ec, rotation);

		ctx.restore();

	}

	function Cargo(value,type) { //object representing a Cargo. Cargo belongs to either EC or Track so no coords
		//this object is stored by JSON.stringify so no functions allowed in object
		this.value = value || 0; //integer. numeric value of cargo for enums
		this.type = type || cargoValues[0]; //reference to array of values. One of predefined cargo types like cargoNumbers, cargoColors, cargoLowercase, cargoUppercase, cargoAfricanAnimals

		//cargos.push(this);
	}
	
	function drawCargo(obj, rotation) { //draws cargo for obj= car or track
		if (obj == undefined || obj.cargo == undefined) return;
		
		//draws relative to current tile so after ctx has been translated and rotated to draw ec or tile
		//ctx.rotate(-Math.PI/2);
		
		if (useSprites) {
			//ctx.rotate(-obj.orientation * Math.PI/4); //rotate context back to normal
			var imgCargo = imgCargoNumbers;
			switch (obj.cargo.type[0]) {
				case "numbers":
					imgCargo = imgCargoNumbers;
					break;
				case "uppercase":
					imgCargo = imgCargoUppercase;
					break;
				case "lowercase":
					imgCargo = imgCargoLowercase;
					break;
				case "colors":
					imgCargo = imgCargoColors;
					break;
				case "safariAnimals":
					imgCargo = imgCargoSafariAnimals;
					break;
				case "dinosaurs":
					imgCargo = imgCargoDinosaurs;
					break;
				case "stuffedAnimals":
					imgCargo = imgCargoStuffedAnimals;
					break;
			}
			
			var value = obj.cargo.value;
			var frame = (obj.orientation/8*imgCargo[0].length  + Math.round(rotation/(2*Math.PI/imgCargo[0].length)) +imgCargo[0].length)%imgCargo[0].length;
			if (obj.cargo.type[0] == "dinosaurs") frame = (frame+32)%64; //flip dinos because rendered wrong
			if (obj.type == "TrackCargo" || obj.type == "TrackBlank") frame = 16;
			//console.log("type="+obj.cargo.type[0]+" value="+obj.cargo.value);
			try {
				ctx.drawImage(imgCargo[value][frame], -imgTrackWidth/2, -imgTrackWidth/2);
			} catch (err) {
				console.log("ERROR image not loaded. type="+obj.cargo.type[0]+" value="+value+" frame="+frame);
			}
		} else {
		    ctx.fillStyle    = cargoColor;
		    ctx.font         = 'bold ' + 0.35*tileWidth + 'px Sans-Serif';
		    ctx.textBaseline = 'middle';
		    ctx.textAlign	 = 'center';
			switch (obj.cargo.type[0]) {
				case "numbers":
				case "uppercase":
				case "lowercase":
					ctx.fillText  (obj.cargo.type[obj.cargo.value+1], 0,0.1*tileWidth);
					break;
				case "colors":
				case "safariAnimals":
				case "dinosaurs":
				    ctx.font = 'bold ' + 0.15*tileWidth + 'px Sans-Serif';
					ctx.fillText  (obj.cargo.type[obj.cargo.value+1], 0,0);
					break;
			}
		}		
	}
	
///////////////////////////////////////	
	function getButton(name) { //returns button in toolbar with text name
	    for (var i=0; i<toolButtons.length; i++) {
	  	    if (toolButtons[i].name == name) {
	  		    return toolButtons[i];
	  	    } 
	    }
	    
	    console.log ("Button not found");
	    return undefined;
	}
	
	// touch detection==
//	$('#canvas').touchstart(function(e) {
//        console.log("TOUCH START");
//	});


	// mouse detection==
	$('#canvas').mousedown(function(e) {
        //console.log("MouseDown");
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop; //screen coordinates
        onClickDown(mouseX, mouseY);
	});	

    function onClickDown (mouseX, mouseY) { //for handling both mouse and touch events
//        console.log("onClickDown");
        if (showToolBar) { //if toolbar hidden then toggle play trains for any click
        	mouseX = mouseX / zoomScale;
        	mouseY = mouseY / zoomScale;
		    var mouseYWorld = mouseY*tileRatio; //world coordinates
			
			//see if clicked in button caption (button caption is a caption balloon that pops up from button in button bar)
			if (currentCaptionedButton != undefined) {	
		    	if (mouseX > buttonCaptionX && mouseX < (buttonCaptionX+3*tileWidth) && mouseYWorld > buttonCaptionY && mouseYWorld < (buttonCaptionY+3*tileWidth)) {
		    		//inside caption
		    		var nBin = 3*Math.floor((mouseYWorld-buttonCaptionY)/tileWidth) + Math.floor((mouseX-buttonCaptionX)/tileWidth);
		    		//console.log ("Clicked in button caption. bin=" + nBin);
		    		if (getButton("Save").down) {
		    			console.log("Save");
			  			//getButton("Save").down = false;
				  		saveTrx(nBin);
		    		} else {
		    			console.log("Open");
			  			//getButton("Open").down = false;
				  		openTrx(nBin);
				  		draw();
		    		}
	    		return
		    	} else { //outside button caption
		    		currentCaptionedButton = undefined;
		  			getButton("Open").down = false;
		  			getButton("Save").down = false;
		    		draw();
		    	}
		    }
		    	//console.log("Trackwidth="+tracksWidth+" mouseX="+mouseX+" gridx="+gridx);
		    if (mouseX*zoomScale < tracksWidth && mouseY*zoomScale < tracksHeight) { //in track space
		    	console.log ("Click in track space");
	  			startXPoint = mouseX;
	  			startYPoint = mouseYWorld;
		    	
		    	//check if track button down
		    	if (getButton("Track").down) {
		    		isDrawingTrack = true;
		    		addPointTrack(mouseX, mouseYWorld);
		    	}
		    	
		    	//check if engine button down
		    	if (getButton("Engine").down) {
		    		isDrawingEngine = true;
		    		addPointEC(mouseX, mouseYWorld);
		    	}
		    	
		    	//check if select button down
		    	/*if (getButton("Select").down) {
		    		//console.log("Select button down");
		   			if (mouseX>Math.min(startSelectX, endSelectX) && mouseY>Math.min(startSelectY, endSelectY)
		   			   && mouseX<Math.max(startSelectX, endSelectX) && mouseY<Math.max(startSelectY, endSelectY)) {
		   				//move current selection
			    		isMoving = true;
			    		startMoveX = mouseX;
			    		startMoveY = mouseY;'[]';
		   				
		   			} else { 
		   				//start new selection
			    		isSelecting = true;
			    		startSelectX = tileWidth*Math.round(mouseX/tileWidth);
			    		startSelectY = tileWidth*tileRatio*Math.round(mouseY/(tileWidth*tileRatio));
		    		}
		    	} */
		    	
		    	//check if car button down
		    	if (getButton("Car").down) {
		    		isDrawingCar = true;
		    		addPointEC(mouseX, mouseYWorld);
		    	}
		    	
		    	//check if cargo button down
		    	if (getButton("Cargo").down && currentCaptionedObject == undefined) {
		    		var gridx = Math.floor(mouseX/tileWidth);
		    		var gridy = Math.floor(mouseYWorld/tileWidth/tileRatio/tileRatio);
	                console.log("gridx="+gridx+"tracks length="+tracks.length);
		    		if (tracks[gridx] == undefined || tracks[gridx][gridy] == undefined || tracks[gridx][gridy] == null) {
			    		//if no track at that location then add TrackBlank with "A"
		    			console.log("Empty grid, add blank Track");
		    			new Track(gridx, gridy, "TrackBlank");
		    			tracks[gridx][gridy].cargo = new Cargo(0,cargoValues[1]);
	                    draw();
	                }
		    		
		    		
		    	}
		    	
		    	//check if erase button down
		    	if (getButton("Eraser").down) {
		    		isErasing = true;
		    		var gridx = Math.floor(mouseX/tileWidth);
		    		var gridy = Math.floor(mouseYWorld/tileWidth/tileRatio/tileRatio);
		    		//console.log("gridx="+gridx+" gridy="+gridy);
					var train;
					
					//delete clicked engine
		    		for (var i=0; i<engines.length; i++) {
		    			if (engines[i].gridx == gridx && engines[i].gridy == gridy) {
		    				//console.log("Delete engine i=" + i);
		    				train = trains[i];
		    				var oldEngine = engines.splice(i,1); //delete engine
		    				if (currentCaptionedObject == oldEngine) currentCaptionObject = undefined;
		    				delete oldEngine;
		    				i = engines.length;
		    				draw();
		    			}
		    		}
	
					//delete clicked car
		    		for (var i=0; i<cars.length; i++) {
		    			if (cars[i].gridx == gridx && cars[i].gridy == gridy) {
		    				if (cars[i].cargo == null) {
			    				console.log("Delete car i=" + i);
			    				train = getTrain(cars[i]);
			    				console.log("Deleted car is in train of length="+train.length);
			    				var oldCar = cars.splice(i,1); //delete car
			    				if (currentCaptionedObject == oldCar) currentCaptionObject = undefined; //remove caption bubble if its car is deleted
			    				delete oldCar;
			    				i = cars.length;
		    				} else {
		    					console.log ("Car has cargo. Delete cargo");
		    					cars[i].cargo = null;
		    					draw();
		    				}
		    				
		    			}
		    		}
		    		
		    		//if deleted engine or car then rebuild train
		    		if (train) {
		    			console.log ("Rebuild train after delete");
	    				//set cars in this train to speed 0 and rebuild train to account for disconnecting a car from an engine or deleting an engine
	    				for (var t=0; t<train.length; t++) {
	    					if (train[t].type != "EngineBasic") {
		    					if (train[t].speed < 0) reverseSpeed(train[t]);
		    					train[t].speed = 0;
	    					}
	    				}
	    				
	    				buildTrains(); //todo- this could be made more efficient by just working on this train rather than all trains
	    				draw();
	    			}
		    		
		    	}
		    } else { // in toolBar
		    	console.log("Clicked in toolbar");
		    	//deselect track area captions
		    	currentCaptionedObject = undefined;
		    	secondaryCaption = undefined;
		    	
		    	mouseX = mouseX*zoomScale;
		    	mouseY = mouseY*zoomScale;
			    //check if buttons clicked
			    var pushedButton;
			    for (var i=0; i<toolButtons.length && pushedButton == undefined; i++) {
			  	    if (mouseX > toolButtons[i].x+tracksWidth && mouseY > toolButtons[i].y && mouseX < toolButtons[i].x+toolButtons[i].width+tracksWidth && mouseY < toolButtons[i].y + toolButtons[i].height) {
			  		    pushedButton = i;
			  	    } 
			    }
			  	
			  	if (pushedButton == undefined) return;
			  	
			  	switch (toolButtons[pushedButton].name) {
			  		case "Play":
	                    //console.debugger("Testttttt");
	                    pushPlayButton();
			  			break;
			  		case "Track":
			  			break;
			  		case "Engine":
			  			break;
			  		case "Eraser":
			  			break;
			  		case "Select":
			  			break;
			  		case "Save":
			  			currentCaptionedButton = getButton("Save");
			  			getButton("Save").down = true;
			  			getButton("Open").down = false;
			  			break;
			  		case "Open":
			  			currentCaptionedButton = getButton("Open");
			  			getButton("Open").down = true;
			  			getButton("Save").down = false;
			  			break;
			  		case "Upload":
			        	if (currentUserID == 1) {
				        	uploadTrackDialog()
			        		signinUserDialog();
			        	} else {
			        		uploadTrackDialog();
			        	}
			  			break;
			  		case "Download":
			  			downloadTrackDialog();
			  			break;
			  		case "Clear":
			  			//tracks.length=0;
	                    tracks = createArray(trackArrayWidth, trackArrayHeight);
			  			engines.length = 0;
			  			cars.length = 0;
			  			trains.length = 0;
			  			draw();
			  			break;
			  	}
	
				//toggle up/down if button is in a group
				if (toolButtons[pushedButton].name != "Play") {
					if (toolButtons[pushedButton].group != undefined) toolButtons[pushedButton].down = !toolButtons[pushedButton].down;
					for (var i=0; i<toolButtons.length; i++) {  //set other buttons in same group to up
						if (i != pushedButton && toolButtons[i].group == toolButtons[pushedButton].group ) toolButtons[i].down = false;
		  			}
		
					draw();
				}
			}
		} else {
        	console.log("Push play button");
        	pushPlayButton();
        }
	}
	
	function pushPlayButton() {
		if (getButton("Play").down) {
			playSound("stop");
			clearInterval(interval);
		} else {
			playSound("choochoo");
			skip = 10;
			nIterations = 0;
			interval = setInterval(interpretAndDraw, 20);
		}
		getButton("Play").down = !getButton("Play").down; // toggle state
	}		
	
	$('#canvas').mousemove(function(e){
    //console.log("Mousemove");
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop;
        onClickMove(mouseX,mouseY);
	});
        
    function onClickMove(mouseX,mouseY) { //for mouse move or touch move events
        //console.log("onClickMove");
        if (!showToolBar) return; //if toolbar hidden then ignore events
        
    	mouseX = mouseX / zoomScale;
    	mouseY = mouseY / zoomScale;
	    var mouseYWorld = mouseY*tileRatio; //world coordinates
	    
/*	    //change mouse cursor
        if (mouseX<tracksWidth) { // in track area
	    	if (getButton("Engine").down || getButton("Track").down) {
	   			e.target.style.cursor = 'crosshair';
			} else if (getButton("Eraser").down) {
	   			e.target.style.cursor = 'no-drop';
	   		} else if (!isSelecting && mouseX>Math.min(startSelectX, endSelectX) && mouseYWorld>Math.min(startSelectY, endSelectY)
	   		          && mouseX<Math.max(startSelectX, endSelectX) && mouseYWorld<Math.max(startSelectY, endSelectY)) {
	   			e.target.style.cursor = 'move';
	   		} else if (isMoving) {
	   			e.target.style.cursor = 'move';
		   	} else {
	   			e.target.style.cursor = 'default';
		   	}
	    } else {
   			e.target.style.cursor = 'default';
	    }
*/
	    if (mouseX < canvasWidth && mouseY < canvasHeight) {
	    	if (isDrawingTrack) {
	    		addPointTrack(mouseX, mouseYWorld);
	    	}
	    	
	    	if (isDrawingEngine || isDrawingCar) {
	    		addPointEC(mouseX, mouseYWorld);
	    	}
	    	
	    	if (isSelecting) {
	    		endSelectX = mouseX;
	    		endSelectY = mouseY;
	    		draw();
	    	}
	    	
	    	if (isMoving) {
	    		endMoveX = mouseX;
	    		endMoveY = mouseY;
	    		draw();
	    	}
	    	
	    	if (isErasing) {
	    		var gridx = Math.floor(mouseX/tileWidth);
	    		var gridy = Math.floor(mouseYWorld/tileWidth/tileRatio/tileRatio);
	    		var ecDel = getEC(gridx, gridy);
	    		var redraw = false;
	    		if (ecDel) {
	    			deleteEC(ecDel); //delete engine or car
	    			redraw = true;
	    		}
	    		if (tracks[gridx] != undefined) if (tracks[gridx][gridy] != undefined) {
	    			delete tracks[gridx][gridy]; //delete track
	    			redraw = true;
	    		}
	    		if (redraw) draw();
	    	}
	    }
	}
	   
	$('#canvas').mouseup(function(e){
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop;
        onClickUp(mouseX, mouseY);
	});
    
    function onClickUp(mouseX, mouseY) {
        //console.log ("onClickUp");
        if (!showToolBar) return; //if toolbar hidden then ignore events

    	mouseX = mouseX / zoomScale;
    	mouseY = mouseY / zoomScale;
	    var mouseYWorld = mouseY*tileRatio; //world coordinates

	    if (mouseX < tracksWidth && mouseY < tracksHeight) { //in track space
	    	var distanceSq = Math.pow((startXPoint-mouseX),2) + Math.pow((startYPoint-mouseYWorld),2);
	    	if (distanceSq<10) { //select object for caption if mouse up near mouse down
	    		var gridx = Math.floor(mouseX/tileWidth);
	    		var gridy = Math.floor(mouseY/(tileWidth*tileRatio));
	    		
	    		if ((secondaryCaption) && captionSecondaryX !=undefined && gridx >= captionSecondaryX && gridx< captionSecondaryX+3 && gridy >= captionSecondaryY && gridy< captionSecondaryY+3) {
    				//clicked in secondary caption ***********************
    				//console.log ("Clicked in secondary caption bubble");
  					var fracX = (mouseX-(captionSecondaryX+0.1)*tileWidth)/(2.8*tileWidth); //account for for border then divide
					var fracY = (mouseY-(captionSecondaryY+0.1)*tileWidth*tileRatio)/(2.8*tileWidth*tileRatio);
					//get cargo subarray
					var iCargo;
					for (var i=0; i<cargoValues.length; i++) {
						//console.log("cv="+cargoValues[i][0]+" sct="+secondaryCaption.type);
						if (cargoValues[i][0] == secondaryCaption.type) iCargo = i;
					}
					if (iCargo == undefined) {
						console.log("ERROR- cargo not found");
						return;
					}
					//console.log("iCargo"+iCargo);
					
					var array = [];
					var nCols = Math.floor(Math.sqrt(cargoValues[iCargo].length-1));
					var nRows = Math.ceil((cargoValues[iCargo].length-1) / nCols);
					
					var row= Math.floor(nRows*fracY);
					var col= Math.floor(nCols*fracX);
					var i = row*nCols + col; //which item was selected
					i = Math.min(i, cargoValues[iCargo].length-2);
					//console.log("value ="+cargoValues[iCargo][i+1]+" row="+row+" col="+col+" nRows="+nRows+" nCols="+nCols);
					currentCaptionedObject.cargo = new Cargo(i,cargoValues[iCargo]);
					secondaryCaption = undefined;
					captionX = undefined;
   				
    			} else {
    				secondaryCaption = undefined;
    				captionSecondaryX = undefined;
    			}
    			
	    		if (captionX !=undefined && gridx >= captionX && gridx< captionX+2 && gridy >= captionY && gridy< captionY+3) {
    				//clicked in caption (primary) *******************
// 					var fracX = (mouseX-(captionX+0.1)*tileWidth)/(1.8*tileWidth);
//					var fracY = (mouseY-(captionY+0.1)*tileWidth*tileRatio)/(1.8*tileWidth*tileRatio);
   				
   					//which caption was cliked in
                    console.log("Captioned object="+currentCaptionedObject.type);
    				switch (currentCaptionedObject.type) {
    					case "EngineBasic":
	    					//adjust speed
		    				var angle = Math.atan2(mouseYWorld-(captionY+0.7)*tileWidth, mouseX-(captionX+1)*tileWidth);
		    				//var angle = Math.atan2(mouseYWorld-(captionY+1.8)*tileWidth, mouseX-(captionX+1)*tileWidth);
		    				if (angle>1) angle = -Math.PI;
		    				var speed = (2*angle/Math.PI+1)*maxEngineSpeed;
		    				console.log ("Speed="+speed+" angle="+angle);
		    				speed = Math.min(speed, maxEngineSpeed);
		    				speed = Math.max(speed, -maxEngineSpeed);
		    				speed = (maxEngineSpeed/(nNumSpeeds/2))*Math.round(speed/(maxEngineSpeed/(nNumSpeeds/2)));
							console.log("Speed="+speed);
		    				//find train
	    					var nEngine;
	    					for (var k=0; k<engines.length && !nEngine; k++) {
	    						if (engines[k] == currentCaptionedObject) nEngine = k;
	    					}
	    					//console.log("Clicked engine ="+nEngine);
	    					if (nEngine == undefined) console.log ("ERROR- did not find nEngine");
	    					var train = trains[nEngine];
	
	    					// change orientation for ECs on corner tracks if speed reversed
		    				if (train) {
		    					if ((currentCaptionedObject.speed>=0 && speed<0) || (currentCaptionedObject.speed<0 && speed>=0)) {
			    					for (var k=0; k<train.length; k++) {
			    						reverseSpeed(train[k]);
			    					}
			    				}
			    			} else {
			    				reverseSpeed(currentCaptionedObject);
			    			}
		    				
		    				//change speed of whole train
	    					if (train) for (var k=0; k<train.length; k++) {
	    						train[k].speed = speed;
	    					}
		    				currentCaptionedObject.speed = speed;
		    				break;
		    			case "CarBasic":
		    			case "TrackBlank":
		    			case "TrackCargo":
		 					var fracX = (mouseX-(captionX+0.1)*tileWidth)/(1.8*tileWidth);
							var fracY = (mouseY-(captionY+0.1)*tileWidth*tileRatio)/(1.8*tileWidth*tileRatio);
 	  						var row = Math.floor(fracY*buttonsCargoTypes.length);
    						var col = Math.floor(fracX*buttonsCargoTypes[row].length);
//    						currentCaptionedObject.subtype = buttonsCargoTypes[row][col];
	   						secondaryCaption = {
	   							'type': buttonsCargoTypes[row][col],
	   							'X': mouseX,
	   							'Y': mouseY/tileRatio
	   						};
							break;
						case "TrackStraight":
		 					var fracX = (mouseX-(captionX+0.1)*tileWidth)/(1.8*tileWidth);
							var fracY = (mouseY-(captionY+0.1)*tileWidth*tileRatio)/(2.8*tileWidth*tileRatio);
 	  						var row = Math.floor(fracY*buttonsStation.length);
    						var col = Math.floor(fracX*buttonsStation[row].length);
/*    						if (currentCaptionedObject.subtype  == "pickDrop"
    						 || currentCaptionedObject.subtype  == "supply"
    						 || currentCaptionedObject.subtype  == "catapult"
    						 || currentCaptionedObject.subtype  == "add"
    						 || currentCaptionedObject.subtype  == "subtract"
    						 || currentCaptionedObject.subtype  == "multiply"
    						 || currentCaptionedObject.subtype  == "divide" ) {*/
 		  						currentCaptionedObject.subtype = buttonsStation[row][col];
     						 	if (!(currentCaptionedObject.subtype == "redtunnel" ||
     						 	      currentCaptionedObject.subtype == "bluetunnel" ||
     						 	      currentCaptionedObject.subtype == "increment" ||
     						 	      currentCaptionedObject.subtype == "decrement" ||
     						 	      currentCaptionedObject.subtype == "greentunnel"))
     						 	        addTrackCargo(currentCaptionedObject);
    						 //}
 							break;
						case "TrackWye":
						case "TrackWyeLeft":
						case "TrackWyeRight":
		 					var fracX = (mouseX-(captionX+0.1)*tileWidth)/(1.8*tileWidth);
							var fracY = (mouseY-(captionY+0.1)*tileWidth*tileRatio)/(1.8*tileWidth*tileRatio);
    						var row = Math.floor(fracY*buttonsWye.length);
    						var col = Math.floor(fracX*buttonsWye[row].length);
    						currentCaptionedObject.subtype = buttonsWye[row][col];
    						if (currentCaptionedObject.subtype  == "compareLess"
    						 || currentCaptionedObject.subtype  == "compareGreater" ) {
    						 	addTrackCargo(currentCaptionedObject);
    						 }
							break;
					}
						
	    		} else if (secondaryCaption == undefined) { //select object for new caption *****************
                //console.log("Select object for new caption");
		    		currentCaptionedObject = undefined;

	    			//see if clicked engine or car
	    			var foundEC = false;
	    			if (!getButton("Eraser").down) {
			    		captionX = undefined;
			    		currentCaptionedObject = getEC(gridx, gridy); 
			    		if (currentCaptionedObject != undefined) foundEC = true;
			    	}
					
	    			//see if clicked track
	    			if (tracks[gridx] != undefined)  if (!getButton("Eraser").down && !foundEC ) {
			    		if (tracks[gridx][gridy] != undefined) {
				    		if (tracks[gridx][gridy].type == "TrackWye" || tracks[gridx][gridy].type == "TrackWyeLeft" 
				    		 || tracks[gridx][gridy].type == "TrackWyeRight" || tracks[gridx][gridy].type == "TrackStraight"
				    		 || tracks[gridx][gridy].type == "TrackCargo"|| tracks[gridx][gridy].type == "TrackBlank") {
				    			currentCaptionedObject = tracks[gridx][gridy];
					    		captionX = undefined;
				    		}
				    	} 
	    				
			    	}
	    		}
	    		
	    		draw();
	    	}
	    }
 	    	
    	if (isDrawingTrack) {
	    	isDrawingTrack = false;
	    	drawingPointsTrackX.length = 0;
	    	drawingPointsTrackY.length = 0;
	    	currentXTile = undefined;
	    	draw();
	    }
    	if (isDrawingEngine || isDrawingCar) {
    		//make engine at startpoint in direction from down to up
    		if (startXPoint != undefined) {
    			var startXTile = Math.floor(startXPoint/tileWidth);
    			var startYTile = Math.floor(startYPoint/tileRatio/tileRatio/tileWidth);
    			var distSq = Math.pow((startXPoint-mouseX),2) + Math.pow((startYPoint-mouseYWorld),2);
    			//console.log ("distSq=" + distSq + "Make new engine at x=" + startXTile + " y=" + startYTile + " orientation=" + orientation + " fraction=" + fraction);
				if (tracks[startXTile] && tracks[startXTile][startYTile] && distSq>10 && 
				(tracks[startXTile][startYTile].type == "TrackStraight" ||
				 tracks[startXTile][startYTile].type == "Track45" ||
				 tracks[startXTile][startYTile].type == "Track90" ||
				 tracks[startXTile][startYTile].type == "TrackCross")) {
	    			var fraction = Math.atan2(mouseYWorld-startYPoint, mouseX-startXPoint)/(2*Math.PI) + 0.25;
	    			var orientation = Math.round(8*fraction+8)%8;
	    			if (trackConnects(tracks[startXTile][startYTile], (orientation+4)%8)) {
	    				if (getEC(startXTile, startYTile) == undefined) { //dont put ec on top of current ec
							if (isDrawingEngine) new EC(startXTile, startYTile, "EngineBasic", orientation, "", 20, 0.5);
							if (isDrawingCar) new EC(startXTile, startYTile, "CarBasic", orientation, "", 0, 0.5);
							buildTrains();
						}
					}
				}
				
		    	drawingPointsECX.length = 0;
		    	drawingPointsECY.length = 0;
		    	currentXTile = undefined;
		    	startXPoint = undefined;
		    	draw();
    		}

	    }

    	if (isSelecting) {
    		endSelectX = tileWidth*Math.round(mouseX/tileWidth);
    		endSelectY = tileWidth*tileRatio*Math.round(mouseY/(tileWidth*tileRatio));
    		draw();
   			if (mouseX>Math.min(startSelectX, endSelectX) 
   			 && mouseYWorld>Math.min(startSelectY, endSelectY)
   			 && mouseX<Math.max(startSelectX, endSelectX)
   			 && mouseYWorld<Math.max(startSelectY, endSelectY))
   			  e.target.style.cursor = 'move';
    	}
    	
    	if (isMoving) {
    		endMoveX = tileWidth*Math.round(mouseX/tileWidth);
    		endMoveY = tileWidth*tileRatio*Math.round(mouseY/(tileWidth*tileRatio));
    		moveX = undefined
			isMoving = false;
			
			//copy tracks and ecs 
	    	for (gridx= Math.min(startSelectX, endSelectX)/tileWidth; gridx<Math.max(startSelectX, endSelectX)/tileWidth; gridx++) {
		    	for (gridy= Math.min(startSelectY, endSelectY)/tileWidth/tileRatio; gridy<Math.max(startSelectY, endSelectY)/tileWidth/tileRatio; gridy++) {
//						ctx.translate(startX-startSelectX, startY-startSelectY); //center origin on tile
		    		//copy track 
		    		var track = tracks[gridx][gridy];
		    		console.log("COpy tracl at "+gridx+", "+gridy);
		    		if (track) {
		    			console.log("endMoveX="+endMoveX+ " stMvX="+startMoveX);
		    			console.log("New track at "+ gridx+Math.round((endMoveX-startMoveX)/tileWidth)+", "+gridy+Math.round((endMoveY-startMoveY)/tileWidth/tileRatio));
		    			new Track ( gridx+Math.round((endMoveX-startMoveX)/tileWidth), gridy+Math.round((endMoveY-startMoveY)/tileWidth/tileRatio), track.type, track.orientation, track.state, track.subtype);
		    		}
		    		// delete any ECs for which new track is placed on top of
		    		var ecOld =getEC(gridx+Math.round((endMoveX-startMoveX)/tileWidth), gridy+Math.round((endMoveY-startMoveY)/tileWidth/tileRatio));
					if (ecOld) deleteEC(ecOld); // delete any ECs for which new track is placed on top of
		    		//copy EC
		    		var ec=getEC(gridx,gridy);
		    		if (ec) {
		    			var newEC = new EC (gridx+Math.round((endMoveX-startMoveX)/tileWidth), gridy+Math.round((endMoveY-startMoveY)/tileWidth/tileRatio), ec.type, ec.orientation, ec.state, ec.speed, ec.position);
		    			newEC.cargo = ec.cargo; //copy cargo
		    		}
		    	}
	    	}
			
    		draw();
    	}
    	
		isMoving = false;
		isErasing = false;
		isSelecting = false;
    	isDrawingEngine = false;
    	isDrawingCar = false;
	    
	}
	
	function addTrackCargo(track) { //adds a new TrackCargo for the given track. The new TrackCargo will be behind the inset so one tile away
		step = getTrackCargoStep(track);
		if (tracks[track.gridx+step.stepX]) {
			if (tracks[track.gridx+step.stepX][track.gridy+step.stepY] != undefined) {
				if (tracks[track.gridx+step.stepX][track.gridy+step.stepY].type != "TrackCargo") {
					//replace track with TrackCargo
					new Track(track.gridx+step.stepX, track.gridy+step.stepY, "TrackCargo"); 
				}
			} else {
				//make new TrackCargo
				new Track(track.gridx+step.stepX, track.gridy+step.stepY, "TrackCargo"); 
			}
		}
		
	}
	
	function getTrackCargoStep(track) { //used for getting cargo from TrackCargo tiles to be used for adjacent wyes and stations. Returns the displacement of the cargo tile compared to the wye or station
		if (!track) console.log("ERROR- track is null for cargo. Track at "+track.gridx+" ,"+track.gridy);
		var dif = 6; //rotate differently depending on track type
		switch (track.type) {
			case "TrackWyeRight":
				dif = 2;
				break;
			case "TrackWye":
				dif = 4;
				break;
		}
		var angle = ((tracks[track.gridx][track.gridy].orientation + 2 + dif) %8)*Math.PI/4;
		var stepX = Math.round(Math.cos(angle));
		var stepY = Math.round(Math.sin(angle));
		return {
			'stepX': stepX,
			'stepY': stepY
		};
	}
	
	function getEC(gridx, gridy) { //returns the engine or car at the given coordinates
		for (var w=0; w<engines.length; w++) {
			if (engines[w].gridx == gridx && engines[w].gridy == gridy) return engines[w];
		}

		if (cars == undefined) return;
		for (var w=0; w<cars.length; w++) {
			if (cars[w].gridx == gridx && cars[w].gridy == gridy) return cars[w];
		}
	}
	
	function getTrain(ec) { //returns the train that this ec belongs to
		for (var w=0; w<trains.length; w++) {
			train = trains[w];
			for (var x=0; x<train.length; x++) {
				if (train[x] == ec) return train;
			}
		}
	}

	function isLastCarInTrain(ec) {
		var train = getTrain(ec);
		var position;
		for (var i=0; i<train.length && !position; i++) { // get ec's position in train
			if (ec == train[i]) position = i;
		}

		if (ec.speed>=0) {
			if (train.length == position+1) return true; //this is the last ec of train going forward
		} else {
			if (position == 0) return true; //this is the first ec of a train going backward
		}
		
		return false;
	}
	
	function isFirstCarInTrain(ec) {
		var train = getTrain(ec);
		var position;
		for (var i=0; i<train.length && !position; i++) { // get ec's position in train
			if (ec == train[i]) position = i;
		}
		
		if (ec.speed>=0) {
			if (position == 0) return true; //this is the first ec of train going forward
		} else {
			if (train.length == position+1) return true; //this is the last ec for a train going backwards
		}
		
		return false;
	}
	
	function buildTrains() { // connects engines with adjacent cars to make trains. A train has exactly one engine and no gaps, but engine does not have to be first
//		if (cars[0]){
//			cars[0].speed=0;
//			var next=getNextTrack(cars[0]);
//			var prev=getPreviousTrack(cars[0]);
//			console.log("Car0 next=("+next.gridx+","+next.gridy+")   prev=("+prev.gridx+","+prev.gridy+")");
//		}
//		return;
		trains.length = 0;
		//console.log("engines="+engines.length);
		for (var i=0; i<engines.length; i++) {
			var train = [];
			train.push(engines[i]);
			trains[i]=train;

			//step forward from engine and add adjacent cars to train	
			var ec = engines[i];
			//console.log("engine "+i+" speed="+ec.speed)
			var recip, next, prev;
			do {
				if (ec.speed>=0) next = getNextTrack(ec);
				else next = getPreviousTrack(ec);
//				console.log("AA nextx="+next.gridx+" nexty="+next.gridy+" ori="+ec.orientation+" speed="+ec.speed);
				ec = getEC(next.gridx, next.gridy);
				
				if (ec) if (ec.type != "EngineBasic") {
					if (ec.speed>=0) recip = getPreviousTrack(ec);
					else recip = getNextTrack(ec);
					//only link if there is a reciprocal match
//					console.log("AA recipgridx="+recip.gridx+" curgridx="+train[0].gridx+" recipy="+recip.gridy+" cury="+train[0].gridy);
					if (recip.gridx == train[0].gridx && recip.gridy == train[0].gridy) {
						train.unshift(ec);
						if (engines[i].speed <0) reverseSpeed(ec);
						ec.speed = engines[i].speed;
						ec.position = engines[i].position;
						
//						console.log("AA front added car forward");
					} else { //try flipping car's orientation
//						console.log("Before reverse ori="+ec.orientation);
						reverseOrientation(ec);
//						console.log("After reverse ori="+ec.orientation);
						if (ec.speed>=0) recip = getPreviousTrack(ec);
						else recip = getNextTrack(ec);
						//only link if there is a reciprocal match
//						console.log("AA front Second chance recipgridx="+recip.gridx+" crgridx="+train[0].gridx+" recipy="+recip.gridy+" cry="+train[0].gridy);
						if (recip.gridx == train[0].gridx && recip.gridy == train[0].gridy) {
							train.unshift(ec);
							if (engines[i].speed <0) reverseSpeed(ec);
							ec.speed = engines[i].speed;
							ec.position = engines[i].position;
//							console.log("AA front added car flipped ori="+ec.orientation+" speed="+ec.speed);
						} else {
							reverseOrientation(ec);
							ec = undefined;
//							console.log("AA front No recip");
						}
					}
				} // else console.log("AA no car");
			} while (ec && train.length < 200 && ec.type != "EngineBasic")  //max train length of 200 to prevent circular trains causing infinite loop

			//step backwards from engine and add adjacent cars to train	
			var ec = engines[i];
			do {
				//get ec at previous position
				if (ec.speed>=0) prev = getPreviousTrack(ec);
				else prev = getNextTrack(ec);
//				console.log("prevx="+prev.gridx+" prevy="+prev.gridy+" ori="+ec.orientation+" speed="+ec.speed);
				ec = getEC(prev.gridx, prev.gridy);
				
				if (ec) if (ec.type != "EngineBasic")  {
					if (ec.speed>=0) recip = getNextTrack(ec);
					else recip = getPreviousTrack(ec);
					//only link if there is a reciprocal match
//					console.log("recipgridx="+recip.gridx+" crgridx="+train[train.length-1].gridx+" recipy="+recip.gridy+" cry="+train[train.length-1].gridy);
					if (recip.gridx == train[train.length-1].gridx && recip.gridy == train[train.length-1].gridy) {
						train.push(ec);
						if (engines[i].speed <0) reverseSpeed(ec);
						ec.speed = engines[i].speed;
						ec.position = engines[i].position;
//						console.log("added car forward");
					} else { //try flipping car's orientation
						reverseOrientation(ec);
						if (ec.speed>=0) recip = getNextTrack(ec);
						else recip = getPreviousTrack(ec);
//						console.log("Second chance recipgridx="+recip.gridx+" curgridx="+train[train.length-1].gridx+" recipy="+recip.gridy+" cury="+train[train.length-1].gridy);
						//only link if there is a reciprocal match
						if (recip.gridx == train[train.length-1].gridx && recip.gridy == train[train.length-1].gridy) {
							train.push(ec);
							if (engines[i].speed <0) reverseSpeed(ec);
							ec.speed = engines[i].speed;
							ec.position = engines[i].position;
//							console.log("added car flipped");
						} else {
							reverseOrientation(ec); //flip car orientation back
							ec = undefined;
//							console.log("No recip");
						}
					}
				} //else console.log("no car");
			} while (ec && train.length < 200 && ec.type != "EngineBasic")  //max train length of 200 to prevent circular trains causing infinite loop

		}
	}
	
    function doOnOrientationChange() {
        calculateLayout();
        draw();
    }

    function doTouchStart(e) {
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
        var x = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser
        var y = parseInt(touchobj.clientY) // get y position of touch point relative to top edge of browser
        console.log("TOUCH start!!!! x="+x+" y="+y);
        e.preventDefault();
        onClickDown(x, y);
    }
        
    function doTouchMove(e) {
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
        var x = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser
        var y = parseInt(touchobj.clientY) // get y position of touch point relative to top edge of browser
        console.log("TOUCH move!!!! x="+x+" y="+y);
        e.preventDefault();
        onClickMove(x, y);
    }
        
    function doTouchEnd(e) {
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
        var x = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser
        var y = parseInt(touchobj.clientY) // get y position of touch point relative to top edge of browser
        console.log("TOUCH end!!!! x="+x+" y="+y);
        e.preventDefault();
        onClickUp(x, y);
    }
        
    function calculateLayout() {
    	if (resizeCanvas) {
	        windowWidth = window.innerWidth;
	        windowHeight = window.innerHeight;
	        pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device
	        //console.log ("width="+windowWidth+" height="+windowHeight+" ratio="+pixelRatio);
	        canvas.width = windowWidth;// * pixelRatio;   /// resolution of canvas
	        canvas.height = windowHeight;// * pixelRatio;
	        canvas.style.width = windowWidth + 'px';   /// CSS size of canvas
	        canvas.style.height = windowHeight + 'px';
	    }
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        toolBarHeight = canvasHeight; //height of toolbar in pixels
        if (!showToolBar) {
        	toolBarHeight = 0;
        	toolBarWidth = 0;
        }
        tracksWidth = canvasWidth-toolBarWidth; //width of the tracks area in pixels
        tracksHeight = canvasHeight; //height of the tracks area in pixels
        numTilesX = Math.floor(tracksWidth/tileWidth);
        numTilesY = Math.floor(tracksHeight/tileRatio/tileWidth);
    }
    
	//////////////////////
	function draw() {
        

		//add background texture
//        ctx.save();
//		ctx.scale(zoomScale, zoomScale);
		ctx.drawImage(imgTerrain,0,0,canvasWidth,canvasHeight);
 //       ctx.restore();
        
        ctx.save();
		ctx.scale(zoomScale, zoomScale);
		if (getButton("Track").down || getButton("Cargo").down) drawGrid();
		drawAllTracks();
		drawSquares();
		drawAllEnginesAndCars();
		if (showToolBar) {
			drawCaption();
			drawSecondaryCaption();
			drawButtonCaption();
			drawSelection();
			drawPathEC();
			drawPathTrack();
		}
        ctx.restore();

		if (showToolBar) { //toolbar doesn't zoom
			drawToolBar();
		}
	}
	
	function interpretAndDraw() {
//		if (nIterations%Math.round(skip) == 0) { //accelerate
			interpretAll();
			detectCrashes();
			detectStations();
			draw();
//		}

//		nIterations++;
//		if (skip>1) skip -= 0.5;
	}
	
	draw(); //draw scene before play button pressed first time
	
	function drawAllTracks() {
		//draw all tracks
		//console.log("draw all tracks");
		
//		for (var i=0; i< tracks.length; i++) {
		for (var i=0; i< numTilesX; i++) {
//		    for (var j=0; j<tracks[i].length; j++) {
		    for (var j=0; j<numTilesY; j++) {
		        if (tracks[i] != undefined && tracks[i][j] != undefined) {
		        	drawTrack(tracks[i][j]);
		        }
		    }
		}
	}	
	
	function drawSquares() { 
		// draw tracks in the squares in the diagonals of tracks where needed
		for (var i=0; i< numTilesX; i++) {
//		for (var i=0; i< tracks.length; i++) {
		    entry = tracks[i];
		    for (var j=0; j<numTilesY; j++) {
		    //for (var j=0; j<entry.length; j++) {
                var track;
		    	if (entry) track = entry[j];
		        if (track) {
		        	//console.log("track type=" + entry[j].type);
		        	if (tracks[i+1]) if (tracks[i+1][j+1]) {
		        		//console.log("Draw SE diagnol for x=" + i + " y=" + j); 
		        		//only draw diagonal if both tracks line up with square
		        		if (trackConnects(tracks[i][j],3)) if (trackConnects(tracks[i+1][j+1],7)) {
							ctx.save();
							ctx.translate((0.5+track.gridx)*tileWidth, (0.5+track.gridy)*tileWidth*tileRatio); //center origin on tile
			        		//draw diagnol is SE
							drawSquare();
			        		ctx.restore();
			        	}
		        	}
		        	if (tracks[i-1]) if (tracks[i-1][j+1]) {
		        		//console.log("Draw SW diagnol for x=" + i + " y=" + j); 
		        		//only draw diagonal if both tracks line up with square
		        		if (trackConnects(tracks[i][j],5)) if (trackConnects(tracks[i-1][j+1],1)) {
							ctx.save();
							ctx.translate((-0.5+track.gridx)*tileWidth, (0.5+track.gridy)*tileWidth*tileRatio); //center origin on tile
							ctx.translate(0.5*tileWidth, 0.5*tileWidth); //center origin on corner
							ctx.rotate(Math.PI/2);
							ctx.translate(-0.5*tileWidth, -0.5*tileWidth); //center origin back on tile
			        		//draw diagnol is SE
							drawSquare();
			        		ctx.restore();
			        	}
		        	}
		        }
		    }
		}
		
	}
	
	function drawSquare() { //draw diagonal track across one square in SE orientation
		//draw ties
		ctx.strokeStyle = tieColor;
		ctx.lineWidth = 4;
		for (var k=Math.SQRT2/6; k<Math.SQRT2; k+=Math.SQRT2/3) {
			ctx.beginPath();
			ctx.moveTo(((2 + Math.SQRT2+k)/(2 + 2*Math.SQRT2)-0.55)*tileWidth, (0.55+k/(2 + 2*Math.SQRT2))*tileWidth);
			ctx.lineTo((0.55+k/(2 + 2*Math.SQRT2))*tileWidth, (-0.55 + ((2+Math.SQRT2+k)/(2 + 2*Math.SQRT2)))*tileWidth);
			ctx.stroke();
		}
			
		//draw rails
		ctx.strokeStyle = railColor;
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.moveTo((oct2-0.5)*tileWidth, 0.5*tileWidth);
		ctx.lineTo(0.5*tileWidth, (0.5 + oct1)*tileWidth);
		ctx.stroke();
		ctx.moveTo(0.5*tileWidth, (-0.5 + oct2)*tileWidth);
		ctx.lineTo((0.5 + oct1)*tileWidth, 0.5*tileWidth);
		ctx.stroke();
	}
	
	function drawAllEnginesAndCars() {
		//combine engine and cars array
		var ECs = engines.concat(cars);
		
		//sort ECs by gridy
		ECs.sort(function(a, b){
		 return a.gridy-b.gridy
		})	
			
		for (var i=0; i<ECs.length; i++) {
			drawEC(ECs[i]);
		}
	}	
	
/*	function drawAllEngines() { 
		//sort engines by row
		for (var i=0; i<engines.length; i++) {
			drawEC(engines[i]);
		}
	}	
	
	function drawAllCars() {
		if (cars == undefined) return;
		for (var i=0; i<cars.length; i++) {
			drawEC(cars[i]);
		}
	}	
*/	
	function drawSelection() {

		if (startSelectX == endSelectX) return;
		if (startSelectY == endSelectY) return;
		ctx.lineWidth = 2;
	    ctx.strokeStyle = "red";
	    ctx.beginPath();
	    
	    var startX = startSelectX;
	    var startY = startSelectY;
	    var endX = endSelectX;
	    var endY = endSelectY;
	    if (isMoving) {
	    	console.log("startMoveY="+startMoveY+" endMoveY="+endMoveY);
    		startX = startX - startMoveX + endMoveX;
    		startY = startY - startMoveY + endMoveY;
    		endX = endX - startMoveX + endMoveX;
    		endY = endY - startMoveY + endMoveY;
	    }
		ctx.dashedLine( startX, startY, endX, startY, [4,3]);
		ctx.dashedLine( endX, startY, endX, endY, [4,3]);
		ctx.dashedLine( endX, endY, startX, endY, [4,3]);
		ctx.dashedLine( startX, endY, startX, startY, [4,3]);
		ctx.stroke();

		//show tracks and ecs being moved
	    if (isMoving) {
	    	for (gridx= Math.min(startSelectX, endSelectX)/tileWidth; gridx<Math.max(startSelectX, endSelectX)/tileWidth; gridx++) {
		    	for (gridy= Math.min(startSelectY, endSelectY)/tileWidth/tileRatio; gridy<Math.max(startSelectY, endSelectY)/tileWidth/tileRatio; gridy++) {
					//translate
					ctx.save();
					ctx.translate(startX-startSelectX, (startY-startSelectY)/tileRatio); //center origin on tile
		    		//draw track 
		    		drawTrack(tracks[gridx][gridy]);
		    		//draw EC
		    		var ec=getEC(gridx,gridy);
		    		drawEC(ec);
		    		
		    		ctx.restore();
		    	}
	    	}
	    }
	}
	
	function getOffset(ec) { //returns the center of an engine or car in tiles with origin at center of current tile so (-0.5,0.5]
		//also adjust offset to smooth over the squares that go across diagonals
		var enterSquareDist = 0;
		var exitSquareDist = 0;
		var offsetx = 0;
		var offsety = 0; //fraction of a tile offset
		
		var track = tracks[ec.gridx][ec.gridy];
		
		var enterOri = ec.orientation;
		if (ec.speed <0) enterOri = (enterOri+4)%8;
		if (enterOri == 1 || enterOri == 3 || enterOri == 5 || enterOri == 7) enterSquareDist = (Math.SQRT2-1)/2;
		var exitOri = getExitOrientation(ec);
		if (exitOri == 1 || exitOri == 3 || exitOri == 5 || exitOri == 7) exitSquareDist = (Math.SQRT2-1)/2;
		var totalDist = enterSquareDist + 1 + exitSquareDist;
		if (ec.speed<0) {
			var temp = enterSquareDist;
			enterSquareDist = exitSquareDist;
			exitSquareDist = temp;
		}
		//console.log("exit ori="+exitOri);
		
		var type = getTypeForWye(ec, track);
		switch (type) {
			case "TrackWyeLeft":
				if (track.state == "left") type = "Track90";
				else type = "TrackStraight";
				break;
			case "TrackWyeRight":
				if (track.state == "left") type = "TrackStraight";
				else {
					type = "Track90Right";
				}
				break;
			case "TrackWye":
				if (track.state == "left") type = "Track90";
				else {
					type = "Track90Right";
				}
				break;
		}

		if (ec.position < enterSquareDist/totalDist) { 
		//the ec is in the entering square
			var frac = (enterSquareDist/totalDist - ec.position)/(enterSquareDist/totalDist); //fraction across enter square
			var oriDif = (ec.orientation - exitOri +8)%8;
			switch (type) {
				case "TrackStraight":
				case "TrackCross":
				case "TrackBridge":
					offsety = frac*(Math.SQRT2/2 - 0.5) + 0.5;
					break;
				case "Track90":
				case "Track90Right":
					//console.log("frac="+frac);
					if (ec.speed>=0) {
						offsety = frac*(Math.SQRT2/2 - 0.5) + 0.5;
					} else {
						if (oriDif ==6) offsetx = (frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsetx = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					}
					break;
				case "Track45":
//					console.log("WWWW OriDif="+oriDif+" frac="+frac);
					if (ec.speed>=0) {
						offsety = frac*(Math.SQRT2/2 - 0.5) + 0.5;
					} else {
//						console.log("jjj oriDif="+oriDif+" enterOri="+enterOri+" exitOri="+exitOri);
						if (oriDif == 5) {
							offsetx = Math.SQRT2/4+(frac)*((Math.SQRT2-1)/2);
							offsety = (Math.SQRT2/4+(frac)*((Math.SQRT2-1)/2));
						} else {
							console.log("GGGG");
							offsetx = -(Math.SQRT2/4+(frac)*((Math.SQRT2-1)/2));
							offsety = (Math.SQRT2/4+(frac)*((Math.SQRT2-1)/2));
						}
					}
					break;
			}
	
			if (type == "Track90Right") offsetx = -offsetx;
			//console.log ("In enterSquare. offsetx="+offsetx+" offsety="+offsety+" position="+ec.position+" frac="+frac);
		} else if (ec.position <= (1 + enterSquareDist)/totalDist) { 
		//the ec is in tile proper
			frac = (ec.position - enterSquareDist/totalDist) / ((1 + enterSquareDist)/totalDist - enterSquareDist/totalDist);
			//console.log("frac="+frac);
			switch (type) {
				case "TrackStraight":
				case "TrackCross":
				case "TrackBridge":
					offsety = 0.5 - frac;
					break;
				case "Track90":
				case "Track90Right":
					if (ec.speed>=0) {
						if (ec.orientation != track.orientation) {
							offsetx = -Math.cos(Math.PI/2*frac)/2 + 0.5;
							offsety = -Math.sin(Math.PI/2*frac)/2 + 0.5;
						} else {
							offsetx = Math.cos(Math.PI/2*frac)/2 - 0.5;
							offsety = -Math.sin(Math.PI/2*frac)/2 + 0.5;
						}
					} else {
						if ((ec.orientation - track.orientation+8)%8 == 4) {
							offsetx = -Math.sin(Math.PI/2*frac)/2 + 0.5;
							offsety = Math.cos(Math.PI/2*frac)/2 - 0.5;
						} else {
							offsetx = Math.sin(Math.PI/2*frac)/2 - 0.5;
							offsety = Math.cos(Math.PI/2*frac)/2 - 0.5;
						}
				}
					break;
				case "Track45":
					if (ec.speed>=0) {
						//console.log ('eng ori=' + this.orientation + " trk ori=" + track.orientation);
						if (ec.orientation != track.orientation) {
							offsetx = -Math.cos(Math.PI/2*frac/2)*1.25 + 1.25;
							offsety = -Math.sin(Math.PI/2*frac/2)*1.25 + 0.5;
						} else {
							offsetx = Math.cos(Math.PI/2*frac/2)*1.25 - 1.25;
							offsety = -Math.sin(Math.PI/2*frac/2)*1.25 + 0.5;
						}
					} else {
						//console.log("Tr45 oridif="+(ec.orientation - track.orientation+8)%8);
						if ((ec.orientation - track.orientation+8)%8 == 4) {
							offsetx = -Math.cos(Math.PI/2*(1-frac)/2)*1.25 + 1.25;
							offsety = Math.sin(Math.PI/2*(1-frac)/2)*1.25 - 0.5;
						} else { //todo
							offsetx = Math.cos(Math.PI/2*(1-frac)/2)*1.25 - 1.25;
							offsety = Math.sin(Math.PI/2*(1-frac)/2)*1.25 - 0.5;
						}
					}
					break;
			}
	
			if (type == "Track90Right") offsetx = -offsetx;
//			console.log ("In tileProper. offsetx="+offsetx+" offsety="+offsety+" position="+ec.position+" frac="+frac);
		} else { 
		// ec is in exiting square
			// should range from -sqrt2 to -0.5
			var frac = (ec.position - (1+exitSquareDist)/totalDist)/(exitSquareDist/totalDist);
			var oriDif = (ec.orientation - exitOri +8)%8;
			switch (type) {
				case "TrackStraight":
				case "TrackCross":
				case "TrackBridge":
					offsety = -frac*(Math.SQRT2/2 - 0.5) - 0.5; // [-0.5, -0.207]
					break;
				case "Track90":
				case "Track90Right":
					//console.log("frac="+frac);
					if (ec.speed>=0) {
						if (oriDif == 6) offsetx = (frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsetx = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					} else {
						if (oriDif == 6) offsety = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsety = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					}
					break;
				case "Track45":
					//console.log("OriDif="+oriDif+" frac="+frac);
					if (ec.speed >=0) {
						if (oriDif ==7) {
							offsetx = Math.SQRT2/4+(1+frac)*((Math.SQRT2-1)/2);
							offsety = -(Math.SQRT2/4+(1+frac)*((Math.SQRT2-1)/2));
						} else {
							offsetx = -(Math.SQRT2/4+(1+frac)*((Math.SQRT2-1)/2));
							offsety = -(Math.SQRT2/4+(1+frac)*((Math.SQRT2-1)/2));
						}
					} else {
						console.log("jjj oriDif="+oriDif+" enterOri="+enterOri+" exitOri="+exitOri);
						if (oriDif ==5) {
							offsety = -((1+frac)*(Math.SQRT2/2 - 0.5) + 0.5); // [-0.5, -0.707]
//							offsety = -frac*(Math.SQRT2/2 - 0.5) - 0.5; // [-0.5, -0.207]
						} else {
							offsety = -((1+frac)*(Math.SQRT2/2 - 0.5) + 0.5); // [-0.5, -0.707]
//							offsety = -frac*(Math.SQRT2/2 - 0.5) - 0.5; // [-0.5, -0.207]
						}
					}
					break;
			}
	
			if (type == "Track90Right") offsetx = -offsetx;
//			console.log ("In exitSquare. offsetx="+offsetx+" offsety="+offsety+" position="+ec.position+" frac="+frac);
		}	
			
	    return {
	        'X': offsetx,
	        'Y': offsety
	    };  
		
	}
	
	function getExitOrientation(ec) { //returns the exit orientation for the ec
		var next = getNextTrack(ec);
		var angle = Math.atan2(next.gridy-ec.gridy, next.gridx-ec.gridx);
		var ori = (angle/(2*Math.PI)*8 + 10)%8;
		//console.log ("Exit ori="+ori);
		return ori;
	}
	
	function getCenter(obj) { //returns center of EC or tile in pixels
		var x,y;
		if (obj.type == "EngineBasic" || obj.type == "CarBasic") {
			var offset = getOffset(obj);
			var angle = Math.PI/4*(obj.orientation);
			x = (obj.gridx+0.5+Math.cos(angle)*offset.X-Math.sin(angle)*offset.Y)*tileWidth;
			y = (obj.gridy+0.5+Math.sin(angle)*offset.X+Math.cos(angle)*offset.Y)*tileWidth;
			//console.log("get Center Engine offset="+offset+" x="+x+" y="+y+ " angle="+angle);
		} else {
			x= (obj.gridx+0.5)*tileWidth;
			y= (obj.gridy+0.5)*tileWidth;
			//console.log("new Center  x="+x+" y="+y);
		}
		
	    return {
	        'X': x,
	        'Y': y
	    };  
	}
	
	function drawCaption() { //draw caption bubble attached to currentCaptionedObject
//		console.log("Draw caption");
		if (currentCaptionedObject == undefined) return;
		
		if (captionX == undefined) { //choose coordinates for caption bubble
			var retVal = spiral (currentCaptionedObject.gridx, currentCaptionedObject.gridy);
			captionX = retVal.gridx;
			captionY = retVal.gridy;
		}

		if (captionX == -1) return;
				
		var captionWidth =2;
		var captionHeight =2;
		if (currentCaptionedObject.type == 'TrackStraight') {
			captionHeight =3;
		}
		var obj = getCenter(currentCaptionedObject);
		//console.log("objx="+obj.X+" objy="+obj.Y);

		drawCaptionBubble(captionX, captionY*tileRatio, captionWidth, captionHeight*tileRatio, obj.X, obj.Y*tileRatio);
		
		switch (currentCaptionedObject.type) {
			case "EngineBasic":
				drawSprite("speedController");
				break;
			case "CarBasic":
			case "TrackCargo":
			case "TrackBlank":
		 		drawButtonsArray(buttonsCargoTypes);
				break;
			case "TrackStraight":
		 		drawButtonsArray(buttonsStation);
				break;
			case "TrackWye":
			case "TrackWyeLeft":
			case "TrackWyeRight":
		 		drawButtonsArray(buttonsWye);
				break;
		}
		 
	}
	
	function drawSecondaryCaption() { //draw caption bubble attached to primary caption bubble (used for submenus)
		if (secondaryCaption == undefined) return;
		
		if (captionSecondaryX == undefined) { //choose coordinates for secondary caption bubble
			var retVal = spiral (captionX, captionY);
			captionSecondaryX = retVal.gridx;
			captionSecondaryY = retVal.gridy;
			//console.log("Found new cap loc x="+captionSecondaryX+" y="+captionSecondaryY);
		}
		if (captionX == -1) return;
				
		var captionWidth =3;
		var captionHeight =3;

		drawCaptionBubble(captionSecondaryX, captionSecondaryY*tileRatio, captionWidth, captionHeight*tileRatio, secondaryCaption.X, secondaryCaption.Y*tileRatio, true);
		
		//console.log("Draw button array="+secondaryCaption.type)
		
		//get cargo subarray
		var iCargo;
		for (var i=0; i<cargoValues.length; i++) {
			//console.log("cv="+cargoValues[i][0]+" sct="+secondaryCaption.type);
			if (cargoValues[i][0] == secondaryCaption.type) iCargo = i;
		}
		if (iCargo == undefined) {
			console.log("ERROR- cargo not found");
			return;
		}
		//console.log("iCargo"+iCargo);
		
		i=1;
		var array = [];
		var nCols = Math.floor(Math.sqrt(cargoValues[iCargo].length-1));
		var nRows = Math.ceil((cargoValues[iCargo].length-1) / nCols);
		console.log ("Rows="+nRows+" cols="+nCols);
		for (var row=0; row<nRows; row++) {
			var rowArray = [];
			for (var col=0; col<nCols; col++) {
				if (i<cargoValues[iCargo].length) rowArray.push (cargoValues[iCargo][i]);
				i++;
			}
			array.push(rowArray);
		}
		
 		drawButtonsArray(array, true);
		
	}
	
	function drawButtonsArray(array, isSecondary) {
		var captionWidth = 1.8;
		var captionHeight = 1.8;
		//console.log ("Array length="+array.length);
		if (array[0].length*array.length > 8) captionHeight = 2.8;
		if (isSecondary) captionWidth = 2.8;
		//console.log("Begin draw button array");
 		for (var row=0; row<array.length; row++) {
 			//console.log ("----row="+row);
 			//console.log("row length="+array[row].length);
 			for (var col=0; col<array[row].length; col++) {
 				//console.log("r="+row+"c="+col);
 				var xSpacing = (captionWidth*tileWidth-array[row].length*insetWidth)/(array[row].length+1);
 				var ySpacing = (captionHeight*tileWidth*tileRatio-array.length*insetWidth)/(array.length+1);
 				if (array.length == 3 && isSecondary) {
 					ySpacing = ySpacing*2.5;
 					//console.log("Extra space "+ySpacing);
 				} 
			 	ctx.save();
			 	if (isSecondary) {
			 		ctx.translate(xSpacing*(col+1)+(col*insetWidth)+(captionSecondaryX+0.1)*tileWidth, ySpacing*(row+1)+(row*insetWidth)+(captionSecondaryY+0.1)*tileWidth*tileRatio);
			 	} else {
			 		ctx.translate(xSpacing*(col+1)+(col*insetWidth)+(captionX+0.1)*tileWidth, ySpacing*(row+1)+(row*insetWidth)+(captionY+0.1)*tileWidth*tileRatio);
			 	}
			 	//drawTrackInset();
			 	if (isSecondary) {
                    if (array[row][col] != undefined) {
                        var index = 1;
                        index = row*(array.length-1)+col;
                        //console.log("row="+row+", col="+col+", value="+array[row][col]+", index="+index);
                        drawSprite("Caption"+array[0][0],0, index); //kkk
                    }
                } else {
                    drawSprite("Caption"+array[row][col],0, 0); //kkk
                }
			 	ctx.restore();
 			}
 		}
		//console.log("End draw button array");
	}
	
	function drawCaptionBubble (capX, capY, captionWidth, captionHeight, objX, objY, isSecondary) { //capX, capY is upperleft corner of caption, objX, objY is location of where pointer goes
		//draw caption bubble
		//console.log("Cap bubble at capX="+capX+" capY="+capY);
		var angle = Math.atan2(objY-(capY+0.5*captionHeight)*tileWidth, objX-(capX+0.5*captionWidth)*tileWidth);
		ctx.beginPath();
		ctx.moveTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle+Math.PI/2)*0.2*tileWidth, (capY+0.5*captionHeight)*tileWidth+Math.sin(angle+Math.PI/2)*0.2*tileWidth);
		ctx.lineTo (objX, objY);
		ctx.lineTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle-Math.PI/2)*0.2*tileWidth, (capY+0.5*captionHeight)*tileWidth-Math.sin(angle+Math.PI/2)*0.2*tileWidth);
		
		if (isSecondary) {
			ctx.fillStyle = secondaryCaptionColor;
			ctx.fill();
		 	roundRect(ctx, (capX+0.1)*tileWidth, (capY+0.1)*tileWidth, (captionWidth-0.2)*tileWidth, (captionHeight-0.2)*tileWidth, 0.2*tileWidth, secondaryCaptionColor, false);
		} else { 
			ctx.fillStyle = captionColor;
			ctx.fill();
		 	roundRect(ctx, (capX+0.1)*tileWidth, (capY+0.1)*tileWidth, (captionWidth-0.2)*tileWidth, (captionHeight-0.2)*tileWidth, 0.2*tileWidth, captionColor, false);
		}
		
	}
			 	
	function spiral (gridx, gridy) { //gridx and gridy are the center tile to spiral out from
		//this function spirals outward from x,y = 0,0 to max of X,Y
		// then exits when an empty space is found
		var maxX=10;
		var maxY=10;
	    var x,y,dx,dy;
	    x = y = dx =0;
	    dy = -1;
	    var t = Math.max(maxX,maxY);
	    var maxI = t*t;
	    for (var i =0; i < maxI; i++) {
	    	if ((-maxX/2 < x && x <= maxX/2) && (-maxY/2 < y && y <= maxY/2)) {
	    		//console.log ("x=" + x + " y=" + y)
	    		if (isSpace(gridx+x, gridy+y, 2, 2)) {
	    			//console.log ("Found empty space at x=" + gridx+x + " y=" + gridy+y);
	    			//successfully found empty space
				    return {
				        'gridx': gridx + x,
				        'gridy': gridy + y
				    };  
	    		}
	    	}
	    	if( (x == y) || ((x < 0) && (x == -y)) || ((x > 0) && (x == 1-y))) {
	    		t = dx;
	    		dx = -dy;
	    		dy = t;
	    	}
	    	x += dx;
	    	y += dy;
	    }
	    
	    //failed to find empty space so return adjacent
	    return {
	        'gridx': currentCaptionedObject.gridx + 1,
	        'gridy': currentCaptionedObject.gridy
	    };  
    }
    
    function isSpace (capx,capy,width, height) {
    	//returns true if the space has all empty tiles, else false
    	for (var a=capx; a<capx+width; a++) {
	    	for (var b=capy; b<capy+height; b++) {
	    		if (a<0 || b<0 || a>=Math.floor(tracksWidth/tileWidth) || b>=Math.floor(tracksHeight/tileWidth)) return false;
    			if (tracks[a] != undefined) {
                    if (tracks[a][b] != undefined) {
                        //console.log("No space at capx=" + capx + " capy=" + capy);
                        return false;
                    }
    			}
    		}
    	}
    	
    	//check if intersects current caption
    	if (secondaryCaption == undefined) return true; 
    	if (capx+width<=captionX) return true;
    	if (capy+height<=captionY) return true;
    	if (capx>=captionX+width) return true;
    	if (capy>=captionY+height) return true;

    	return false;
    }

	function drawGrid () {
		for (var i=0; i<numTilesX; i++) {
			for (var j=0; j<numTilesY; j++) {
				drawTileBorder(i,j);
			}
		}	
	}

	function drawToolBar () {
		ctx.fillStyle = toolBarBackColor;
		ctx.fillRect(tracksWidth, 0, toolBarWidth, toolBarHeight);
		
		for (var i=0; i<toolButtons.length; i++) {
			toolButtons[i].draw();
		}
	}
	
	function drawTileBorder(gridx, gridy) {
		//draw tile border
		ctx.strokeStyle = gridColor;
		ctx.save();
		ctx.translate((gridx+0.5)*tileWidth, (gridy+0.5)*tileWidth*tileRatio);
		ctx.beginPath();
		ctx.moveTo( Math.round(tileWidth/(2+Math.SQRT2)) - 0.5*tileWidth, 				-0.5*tileWidth*tileRatio);
		ctx.lineWidth = 1;
		ctx.lineTo(Math.round(tileWidth*(1+Math.SQRT2)/(2+Math.SQRT2)) - 0.5*tileWidth, -0.5*tileWidth*tileRatio); //  -
		ctx.lineTo(tileWidth - 0.5*tileWidth, 										 	Math.round(tileWidth*tileRatio/(2+Math.SQRT2)) - 0.5*tileWidth*tileRatio); //   \
		ctx.lineTo(tileWidth - 0.5*tileWidth,											Math.round(tileWidth*tileRatio*(1+Math.SQRT2)/(2+Math.SQRT2)) - 0.5*tileWidth*tileRatio); //   |
		ctx.lineTo(Math.round(tileWidth*(1+Math.SQRT2)/(2+Math.SQRT2)) - 0.5*tileWidth, 0.5*tileWidth*tileRatio); //   /
		ctx.lineTo(Math.round(tileWidth/(2+Math.SQRT2)) - 0.5*tileWidth, 				0.5*tileWidth*tileRatio); //  -
		ctx.lineTo(0 - 0.5*tileWidth, 									 			  	Math.round(tileWidth*tileRatio*(1+Math.SQRT2)/(2+Math.SQRT2)) - 0.5*tileWidth*tileRatio); // \
		ctx.lineTo(0 - 0.5*tileWidth,													Math.round(tileWidth*tileRatio/(2+Math.SQRT2)) - 0.5*tileWidth*tileRatio); // |
		ctx.lineTo(Math.round(tileWidth/(2+Math.SQRT2)) - 0.5*tileWidth, 				-0.5*tileWidth*tileRatio); // /
		ctx.stroke();
		ctx.restore();
	}
	
	function drawButtonCaption() {
		if (currentCaptionedButton == undefined) return;
		var xC=Math.floor(tracksWidth/tileWidth)-3;
		var yC=currentCaptionedButton.y/tileWidth-1.5;
		var wC=3;
		var hC=3;
		buttonCaptionX = xC*tileWidth;
		buttonCaptionY = yC*tileWidth;

		drawCaptionBubble (xC, yC, wC, hC, tracksWidth+currentCaptionedButton.x, currentCaptionedButton.y+currentCaptionedButton.height/2);
		for (var i=0; i<wC; i++) {
			for (var j=0; j<hC; j++) {
				var nBin = j*wC+i;
				if (localStorage.getObject('trx-tracks'+nBin) == undefined) {
					ctx.strokeStyle = saveButtonColors[nBin];
					ctx.lineWidth=3;
					ctx.strokeRect(10+(i+xC)*tileWidth,10+(j+yC)*tileWidth, tileWidth-20, tileWidth-20);
				} else {
					ctx.fillStyle = saveButtonColors[nBin];
					ctx.fillRect(10+(i+xC)*tileWidth,10+(j+yC)*tileWidth, tileWidth-20, tileWidth-20);
				}
			}
		}
	}
	
	function saveTrx(nBin) { //saves trx in bin nButton
		//save the tracks, engines, cars, cargo... everything to a file	using JSON stringify
		if (Modernizr.localstorage) {
		  //console.log ("Local storage available");
		} else {
		  console.log ("ERROR-NO local storage available");
		}

		var trx = [tracks, engines, cars];
		localStorage.setObject('trx-'+nBin, trx);
//		localStorage.setObject('trx-tracks'+nBin, tracks);
//		localStorage.setObject('trx-engines'+nBin, engines);
//		localStorage.setObject('trx-cars'+nBin, cars);
	}
	
	function openTrx(nBin) { //opens trx stored in bin nButton
		if (localStorage.getObject('trx-'+nBin) == undefined) {
			console.log("No trx in bin"+nBin);
			return;
		}

		var trx = localStorage.getObject('trx-'+nBin);
		tracks = trx[0];
		engines = trx[1];
		cars = trx[2];
//		tracks = localStorage.getObject('trx-tracks'+nBin);
//		engines = localStorage.getObject('trx-engines'+nBin);
//		cars = localStorage.getObject('trx-cars'+nBin);
		buildTrains();
	}

	function openTrxJSON(string) { //opens trx stored in JSON string 
		var trx = JSON.parse(string);
		tracks = trx[0];
		engines = trx[1];
		cars = trx[2];
	}

 //// BEGIN code for dialog box for new user
    var dialogNewUser, dialogSigninUser, dialogForgotPassword,dialogUploadTrack, dialogDownloadTrack, form;
 
    // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var username = $("#username");
    var usernameSignin = $("#usernameSignin");
    var email = $("#email");
    var password = $("#password");
    var passwordSignin = $("#passwordSignin");
    var trackname = $("#trackname");
    var trackdescription = $("#trackdescription");
    var allFields = $( [] ).add(username).add(email).add(password).add(trackname).add(trackdescription);
    var tips = $(".validateTips");
  
     function newUser() {
    	console.log("Add user");
    	//var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    	//tips = $( ".validateTips" );
      	var valid = true;
      	valid = valid && checkLength( username, "username", 3, 16 );
     	valid = valid && checkLength( email, "email", 6, 80 );
      	valid = valid && checkLength( password, "password", 5, 16 );
 
      	valid = valid && checkRegexp( username, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
      	valid = valid && checkRegexp( email, emailRegex, "eg. engineer@train-hub.org" );
      	valid = valid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
 
      	if ( valid ) {
        	//$( "#users tbody" ).append( "<tr>" + "<td>" + name.val() + "</td>" + "<td>" + email.val() + "</td>" + "<td>" + password.val() + "</td>" + "</tr>" );
        	console.log("ADD username="+username.val()+", email="+email.val()+", password="+password.val());
	        xmlhttp = new XMLHttpRequest();
	        xmlhttp.onreadystatechange = function() {
	            if (this.readyState == 4 && this.status == 200) {
	                console.log("Response="+this.responseText);
	            }
	        };
	        var url = "php/newUser.php?username="+encodeURI(username.val())+"&email="+encodeURI(email.val())+"&password="+encodeURI(password.val());
	        console.log("url="+url);
	        xmlhttp.open("GET",url,true);
	        xmlhttp.send();
        	dialogNewUser.dialog( "close" );
      	}
      	return valid;
    }
    
    function signinUser() {
    	console.log("Function signinUser");
     	var valid = true;
      	valid = valid && checkLength( usernameSignin, "username", 3, 16 );
      	valid = valid && checkLength( passwordSignin, "password", 5, 16 );
 
      	valid = valid && checkRegexp( usernameSignin, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
      	valid = valid && checkRegexp( passwordSignin, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
 
      	if ( valid ) {
        	//$( "#users tbody" ).append( "<tr>" + "<td>" + name.val() + "</td>" + "<td>" + email.val() + "</td>" + "<td>" + password.val() + "</td>" + "</tr>" );
        	//console.log("signin username="+usernameSignin.val()+", password="+passwordSignin.val());
	        xmlhttp = new XMLHttpRequest();
	        xmlhttp.onreadystatechange = function() {
	            if (this.readyState == 4 && this.status == 200) {
	                //console.log("Response="+this.responseText);
	                if (this.responseText == "fail-login") {
	                	alert ("Wrong username or password");
	                } else if (this.responseText == "fail-connect") {
	                	alert ("Failed to connect");
	                } else {
		                var retArray = this.responseText.split("&&&");
		                currentUserID = retArray[1];
		                currentUsername = retArray[2];
		                console.log("Successfully logged in username="+currentUsername+", and userID="+currentUserID);
		            }
	            }
	        };
	        var url = "php/signinUser.php?username="+encodeURI(usernameSignin.val())+"&password="+encodeURI(passwordSignin.val());
	        //console.log("url="+url);
	        xmlhttp.open("GET",url,true);
	        xmlhttp.send();
        	dialogSigninUser.dialog( "close" );
      	}
      	return valid;
    }
    
    function forgotPassword() {
    	console.log ("function forgot password");
    }
    
    function browseTracks() {
    	console.log("Function browse tracks");
    }

	function uploadTrack() { // uses GET
		console.log ("Function Upload track");
 		var trx = [tracks, engines, cars];
		var strTrx = JSON.stringify(trx);

      	var valid = true;
      	valid = valid && checkLength( trackname, "trackname", 3, 25 );
     	valid = valid && checkLength( trackdescription, "trackdescription", 6, 300 );

      	if ( valid ) {
        	console.log("trackname="+trackname.val()+", trackdescription="+trackdescription.val());
	        xmlhttp = new XMLHttpRequest();
	        xmlhttp.onreadystatechange = function() {
	            if (this.readyState == 4 && this.status == 200) {
	                console.log("Response="+this.responseText);
	                if (this.responseText.length>3) {
	                	alert("Track upload successful!");
 	                } else {
	                	alert("Track upload failed.")
	                }
	            }
	        };
	        var url = "php/uploadTrack.php?userID="+currentUserID+"&trx="+strTrx+"&trackName="+encodeURI(trackname.val())+"&trackDescription="+encodeURI(trackdescription.val());
	        console.log("url="+url);
	        xmlhttp.open("GET",url,true);
	        xmlhttp.send();
 			dialogUploadTrack.dialog( "close" );
     	}
      	return valid;
	}
	
	function uploadTrackPost() { //uses POST to upload longer tracks
		console.log ("Function Upload track POST");
 		var trx = [tracks, engines, cars];
		var strTrx = JSON.stringify(trx);

      	var valid = true;
      	valid = valid && checkLength( trackname, "trackname", 3, 25 );
     	valid = valid && checkLength( trackdescription, "trackdescription", 6, 300 );

      	if ( valid ) {
			var http = new XMLHttpRequest();
			var url = "php/uploadTrackPost.php";
			var params = "userID="+currentUserID+"&trx="+strTrx+"&trackName="+encodeURI(trackname.val())+"&trackDescription="+encodeURI(trackdescription.val());
			console.log("params="+params);
			http.open("POST", url, true);
			
			//Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			http.onreadystatechange = function() {//Call a function when the state changes.
			    if(http.readyState == 4 && http.status == 200) {
			    	console.log("response="+http.responseText);
			        alert(http.responseText);
	                if (this.responseText.length>3) {
	                	alert("Track upload successful!");
 	                } else {
	                	alert("Track upload failed.")
	                }
			    }
			}
			http.send(params);		
  			dialogUploadTrack.dialog( "close" );
    	}
      	return valid;
	}
	
	
    function updateTips( t ) {
      tips
        .text( t )
        .addClass( "ui-state-highlight" );
      setTimeout(function() {
        tips.removeClass( "ui-state-highlight", 1500 );
      }, 500 );
    }
 
     function checkLength( o, n, min, max ) {
      if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Length of " + n + " must be between " +
          min + " and " + max + "." );
        return false;
      } else {
        return true;
      }
    }
 
    function checkRegexp( o, regexp, n ) {
      if ( !( regexp.test( o.val() ) ) ) {
        o.addClass( "ui-state-error" );
        updateTips( n );
        return false;
      } else {
        return true;
      }
    }
  
 	function newUserDialog() {
		console.log("New user dialog");

	    dialogNewUser = $( "#dialog-newUser" ).dialog({
	      autoOpen: false,
	      height: 400,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Create an account": newUser,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      },
	      close: function() {
	        form[ 0 ].reset();
	        allFields.removeClass( "ui-state-error" );
	      }
	    });
	 
	    form = dialogNewUser.find( "form" ).on( "submit", function( event ) {
	      event.preventDefault();
	      newUser();
	    });
	 
	    dialogNewUser.dialog( "open" );
	}
	
 	function signinUserDialog() {
		console.log("Sign in user dialog");

	    dialogSigninUser = $( "#dialog-signinUser" ).dialog({
	      autoOpen: false,
	      height: 400,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Sign-in user": signinUser,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      },
	      close: function() {
	        form[ 0 ].reset();
	        allFields.removeClass( "ui-state-error" );
	      }
	    });
	 
	    form = dialogSigninUser.find( "form" ).on( "submit", function( event ) {
	      event.preventDefault();
	      signinUser();
	    });
	 
	    dialogSigninUser.dialog( "open" );
	}
	
 	function forgotPasswordDialog() {
		console.log("Forgot password dialog");

	    dialogForgotPassword = $( "#dialog-forgotPassword" ).dialog({
	      autoOpen: false,
	      height: 400,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Forgot Password": forgotPassword,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      },
	      close: function() {
	        form[ 0 ].reset();
	        allFields.removeClass( "ui-state-error" );
	      }
	    });
	 
	    form = dialogForgotPassword.find( "form" ).on( "submit", function( event ) {
	      event.preventDefault();
	      forgotPassword();
	    });
	 
	    dialogForgotPassword.dialog( "open" );
	}
	
 	function downloadTrackDialog() {
		console.log("Browse Tracks dialog");
		downloadTrack();
/*	
	    dialogDownloadTracks = $( "#dialog-downloadTracks" ).dialog({
	      autoOpen: false,
	      height: 400,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Browse Tracks": browseTracks,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      },
	      close: function() {
	        form[ 0 ].reset();
	        allFields.removeClass( "ui-state-error" );
	      }
	    });
	 
	    form = dialogDownloadTracks.find( "form" ).on( "submit", function( event ) {
	      event.preventDefault();
	      browseTracks();
	    });
	 
	    dialogDownloadTracks.dialog( "open" );
*/	}
	
 	function uploadTrackDialog() {
		console.log("Upload Track dialog");

	    dialogUploadTrack = $( "#dialog-uploadTrack" ).dialog({
	      autoOpen: false,
	      height: 400,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Upload Track": uploadTrack,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      },
	      close: function() {
	        form[ 0 ].reset();
	        allFields.removeClass( "ui-state-error" );
	      }
	    });
	 
	    form = dialogUploadTrack.find( "form" ).on( "submit", function( event ) {
	      event.preventDefault();
	      //uploadTrack();
	      uploadTrackPost();
	    });
	 
	    dialogUploadTrack.dialog( "open" );
	}
	
//// END code for dialog boxes
 	
	function writeTrx() { //write out trx to console so can be manually cut and paste to save
		var trx = [tracks, engines, cars];
		console.log("    trx[]=\'"+JSON.stringify(trx)+"\'\;");
	}

	function loadTrack() { //load tracks from the trx array
		nCurrentTrx = prompt("Please enter level number to load", "1");
		openTrxJSON(trx[nCurrentTrx]);
		buildTrains();
		draw();
	}
	
	function downloadTrack() {
		var trackID = prompt("Please enter the trackID to load", "1");
		downloadTrackID(trackID);
	}
	
	function downloadTrackID(trackID) {
		console.log ("Download track from server. TrackID="+trackID);
		var url = "php/downloadTrack.php?trackID="+trackID;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log("Response="+this.responseText);
                var retArray = this.responseText.split("&&&");
                var strTrx = retArray[1];
                var trackName = retArray[2];
                var trackDescription = retArray[3];
                var strTrxD = strTrx.replace(/&quot;/g,'"')
//                console.log("strTrx="+strTrx);
//                console.log("strTrxD="+strTrxD);
//                console.log("trackName="+trackName);
//                console.log("trackDescription="+trackDescription);
				openTrxJSON(strTrxD);
				buildTrains();
				draw();
            }
        };
        xmlhttp.open("GET",url,true);
        xmlhttp.send();
 
 	}
	
	Storage.prototype.setObject = function(key, value) {
	    this.setItem(key, JSON.stringify(value));
	}
	
	Storage.prototype.getObject = function(key) {
	    var value = this.getItem(key);
	    return value && JSON.parse(value);
	}
	
	function interpretAll() {
		for (var i=0; i<engines.length; i++) {
			interpret(engines[i]);
		}

		for (var i=0; i<cars.length; i++) {
			interpret(cars[i]);
		}
		
	}
	
	function interpret(ec) { //interprets an engine or car one iteration
		ec.position += ec.speed/1000;

		if (ec.position>=1 || ec.position<0) { //stepped past current tile so figure out which one to jump to
			var x = Math.floor(ec.gridx);
			var y = Math.floor(ec.gridy);
			var startTrack = tracks[x][y];
			var startOri = ec.orientation; // this was missing for a while so I added back, not sure if right

			//clamp position to [0,1)]
 			if (ec.position>=1) ec.position -= 1;		
 			if (ec.position<0) ec.position += 1;		

			//figure out next tile
			next = getNextTrack(ec);

			//check for crashes
			if (tracks[next.gridx][next.gridy] == undefined) {
				crash(ec);
			} else {	
				//advance ec		
				ec.gridx = next.gridx;
				ec.gridy = next.gridy;
				ec.orientation = next.orientation;

				//check for lazy wyes
				var oriDif = (ec.orientation - tracks[ec.gridx][ec.gridy].orientation +8)%8;
				if (tracks[ec.gridx][ec.gridy].subtype == "lazy") {
					//console.log("Lazy wye. Ori dif="+oriDif);
					var state = tracks[ec.gridx][ec.gridy].state;
					switch 	(tracks[ec.gridx][ec.gridy].type) {
						case "TrackWyeLeft":
							if (oriDif == 2) state = "left";
							if (oriDif == 4) state = "right";
							break;
						case "TrackWyeRight":
							if (oriDif == 4) state = "left";
							if (oriDif == 6) state = "right";
							break;
						case "TrackWye":
							if (oriDif == 2) state = "left";
							if (oriDif == 6) state = "right";
							break;
					}
					
					if (tracks[ec.gridx][ec.gridy].state != state) { //switch
						tracks[ec.gridx][ec.gridy].state = state;
						playSound("switch");
					}
				}
				
				//check for prompt on entering tile
				if (tracks[ec.gridx][ec.gridy].subtype == "prompt" && oriDif == 0 && isFirstCarInTrain(ec)) {
					console.log("Interpret prompt");
					ctx.lineWidth = 3;
					roundRect(ctx, tracks[ec.gridx][ec.gridy].gridx*tileWidth, tracks[ec.gridx][ec.gridy].gridy*tileWidth, tileWidth, tileWidth,3, false, highlightColor);
					var retVal = confirm("Go left ?");
					if (retVal)	tracks[ec.gridx][ec.gridy].state = "left";
					else tracks[ec.gridx][ec.gridy].state = "right";	
					ctx.lineWidth = 1;
				}
	
				//check for alternate on exiting tile
				if (startTrack.subtype == "alternate" && (startOri - startTrack.orientation +8)%8 == 0 && isLastCarInTrain(ec)) {
					if (startTrack.state == "left") startTrack.state = "right";
					else startTrack.state = "left";
					playSound("switch");
				}
				
				//check for compareLess or compareGreater on engine entering tile
				var step = getTrackCargoStep(tracks[ec.gridx][ec.gridy]);
				if ((tracks[ec.gridx][ec.gridy].subtype == "compareLess" || tracks[ec.gridx][ec.gridy].subtype == "compareGreater") && oriDif == 0 && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined && isFirstCarInTrain(ec)) {
					//iterate through train to find first car with same type as switch cargo type. Use it for comparison
					var train = getTrain(ec);
					var car;
					for (var c=1; c<train.length && car == undefined;  c++) {
						if (train[c].cargo) if (train[c].cargo.type[0] == tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.type[0]) car = train[c];
					}
					
					if (car) {
						var state;
						if (tracks[ec.gridx][ec.gridy].subtype == "compareLess") { //for compareLess
							if (car.cargo.value < tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value) state = "left";
							else state = "right";
						} else { //for compareGreater
							if (car.cargo.value < tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value) state = "right";
							else state = "left";
						}
						if (state != tracks[ec.gridx][ec.gridy].state) playSound("switch");
						tracks[ec.gridx][ec.gridy].state = state;
					}
	
				}
			}
		}
	}
	
	function detectCrashes() { // determine if any ec is <1 tile from another ec
		var rebuildTrains = false;
		for (var t=0; t<trains.length; t++) { //iterate through trains to see if leading edge is too close to another car
			var train = trains[t];
			if (train[0].speed >= 0) {
				var next = getNextTrack(train[0]);
				//console.log ("Beginning of train is a x="+train[0].gridx+" y="+train[0].gridy+". Next is x="+next.gridx+" y="+next.gridy);
				var nextEC = getEC(next.gridx, next.gridy);
				if (nextEC != undefined) {
					if (nextEC.position+1-train[0].position < 0.9) {
						if (!isInTrain(nextEC)) {
							//console.log("Join free car");
							playSound("connect");
							rebuildTrains = true;
						} else {
							console.log ("Crash at x="+next.gridx+" y="+next.gridy);
						}
					}
				}
			} else {
				var next = getNextTrack(train[train.length-1]);
				//console.log ("Beginning of train is a x="+train[0].gridx+" y="+train[0].gridy+". Next is x="+next.gridx+" y="+next.gridy);
				var nextEC = getEC(next.gridx, next.gridy);
				if (nextEC != undefined) {
					if (nextEC.position+1-train[train.length-1].position < 1.0) {
						if (!isInTrain(nextEC)) {
							console.log("Join free car");
							rebuildTrains = true;
						} else {
							console.log ("Crash at x="+next.gridx+" y="+next.gridy);
						}
					}
				}
			}
		}	

		if (rebuildTrains) buildTrains(); //make trains if any new cars added

	}

	function detectStations() {
		for (var t=0; t<trains.length; t++) { //iterate through trains to check if empty car is near cargo (then pick it up)
			var train = trains[t];
			for (var c=0; c<train.length; c++) {
				var ec = train[c];
				//console.log("t="+t+" c="+c);
				if (ec.position >= 0.5 && ec.position < 0.5+ec.speed/1000 && ec.type == "CarBasic") { //perform action when car reaches middle of track
					//console.log("detect stations");
					// pickup cargo lying on track (not on station)
				/*	if (ec.cargo == undefined && tracks[ec.gridx][ec.gridy].cargo != undefined && tracks[ec.gridx][ec.gridy].type == "supply") {
						//move cargo
						ec.cargo = tracks[ec.gridx][ec.gridy].cargo;
						tracks[ec.gridx][ec.gridy].cargo = undefined;
				} */
					
					var step = getTrackCargoStep(tracks[ec.gridx][ec.gridy]);

					//divide cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "divide") {
						console.log("Divide");
						if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined)  { //station has cargo 
							if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.type[0] == ec.cargo.type[0]) { // same type so divide
								playSound("divide");
								ec.cargo.value = Math.round(ec.cargo.value / tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value);
								tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
							}
						} else { // station does not have cargo so transfer cargo
							console.log("Transfer to empty");
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					} 
					
					//multiply cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "multiply") {
						if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined)  { //station has cargo 
							if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.type[0] == ec.cargo.type[0]) { // same type so multiply
								playSound("multiply");
								ec.cargo.value = (ec.cargo.value * tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value)%(ec.cargo.type.length-1);
								tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
							}
						} else { // station does not have cargo so transfer cargo
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					} 

					//subtract cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "subtract") {
						if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined)  { //station has cargo 
							if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.type[0] == ec.cargo.type[0]) { // same type so subtract
								playSound("subtract");
								ec.cargo.value = (ec.cargo.value - tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value + (ec.cargo.type.length-1))%(ec.cargo.type.length-1);
								//console.log("len="+ec.cargo.type.length+" testmod="+ 2%10+" ecval="+ec.cargo.value+" trackval="+tracks[ec.gridx][ec.gridy].cargo.value);
								tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
							}
						} else { // station does not have cargo so transfer cargo
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					} 

					//add cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "add") {
						if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined)  { //station has cargo 
							if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.type[0] == ec.cargo.type[0]) { // same type so add
								playSound("add");
								ec.cargo.value = (ec.cargo.value + tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value)%(ec.cargo.type.length-1);
								tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
							}
						} else { // station does not have cargo so transfer cargo
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					} 

					//catapult cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "catapult") {
						if (tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined)  { //station has cargo so catapult ec cargo and remove number from station and cargo from car
							playSound("catapult");
							var angle = ((tracks[ec.gridx][ec.gridy].orientation + 2 + 2) %8)*Math.PI/4;
							var stepX = tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value * Math.round(Math.cos(angle));
							var stepY = tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo.value * Math.round(Math.sin(angle));
							//console.log("stepX="+stepX+" stepY="+stepY)
							if (tracks[ec.gridx+stepX][ec.gridy+stepY] == undefined) new Track (ec.gridx+stepX, ec.gridy+stepY, "TrackBlank");
							tracks[ec.gridx+stepX][ec.gridy+stepY].cargo = ec.cargo; //catapult
							ec.cargo = undefined;
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
						} else { // station does not have cargo so transfer cargo if its a number
							if (ec.cargo.type[0] == "numbers") {
								playSound("catapultWindup");
								tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
								ec.cargo = undefined;
							}
						}
					} 

					//slingshot cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "slingshot") {
						playSound("slingshot");
						var angle = ((tracks[ec.gridx][ec.gridy].orientation + 2 + 2) %8)*Math.PI/4;
						var stepX = Math.round(Math.cos(angle));
						var stepY = Math.round(Math.sin(angle));
						
						var curX = ec.gridx;
						var curY = ec.gridy;
						var tempCargo = ec.cargo;
						ec.cargo = undefined;
						
						//push cargo in away from station until free square
						do {
							curX += stepX;
							curY += stepY;
							if (curX<0 || curY<0 || curX>=numTilesX || curY>=numTilesY) { // exit loop if goes off screen
								tempCargo = undefined;
							} else {
								if (tracks[curX][curY] == undefined) new Track(curX, curY, "TrackBlank");
								track = tracks[curX][curY];
								temp2cargo = track.cargo;
								track.cargo = tempCargo;
								tempCargo=temp2cargo;
							}
						} while (tempCargo);
					}
					
					//pickdrop cargo
					//console.log("subtype="+tracks[ec.gridx][ec.gridy].subtype);
					if (tracks[ec.gridx][ec.gridy].subtype == "pickDrop") {
						//console.log("Pickdrop");
						//if station has cargo and car doesn't, then swap station cargo to car
						if (ec.cargo == undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined) {
							playSound("pickdrop");
							ec.cargo = tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo; //move cargo
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = undefined;
						}
						//if car has cargo and station doesn't, then swap car cargo to station
						else if (ec.cargo != undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo == undefined) {
							playSound("pickdropReverse");
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					}
					
					//home cargo
					//console.log("subtype="+tracks[ec.gridx][ec.gridy].subtype);
					if (tracks[ec.gridx][ec.gridy].subtype == "home") {
						//console.log("home");
						//if car has cargo and station doesn't, then swap car cargo to station
						if (ec.cargo != undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo == undefined) {
							playSound("home");
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					}
					
					//dump cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "dump") {
						playSound("dump");
						ec.cargo = undefined;
					}
					
					//increment cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "increment") {
						playSound("increment");
						ec.cargo.value++;
						console.log("Increment lnegth="+ ec.cargo.type.length);
						ec.cargo.value %= ec.cargo.type.length-1;
					}
					
					//decrement cargo
					if (ec.cargo !=undefined && tracks[ec.gridx][ec.gridy].subtype == "decrement") {
						playSound("decrement");
						ec.cargo.value--;
						ec.cargo.value %= ec.cargo.type.length-1;
					}
					
					//supply station
					if (tracks[ec.gridx][ec.gridy].subtype == "supply") {
						//if station has cargo and car doesn't, then copy station cargo to car
						if (ec.cargo == undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo != undefined) {
							playSound("supply");
							ec.cargo = jQuery.extend({},tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo); //copy cargo
						}
						//if car has cargo and station doesn't, then moce car cargo to station
						if (ec.cargo != undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo == undefined) {
							playSound("supply");
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo;
							ec.cargo == undefined;
						}
					}

					//tunnel
					if (tracks[ec.gridx][ec.gridy].subtype == "redTunnel") {
						console.log ("Enter red tunnel");
					}

					//drop off cargo at empty compareLess or comapreGreater wyes
					if (tracks[ec.gridx][ec.gridy].subtype == "compareLess" || tracks[ec.gridx][ec.gridy].subtype == "compareGreater") {
						//if car has cargo and station doesn't, then swap car cargo to station
						if (ec.cargo != undefined && tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo == undefined) {
							playSound("supply");
							tracks[ec.gridx+step.stepX][ec.gridy+step.stepY].cargo = ec.cargo ; //move cargo
							ec.cargo = undefined;
						}
					}
				}
			}
		}
		
	}	
	
	function playSound(name) { // play sound for the named event
		if (sounds[name]) {
			sounds[name].play();
		} else {
			console.log("ERROR- Play sound name undefined name="+name);
		}
	}
	
	function isInTrain(ec) { //returns true if ec is part of a train, returns false for free cars
		if (ec.type == "EngineBasic") return true; //trivial case because engines are part of a train by definition
		
		for (var nTrain=0; nTrain<trains.length; nTrain++) {
			var train = trains[nTrain];
			for (var j=0; j<train.length; j++) {
				if (train[j] == ec) return true;
			}
		}
		
		return false;
	}
	
	function reverseOrientation(ec) { //flips the orientation of the ec so it is going the other way on the track. For track straight just ori+=4
		var track=tracks[ec.gridx][ec.gridy];
		for (var dif=1; dif<8; dif++) {
			var oriCheck = (ec.orientation+dif)%8;
			if (ec.speed >=0) oriCheck = (oriCheck+4)%8; //add 4 since orientation is based on orientation when entering
			if (trackConnects(track, oriCheck)) {
				console.log("Found reverse ori. original ori="+ec.orientation+" new ori="+(ec.orientation+dif)%8);
				ec.orientation = (oriCheck+4)%8;
				return;
			}
		}
		
		console.log("ERROR- couldn't reverse orientation");
	}
	
	function reverseSpeed(ec) { //reverse the speed of this engine or car. If straight then just speed = -speed. If on corner then must change ori
		var type = getTypeForWye(ec, tracks[ec.gridx][ec.gridy]);
		if (type != "TrackStraight" && type != "TrackBridge" && type != "TrackCross") {
			var ori;
			for (var dif=1; dif<9 && ori == undefined; dif++) {
				var testOri = (ec.orientation+dif)%8;
				//if (ec.speed<0) testOri = (testOri+4)%8; //since going backwards use opposite orientation
				var oriDif = (testOri-ec.orientation+8)%8;
				if ((trackConnects(tracks[ec.gridx][ec.gridy], testOri)) && oriDif !=4) {
					ori = testOri;
					if (ec.speed<0) ori = (ori+4)%8;
				}
			}
			if (dif == 8) console.log("ERROR- couldn't flip orientation");
			ec.orientation = ori;
		}
		ec.speed = -ec.speed;
	}
	
	function getPreviousTrack(ec) { //find previous track by reversing speed
		var ecCopy = jQuery.extend({},ec);
		if (ecCopy.speed == 0) ecCopy.speed = 10;
		reverseSpeed(ecCopy);
		return getNextTrack(ecCopy);
	}
	
	function getNextTrack(ec) {
		//console.log("getNextTrack");
		var track = tracks[ec.gridx][ec.gridy];
		if (!track) console.log("ERROR no track found for getNextTrack ec.gridx="+ec.gridx+" y="+ec.gridy);
		var type = getTypeForWye(ec, track);
		var gridx=0, gridy=0;
		var orientation = ec.orientation;
		var oriDif = (orientation - track.orientation+8)%8;
		
		switch (type)  {
			case "TrackStraight":
			case "TrackCross":
			case "TrackBridge":
				if (ec.speed>=0 ) {
					gridx = ec.gridx + Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy + Math.round(Math.sin(Math.PI/4*(orientation-2)));
				} else {
					gridx = ec.gridx - Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy - Math.round(Math.sin(Math.PI/4*(orientation-2)));
				}
				break;
			case "Track90":
				if (ec.speed>=0 ) {
					//turn left or right
					if (oriDif == 0) orientation += 6;
					else orientation += 2;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx + Math.round(Math.cos(Math.PI/4*(orientation-2))); // -2 because x-axis is 0 radians whereas orientation=0 is negative y-axis
					gridy = ec.gridy + Math.round(Math.sin(Math.PI/4*(orientation-2)));
				} else {
					//turn left or right
					if (oriDif != 4) orientation += 2;
					else orientation += 6;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx - Math.round(Math.cos(Math.PI/4*(orientation-2))); //if eng ori = trk ori then 0 , else+=4
					gridy = ec.gridy - Math.round(Math.sin(Math.PI/4*(orientation-2)));
				}
				break;
			case "Track90Right":
				if (ec.speed>=0 ) {
					//turn left or right
					if (oriDif == 0) orientation += 2;
					else orientation += 6;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx + Math.round(Math.cos(Math.PI/4*(orientation-2))); // -2 because x-axis is 0 radians whereas orientation=0 is negative y-axis
					gridy = ec.gridy + Math.round(Math.sin(Math.PI/4*(orientation-2)));
				} else {
					//turn left or right
					if (oriDif != 4) orientation += 6;
					else orientation += 2;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx - Math.round(Math.cos(Math.PI/4*(orientation-2))); //if eng ori = trk ori then 0 , else+=4
					gridy = ec.gridy - Math.round(Math.sin(Math.PI/4*(orientation-2)));
				}
				break;
			case "Track45":
				if (ec.speed>=0 ) {
					//turn left or right
					if (oriDif == 0) orientation +=7;
					else orientation +=1;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx + Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy + Math.round(Math.sin(Math.PI/4*(orientation-2)));
				} else {
					//turn left or right
					//console.log("oridif 45="+oriDif);
					if (oriDif == 4) orientation +=7;
					else orientation +=1;
					orientation %= 8;
					//step in new orientation
					gridx = ec.gridx - Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy - Math.round(Math.sin(Math.PI/4*(orientation-2)));
				}
				break;
		}

	    return {
	        'gridx': gridx,
	        'gridy': gridy,
	        'orientation': orientation
	    };  
	}

	function getTypeForWye(ec, track) { //converts a wye track into a basic track type for drawing and interpreting
		var oriDif = (ec.orientation - track.orientation + 8)%8;
		if (ec.speed < 0) oriDif = (oriDif+4)%8;
		var type = track.type;
	//	var orientation = engine.orientation;
		switch (type) {
			case "TrackWyeLeft":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "Track90";
						else type = "TrackStraight";
						break;
					case 4:
						type = "TrackStraight";
						break;
					case 2:
						type = "Track90";
						break;
					default:
						crash(ec);
						console.log("Crash XXX");
						break;
				}
				break;
			case "TrackWyeRight":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "TrackStraight";
						else type = "Track90Right";
						break;
					case 4:
						type = "TrackStraight";
						break;
					case 6:
						type = "Track90Right";
						break;
					default:
						crash(ec);
						console.log("Crash YYY");
						break;
				}
				break;
			case "TrackWye":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "Track90";
						else type = "Track90Right";
						break;
					case 2:
						type = "Track90";
						break;
					case 6:
						type = "Track90Right";
						break;
					default:
						crash(ec);
						console.log("Crash ZZZ");
						break;
				}
		}
		
		return type;
	}
	
	function crash(ec) {
		playSound("crash");
		console.log ("Engine crashed at gridx="+ ec.gridx + " gridy=" + ec.gridy);
		
		//delete train if crashes
		var nEngine;
		var train = getTrain(ec);
		console.log("Train length="+train.length);
		for (var i=0; i<train.length; i++) {
			if (train[i].type == "EngineBasic") nEngine = i;
			console.log("delete i="+i);
			deleteEC(train[i]);
		}
		trains.splice(i,1);
		
	}
	
	function deleteEC(ecdel) { //removes engines and cars from their arrays
		var found = false;
		if (ecdel.type == "EngineBasic") {
			for (var j=0; j<engines.length && !found; j++) {
				if (engines[j] == ecdel) {
					engines.splice(j,1);
					found = true;
					console.log("Deleted engine "+j);
				}
			}
		} else {
			for (var j=0; j<cars.length && !found; j++) {
				if (cars[j] == ecdel) {
					cars.splice(j,1);
					found = true;
					console.log("Deleted car "+j);
				}
			}
		}
		
	}
		
	function addPointTrack(x,y) {
		if (x > (Math.floor(tracksWidth/tileWidth) * tileWidth)) return;
		if (y > (Math.floor(tracksHeight/tileWidth) * tileWidth)) return;

		drawingPointsTrackX.push(x);
		drawingPointsTrackY.push(y);
		if (!getButton("Play").down) drawPathTrack();
		
		x-=1; y-=1; //this is so you can draw on gridx=0 and gridy=0 since you need to cross border to trigger a new tile
		//get tile coords
		var trackTileX = Math.floor(x/tileWidth);
		var trackTileY = Math.floor(y/tileRatio/tileRatio/tileWidth);
						
		//get tile quadrant (tile split into 3x3 grid, center is 8, 0 is N, 1 is NE, 2 is E...)
		var xFraction = (x%tileWidth)/tileWidth * (2+2*Math.SQRT2); 
		var yFraction = ((y/tileRatio)%(tileWidth*tileRatio))/(tileWidth*tileRatio) * (2+2*Math.SQRT2);
		var tileOrientation;

		//if in the box (the space between octagons) then return
		if (xFraction + yFraction < Math.SQRT2) return;
		if ((2+2*Math.SQRT2)-xFraction + yFraction < Math.SQRT2) return;
		if (xFraction + (2+2*Math.SQRT2)-yFraction < Math.SQRT2) return;
		if ((2+2*Math.SQRT2)-xFraction + (2+2*Math.SQRT2)-yFraction < Math.SQRT2) return;

		//figure out orientation
		if (xFraction < Math.SQRT2) {
			if (yFraction < Math.SQRT2) {
				tileOrientation = 7;
			} else if (yFraction < Math.SQRT2+2) {
				tileOrientation = 6;
			} else {
				tileOrientation = 5;
			}
		} else if (xFraction < Math.SQRT2+2) {
			if (yFraction < Math.SQRT2) {
				tileOrientation = 0;
			} else if (yFraction < Math.SQRT2+2) {
				tileOrientation = 8;
			} else {
				tileOrientation = 4;
			}
		} else {
			if (yFraction < Math.SQRT2) {
				tileOrientation = 1;
			} else if (yFraction < Math.SQRT2+2) {
				tileOrientation = 2;
			} else {
				tileOrientation = 3;
			}
		} 
		
		//if new tile position, then make tile for last position based on quadrant entered and exited
		if (currentXTile == undefined) {
			currentXTile = trackTileX;
			currentYTile = trackTileY;
			enteringOrientation = 8; //flag so as to not make track on initial tile
		}
		
		if (currentXTile != trackTileX || currentYTile != trackTileY) { //this is a new tile
			//compare enteringOrientation and exitingOrientation to make tile for currentXTile, currentYTile
			if (enteringOrientation != exitingOrientation && enteringOrientation != 8) {
				//console.log ("make new tile. enteringOrientation=" + enteringOrientation + " exitingOrientation=" + exitingOrientation);
				
				var type, orientation;
				var state = "";
				var subtype = "";
				switch ((8+enteringOrientation-exitingOrientation)%8) {
					case 1: 
						type="Track135"; 
						break;
					case 2: 
						type="Track90"; 
						orientation=(exitingOrientation+4)%8;
						break;
					case 3: 
						type="Track45"; 
						orientation=(exitingOrientation+4)%8;
						break;
					case 4:
						type="TrackStraight";
						orientation = (enteringOrientation+4)%8;
						break;
					case 5: 
						type="Track45"; 
						orientation=(enteringOrientation+4)%8;
						break;
					case 6: 
						type="Track90"; 
						orientation=(enteringOrientation+4)%8;
						break;
					case 7: 
						type="Track135"; 
						break;
				}
				
				//make wyes and crosses when new track is on top of existing track for special cases (perpendicular and no 45s)
				switch (type) {
					case "Track90":
						//console.log("Track90");
						//if there is already a straight track then make a wye left track
						if (tracks[currentXTile] != undefined && tracks[currentXTile][currentYTile] != undefined) {
							switch (tracks[currentXTile][currentYTile].type) {
								case "TrackStraight":
									var difEnter = (tracks[currentXTile][currentYTile].orientation - enteringOrientation +8)%8;
									var difExit = (tracks[currentXTile][currentYTile].orientation - exitingOrientation +8)%8;
									//console.log ("difEnter=" + difEnter + " difExit=" + difExit);
									//console.log("current ori=" + tracks[currentXTile][currentYTile].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									if ((difEnter == 4 && difExit == 2) || (difEnter == 2 && difExit == 4) || (difEnter == 0 && difExit == 6) || (difEnter == 6 && difExit == 0)) {
											type = "TrackWyeLeft";
											state = "left";
											subtype = "sprung";
									    } else {
											type = "TrackWyeRight";
											state = "right";
											orientation = (orientation+2)%8;
											subtype = "sprung";
									    }
								break;
								case "Track90":
									//console.log("current ori=" + tracks[currentXTile][currentYTile].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									switch ((tracks[currentXTile][currentYTile].orientation - enteringOrientation +8)%8) {
										case 0:
										case 2:
											type = "TrackWye";
											state = "left";
											subtype = "sprung";
											break;
										case 4:
										case 6:
											type = "TrackWye";
											orientation = (orientation+2)%8;
											state = "right";
											subtype = "sprung";
											break;
									}
									break;
							}
						}
						break;	
					case "TrackStraight":
						if (tracks[currentXTile] != undefined && tracks[currentXTile][currentYTile] != undefined) {
							switch (tracks[currentXTile][currentYTile].type) {
								case "TrackStraight":
								case "TracksCross":
								//if new straight track crosses straight or cross track then make cross track
									switch ((tracks[currentXTile][currentYTile].orientation - enteringOrientation +8)%8) {
										case 2:
										case 6:
											type = "TrackCross";
											break;
									}
									break;
								case "Track90":
								//if new straight track crosses straight or cross track then make cross track
									var difEnter = (tracks[currentXTile][currentYTile].orientation - enteringOrientation +8)%8;
									var difExit = (tracks[currentXTile][currentYTile].orientation - exitingOrientation +8)%8;
									console.log ("XXX difEnter=" + difEnter + " difExit=" + difExit);
									//console.log("current ori=" + tracks[currentXTile][currentYTile].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									if ((difEnter == 4 && difExit == 0) || (difEnter == 0 && difExit == 4)) {
											type = "TrackWyeLeft";
											state = "right";
											subtype = "sprung";
											if (difEnter == 0) orientation = (orientation+4)%8;
									    } else {
											type = "TrackWyeRight";
											state = "left";
											subtype = "sprung";
											if (difEnter == 6) orientation = (orientation+4)%8;
									    }
								break;
							}
						}
						break;
				}
				
				if (type != "Track135") { // 135 not allowed because too sharp
					new Track(currentXTile, currentYTile, type, orientation, state, subtype);
					ctx.save();
					ctx.scale(zoomScale, zoomScale);
					drawTrack(tracks[currentXTile][currentYTile]);
					ctx.restore();
				}
			}
			
			//save entering orientation
			enteringOrientation = tileOrientation;
		}

		currentXTile = trackTileX;
		currentYTile = trackTileY;
		exitingOrientation = tileOrientation;
	}

	function drawPathTrack(){ //draw the mouse movements during track drawing
		if (drawingPointsTrackX.length == 0) return;
	    ctx.strokeStyle = "yellow";
	    ctx.lineJoin = "round";
	    ctx.lineWidth = 4;
	    ctx.save();
	    ctx.scale(zoomScale,zoomScale);
				
        ctx.beginPath();
        ctx.moveTo(drawingPointsTrackX[0], drawingPointsTrackY[0]/tileRatio);
        for (i=1; i<drawingPointsTrackX.length; i++) {
	        ctx.lineTo(drawingPointsTrackX[i], drawingPointsTrackY[i]/tileRatio);
        	
        }
	    ctx.stroke();
	    ctx.restore();
	}	

	function addPointEC(x,y) { //for drawing mouse movements when manually placing engines or cars
		if (x > (Math.floor(tracksWidth/tileWidth) * tileWidth)) return;
		if (y > (Math.floor(tracksHeight/tileWidth) * tileWidth)) return;

		drawingPointsECX.push(x);
		drawingPointsECY.push(y);
		if (!getButton("Play").down) drawPathEC();
	}	

	function drawPathEC(){ //draw the mouse movements during drawing engines or cars
		if (drawingPointsECX.length == 0) return;
	    if (isDrawingEngine) ctx.strokeStyle = engineColor;
	    else ctx.strokeStyle = carColor;
	    
	    ctx.lineJoin = "round";
	    ctx.lineWidth = 4;
	    ctx.save();
	    ctx.scale(zoomScale,zoomScale);
				
        ctx.beginPath();
        ctx.moveTo(drawingPointsECX[0], drawingPointsECY[0]/tileRatio);
        for (i=1; i<drawingPointsECX.length; i++) {
	        ctx.lineTo(drawingPointsECX[i], drawingPointsECY[i]/tileRatio);
        }
	    ctx.stroke();
	    ctx.restore();
	}	

	///////// convenience functions ////////////////////
	
	function createArray(length) {
	    var a = new Array(length || 0);
	
	    if (arguments.length > 1) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        for (var i = 0; i < length; i++) {
	            a[i] = createArray.apply(this, args);
	        }
	    }
	
	    return a;
	}
	
	function ToolButton(x, y, width, height, name, group) {
		toolButtons.push(this);
		
		this.x = x || 10;
		this.y = y || 10;
		this.width = width || 50;
		this.height = height || 50;
		this.name = name || "default";
		this.group = group; //an integer. All buttons within same group act as radios
		this.down = false; 
		
		this.draw = draw;
		
		function draw () {
			offset = -7;
			ctx.fillStyle = "Silver";
			ctx.save();
			ctx.translate(tracksWidth+x, y);
			ctx.fillRect(0, 0, width, height);
			
			switch (name) {
				case "Play":
					if (this.down) { //draw pause
						ctx.beginPath();
						ctx.fillStyle = "black";
						ctx.moveTo(0.25*width,0.2*height);
						ctx.lineTo(0.45*width,0.2*height);
						ctx.lineTo(0.45*width,0.8*height);
						ctx.lineTo(0.25*width,0.8*height);
						ctx.closePath();
						ctx.fillStyle = "goldenrod";
						ctx.fill();
						ctx.lineWidth = 1;
						ctx.strokeStyle = "black";
						ctx.stroke();

						ctx.moveTo(0.55*width,0.2*height);
						ctx.lineTo(0.75*width,0.2*height);
						ctx.lineTo(0.75*width,0.8*height);
						ctx.lineTo(0.55*width,0.8*height);
						ctx.closePath();
						ctx.fillStyle = "goldenrod";
						ctx.fill();
						ctx.lineWidth = 1;
						ctx.strokeStyle = "black";
						ctx.stroke();
					} else { // draw play
						ctx.beginPath();
						ctx.moveTo(0.2*width,0.2*height);
						ctx.lineTo(0.2*width,0.8*height);
						ctx.lineTo(0.8*width, height/2);
						ctx.closePath();
						ctx.fillStyle = "goldenrod";
						ctx.fill();
						ctx.lineWidth = 1;
						ctx.strokeStyle = "black";
						ctx.stroke();
					}
					break;
				case "Track":
					ctx.drawImage(imgTrackStraight[1], -10,-10);
/*
					//draw ties
					ctx.strokeStyle = tieColor;
					ctx.lineWidth = 3;
					for (var i=0.35; i<=0.75; i+=0.4/3) {
						ctx.beginPath();
						ctx.moveTo(Math.round(1.04*width/(2+Math.SQRT2)), i*height);
						ctx.lineTo(Math.round(1.25*width*(1+Math.SQRT2)/(2+Math.SQRT2)), i*height);
						ctx.stroke();
					}
	
					//draw rails
					ctx.strokeStyle = railColor;
					ctx.beginPath();
					ctx.lineWidth = 3;
					ctx.moveTo(Math.round(1.4*width/(2+Math.SQRT2)), 0.2*height);
					ctx.lineTo(Math.round(1.4*width/(2+Math.SQRT2)), 0.9*height);
					ctx.stroke();
					ctx.moveTo(Math.round(1.1*width*(1+Math.SQRT2)/(2+Math.SQRT2)), 0.2*height);
					ctx.lineTo(Math.round(1.1*width*(1+Math.SQRT2)/(2+Math.SQRT2)), 0.9*height);
					ctx.stroke();

					drawCrosshair(width,height);
					*/
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					break;
				case "Cargo":
					ctx.drawImage(imgCargoUppercase[0][14], -8,3);
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					break;
				case "Clear":
					ctx.translate(width/2, height/2);
					ctx.rotate(Math.PI/4);
					ctx.translate(-0.3*width, -height/2);
					ctx.beginPath();
					ctx.fillStyle = "red";
					ctx.moveTo(0.45*width,0.2*height);
					ctx.lineTo(0.55*width,0.2*height);
					ctx.lineTo(0.55*width,0.45*height);
					ctx.lineTo(0.8*width,0.45*height);
					ctx.lineTo(0.8*width,0.55*height);
					ctx.lineTo(0.55*width,0.55*height);
					ctx.lineTo(0.55*width,0.8*height);
					ctx.lineTo(0.45*width,0.8*height);
					ctx.lineTo(0.45*width,0.55*height);
					ctx.lineTo(0.2*width,0.55*height);
					ctx.lineTo(0.2*width,0.45*height);
					ctx.lineTo(0.45*width,0.45*height);
					ctx.closePath();
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					//arrow
					ctx.translate(0.3*width, height/2);
					ctx.rotate(-Math.PI/4);
					ctx.translate(-width/2, -0.65*height);
					ctx.beginPath();
					ctx.moveTo(0.05*width,0.4*height);
					ctx.lineTo(0.35*width,0.4*height);
					ctx.lineTo(0.35*width,0.3*height);
					ctx.lineTo(0.6*width,0.5*height);
					ctx.lineTo(0.35*width,0.7*height);
					ctx.lineTo(0.35*width,0.6*height);
					ctx.lineTo(0.05*width,0.6*height);
					ctx.closePath();
					ctx.fillStyle = "goldenrod";
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
				case "Engine":
					// engine icon
					ctx.drawImage(imgEngine[46], offset,offset);
					//drawCrosshair(width,height);
					/*ctx.beginPath();
					ctx.moveTo(0.4*width,0.4*height);
					ctx.lineTo(0.4*width,0.8*height);
					ctx.lineTo(0.9*width, 0.6*height);
					ctx.closePath();
					ctx.fillStyle = engineColor;
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();*/
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					break;
				case "Car":
					ctx.drawImage(imgCar[14], offset,offset);
					//drawCrosshair(width,height);
					/*ctx.beginPath();
					ctx.moveTo(0.375*width,0.45*height);
					ctx.lineTo(0.375*width,0.75*height);
					ctx.lineTo(0.875*width, 0.75*height);
					ctx.lineTo(0.875*width, 0.45*height);
					ctx.closePath();
					ctx.fillStyle = carColor;
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();*/
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					break;
				case "Eraser":
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					drawCrosshair(width,height);
					ctx.translate(width/2, height/2);
					ctx.rotate(Math.PI/4);
					ctx.translate(-0.3*width, -height/2);
					ctx.beginPath();
					ctx.fillStyle = "red";
					ctx.moveTo(0.45*width,0.2*height);
					ctx.lineTo(0.55*width,0.2*height);
					ctx.lineTo(0.55*width,0.45*height);
					ctx.lineTo(0.8*width,0.45*height);
					ctx.lineTo(0.8*width,0.55*height);
					ctx.lineTo(0.55*width,0.55*height);
					ctx.lineTo(0.55*width,0.8*height);
					ctx.lineTo(0.45*width,0.8*height);
					ctx.lineTo(0.45*width,0.55*height);
					ctx.lineTo(0.2*width,0.55*height);
					ctx.lineTo(0.2*width,0.45*height);
					ctx.lineTo(0.45*width,0.45*height);
					ctx.closePath();
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
				case "Select":
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					ctx.lineWidth = 2;
				    ctx.strokeStyle = "red";
				    ctx.beginPath();
					ctx.dashedLine(0.2*width, 0.3*height, 0.8* width, 0.3*height, [4,3]);
					ctx.dashedLine(0.8*width, 0.3*height, 0.8* width, 0.7*height, [4,3]);
					ctx.dashedLine(0.8*width, 0.7*height, 0.2* width, 0.7*height, [4,3]);
					ctx.dashedLine(0.2*width, 0.7*height, 0.2* width, 0.3*height, [4,3]);
					ctx.stroke();
					break;
				case "Save":
					ctx.beginPath();
					ctx.strokeStyle = "cornflowerblue";
				    ctx.lineWidth = 3;
					ctx.strokeRect(0.2*width, 0.2*height, 0.6*width, 0.6*height);
					//ctx.stroke();
					//arrow
					ctx.beginPath();
					ctx.moveTo(0.05*width,0.4*height);
					ctx.lineTo(0.35*width,0.4*height);
					ctx.lineTo(0.35*width,0.3*height);
					ctx.lineTo(0.6*width,0.5*height);
					ctx.lineTo(0.35*width,0.7*height);
					ctx.lineTo(0.35*width,0.6*height);
					ctx.lineTo(0.05*width,0.6*height);
					ctx.closePath();
					ctx.fillStyle = "goldenrod";
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
				case "Open":
					ctx.fillStyle = "cornflowerblue";
					ctx.fillRect(0.2*width, 0.2*height, 0.6*width, 0.6*height);
					//arrow
					ctx.beginPath();
					ctx.moveTo(0.6*width,0.4*height);
					ctx.lineTo(0.3*width,0.4*height);
					ctx.lineTo(0.3*width,0.3*height);
					ctx.lineTo(0.05*width,0.5*height);
					ctx.lineTo(0.3*width,0.7*height);
					ctx.lineTo(0.3*width,0.6*height);
					ctx.lineTo(0.6*width,0.6*height);
					ctx.closePath();
					ctx.fillStyle = "goldenrod";
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
				case "Download":
					ctx.translate(0.5*width, 0.5*height);
					ctx.rotate(Math.PI/2);
					ctx.translate(-0.5*width, -0.5*height);
					ctx.beginPath();
					ctx.strokeStyle = "cornflowerblue";
				    ctx.lineWidth = 3;
					ctx.strokeRect(0.2*width, 0.2*height, 0.6*width, 0.6*height);
					//ctx.stroke();
					//arrow
					ctx.beginPath();
					ctx.moveTo(0.05*width,0.4*height);
					ctx.lineTo(0.35*width,0.4*height);
					ctx.lineTo(0.35*width,0.3*height);
					ctx.lineTo(0.6*width,0.5*height);
					ctx.lineTo(0.35*width,0.7*height);
					ctx.lineTo(0.35*width,0.6*height);
					ctx.lineTo(0.05*width,0.6*height);
					ctx.closePath();
					ctx.fillStyle = "goldenrod";
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
				case "Upload":
					ctx.translate(0.5*width, 0.5*height);
					ctx.rotate(Math.PI/2);
					ctx.translate(-0.5*width, -0.5*height);
					ctx.fillStyle = "cornflowerblue";
					ctx.fillRect(0.2*width, 0.2*height, 0.6*width, 0.6*height);
					//arrow
					ctx.beginPath();
					ctx.moveTo(0.6*width,0.4*height);
					ctx.lineTo(0.3*width,0.4*height);
					ctx.lineTo(0.3*width,0.3*height);
					ctx.lineTo(0.05*width,0.5*height);
					ctx.lineTo(0.3*width,0.7*height);
					ctx.lineTo(0.3*width,0.6*height);
					ctx.lineTo(0.6*width,0.6*height);
					ctx.closePath();
					ctx.fillStyle = "goldenrod";
					ctx.fill();
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.stroke();
					break;
	
			}
			ctx.restore();
		}
	}
	
	function drawCrosshair(width, height) {
		ctx.lineWidth = 3;
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(0.05*width, 0.25*height);
		ctx.lineTo(0.45*width, 0.25*height);
		ctx.stroke();
		
		ctx.lineWidth = 3;
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(0.25*width, 0.05*height);
		ctx.lineTo(0.25*width, 0.45*height);
		ctx.stroke();
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(0.05*width+1, 0.25*height);
		ctx.lineTo(0.45*width-1, 0.25*height);
		ctx.stroke();
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(0.25*width, 0.05*height+1);
		ctx.lineTo(0.25*width, 0.45*height-1);
		ctx.stroke();
	}
	
	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	//	console.log ("x="+x+" y="+y+" w="+width+" h="+height+ " r="+radius);
	  if (typeof stroke == "undefined" ) {
	    stroke = true;
	  }
	  if (typeof radius === "undefined") {
	    radius = 5;
	  }
	  ctx.beginPath();
	  ctx.moveTo(x + radius, y);
	  ctx.lineTo(x + width - radius, y);
	  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	  ctx.lineTo(x + width, y + height - radius);
	  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	  ctx.lineTo(x + radius, y + height);
	  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	  ctx.lineTo(x, y + radius);
	  ctx.quadraticCurveTo(x, y, x + radius, y);
	  ctx.closePath();
	  if (fill) {
	  	ctx.fillStyle = fill;
	    ctx.fill();
	  }        
	  if (stroke) {
	  	ctx.strokeStyle = stroke;
	    ctx.stroke();
	  }
	}	
});
