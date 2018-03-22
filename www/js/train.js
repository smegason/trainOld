Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(JSON.decycle(value)));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.retrocycle(JSON.parse(value));
}
	

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
        Happy Green Glob Monster- made by twin97 is CC-BY
        Toy Rabbit purchased (by alesya5enot on TurboSquid) Royalty free license

	 */
	var debugMode = true; 
	
	console.debug("readyXXXXX");
	console.log("READY");
	console.log("press shift for pan, and option for zoom. Command-delete to make immutable");
//	console.log("w = write tracks to console");
/*	console.log("l = load tracks from trx array");
	console.log("n = new user");
	console.log("s = sign in user");
	console.log("f = forgot password");
	console.log("b = browse tracks to download");
	console.log("left = decrement trx array");
	console.log("right = increment trx array");
*///	console.log("up = upload current track");
	//console.log("down = download track by trackID");
		
	//console.log ("Document="+ document.URL);
	var newUserLink = document.getElementById('newuserlink');
	newUserLink.style.cursor = 'pointer';
	newUserLink.onclick = function() {
	    console.log("New user clicked");
       	newUserDialog();
 	};

    window.addEventListener('orientationchange', doOnOrientationChange);
    
    window.addEventListener('mousewheel', function(e){
    	doMouseWheel(e);
    }, false);
    
    window.addEventListener('touchstart', function(e){
        doTouchStart(e);
    }, false)
    
    window.addEventListener('touchend', function(e){
        doTouchEnd(e);
    }, false)
    
    window.addEventListener('touchmove', function(e){
        doTouchMove(e);
    }, false)
 
 	var shiftIsPressed = false;
 	var optionIsPressed = false;
 	var commandIsPressed = false;
 	window.addEventListener('keydown', function(event) {
// 		console.log ("Key="+event.keyCode);
        if (!showToolBar) return; //if toolbar hidden then ignore events

 		else if (event.keyCode == 16) { //pan
 			shiftIsPressed = true;
 			document.getElementById("canvas").style.cursor = 'move';
 		}
 		else if (event.keyCode == 18) { //zoom
 			optionIsPressed = true;
 			document.getElementById("canvas").style.cursor = 'zoom-in';
 		}
 		else if (event.keyCode == 224) {
 			commandIsPressed = true;
 			console.log("command down");
 		}
 		else if (event.keyCode == 90) {
 			if (shiftIsPressed && commandIsPressed) redoTrx();
 			if (!shiftIsPressed && commandIsPressed) undoTrx();
 		}
	});   

 	window.addEventListener('keyup', function(event) {
 		if (event.keyCode == 16) {
 			shiftIsPressed = false;
 			isPanning = false;
// 			console.log("shift up");
 			document.getElementById("canvas").style.cursor = 'crosshair';
 		}
 		else if (event.keyCode == 18) {
 			optionIsPressed = false;
 			isZooming = false;
// 			console.log("option up");
 			document.getElementById("canvas").style.cursor = 'crosshair';
 		}
 		else if (event.keyCode == 224) {
 			commandIsPressed = false;
 			console.log("command up");
 		}
	});          
	// "constants"
	var oct1 = Math.SQRT2/(2+2*Math.SQRT2);
	var oct2 = (Math.SQRT2 + 2)/(2+2*Math.SQRT2);

	//globals
    var canvas = $("#canvas")[0];
    var canvas2 = $("#canvas2")[0];
 
 	//passed params
 	// options:
 	//e.g. train.html?resize=0&toolbar=0&trx=[[[null%2Cn...
 	// resize=boolean  Allow automatic resizing?
 	// toolbar=boolean    Show toolbar?
 	// scale=percent Zoom level of canvas. 100%=normal
 	// trx=URIencoded(JSONstringified(trx)   If pass a trx it will display this in the trx[1] position. Can't be too long for URL though...
 	// trackID=111  Display trx with the given trackID
 	// showBrowse=0 hide or show the browse iframe
 	
 	//console.log ("href=" + location.href);
 	var params, data;
 	if (location.href.split('?')[1]) {
		params = location.href.split('?')[1].split('&');
		data = {};
		for (x in params) {
			data[params[x].split('=')[0]] = params[x].split('=')[1];
		}
	}
	console.log("Data="+data);
	console.log (location.href);
	
	var buttonDims = [];
	var buttonDimLevels = [];
	var showTitleScreen = true;
	var interactionState = 'TitleScreen';
	var resizeCanvas = true;
	var showToolBar = true;
	var passedTrx;
	var passedTrackID;
	var zoomScale = 1.5;
	var zoomMultiplier = 1.1;	
	var panStartX, panStartY, zoomStartX, zoomStartY, startZoomScale; 
	var startTimePlay; //time when play pressed
	var animationFrame = 0; //used for keeping track of frames for animation of star after successfully completing track
	var imgfolder = "renders100";
	var iconscale = 1;
	var allTilesDirty = true; //redraws everything if true

		
	if (data) {
		if (data["resize"]) {
			if (data["resize"]==0) {
				resizeCanvas = false;
			}
		}
		passedStrTrx = data["trx"];
		if (passedStrTrx) {
			passedTrx = decodeURIComponent(passedStrTrx);
			interactionState = 'Freeplay';
		}
		if (data["toolbar"]) {
			if (data["toolbar"]==0) {
				showToolBar = false;
				interactionState = 'Freeplay';
			}
		}
		if (data["showBrowse"]) {
			var objx = parent.document.getElementById('browseframeid');
			if (data["showBrowse"]==0) objx.height = 0;
			else objx.height = 750;
		}
		
		if (data["showTrain"]) { ///////
			var objx = parent.document.getElementById('trainframeid');
			if (objx) {
				if (data["showTrain"]==0) objx.height = 0;
				else objx.height = 750;
			}
		}
		
		if (data["trackID"]) {
			passedTrackID = data["trackID"];
			interactionState = 'Freeplay';
		}
		
		if (data["iconscale"]) {
			iconscale = data["iconscale"];
			if (iconscale == 0.25) imgfolder = "renders25";
			else if (iconscale == 0.5) imgfolder = "renders50";
			else if (iconscale == 1) imgfolder = "renders100";
			else if (iconscale == 2) imgfolder = "renders200";
			else if (iconscale == 4) imgfolder = "renders400";
			else {
				imgfolder = "renders200";
				iconscale = 2;
			}
		}
		console.log("imgfolder="+imgfolder);
		
		if (data["scale"]) {
			zoomScale = data["scale"]/100;
    		if (zoomScale<0.2) zoomScale = 0.2;
    		if (zoomScale>5) zoomScale = 5;
		}
	}
	console.log ("resize="+resizeCanvas);
	//console.log("trx="+passedTrx);
   
    var windowWidth = 1000;
    var windowHeight = 750;
    var pixelRatio = 1; /// get pixel ratio of device

	var ctx = canvas.getContext("2d");
    var canvasWidth;
    var canvasHeight;
	var centerTileX=0; //which tile to put in the center of the canvas. This plus zoomScale determines frame of tracks to view
	var centerTileY=0; 
	var startCenterTileX, startCenterTileY; //used for panning
	var buttonWidth = 76;
	var buttonPadding = 10;
	var toolBarWidthLevels = buttonWidth+2*buttonPadding; //width of toolbar in pixels
	var toolBarWidthFreeplay = 2*buttonWidth+3*buttonPadding; //width of toolbar in pixels
	var toolBarHeight; //height of toolbar in pixels
	var tracksWidth; //width of the tracks area in pixels
	var tracksHeight; //height of the tracks area in pixels
    var tileRatio = 57/63; //aspect ratio of tiles
	var tileWidth=60;
	calculateLayout();
	var insetWidth = 0.35*tileWidth;
	var tracks = {};
	var engines = [];
	var cars = [];
	var trains = []
	var poofs = []; //used for animating explosions after crash
	var modalTrack; // used to store value of the current modal track. Used for wye prompts so know which wye to change after mouse interaction
	
	var useOctagons = false; //use square or octagon shaped tiles for drawing
	var interval = 0;	
	var skip = 10; // only interpret and draw every skip steps so as to allow acceleration of train
	var isDrawingTrack = false;
	var isDrawingEngine = false;
	var isDrawingCar = false;
	var isErasing = false;
	var isSelecting = false;
	var isMoving = false; //for moving a selection
	var isPanning = false;
	var isZooming = false;
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
	var startSelectXTile; //for drawing selection
	var startSelectYTile;
	var endSelectXTile; //for drawing selection
	var endSelectYTile;
	var startMoveXTile; //for moving selection
	var startMoveYTile;
	var endMoveXTile; //for moving selection
	var endMoveYTile;
	var currentCaptionedObject; //for making caption bubble for engine or car
	var captionX; //upper left x,y tile for caption bubble
	var captionY; //upper left x,y tile for caption bubble
	var captionWidth; //width in units of tile
	var captionHeight;// height in units of tile
	var secondaryCaption; //reference to array containing info about secondary caption
	var captionSecondaryX; //upper left x,y tile for secondary caption bubble (caption bubble off of primary bubble used as submenu)
	var captionSecondaryY; //upper left x,y tile for secondary caption bubble
	var captionSecondaryWidth; //
	var captionSecondaryHeight; //
	var maxEngineSpeed = 200; //in millitiles/iteration
	var nNumSpeeds = 20; //number of tick marks on speed controller for engine. Rounds to nearest tick mark
	var currentCaptionedButton;
	var buttonCaptionX;
	var buttonCaptionY;
	var lastClickUp; //position in world coords of mouse cursor on last click up
	var currentUserID = localStorage.getObject('currentUserID');
	var currentUsername = localStorage.setObject('currentUsername');
	if (!currentUserID) currentUserID = 1;
	if (!currentUsername) currentUsername = "X";
	console.log("Current user="+currentUsername+" ID="+currentUserID);
		
	var trainerLevelNames = ['Hobo', 'Trainee', 'Caboose captain', 'Breakman', 'Switchman', 'Conductor', 'Engineer', 'Yard Master', 'Train Master'];
	var currentTrackSet; // text name of current track set. Must be one of above trainerLevelNames
	
	//cargo
	var cargoValues = []; // array of arrays of different types of cargo
	cargoValues.push( ['numbers', '0','1','2','3','4','5','6','7','8','9']);
	cargoValues.push( ['uppercase','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']); //26
	cargoValues.push( ['lowercase','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']); //26
	cargoValues.push( ['colors','white', 'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple']); //10
	cargoValues.push( ['blocks','1','2','3','4','5','6','7','8','9', '10']);
	var gColors = ['white', 'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple'];
	cargoValues.push( ['binary','yes', 'no']); //2
	//cargoValues.push( ['shapes', 'point', 'line', 'triangle', 'square', 'pentagon', 'hexagon']); //6
	//cargoValues.push( ['safarianimals','aardvark', 'cheetah', 'elephant', 'giraffe', 'hippo', 'lion', 'osterich', 'rhino', 'warthog', 'zebra']); //10
	cargoValues.push( ['dinosaurs', 'raptor', 'triceratops', 'stegosaurus', 'tyranisaurus', 'brontosaurus']); //5
	cargoValues.push( ['stuffedanimals', 'bear', 'bunny']);
	//var cargoJungleAnimals
	//var cargoAustralianAnimals
	//var cargoAmericanAnimals
	
	//buttonArrays - used to store the order in which buttons are displayed in captions
	var buttonsStation = [["none","pickdrop","supply","dump"],["increment","decrement","slingshot","catapult"],["add","subtract","multiply","divide"],["home","greentunnel","redtunnel","bluetunnel"]];
 	var buttonsWye = [["sprung", "lazy","alternate", "random"],["prompt","compareless","comparegreater"]];
// 	var buttonsCargoTypes = [["blocks","numbers","colors"],["uppercase","lowercase"],["binary","dinosaurs","stuffedanimals"]] //needs to match the 0th element of each cargo subarray
 	var buttonsCargoTypes = [["numbers","uppercase","lowercase","colors"],["blocks","binary","dinosaurs","stuffedanimals"]] //needs to match the 0th element of each cargo subarray and be in same order as cargoValues

	//images
	console.log("load images");
	// load buttons for title screens

	var imgBadgeIcon = new Image(); imgBadgeIcon.src = 'img/ribbon-small.png';
	var imgBadgeIconSmall = new Image(); imgBadgeIconSmall.src = 'img/ribbon-smaller.png';
	var imgArrowIcon = new Image(); imgArrowIcon.src = 'img/arrow-icon.png';
	var imgLockedIcon = new Image(); imgLockedIcon.src = 'img/lockedIcon.png';
	var imgUnlockedIcon = new Image(); imgUnlockedIcon.src = 'img/unlockedIcon.png';
	var imgLoadIcon = new Image(); imgLoadIcon.src = 'img/loadicon.png';
	var imgSaveIcon = new Image(); imgSaveIcon.src = 'img/saveicon.png';
	var imgDownloadIcon = new Image(); imgDownloadIcon.src = 'img/downloadicon.png';
	var imgUploadIcon = new Image(); imgUploadIcon.src = 'img/uploadicon.png';
	var imgSigninIcon = new Image(); imgSigninIcon.src = 'img/kids.png';
	var imgPoof = new Image(); imgPoof.src = 'img/poof-small.png';
    var imgTitleScreen = new Image();
    imgTitleScreen.onload = function() { console.log("Height: " + this.height); draw();}
    imgTitleScreen.src = 'img/titlePage4.png';
    
    drawTitleScreen();

   // var imgTerrain = new Image(); imgTerrain.src = 'img/WoodShutterstockBrownGraySmall.jpg';
//    var imgTerrain = new Image(); imgTerrain.src = 'img/WoodShutterstockOrangeSmall.jpg';
   // var imgTerrain = new Image(); imgTerrain.src = 'img/parquet4.jpg';
	var imgButtonHome = new Image(); imgButtonHome.src = 'img/homeicon.png';
	var imgStar = new Image(); imgStar.src = 'img/star.png';
		
	//load images for buttons in captions for choosing station type
	var imgCaptionNone = new Image(); imgCaptionNone.src = 'img/'+imgfolder+'/CaptionButtons/none.png';
	var imgCaptionAdd = new Image(); imgCaptionAdd.src = 'img/'+imgfolder+'/CaptionButtons/add.png';
	var imgCaptionCatapult = new Image(); imgCaptionCatapult.src = 'img/'+imgfolder+'/CaptionButtons/catapult.png';
	var imgCaptionDecrement = new Image(); imgCaptionDecrement.src = 'img/'+imgfolder+'/CaptionButtons/decrement.png';
	var imgCaptionDivide = new Image(); imgCaptionDivide.src = 'img/'+imgfolder+'/CaptionButtons/divide.png';
	var imgCaptionDump = new Image(); imgCaptionDump.src = 'img/'+imgfolder+'/CaptionButtons/dump.png';
	var imgCaptionIncrement = new Image(); imgCaptionIncrement.src = 'img/'+imgfolder+'/CaptionButtons/increment.png';
	var imgCaptionMultiply = new Image(); imgCaptionMultiply.src = 'img/'+imgfolder+'/CaptionButtons/multiply.png';
	var imgCaptionPickDrop = new Image(); imgCaptionPickDrop.src = 'img/'+imgfolder+'/CaptionButtons/pickDrop.png';
	var imgCaptionSlingshot = new Image(); imgCaptionSlingshot.src = 'img/'+imgfolder+'/CaptionButtons/slingshot.png';
	var imgCaptionSubtract = new Image(); imgCaptionSubtract.src = 'img/'+imgfolder+'/CaptionButtons/subtract.png';
	var imgCaptionSupply = new Image(); imgCaptionSupply.src = 'img/'+imgfolder+'/CaptionButtons/supply.png';
	var imgCaptionHome = new Image(); imgCaptionHome.src = 'img/'+imgfolder+'/CaptionButtons/home.png';
	var imgCaptionGreenTunnel = new Image(); imgCaptionGreenTunnel.src = 'img/'+imgfolder+'/CaptionButtons/greenTunnel.png';
	var imgCaptionRedTunnel = new Image(); imgCaptionRedTunnel.src = 'img/'+imgfolder+'/CaptionButtons/redTunnel.png';
	var imgCaptionBlueTunnel = new Image(); imgCaptionBlueTunnel.src = 'img/'+imgfolder+'/CaptionButtons/blueTunnel.png';

	//load images for buttons in captions for choosing wye type
	var imgCaptionAlternate = new Image(); imgCaptionAlternate.src = 'img/'+imgfolder+'/CaptionButtons/alternate.png';
	var imgCaptionGreater = new Image(); imgCaptionGreater.src = 'img/'+imgfolder+'/CaptionButtons/greater.png';
	var imgCaptionLazy = new Image(); imgCaptionLazy.src = 'img/'+imgfolder+'/CaptionButtons/lazy.png';
	var imgCaptionLesser = new Image(); imgCaptionLesser.src = 'img/'+imgfolder+'/CaptionButtons/lesser.png';
	var imgCaptionPrompt = new Image(); imgCaptionPrompt.src = 'img/'+imgfolder+'/CaptionButtons/prompt.png';
	var imgCaptionSprung = new Image(); imgCaptionSprung.src = 'img/'+imgfolder+'/CaptionButtons/sprung.png';
	var imgCaptionRandom = new Image(); imgCaptionRandom.src = 'img/'+imgfolder+'/CaptionButtons/random.png';

	//load the array of parquet tiles
	var imgParquet = [];
	for (var i=0; i<3; i++) {
		imgParquet[i] = new Image();
		var name = 'img/carpetTileBeige';
		//if (i<9) name += '0';
		name += (i+1);
		name += '.jpg';
		imgParquet[i].src = name;
	}

	//load the array of parquet tiles for octagon
	var imgParquetOct = [];
	for (var i=0; i<3; i++) {
		imgParquetOct[i] = new Image();
		var name = 'img/carpetTileBeigeOct';
		//if (i<9) name += '0';
		name += (i+1);
		name += '.jpg';
		imgParquetOct[i].src = name;
	}

	//load the array of images for animating the engines. The images are renderings of a model from Blender from 64 different angles
	var imgEngine = [];
	for (var i=0; i<64; i++) {
		imgEngine[i] = new Image();
		var name = 'img/'+imgfolder+'/Engine/00';
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
		var name = 'img/'+imgfolder+'/Car/00';
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
		var name = 'img/'+imgfolder+'/TrackStraight/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackStraight[i].src = name;
	}
	var imgTrackWidth = 92;
	var captionIconWidth = 0.4*imgTrackWidth;
	
	var imgTrackDiagonalSquare = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackDiagonalSquare[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackDiagonalSquare/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackDiagonalSquare[i].src = name;
	}

	var imgTrack90 = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrack90[i] = new Image();
		var name = 'img/'+imgfolder+'/Track90/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrack90[i].src = name;
	}

	var imgTrack45 = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrack45[i] = new Image();
		var name = 'img/'+imgfolder+'/Track45/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrack45[i].src = name;
	}

	var imgTrackCross = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackCross[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackCross/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackCross[i].src = name;
	}
	
	var imgRedTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgRedTunnel[i] = new Image();
		var name = 'img/'+imgfolder+'/TunnelRed/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgRedTunnel[i].src = name;
	}
	
	var imgGreenTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgGreenTunnel[i] = new Image();
		var name = 'img/'+imgfolder+'/TunnelGreen/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgGreenTunnel[i].src = name;
	}
	
	var imgBlueTunnel = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgBlueTunnel[i] = new Image();
		var name = 'img/'+imgfolder+'/TunnelBlue/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgBlueTunnel[i].src = name;
	}
	
// WyeLeft
	var imgTrackWyeLeftAlternateL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftAlternateL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftAlternateL[i].src = name;
	}

	var imgTrackWyeLeftAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftAlternateR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftAlternateR[i].src = name;
	}

	var imgTrackWyeLeftLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLazyL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLazyL[i].src = name;
	}

	var imgTrackWyeLeftLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLazyR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLazyR[i].src = name;
	}	

	var imgTrackWyeLeftLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLesserL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLesserL[i].src = name;
	}

	var imgTrackWyeLeftLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftLesserR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftLesserR[i].src = name;
	}

	var imgTrackWyeLeftGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftGreaterL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftGreaterL[i].src = name;
	}

	var imgTrackWyeLeftGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftGreaterR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftGreaterR[i].src = name;
	}

	var imgTrackWyeLeftPromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftPromptL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftPromptL[i].src = name;
	}

	var imgTrackWyeLeftPromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftPromptR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftPromptR[i].src = name;
	}

	var imgTrackWyeLeftRandomL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftRandomL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Random-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftRandomL[i].src = name;
	}

	var imgTrackWyeLeftRandomR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftRandomR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Random-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftRandomR[i].src = name;
	}

	var imgTrackWyeLeftSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftSprungL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLeftSprungL[i].src = name;
	}

	var imgTrackWyeLeftSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLeftSprungR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeLeft-Sprung-R/00';
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
		var name = 'img/'+imgfolder+'/TrackWyeRight-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightAlternateL[i].src = name;
	}

	var imgTrackWyeRightAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightAlternateR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightAlternateR[i].src = name;
	}

	var imgTrackWyeRightLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLazyL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLazyL[i].src = name;
	}

	var imgTrackWyeRightLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLazyR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLazyR[i].src = name;
	}

	var imgTrackWyeRightLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLesserL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLesserL[i].src = name;
	}

	var imgTrackWyeRightLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightLesserR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightLesserR[i].src = name;
	}

	var imgTrackWyeRightGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightGreaterL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightGreaterL[i].src = name;
	}

	var imgTrackWyeRightGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightGreaterR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightGreaterR[i].src = name;
	}

	var imgTrackWyeRightPromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightPromptL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightPromptL[i].src = name;
	}

	var imgTrackWyeRightPromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightPromptR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightPromptR[i].src = name;
	}

	var imgTrackWyeRightRandomL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightRandomL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Random-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightRandomL[i].src = name;
	}

	var imgTrackWyeRightRandomR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightRandomR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Random-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightRandomR[i].src = name;
	}

	var imgTrackWyeRightSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightSprungL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightSprungL[i].src = name;
	}

	var imgTrackWyeRightSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRightSprungR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWyeRight-Sprung-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRightSprungR[i].src = name;
	}

// Wye
	var imgTrackWyeAlternateL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeAlternateL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Alternate-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeAlternateL[i].src = name;
	}

	var imgTrackWyeAlternateR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeAlternateR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Alternate-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeAlternateR[i].src = name;
	}

	var imgTrackWyeLazyL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLazyL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Lazy-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLazyL[i].src = name;
	}

	var imgTrackWyeLazyR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLazyR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Lazy-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLazyR[i].src = name;
	}

	var imgTrackWyeLesserL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLesserL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Lesser-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLesserL[i].src = name;
	}

	var imgTrackWyeLesserR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeLesserR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Lesser-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeLesserR[i].src = name;
	}

	var imgTrackWyeGreaterL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeGreaterL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Greater-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeGreaterL[i].src = name;
	}

	var imgTrackWyeGreaterR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeGreaterR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Greater-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeGreaterR[i].src = name;
	}

	var imgTrackWyePromptL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyePromptL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Prompt-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyePromptL[i].src = name;
	}

	var imgTrackWyePromptR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyePromptR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Prompt-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyePromptR[i].src = name;
	}

	var imgTrackWyeRandomL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRandomL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Random-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRandomL[i].src = name;
	}

	var imgTrackWyeRandomR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeRandomR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Random-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeRandomR[i].src = name;
	}

	var imgTrackWyeSprungL = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeSprungL[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Sprung-L/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeSprungL[i].src = name;
	}

	var imgTrackWyeSprungR = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgTrackWyeSprungR[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackWye-Sprung-R/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgTrackWyeSprungR[i].src = name;
	}
//
	var imgTrackCargo = [];
	for (var i=0; i<2; i++) { //one for each orientation
		imgTrackCargo[i] = new Image();
		var name = 'img/'+imgfolder+'/TrackCargo/00';
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
		var name = 'img/'+imgfolder+'/StationIncrement/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationIncrement[i].src = name;
	}

	var imgStationDecrement = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDecrement[i] = new Image();
		var name = 'img/'+imgfolder+'/StationDecrement/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDecrement[i].src = name;
	}

	var imgStationSupply = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSupply[i] = new Image();
		var name = 'img/'+imgfolder+'/StationSupply/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSupply[i].src = name;
	}

	var imgStationDump = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDump[i] = new Image();
		var name = 'img/'+imgfolder+'/StationDump/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDump[i].src = name;
	}

	var imgStationSlingshot = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSlingshot[i] = new Image();
		var name = 'img/'+imgfolder+'/StationSlingshot/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSlingshot[i].src = name;
	}

	var imgStationCatapult = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationCatapult[i] = new Image();
		var name = 'img/'+imgfolder+'/StationCatapult/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationCatapult[i].src = name;
	}

	var imgStationMultiply = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationMultiply[i] = new Image();
		var name = 'img/'+imgfolder+'/StationMultiply/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationMultiply[i].src = name;
	}

	var imgStationDivide = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationDivide[i] = new Image();
		var name = 'img/'+imgfolder+'/StationDivide/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationDivide[i].src = name;
	}

	var imgStationAdd = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationAdd[i] = new Image();
		var name = 'img/'+imgfolder+'/StationAdd/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationAdd[i].src = name;
	}

	var imgStationSubtract = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationSubtract[i] = new Image();
		var name = 'img/'+imgfolder+'/StationSubtract/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationSubtract[i].src = name;
	}

	var imgStationPickDrop = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationPickDrop[i] = new Image();
		var name = 'img/'+imgfolder+'/StationPickDrop/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationPickDrop[i].src = name;
	}

	var imgStationHome = [];
	for (var i=0; i<8; i++) { //one for each orientation
		imgStationHome[i] = new Image();
		var name = 'img/'+imgfolder+'/StationHome/00';
		if (i<9) name += '0';
		name += (i+1);
		name += '.png';
		imgStationHome[i].src = name;
	}

//cargo
	var imgCargoStuffedAnimals = [];
	for (var j=0; j<2; j++) {
		imgCargoStuffedAnimals[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoStuffedAnimals[j][i] = new Image();
			var name = 'img/'+imgfolder+'/CargoStuffedAnimal/Cargo-' + j + '/00';
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
			var name = 'img/'+imgfolder+'/CargoLowercase/Cargo-' + lowercase.charAt(j) + '/00';
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
			var name = 'img/'+imgfolder+'/CargoUppercase/Cargo-' + uppercase.charAt(j) + '/00';
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
			var name = 'img/'+imgfolder+'/CargoDinosaurs/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoDinosaurs[j][i].src = name;
			//console.log("file="+name);
		}
	}

	console.log ("Loading cargo binary");
	var imgCargoBinary = [];
	for (var j=0; j<2; j++) {
		imgCargoBinary[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoBinary[j][i] = new Image();
			var name = 'img/'+imgfolder+'/CargoBinary/Cargo-' + j + '/00';
//			var name = 'img/'+imgfolder+'/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoBinary[j][i].src = name;
			//console.log ("name="+name);
		}
	}

	console.log ("Loading cargo blocks");
	var imgCargoBlocks = [];
	for (var j=0; j<10; j++) {
		imgCargoBlocks[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoBlocks[j][i] = new Image();
			jp = j+1; //blocks start at 1 instead of 0
			var name = 'img/'+imgfolder+'/CargoBlocks/Cargo-' + jp + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoBlocks[j][i].src = name;
			//console.log ("name="+name);
		}
	}

	console.log ("Loading cargo numbers");
	var imgCargoNumbers = [];
	for (var j=0; j<10; j++) {
		imgCargoNumbers[j] = [];
		for (var i=0; i<64; i++) { //one for each orientation
			imgCargoNumbers[j][i] = new Image();
			var name = 'img/'+imgfolder+'/CargoNumbers/Cargo-' + j + '/00';
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
			var name = 'img/'+imgfolder+'/CargoColors/Cargo-' + gColors[j] + '/00';
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
			var name = 'img/'+imgfolder+'/CargoSafariAnimals/Cargo-' + j + '/00';
			if (i<9) name += '0';
			name += (i+1);
			name += '.png';
			imgCargoSafariAnimals[j][i].src = name;
		}
	}
*/
	
	//colors
	var fontColor = "black";
	var buttonColor = "rgba(205,92,92,0.9)";
	var buttonBorderColor = "rgba(178,34,34,0.9)";
	var buttonColorGreen = "rgba(92,205,92,0.9)";
	var buttonBorderColorGreen = "rgba(34,178,34,0.9)";
	var toolBarBackColor = "gray";
	var tracksBackColor = "DarkOliveGreen";
	var gridColor =  "rgba(200,106,49,0.5)";
	var gridColorDark = "rgba(200,106,49,1.0)";
	var tieColor = "#2A1506";
	var railColor = "Gray";
	var engineColor = "FireBrick";
	var captionColor = "rgba(208, 208, 208, 0.8)";
	var secondaryCaptionColor = "rgba(188, 188, 188, 0.8)";
	var aboutColor = "rgba(176,168,139,0.6)";;
	var starColor = "rgba(176,168,139,0.8)";;
	var insetStrokeColor = "lightslategray";
	var insetFillColor = "gainsboro";
	var highlightColor = "yellow";
	var carColor = "brown"; //"lightsteelblue";
	var cargoColor = "lightyellow";
	var trackImmutableColorFill = "rgba(176,168,139,0.3)";
	var trackImmutableColorBorder = "rgba(176,168,139,0.7)";
	var saveButtonColors= [];
	var currentTrackScore = 0;
	var newHighScore = false;
	saveButtonColors[0] = "red";
	saveButtonColors[1] = "orange";
	saveButtonColors[2] = "yellow";
	saveButtonColors[3] = "green";
	saveButtonColors[4] = "blue";
	saveButtonColors[5] = "indigo";
	saveButtonColors[6] = "violet";
	saveButtonColors[7] = "brown";
	saveButtonColors[8] = "black";
	
	var toolButtonsLevels = [];
	var toolButtonsFreeplay = [];
	var undoHistory = [];
	var undoCurrentIndex = 0;

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
	sounds["pickdropreverse"] = new Audio("sound/pickdrop-reverse.wav");
	sounds["home"] = new Audio("sound/success.wav");
	sounds["tunnel"] = new Audio("sound/Tunnel.wav");
	sounds["tunnelReverse"] = new Audio("sound/TunnelReverse.wav");
	sounds["tada1"] = new Audio("sound/tada-f.wav");
	sounds["tada2"] = new Audio("sound/tada-g.wav");
	sounds["tada3"] = new Audio("sound/tada-a.wav");
	sounds["failure"] = new Audio("sound/failure.wav");
	sounds["open"] = new Audio("sound/open.wav");
	sounds["save"] = new Audio("sound/save.wav");

	// swap is used for compressing/decompressing. Compressed string uses cap, decompressed does not
	//swap array for "TRXv1.0:"
	var swap = {};
	swap['"gridy":'] 		= 'A';
	swap['"gridx":'] 		= 'B';
	swap['"orientation":'] 	= 'C';
	swap['"state":'] 		= 'D';
	swap['"trackstraight"'] = 'E';
	swap['"track90"'] 		= 'F';
	swap['"left"'] 			= 'G';
	swap['"right"'] 		= 'H';
	swap['"subtype":'] 		= 'I';
	swap['"immutable":'] 	= 'J';
	swap['false'] 			= 'K';
	swap['"type":'] 		= 'L';
	swap['"enginebasic"'] 	= 'M';
	swap['"carbasic"'] 		= 'N';
	swap['"tunnelfrom":'] 	= 'O';
	swap['"tunnelto":'] 	= 'P';
	swap['"speed":'] 		= 'Q';
	swap['"position":'] 	= 'R';
	swap['"trackwyeright"'] = 'S';
	swap['"trackwyeleft"'] 	= 'T';
	swap['"sprung"'] 		= 'U';
	swap['"trackwye"'] 		= 'V';
	swap['"trackcross"'] 	= 'W';
	swap['"comparegreater"']= 'X';
	swap['"trackcargo"'] 	= 'Y';
	swap['"blocks"'] 		= 'Z';
	
	///trx
	trxHelloWorld ='TRXv1.0:[{"-5,0":{B-5,A0,LE,C4,DG,I"",JK},"-5,1":{B-5,A1,LT,C4,DH,IU,JK},"-4,1":{B-4,A1,LE,C2,DG,I"",JK},"3,1":{B3,A1,LE,C6,DG,I"",JK},"2,1":{B2,A1,LE,C6,DG,I"",JK},"1,1":{B1,A1,LE,C6,DG,I"",JK},"0,1":{B0,A1,LE,C6,DG,I"",JK},"-1,1":{B-1,A1,LE,C6,DG,I"",JK},"-2,1":{B-2,A1,LE,C6,DG,I"",JK},"-3,1":{B-3,A1,LE,C6,DG,I"",JK},"5,1":{B5,A1,LE,C6,DG,I"",JK},"4,1":{B4,A1,LE,C6,DG,I"",JK},"2,2":{B2,A2,LE,C6,DG,I"",JK},"1,2":{B1,A2,LE,C6,DG,I"",JK},"0,2":{B0,A2,LE,C6,DG,I"",JK},"-1,2":{B-1,A2,LE,C6,DG,I"",JK},"-2,2":{B-2,A2,LE,C6,DG,I"",JK},"-3,2":{B-3,A2,LF,C6,DG,I"",JK},"-3,3":{B-3,A3,LE,C4,DG,I"slingshot",JK},"-3,4":{B-3,A4,LS,C4,DH,IU,JK},"-3,5":{B-3,A5,LF,C4,DG,I"",JK},"-2,5":{B-2,A5,LE,C2,DG,I"",JK},"-1,5":{B-1,A5,LE,C2,DG,I"",JK},"0,5":{B0,A5,LE,C2,DG,I"",JK},"1,5":{B1,A5,LE,C2,DG,I"",JK},"2,5":{B2,A5,LE,C2,DG,I"",JK},"3,5":{B3,A5,LV,C4,DG,IU,JK},"3,4":{B3,A4,LE,C0,DG,I"slingshot",JK},"3,3":{B3,A3,LS,C0,DH,IU,JK},"3,2":{B3,A2,LF,C0,DG,I"",JK},"4,3":{B4,A3,LE,C2,DG,I"",JK},"5,3":{B5,A3,LE,C2,DG,I"",JK},"6,3":{B6,A3,LF,C0,DG,I"",JK},"6,4":{B6,A4,LE,C4,DG,I"",JK},"6,5":{B6,A5,LF,C2,DG,I"",JK},"5,5":{B5,A5,LE,C6,DG,I"",JK},"4,5":{B4,A5,LE,C6,DG,I"",JK},"-4,4":{B-4,A4,LE,C6,DG,I"",JK},"-5,4":{B-5,A4,LF,C4,DG,I"",JK},"-5,3":{B-5,A3,LE,C0,DG,I"",JK},"-5,2":{B-5,A2,LE,C0,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C6,DG,I"",JK},"0,0":{B0,A0,LE,C6,DG,I"",JK},"1,-3":{B1,A-3,LT,C6,DH,IU,JK},"1,-2":{B1,A-2,LE,C4,DG,I"increment",JK},"1,-1":{B1,A-1,LF,C4,DG,I"",JK},"1,0":{B1,A0,LE,C6,DG,I"",JK},"2,-4":{B2,A-4,LY,C0,DG,I"","cargo":{"value":3,L0},JK},"2,-3":{B2,A-3,LS,C2,DG,IX,JK},"2,-2":{B2,A-2,LE,C0,DG,I"increment",JK},"2,0":{B2,A0,LE,C6,DG,I"",JK},"3,-4":{B3,A-4,LY,C0,DG,I"","cargo":{"value":0,L0},JK},"3,-3":{B3,A-3,LE,C6,DG,I"dump",JK},"3,-2":{B3,A-2,LY,C0,DG,I"","cargo":{"value":1,L0},JK},"3,0":{B3,A0,LE,C6,DG,I"",JK},"4,-2":{B4,A-2,LE,C0,DG,I"increment",JK},"5,-2":{B5,A-2,LY,C0,DG,I"","cargo":{"value":0,L4},JK},"5,-3":{B5,A-3,LE,C6,DG,I"dump",JK},"4,-3":{B4,A-3,LS,C2,DH,IX,JK},"-4,-3":{B-4,A-3,LE,C6,DG,I"supply",JK},"-5,-3":{B-5,A-3,LF,C6,DG,I"",JK},"4,-4":{B4,A-4,LY,C0,DG,I"","cargo":{"value":3,L4},JK},"-4,-4":{B-4,A-4,LY,C0,DG,I"","cargo":{"value":0,L4},JK},"-3,-3":{B-3,A-3,LT,C6,DG,IU,JK},"-3,-2":{B-3,A-2,LE,C4,DG,I"",JK},"-3,-1":{B-3,A-1,LE,C4,DG,I"",JK},"-3,0":{B-3,A0,LF,C4,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"supply",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"","cargo":{"value":1,L0},JK},"-1,-3":{B-1,A-3,LE,C2,DG,I"",JK},"2,-1":{B2,A-1,LF,C2,DG,I"",JK},"4,-1":{B4,A-1,LE,C4,DG,I"",JK},"4,0":{B4,A0,LF,C2,DG,I"",JK},"5,-4":{B5,A-4,LY,C0,DG,I"","cargo":{"value":0,L4},JK},"6,-3":{B6,A-3,LF,C0,DG,I"",JK},"6,-2":{B6,A-2,LE,C0,DG,I"",JK},"6,-1":{B6,A-1,LE,C0,DG,I"",JK},"6,0":{B6,A0,LE,C4,DG,I"",JK},"6,1":{B6,A1,LF,C2,DG,I"",JK},"0,-3":{B0,A-3,LE,C2,DG,I"",JK},"-5,-1":{B-5,A-1,LE,C0,DG,I"",JK},"-5,-2":{B-5,A-2,LE,C0,DG,I"supply",JK},"-4,-2":{B-4,A-2,LY,C0,DG,I"","cargo":{"value":0,L1},JK},"0,-2":{B0,A-2,LY,C0,DG,I"","cargo":{"value":0,L1},JK}},[{B-2,A2,LM,C6,D"",Q20,R0.5,JK,O[],P[]},{B2,A5,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-1,A2,LN,C6,D"",Q20,R0.5,"cargo":{"value":14,L2},JK,O[],P[]},{B0,A2,LN,C6,D"",Q20,R0.5,"cargo":{"value":11,L2},JK,O[],P[]},{B1,A2,LN,C6,D"",Q20,R0.5,"cargo":{"value":11,L2},JK,O[],P[]},{B2,A2,LN,C6,D"",Q20,R0.5,"cargo":{"value":4,L2},JK,O[],P[]},{B3,A2,LN,C0,D"",Q20,R0.5,"cargo":{"value":7,L1},JK,O[],P[]},{B1,A5,LN,C2,D"",Q20,R0.5,"cargo":{"value":22,L1},JK,O[],P[]},{B0,A5,LN,C2,D"",Q20,R0.5,"cargo":{"value":14,L2},JK,O[],P[]},{B-1,A5,LN,C2,D"",Q20,R0.5,"cargo":{"value":17,L2},JK,O[],P[]},{B-2,A5,LN,C2,D"",Q20,R0.5,"cargo":{"value":11,L2},JK,O[],P[]},{B-3,A5,LN,C4,D"",Q20,R0.5,"cargo":{"value":3,L2},JK,O[],P[]}]]';

	//////// trx for levels //////////////////////////////////////////
	var trxLevels = [];
	var bestTrackTime = [];

	/// 1. TRAINEE - just connecting, maze
	trxLevels['Trainee'] = [];
	//draw single gap straight
	//trxLevels['Trainee'][1] ='TRXv1.0:[{"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"2,0":{B2,A0,LE,C2,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C0,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C0,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C6,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][1]   ='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C2,DG,I"",JK},"2,0":{B2,A0,LE,C2,DG,I"",JK},"3,0":{B3,A0,LF,C2,DG,I"",JK},"3,-1":{B3,A-1,LE,C0,DG,I"",JK},"3,-2":{B3,A-2,LE,C0,DG,I"",JK},"3,-3":{B3,A-3,LF,C0,DG,I"",JK},"2,-3":{B2,A-3,LE,C6,DG,I"",JK},"1,-3":{B1,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-1'] = 10110;
	//draw bigger gap straight
	//trxLevels['Trainee'][2] ='TRXv1.0:[{"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"2,0":{B2,A0,LE,C2,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C0,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C0,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C6,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][2] ='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C2,DG,I"",JK},"2,0":{B2,A0,LE,C2,DG,I"",JK},"3,0":{B3,A0,LF,C2,DG,I"",JK},"3,-1":{B3,A-1,LE,C0,DG,I"",JK},"3,-2":{B3,A-2,LE,C0,DG,I"",JK},"3,-3":{B3,A-3,LF,C0,DG,I"",JK},"2,-3":{B2,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK}},[{B1,A0,LM,C2,D"",Q20,R0.420000000000001,JK,O[],P[]}],[{B0,A0,LN,C2,D"",Q20,R0.420000000000001,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-2'] = 13106;
	//draw single curve
	//trxLevels['Trainee'][3]='TRXv1.0:[{"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"2,0":{B2,A0,LE,C2,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C0,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][3] ='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C2,DG,I"",JK},"2,0":{B2,A0,LE,C2,DG,I"",JK},"3,0":{B3,A0,LF,C2,DG,I"",JK},"3,-1":{B3,A-1,LE,C0,DG,I"",JK},"1,-3":{B1,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"0,-3":{B0,A-3,LE,C6,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-3'] = 9105;
	//draw curve and fill gap in two different places
	//trxLevels['Trainee'][4]='TRXv1.0:[{"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"2,0":{B2,A0,LE,C2,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C0,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C2,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C0,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][4]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C2,DG,I"",JK},"2,0":{B2,A0,LE,C2,DG,I"",JK},"3,0":{B3,A0,LF,C2,DG,I"",JK},"3,-1":{B3,A-1,LE,C0,DG,I"",JK},"3,-2":{B3,A-2,LE,C0,DG,I"",JK},"2,-3":{B2,A-3,LE,C6,DG,I"",JK},"1,-3":{B1,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"0,-3":{B0,A-3,LE,C6,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-4'] = 9105;
	//draw cross
	//trxLevels['Trainee'][5]='TRXv1.0:[{"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"0,0":{B0,A0,LF,C2,DG,I"",Jtrue},"0,-1":{B0,A-1,LE,C0,DG,I"",Jtrue},"2,-1":{B2,A-1,LE,C4,DG,I"",Jtrue},"2,0":{B2,A0,LF,C2,DG,I"",Jtrue},"1,0":{B1,A0,LF,C4,DG,I"",Jtrue},"0,-2":{B0,A-2,LF,C6,DG,I"",JK},"1,-2":{B1,A-2,LE,C2,DG,I"",JK},"2,-2":{B2,A-2,LF,C0,DG,I"",JK}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][5]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LF,C2,DG,I"",Jtrue},"2,0":{B2,A0,LF,C4,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C4,DG,I"",Jtrue},"3,-2":{B3,A-2,LF,C0,DG,I"",Jtrue},"1,-3":{B1,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"1,-1":{B1,A-1,LE,C0,DG,I"",Jtrue},"1,-2":{B1,A-2,LF,C6,DG,I"",Jtrue},"2,-2":{B2,A-2,LE,C2,DG,I"",JK},"0,-3":{B0,A-3,LE,C6,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-5'] = 9105;
	//many crosses
	//trxLevels['Trainee'][6]='TRXv1.0:[{"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"0,0":{B0,A0,LW,C4,DG,I"",Jtrue},"1,0":{B1,A0,LE,C0,DG,I"",JK},"2,0":{B2,A0,LW,C4,DG,I"",Jtrue},"1,-1":{B1,A-1,LW,C0,DG,I"",Jtrue},"-1,-1":{B-1,A-1,LW,C0,DG,I"",Jtrue},"0,-2":{B0,A-2,LW,C4,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LF,C0,DG,I"",Jtrue},"2,-2":{B2,A-2,LW,C4,DG,I"",Jtrue},"3,-2":{B3,A-2,LF,C2,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LF,C6,DG,I"",Jtrue},"2,1":{B2,A1,LF,C2,DG,I"",Jtrue},"1,1":{B1,A1,LF,C4,DG,I"",Jtrue},"1,-3":{B1,A-3,LF,C0,DG,I"",Jtrue},"0,-3":{B0,A-3,LF,C6,DG,I"",Jtrue},"0,1":{B0,A1,LF,C2,DG,I"",Jtrue},"-1,1":{B-1,A1,LF,C4,DG,I"",Jtrue},"-2,-2":{B-2,A-2,LF,C6,DG,I"",Jtrue},"-2,-1":{B-2,A-1,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LF,C0,DG,I"",JK}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][6] ='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LW,C0,DG,I"",Jtrue},"3,0":{B3,A0,LF,C2,DG,I"",Jtrue},"3,-1":{B3,A-1,LF,C0,DG,I"",Jtrue},"3,-2":{B3,A-2,LF,C2,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LF,C6,DG,I"",Jtrue},"1,-3":{B1,A-3,LF,C0,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"2,-1":{B2,A-1,LW,C0,DG,I"",Jtrue},"1,-1":{B1,A-1,LW,C6,DG,I"",Jtrue},"0,-1":{B0,A-1,LF,C4,DG,I"",Jtrue},"0,-2":{B0,A-2,LF,C6,DG,I"",Jtrue},"1,-2":{B1,A-2,LW,C0,DG,I"",Jtrue},"2,1":{B2,A1,LF,C2,DG,I"",Jtrue},"1,1":{B1,A1,LF,C4,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-6'] = 9105;
	//pickup bunny from station
	//trxLevels['Trainee'][7]='TRXv1.0:[{"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"2,-3":{B2,A-3,LF,C0,DG,I"",Jtrue},"2,0":{B2,A0,LF,C2,DG,I"",Jtrue},"3,3":{B3,A3,LE,C4,DG,I"supply",Jtrue},"3,4":{B3,A4,LF,C4,DG,I"",Jtrue},"4,4":{B4,A4,LF,C2,DG,I"",Jtrue},"4,3":{B4,A3,LE,C0,DG,I"",Jtrue},"2,3":{B2,A3,LY,C0,DG,I"","cargo":{"value":0,L["stuffedanimals","bunny"]},Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":null,JK,O[],P[]}]]';
	trxLevels['Trainee'][7]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C2,DG,I"",JK},"3,-1":{B3,A-1,LE,C0,DG,I"",JK},"3,-2":{B3,A-2,LE,C0,DG,I"",JK},"3,-3":{B3,A-3,LF,C0,DG,I"",JK},"2,-3":{B2,A-3,LE,C6,DG,I"",JK},"1,-3":{B1,A-3,LE,C6,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",JK},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"2,2":{B2,A2,LE,C4,DG,I"pickdrop",JK},"1,2":{B1,A2,LY,C0,DG,I"","cargo":{"value":0,L7},JK},"0,-3":{B0,A-3,LE,C6,DG,I"",JK}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":null,JK,O[],P[]}]]';
	bestTrackTime['Trainee-7'] = 9105;
	//maze1
	//trxLevels['Trainee'][8]='TRXv1.0:[{"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"2,0":{B2,A0,LE,C2,DG,I"",JK},"3,0":{B3,A0,L"track45",C2,DG,I"",JK},"4,-1":{B4,A-1,L"track45",C1,DG,I"",JK},"2,-3":{B2,A-3,LE,C6,DG,I"",JK},"3,-2":{B3,A-2,LF,C0,DG,I"",JK},"3,-1":{B3,A-1,LF,C2,DG,I"",JK},"2,-1":{B2,A-1,LF,C4,DG,I"",JK},"2,-2":{B2,A-2,LF,C6,DG,I"",JK},"4,-4":{B4,A-4,LF,C6,DG,I"",JK},"5,-4":{B5,A-4,LF,C0,DG,I"",JK},"5,-3":{B5,A-3,LF,C2,DG,I"",JK},"4,-3":{B4,A-3,LF,C4,DG,I"",JK}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	//trxLevels['Trainee'][8]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"3,0":{B3,A0,L"track45",C1,DG,I"",Jtrue},"3,-1":{B3,A-1,L"track45",C0,DG,I"",Jtrue},"1,-3":{B1,A-3,L"track45",C7,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"2,1":{B2,A1,L"track45",C2,DG,I"",Jtrue},"-4,1":{B-4,A1,LF,C4,DG,I"",JK},"-3,1":{B-3,A1,LE,C2,DG,I"",JK},"-2,1":{B-2,A1,LE,C2,DG,I"",JK},"-1,1":{B-1,A1,LE,C2,DG,I"",JK},"0,1":{B0,A1,LE,C2,DG,I"",Jtrue},"1,1":{B1,A1,LE,C2,DG,I"",Jtrue},"-4,0":{B-4,A0,LE,C4,DG,I"",JK},"1,-2":{B1,A-2,LF,C0,DG,I"",Jtrue},"0,-2":{B0,A-2,LF,C6,DG,I"",Jtrue},"0,-1":{B0,A-1,LF,C4,DG,I"",Jtrue},"1,-1":{B1,A-1,LF,C2,DG,I"",Jtrue},"2,-3":{B2,A-3,LF,C4,DG,I"",Jtrue},"2,-4":{B2,A-4,LF,C6,DG,I"",Jtrue},"3,-4":{B3,A-4,LF,C0,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C2,DG,I"",Jtrue}},[{B-1,A1,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A1,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	trxLevels['Trainee'][8]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"1,-1":{B1,A-1,LF,C0,DG,I"",Jtrue},"0,-1":{B0,A-1,LE,C6,DG,I"",Jtrue},"-1,-1":{B-1,A-1,LE,C6,DG,I"",Jtrue},"-2,-1":{B-2,A-1,LE,C6,DG,I"",Jtrue},"-3,-1":{B-3,A-1,LE,C6,DG,I"",Jtrue},"1,1":{B1,A1,LW,C2,DG,I"",Jtrue},"0,2":{B0,A2,LE,C6,DG,I"",Jtrue},"-1,2":{B-1,A2,LE,C6,DG,I"",Jtrue},"-2,2":{B-2,A2,LF,C4,DG,I"",Jtrue},"-2,1":{B-2,A1,LF,C6,DG,I"",Jtrue},"-1,1":{B-1,A1,LE,C2,DG,I"",Jtrue},"0,1":{B0,A1,LE,C2,DG,I"",Jtrue},"2,1":{B2,A1,LF,C0,DG,I"",Jtrue},"2,2":{B2,A2,LE,C4,DG,I"",Jtrue},"2,3":{B2,A3,LF,C4,DG,I"",Jtrue},"3,3":{B3,A3,LF,C2,DG,I"",Jtrue},"3,2":{B3,A2,LE,C0,DG,I"",Jtrue},"3,1":{B3,A1,LE,C0,DG,I"",Jtrue},"2,0":{B2,A0,LF,C4,DG,I"",Jtrue},"2,-1":{B2,A-1,LE,C0,DG,I"",Jtrue},"2,-2":{B2,A-2,LE,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LW,C6,DG,I"",Jtrue},"2,-4":{B2,A-4,LF,C6,DG,I"",Jtrue},"3,-4":{B3,A-4,LF,C0,DG,I"",Jtrue},"3,-3":{B3,A-3,LF,C2,DG,I"",Jtrue},"1,-3":{B1,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"1,3":{B1,A3,LF,C4,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C0,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C0,DG,I"",Jtrue}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Trainee-8'] = 9105;
	//maze and pickup bunny
	//trxLevels['Trainee'][9]='TRXv1.0:[{"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",Jtrue},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"2,0":{B2,A0,L"track45",C7,DG,I"",Jtrue},"4,-3":{B4,A-3,L"track45",C3,DG,I"",Jtrue},"4,-4":{B4,A-4,LE,C5,DG,I"",Jtrue},"3,-3":{B3,A-3,L"track45",C5,DG,I"",Jtrue},"1,-1":{B1,A-1,LF,C4,DG,I"",Jtrue},"1,-2":{B1,A-2,LE,C4,DG,I"",Jtrue},"1,-3":{B1,A-3,LF,C0,DG,I"",Jtrue},"2,1":{B2,A1,LF,C0,DG,I"",Jtrue},"2,2":{B2,A2,L"track45",C4,DG,I"",Jtrue},"3,3":{B3,A3,L"track45",C3,DG,I"",Jtrue},"4,3":{B4,A3,LF,C0,DG,I"",Jtrue},"4,4":{B4,A4,LF,C2,DG,I"",Jtrue},"3,4":{B3,A4,L"track45",C3,DG,I"",Jtrue},"2,3":{B2,A3,LE,C7,DG,I"",Jtrue},"1,2":{B1,A2,L"track45",C4,DG,I"",Jtrue},"1,1":{B1,A1,LF,C6,DG,I"",Jtrue},"5,2":{B5,A2,L"track45",C5,DG,I"",Jtrue},"6,1":{B6,A1,LF,C1,DG,I"",Jtrue},"6,-1":{B6,A-1,L"track45",C1,DG,I"",Jtrue},"6,-2":{B6,A-2,LE,C0,DG,I"",Jtrue},"6,-3":{B6,A-3,L"track45",C0,DG,I"",Jtrue},"5,-4":{B5,A-4,LF,C5,DG,I"",Jtrue},"6,-5":{B6,A-5,L"track45",C1,DG,I"",Jtrue},"6,-6":{B6,A-6,LE,C0,DG,I"",Jtrue},"6,-7":{B6,A-7,LF,C0,DG,I"",Jtrue},"5,-7":{B5,A-7,LE,C6,DG,I"",Jtrue},"4,-7":{B4,A-7,L"track45",C6,DG,I"",Jtrue},"3,-6":{B3,A-6,L"track45",C2,DG,I"",Jtrue},"2,-6":{B2,A-6,LF,C4,DG,I"",Jtrue},"2,-7":{B2,A-7,LF,C6,DG,I"",Jtrue},"3,-7":{B3,A-7,LE,C2,DG,I"",Jtrue},"2,-5":{B2,A-5,L"track45",C5,DG,I"",Jtrue},"2,-4":{B2,A-4,LE,C4,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C4,DG,I"",Jtrue},"2,-2":{B2,A-2,LE,C4,DG,I"",Jtrue},"4,-2":{B4,A-2,L"track45",C1,DG,I"",Jtrue},"3,-1":{B3,A-1,L"track45",C5,DG,I"",Jtrue},"3,0":{B3,A0,L"track45",C4,DG,I"",Jtrue},"0,-2":{B0,A-2,LE,C4,DG,I"",Jtrue},"0,-1":{B0,A-1,LE,C4,DG,I"",Jtrue},"0,-4":{B0,A-4,LE,C2,DG,I"",Jtrue},"1,-4":{B1,A-4,LE,C2,DG,I"",Jtrue},"5,3":{B5,A3,LE,C4,DG,I"",Jtrue},"5,4":{B5,A4,LE,C4,DG,I"",Jtrue},"4,1":{B4,A1,L"track45",C0,DG,I"",Jtrue},"5,0":{B5,A0,LF,C5,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":{"value":0,L["stuffedanimals","bunny"]},JK,O[],P[]}]]';
	trxLevels['Trainee'][9]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"-3,2":{B-3,A2,LE,C4,DG,I"pickdrop",Jtrue},"-4,2":{B-4,A2,LY,C0,DG,I"","cargo":{"value":0,L7},Jtrue},"1,-1":{B1,A-1,LW,C6,DG,I"",Jtrue},"1,-2":{B1,A-2,LE,C0,DG,I"",Jtrue},"0,-3":{B0,A-3,LW,C0,DG,I"",Jtrue},"1,1":{B1,A1,LW,C2,DG,I"",Jtrue},"2,2":{B2,A2,LE,C2,DG,I"",Jtrue},"3,2":{B3,A2,LF,C2,DG,I"",Jtrue},"1,3":{B1,A3,LF,C2,DG,I"",Jtrue},"0,3":{B0,A3,LE,C6,DG,I"",Jtrue},"-1,3":{B-1,A3,LE,C6,DG,I"",Jtrue},"-2,3":{B-2,A3,LE,C6,DG,I"",Jtrue},"-3,3":{B-3,A3,LF,C4,DG,I"",Jtrue},"-3,1":{B-3,A1,LF,C6,DG,I"",Jtrue},"-2,1":{B-2,A1,LE,C2,DG,I"",Jtrue},"-1,1":{B-1,A1,LE,C2,DG,I"",Jtrue},"0,1":{B0,A1,LE,C2,DG,I"",Jtrue},"2,1":{B2,A1,LE,C2,DG,I"",Jtrue},"3,0":{B3,A0,LE,C0,DG,I"",Jtrue},"2,-1":{B2,A-1,LE,C6,DG,I"",Jtrue},"0,-1":{B0,A-1,LF,C4,DG,I"",Jtrue},"0,-2":{B0,A-2,LE,C0,DG,I"",Jtrue},"0,-4":{B0,A-4,LF,C6,DG,I"",Jtrue},"1,-4":{B1,A-4,LE,C2,DG,I"",Jtrue},"2,-4":{B2,A-4,LE,C2,DG,I"",Jtrue},"3,-4":{B3,A-4,LF,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C6,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C0,DG,I"",Jtrue}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":null,JK,O[],P[]}]]';
	bestTrackTime['Trainee-9'] = 9105;
	//many diagonals through maze and pickup bunny
	//trxLevels['Trainee'][10]='TRXv1.0:[{"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"",Jtrue},"-3,-3":{B-3,A-3,LE,C6,DG,I"home",Jtrue},"-4,0":{B-4,A0,LE,C2,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",Jtrue},"-1,0":{B-1,A0,LE,C2,DG,I"",Jtrue},"0,0":{B0,A0,LE,C2,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LY,C0,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C6,DG,I"",Jtrue},"-5,-3":{B-5,A-3,LF,C6,DG,I"",Jtrue},"-5,-2":{B-5,A-2,LE,C4,DG,I"",Jtrue},"-5,-1":{B-5,A-1,LE,C4,DG,I"",Jtrue},"-5,0":{B-5,A0,LF,C4,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"1,4":{B1,A4,LE,C2,DG,I"supply",Jtrue},"1,5":{B1,A5,LY,C0,DG,I"","cargo":{"value":0,L["stuffedanimals","bunny"]},JK},"0,2":{B0,A2,L"track45",C3,DG,I"",Jtrue},"-1,4":{B-1,A4,LF,C2,DG,I"",Jtrue},"-1,3":{B-1,A3,LF,C6,DG,I"",JK},"4,3":{B4,A3,LF,C2,DG,I"",Jtrue},"4,-4":{B4,A-4,LW,C4,DG,I"",Jtrue},"2,-6":{B2,A-6,LF,C6,DG,I"",Jtrue},"3,-2":{B3,A-2,LE,C5,DG,I"",Jtrue},"1,3":{B1,A3,LE,C2,DG,I"",Jtrue},"2,3":{B2,A3,L"track45",C2,DG,I"",Jtrue},"3,2":{B3,A2,L"track45",C1,DG,I"",Jtrue},"3,1":{B3,A1,LE,C0,DG,I"",Jtrue},"3,0":{B3,A0,L"track45",C0,DG,I"",Jtrue},"6,0":{B6,A0,L"track45",C0,DG,I"",Jtrue},"6,1":{B6,A1,L"track45",C1,DG,I"",Jtrue},"5,2":{B5,A2,L"track45",C5,DG,I"",Jtrue},"5,3":{B5,A3,L"track45",C1,DG,I"",Jtrue},"3,5":{B3,A5,LF,C2,DG,I"",Jtrue},"3,4":{B3,A4,LF,C6,DG,I"",Jtrue},"4,4":{B4,A4,LE,C2,DG,I"",Jtrue},"5,-2":{B5,A-2,L"track45",C5,DG,I"",Jtrue},"6,-3":{B6,A-3,L"track45",C1,DG,I"",Jtrue},"5,-6":{B5,A-6,L"track45",C0,DG,I"",Jtrue},"4,-7":{B4,A-7,L"track45",C7,DG,I"",Jtrue},"3,-7":{B3,A-7,LE,C6,DG,I"",Jtrue},"2,-7":{B2,A-7,L"track45",C6,DG,I"",Jtrue},"2,-4":{B2,A-4,LE,C7,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C3,DG,I"",Jtrue},"2,-2":{B2,A-2,LE,C3,DG,I"",Jtrue},"-3,1":{B-3,A1,LE,C4,DG,I"",Jtrue},"-3,2":{B-3,A2,LE,C4,DG,I"",Jtrue},"-3,3":{B-3,A3,LE,C4,DG,I"",Jtrue},"-1,2":{B-1,A2,LE,C7,DG,I"",Jtrue},"-3,4":{B-3,A4,LE,C4,DG,I"",Jtrue},"-3,5":{B-3,A5,LF,C4,DG,I"",Jtrue},"-2,5":{B-2,A5,LE,C2,DG,I"",Jtrue},"-1,5":{B-1,A5,LE,C2,DG,I"",Jtrue},"0,5":{B0,A5,LE,C2,DG,I"",Jtrue},"2,5":{B2,A5,LE,C6,DG,I"",Jtrue},"1,1":{B1,A1,LE,C2,DG,I"",Jtrue},"0,1":{B0,A1,L"track45",C3,DG,I"",Jtrue},"3,-1":{B3,A-1,LE,C7,DG,I"",Jtrue},"4,0":{B4,A0,LE,C3,DG,I"",Jtrue},"1,-6":{B1,A-6,LF,C0,DG,I"",Jtrue},"1,-5":{B1,A-5,LE,C4,DG,I"",Jtrue},"1,-4":{B1,A-4,LF,C2,DG,I"",Jtrue},"0,-4":{B0,A-4,LF,C4,DG,I"",Jtrue},"0,-5":{B0,A-5,LE,C0,DG,I"",Jtrue},"0,-6":{B0,A-6,LF,C6,DG,I"",Jtrue},"6,-4":{B6,A-4,LE,C0,DG,I"",Jtrue},"6,-5":{B6,A-5,L"track45",C0,DG,I"",Jtrue}},[{B-2,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-3,A0,LN,C2,D"",Q20,R0.5,"cargo":null,JK,O[],P[]}]]';
	trxLevels['Trainee'][10]='TRXv1.0:[{"-3,-3":{B-3,A-3,LE,C6,DG,I"",JK},"-4,-3":{B-4,A-3,LF,C6,DG,I"",JK},"-4,-2":{B-4,A-2,LE,C4,DG,I"",JK},"-4,-1":{B-4,A-1,LE,C4,DG,I"",JK},"-4,0":{B-4,A0,LF,C4,DG,I"",JK},"-3,0":{B-3,A0,LE,C2,DG,I"",JK},"-2,0":{B-2,A0,LE,C2,DG,I"",JK},"-1,0":{B-1,A0,LE,C2,DG,I"",JK},"0,0":{B0,A0,LW,C0,DG,I"",Jtrue},"-2,-3":{B-2,A-3,LE,C6,DG,I"home",JK},"-1,-3":{B-1,A-3,LE,C6,DG,I"",Jtrue},"-2,-4":{B-2,A-4,LY,C0,DG,I"",JK},"3,-1":{B3,A-1,LE,C4,DG,I"supply",Jtrue},"2,-1":{B2,A-1,LY,C0,DG,I"","cargo":{"value":0,L7},Jtrue},"1,-1":{B1,A-1,LE,C0,DG,I"",Jtrue},"2,0":{B2,A0,LE,C6,DG,I"",Jtrue},"3,0":{B3,A0,LE,C0,DG,I"",Jtrue},"1,-3":{B1,A-3,LW,C6,DG,I"",Jtrue},"1,-4":{B1,A-4,LF,C6,DG,I"",Jtrue},"2,-4":{B2,A-4,LE,C2,DG,I"",Jtrue},"3,-4":{B3,A-4,LF,C0,DG,I"",Jtrue},"1,-2":{B1,A-2,LW,C2,DG,I"",Jtrue},"1,1":{B1,A1,LE,C4,DG,I"",Jtrue},"2,2":{B2,A2,LE,C2,DG,I"",Jtrue},"3,2":{B3,A2,LE,C4,DG,I"",Jtrue},"3,1":{B3,A1,LE,C0,DG,I"",Jtrue},"0,-1":{B0,A-1,LE,C0,DG,I"",Jtrue},"0,-2":{B0,A-2,LF,C6,DG,I"",Jtrue},"2,-2":{B2,A-2,LE,C2,DG,I"",Jtrue},"0,2":{B0,A2,LW,C0,DG,I"",Jtrue},"-1,2":{B-1,A2,LE,C6,DG,I"",Jtrue},"-2,2":{B-2,A2,LE,C6,DG,I"",Jtrue},"-3,2":{B-3,A2,LF,C6,DG,I"",Jtrue},"-3,3":{B-3,A3,LF,C4,DG,I"",Jtrue},"-2,3":{B-2,A3,LE,C2,DG,I"",Jtrue},"-1,3":{B-1,A3,LE,C2,DG,I"",Jtrue},"0,1":{B0,A1,LE,C0,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LE,C6,DG,I"",Jtrue},"1,3":{B1,A3,LE,C2,DG,I"",Jtrue},"2,3":{B2,A3,LE,C2,DG,I"",Jtrue},"3,3":{B3,A3,LF,C2,DG,I"",Jtrue}},[{B-1,A0,LM,C2,D"",Q20,R0.5,JK,O[],P[]}],[{B-2,A0,LN,C2,D"",Q20,R0.5,"cargo":null,JK,O[],P[]}]]';
	bestTrackTime['Trainee-10'] = 9105;
	trxLevels['Trainee'][10] = trxLevels['Trainee'][1]
	
	/// 2. CABOOSE CAPTAIN- spring wyes, Lazy wyes, prompt wye, connect cars
	trxLevels['Caboose captain'] = [];

	// two choices for sprung wyes
	trxLevels['Caboose captain'][1]='TRXv1.0:[{"-1,2":{B-1,A2,LE,C2,DG,I"",Jtrue},"0,2":{B0,A2,LE,C2,DG,I"",Jtrue},"1,2":{B1,A2,LE,C2,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C0,DG,I"home",Jtrue},"2,-4":{B2,A-4,LF,C0,DG,I"",Jtrue},"1,-4":{B1,A-4,LS,C2,DG,IU,Jtrue},"0,-4":{B0,A-4,LF,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LF,C4,DG,I"",Jtrue},"3,-3":{B3,A-3,LY,C0,DG,I"",JK},"1,-3":{B1,A-3,LF,C2,DG,I"",Jtrue},"2,-2":{B2,A-2,LT,C0,DH,IU,Jtrue},"1,-2":{B1,A-2,LE,C2,DG,I"",Jtrue},"2,2":{B2,A2,LE,C6,DG,I"",JK},"-3,2":{B-3,A2,LF,C4,DG,I"",Jtrue},"-2,-2":{B-2,A-2,LW,C2,DG,I"",JK},"-2,-3":{B-2,A-3,LE,C0,DG,I"",Jtrue},"-2,-4":{B-2,A-4,LF,C0,DG,I"",Jtrue},"-3,-4":{B-3,A-4,LE,C6,DG,I"",Jtrue},"-4,-4":{B-4,A-4,LF,C6,DG,I"",Jtrue},"-4,-3":{B-4,A-3,LE,C4,DG,I"",Jtrue},"-4,-2":{B-4,A-2,LT,C4,DH,IU,Jtrue},"-3,-2":{B-3,A-2,LE,C2,DG,I"",Jtrue},"-1,-2":{B-1,A-2,LE,C2,DG,I"",Jtrue},"-3,1":{B-3,A1,LE,C0,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C0,DG,I"",Jtrue},"-2,-1":{B-2,A-1,LF,C2,DG,I"",Jtrue},"-4,-1":{B-4,A-1,LF,C4,DG,I"",Jtrue},"0,-1":{B0,A-1,LE,C4,DG,I"",Jtrue},"0,0":{B0,A0,LW,C2,DG,I"",Jtrue},"0,1":{B0,A1,LF,C2,DG,I"",Jtrue},"-1,1":{B-1,A1,LF,C4,DG,I"",Jtrue},"-1,0":{B-1,A0,LF,C6,DG,I"",Jtrue},"1,0":{B1,A0,LE,C2,DG,I"",Jtrue},"2,0":{B2,A0,LF,C2,DG,I"",Jtrue},"2,-1":{B2,A-1,LE,C0,DG,I"",Jtrue},"3,2":{B3,A2,LE,C6,DG,I"",JK},"-2,2":{B-2,A2,LE,C6,DG,I"supply",Jtrue},"-2,1":{B-2,A1,LY,C0,DG,I"","cargo":{"value":0,L7},JK}},[{B2,A2,LM,C6,D"",Q20,R0.5,JK,O[],P[]}],[{B3,A2,LN,C6,D"",Q20,R0.5,JK,O[],P[]}]]';
	bestTrackTime['Caboose captain-1'] = 9105;

	// two choices for sprung wyes to avoid loop backs
	trxLevels['Caboose captain'][2]='TRXv1.0:[{"-1,2":{B-1,A2,LE,C2,DG,I"",Jtrue},"0,2":{B0,A2,LE,C2,DG,I"",Jtrue},"1,2":{B1,A2,LE,C2,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C0,DG,I"home",Jtrue},"2,-4":{B2,A-4,LF,C0,DG,I"",Jtrue},"1,-4":{B1,A-4,LS,C2,DG,IU,Jtrue},"0,-4":{B0,A-4,LF,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LF,C4,DG,I"",Jtrue},"3,-3":{B3,A-3,LY,C0,DG,I"",JK},"1,-3":{B1,A-3,LF,C2,DG,I"",Jtrue},"2,2":{B2,A2,LE,C6,DG,I"",JK},"-3,2":{B-3,A2,LF,C4,DG,I"",Jtrue},"-3,1":{B-3,A1,LE,C0,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C0,DG,I"",Jtrue},"3,2":{B3,A2,LE,C6,DG,I"",JK},"-2,2":{B-2,A2,LE,C6,DG,I"supply",Jtrue},"-2,1":{B-2,A1,LY,C0,DG,I"","cargo":{"value":0,L7},JK},"-3,-1":{B-3,A-1,LF,C6,DG,I"",Jtrue},"-2,-1":{B-2,A-1,LT,C2,DG,IU,Jtrue},"-1,-1":{B-1,A-1,LT,C2,DG,IU,Jtrue},"0,-1":{B0,A-1,LS,C6,DH,IU,Jtrue},"1,-1":{B1,A-1,LS,C2,DH,IU,Jtrue},"2,-1":{B2,A-1,LV,C4,DG,IU,Jtrue},"2,-2":{B2,A-2,LE,C0,DG,I"",Jtrue},"3,-1":{B3,A-1,LF,C0,DG,I"",Jtrue},"3,0":{B3,A0,LT,C0,DH,IU,Jtrue},"3,1":{B3,A1,LF,C2,DG,I"",Jtrue}},[{B2,A2,LM,C6,D"",Q20,R0.5,JK,O[],P[]}],[{B3,A2,LN,C6,D"",Q20,R0.5,JK,O[],P[]}]]'
	bestTrackTime['Caboose captain-2'] = 9105;
	
	// third demo of sprung wyes
	trxLevels['Caboose captain'][3]= 'TRXv1.0:[{"-3,2":{B-3,A2,LT,C4,DG,IU,JK},"-3,1":{B-3,A1,LT,C0,DG,IU,JK},"-4,1":{B-4,A1,LF,C4,DG,I"",JK},"-2,1":{B-2,A1,LT,C4,DG,IU,JK},"-2,0":{B-2,A0,LE,C0,DG,I"",JK},"-2,-1":{B-2,A-1,LT,C0,DG,IU,JK},"-3,-1":{B-3,A-1,LF,C4,DG,I"",JK},"-1,0":{B-1,A0,LT,C4,DG,IU,JK},"-1,-1":{B-1,A-1,LE,C0,DG,I"",JK},"-1,-2":{B-1,A-2,LE,C0,DG,I"",JK},"-1,-3":{B-1,A-3,LT,C0,DG,IU,JK},"-2,-3":{B-2,A-3,LF,C4,DG,I"",JK},"-2,2":{B-2,A2,LS,C6,DH,IU,JK},"-1,2":{B-1,A2,LE,C2,DG,I"",JK},"0,2":{B0,A2,LS,C2,DH,IU,JK},"0,3":{B0,A3,LF,C4,DG,I"",JK},"-1,1":{B-1,A1,LS,C6,DH,IU,JK},"0,1":{B0,A1,LE,C2,DG,I"",JK},"1,1":{B1,A1,LE,C2,DG,I"",JK},"2,1":{B2,A1,LS,C2,DH,IU,JK},"2,2":{B2,A2,LF,C4,DG,I"",JK},"0,0":{B0,A0,LE,C2,DG,I"",JK},"1,0":{B1,A0,LE,C6,DG,I"home",JK},"-3,3":{B-3,A3,LF,C4,DG,I"",JK},"-2,3":{B-2,A3,LE,C2,DG,I"",JK},"-1,3":{B-1,A3,LE,C2,DG,I"",JK},"2,0":{B2,A0,LS,C6,DH,IU,JK},"3,0":{B3,A0,LF,C2,DG,I"",JK},"3,-1":{B3,A-1,LF,C0,DG,I"",JK},"2,-1":{B2,A-1,LF,C6,DG,I"",JK},"1,-1":{B1,A-1,LY,C0,DG,I"",JK}},[{B-2,A3,LM,C6,D"",Q20,R0.5,JK,O[],P[]}],[{B-1,A3,LN,C6,D"",Q20,R0.5,"cargo":{"value":0,L7},JK,O[],P[]}]]';
	bestTrackTime['Caboose captain-3'] = 9105;

	// simple lazy wyes
	trxLevels['Caboose captain'][4]='TRXv1.0:[{"-1,2":{B-1,A2,LS,C2,DH,I"lazy",Jtrue},"0,2":{B0,A2,LE,C2,DG,I"",Jtrue},"1,2":{B1,A2,LE,C2,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C0,DG,I"home",Jtrue},"2,-4":{B2,A-4,LF,C0,DG,I"",Jtrue},"1,-4":{B1,A-4,LS,C2,DG,IU,Jtrue},"0,-4":{B0,A-4,LF,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LF,C4,DG,I"",Jtrue},"3,-3":{B3,A-3,LY,C0,DG,I"",JK},"1,-3":{B1,A-3,LF,C2,DG,I"",Jtrue},"2,2":{B2,A2,LE,C6,DG,I"",JK},"-3,2":{B-3,A2,LF,C4,DG,I"",Jtrue},"-3,1":{B-3,A1,LE,C0,DG,I"",Jtrue},"-3,0":{B-3,A0,LE,C0,DG,I"",Jtrue},"3,2":{B3,A2,LE,C6,DG,I"",JK},"-2,2":{B-2,A2,LE,C6,DG,I"supply",Jtrue},"-2,1":{B-2,A1,LY,C0,DG,I"","cargo":{"value":0,L7},JK},"1,-5":{B1,A-5,LY,C0,DG,I"",JK},"2,-2":{B2,A-2,LT,C0,DH,IU,Jtrue},"2,-1":{B2,A-1,LT,C0,DG,I"lazy",Jtrue},"1,-1":{B1,A-1,LF,C0,DG,I"",Jtrue},"0,-1":{B0,A-1,LF,C6,DG,I"",Jtrue},"0,0":{B0,A0,LF,C4,DG,I"",Jtrue},"1,0":{B1,A0,LF,C2,DG,I"",Jtrue}},[{B0,A2,LM,C6,D"",Q20,R8.881784197001252e-16,JK,O[],P[]}],[{B1,A2,LN,C6,D"",Q20,R8.881784197001252e-16,JK,O[],P[]}]]';
	bestTrackTime['Caboose captain-4'] = 9105;

	// two lazy wyes
	trxLevels['Caboose captain'][5]='TRXv1.0:[{"-1,2":{B-1,A2,LS,C2,DH,I"lazy",Jtrue},"0,2":{B0,A2,LE,C2,DG,I"",Jtrue},"1,2":{B1,A2,LE,C2,DG,I"",Jtrue},"2,-3":{B2,A-3,LE,C0,DG,I"home",Jtrue},"2,-4":{B2,A-4,LF,C0,DG,I"",Jtrue},"1,-4":{B1,A-4,LS,C2,DG,IU,Jtrue},"0,-4":{B0,A-4,LF,C6,DG,I"",Jtrue},"0,-3":{B0,A-3,LF,C4,DG,I"",Jtrue},"3,-3":{B3,A-3,LY,C0,DG,I"",JK},"1,-3":{B1,A-3,LF,C2,DG,I"",Jtrue},"2,2":{B2,A2,LE,C6,DG,I"",JK},"-3,2":{B-3,A2,LF,C4,DG,I"",Jtrue},"-3,1":{B-3,A1,LE,C0,DG,I"",Jtrue},"3,2":{B3,A2,LE,C6,DG,I"",JK},"-2,2":{B-2,A2,LE,C6,DG,I"supply",Jtrue},"-2,1":{B-2,A1,LY,C0,DG,I"","cargo":{"value":0,L7},JK},"1,-5":{B1,A-5,LY,C0,DG,I"",JK},"-3,-1":{B-3,A-1,LT,C4,DG,IU,Jtrue},"-3,-2":{B-3,A-2,LS,C0,DH,I"lazy",Jtrue},"-3,-3":{B-3,A-3,LS,C0,DG,IU,Jtrue},"-2,-3":{B-2,A-3,LE,C2,DG,I"",Jtrue},"-1,-3":{B-1,A-3,LF,C0,DG,I"",Jtrue},"-1,-2":{B-1,A-2,LF,C4,DG,I"",Jtrue},"-2,-2":{B-2,A-2,LE,C2,DG,I"",Jtrue},"2,-2":{B2,A-2,LT,C0,DH,IU,Jtrue},"2,-1":{B2,A-1,LT,C0,DG,I"lazy",Jtrue}},[{B0,A2,LM,C6,D"",Q20,R8.881784197001252e-16,JK,O[],P[]}],[{B1,A2,LN,C6,D"",Q20,R8.881784197001252e-16,JK,O[],P[]}]]';
	bestTrackTime['Caboose captain-5'] = 9105;

	/// 3. BREAKMAN- blocks, greater wyes, supply, dump

	/// 4. SWITCHMAN- blocks, lesser wyes, swap, second train

	/// 5. CONDUCTOR- blocks, increment, decrement

	/// 6. ENGINEER- blocks add, subtract, catapult

	/// 7. YARD MASTER- numbers, multiply, divide, slingshot

	/// 8. TRAIN MASTER- Tunnels

/*	var trxName = [];

	//connections- choose which car to connect to
//	trx[15]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":8,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,null,null,{"gridx":12,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":10,"gridy":3,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":9,"gridy":3,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":0,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":11,"gridy":3,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":8,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":12,"gridy":3,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":6,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//connection- connect 3 cars in right order so triceratops is dropped off in last pd
//	trx[16]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":9,"gridy":2,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":0,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":10,"gridy":2,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":11,"gridy":2,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":8,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":12,"gridy":2,"type":"carbasic","orientation":4,"state":"","speed":0,"position":0.5,"cargo":{"value":6,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	
	
	//multithreaded- first train reverses lazy wye for second train
//	trx[17]='[[[{"gridx":0,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":1,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":2,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":2,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":3,"gridy":3,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"trackcross","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwye","orientation":0,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":5,"gridy":3,"type":"trackwye","orientation":2,"state":"right","subtype":"lazy"},{"gridx":5,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,{"gridx":8,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":8,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":9,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":10,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":11,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":12,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":12,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":11,"gridy":6,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":7,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":12,"gridy":7,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//4 trains used to flip alternate wyes until they are lined up for triceratops
//	trx[18]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":1,"type":"trackwye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":3,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":4,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"trackwye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":5,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":5,"gridy":4,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":5,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[{"gridx":7,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"trackwye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":8,"gridy":4,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"alternate"},{"gridx":8,"gridy":5,"type":"trackwyeleft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":6,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackwye","orientation":6,"state":"left","subtype":"prompt"},{"gridx":9,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":9,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":5,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null],[{"gridx":10,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":4,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"alternate"},{"gridx":10,"gridy":5,"type":"trackwyeleft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":6,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":0,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":8,"gridy":0,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":6,"gridy":0,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5},{"gridx":4,"gridy":0,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":9,"gridy":0,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	


	//introduction to wyes
	//showing spring wyes but not using
	trx[15]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//showing spring wyes but not using-sprung other way
	trx[16]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//choose right wye
	trx[17]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":0,"state":"left","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//choose right wye other way
	trx[18]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":0,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//converging and diverging wyes, choose right branch
	trx[19]='[[[null,null,{"gridx":0,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//converging and diverging wyes, choose a different branch
	trx[20]='[[[null,null,{"gridx":0,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//lazy wye- send dummy engine through first to flip wye
	trx[21]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":3,"type":"trackwyeleft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"trackwyeright","orientation":2,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,{"gridx":9,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":10,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":11,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":5,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":6,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":11,"gridy":5,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//lazy wyes- choose order to go through
	trx[22]='[[[null,{"gridx":0,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":1,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"trackwye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackwye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5}]]';
	//prompts wye
	trx[23]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":4,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"trackwye","orientation":2,"state":"left","subtype":"prompt"},{"gridx":7,"gridy":5,"type":"trackwye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":6,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":7,"type":"track90","orientation":4,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeright","orientation":0,"state":"right","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackcross","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":5,"type":"trackcross","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackcross","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"trackwye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":5,"type":"trackwye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":6,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":7,"type":"track90","orientation":4,"state":"left","subtype":""},null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":10,"gridy":6,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":11,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":12,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":4,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":4,"gridy":4,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}}]]';
	//compare wye to choose fork in track to station or not
	trx[24]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//compare wye at fork as above but other way
	trx[25]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//compare wye as above but greater than
	trx[26]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareGreater"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareGreater"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add two numbers and then choose wye
	trx[27]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add same as above but opposite choice for wye
	trx[28]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//increment and add then choose wye
	trx[29]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"increment"},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":11,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//subtraxt and then choose wye
	trx[30]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"subtract"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":7,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//multiply and then choose wye
	trx[31]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"multiply"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//divide and then choose wye
	trx[32]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"divide"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//for loop then choose wye
	trx[33]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":5,"gridy":8,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},{"gridx":6,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"enginebasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":7,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":2,"gridy":5,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
	//for loop as above but decrement rather than increment
	trx[34]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":"decrement"},{"gridx":5,"gridy":8,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"trackwye","orientation":0,"state":"left","subtype":"compareGreater"},{"gridx":6,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"enginebasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":15,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":2,"gridy":5,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
	
	//catapult triceratops after 4 prompts
	trx[35]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":1,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":2,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":"increment"},{"gridx":4,"gridy":4,"type":"trackwyeleft","orientation":2,"state":"right","subtype":"prompt"},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":12,"type":["dinosaurs","archaeopteryx","ankylosaurus","brachiosaurus","elasmosaurus","hadrosaurus","iguanodon","megalosaurus","microraptor","ornithomimus","pteranodon","quetzalcoatlus","stegosaurus","triceratops","troodon","tyranosaurus","velociraptor"]}},{"gridx":6,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeleft","orientation":0,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":"catapult"},{"gridx":7,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":13,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null]],[{"gridx":2,"gridy":4,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":4,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//test loop
	trx[36]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":3,"gridy":3,"type":"track45","orientation":5,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"track45","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":1,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":6,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,null,null],[null,{"gridx":5,"gridy":1,"type":"track45","orientation":6,"state":"left","subtype":""},null,null,null,null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":6,"gridy":8,"type":"track45","orientation":3,"state":"left","subtype":""},null],[null,{"gridx":7,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":7,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":8,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":9,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":10,"gridy":1,"type":"track45","orientation":7,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":10,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null],[null,null,{"gridx":11,"gridy":2,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,{"gridx":11,"gridy":8,"type":"track45","orientation":2,"state":"left","subtype":""},null],[null,null,null,{"gridx":12,"gridy":3,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,{"gridx":12,"gridy":7,"type":"trackstraight","orientation":5,"state":"left","subtype":""},null,null],[null,null,null,null,{"gridx":13,"gridy":4,"type":"track45","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":5,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":6,"type":"track45","orientation":1,"state":"left","subtype":""},null,null,null]],[{"gridx":6,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[]]';
	// test loop diagonal
	trx[37]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[{"gridx":2,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":1,"type":"track45","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":3,"gridy":0,"type":"track45","orientation":7,"state":"left","subtype":""},null,{"gridx":3,"gridy":2,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,{"gridx":4,"gridy":3,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,{"gridx":6,"gridy":3,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,{"gridx":7,"gridy":4,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,{"gridx":8,"gridy":5,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,{"gridx":8,"gridy":7,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,{"gridx":9,"gridy":6,"type":"trackstraight","orientation":7,"state":"left","subtype":""},null,{"gridx":9,"gridy":8,"type":"track90","orientation":3,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":10,"gridy":7,"type":"track90","orientation":1,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"enginebasic","orientation":3,"state":"","speed":20,"position":0.5}],[]]';
	//handoff
    trx[38]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":5,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":7,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":5,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":4,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":"pickDrop"},{"gridx":5,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":6,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":7,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":5,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":7,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":7,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":8,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.7400000000001935},{"gridx":7,"gridy":2,"type":"enginebasic","orientation":4,"state":"","speed":20,"position":0.04000000000019318}],[{"gridx":7,"gridy":1,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.04000000000019318,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":8,"gridy":1,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":2,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":3,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":4,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":8,"gridy":5,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.04000000000019318},{"gridx":4,"gridy":1,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":2,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":3,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":4,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":5,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935},{"gridx":4,"gridy":6,"type":"carbasic","orientation":0,"state":"","speed":20,"position":0.7400000000001935}]]';
 		
	//bunny rescue simple one gap
    trx[50]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":4,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';	
//    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":"pickDrop"},{"gridx":4,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":7,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":8,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"lazy"},{"gridx":6,"gridy":4,"type":"trackstraight","orientation":0,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":6,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":7,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":7,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":8,"gridy":2,"type":"trackwyeright","orientation":2,"state":"left","subtype":"compareGreater"},{"gridx":8,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":9,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":5,"type":"trackcross","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":6,"gridy":5,"type":"enginebasic","orientation":0,"state":"","speed":20,"position":0.5}],[{"gridx":6,"gridy":6,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5}]]';	
//    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';	nCurrentTrx = 50;
    trx[51]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":2,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":5,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":5,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[52]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":2,"gridy":7,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,{"gridx":3,"gridy":7,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":3,"gridy":8,"type":"trackwyeleft","orientation":2,"state":"left","subtype":"sprung"},null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":4,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,{"gridx":5,"gridy":8,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":5,"gridy":9,"type":"trackcargo","orientation":0,"state":"left","subtype":""}],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[53]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":7,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[54]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';    

    trx[55]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[56]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":11,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[57]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackstraight","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,{"gridx":8,"gridy":3,"type":"track45","orientation":3,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[58]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":2,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":2,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":3,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":4,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":1,"type":"trackcross","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":5,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":7,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":11,"gridy":1,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":12,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[59]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":3,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,{"gridx":4,"gridy":5,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"gridx":12,"gridy":6,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":7,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null],[null,null,null,null,null,null,{"gridx":13,"gridy":6,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[60]='[[[null,null,null,null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":4,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":5,"gridy":5,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":4,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":6,"gridy":5,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":7,"gridy":4,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":5,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":1,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[61]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":0,"state":"left","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":"home"},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[62]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[{"gridx":7,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":0,"state":"right","subtype":"sprung"},null,{"gridx":7,"gridy":3,"type":"trackwyeleft","orientation":4,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":8,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":"home"},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,{"gridx":11,"gridy":3,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":12,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[63]='[[[null,null,{"gridx":0,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":12,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[64]='[[[null,null,{"gridx":0,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":1,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":10,"gridy":0,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,{"gridx":10,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":11,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":1,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":2,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":11,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":12,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":12,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[{"gridx":13,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":13,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null]],[{"gridx":1,"gridy":2,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":0,"gridy":2,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[65]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,{"gridx":2,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":2,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":5,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":3,"type":"trackwyeleft","orientation":0,"state":"left","subtype":"sprung"},{"gridx":5,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":5,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":6,"gridy":2,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},{"gridx":6,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":6,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,{"gridx":7,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":7,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":8,"gridy":2,"type":"trackwyeright","orientation":2,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":8,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":9,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,{"gridx":9,"gridy":5,"type":"trackstraight","orientation":6,"state":"left","subtype":""},{"gridx":9,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":10,"gridy":2,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":10,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":10,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":10,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,{"gridx":11,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":11,"gridy":3,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":11,"gridy":5,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":11,"gridy":6,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":10,"gridy":5,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5},{"gridx":11,"gridy":6,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":11,"gridy":5,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[66]='[[[null,{"gridx":0,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":0,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":1,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":1,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":2,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":3,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null,null,null,null],[null,{"gridx":4,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,null,null,null,null,null,null],[null,{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":2,"state":"right","subtype":"lazy"},null,null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":2,"state":"left","subtype":"supply"},{"gridx":6,"gridy":5,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"trackwyeright","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":2,"type":"trackwye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackwye","orientation":2,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":8,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":8,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":9,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":1,"type":"enginebasic","orientation":6,"state":"","speed":20,"position":0.5}],[{"gridx":3,"gridy":1,"type":"carbasic","orientation":6,"state":"","speed":20,"position":0.5}]]';
                                            

    trx[67]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":4,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":6,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":7,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":4,"type":"trackwye","orientation":2,"state":"left","subtype":"prompt"},{"gridx":7,"gridy":5,"type":"trackwye","orientation":6,"state":"right","subtype":"prompt"},{"gridx":7,"gridy":6,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":7,"gridy":7,"type":"track90","orientation":4,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeright","orientation":0,"state":"right","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackcross","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"trackwye","orientation":6,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":5,"type":"trackcross","orientation":4,"state":"left","subtype":""},{"gridx":8,"gridy":6,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"trackcross","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":2,"type":"trackwye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":3,"type":"track90","orientation":4,"state":"left","subtype":""},{"gridx":9,"gridy":4,"type":"trackwyeright","orientation":2,"state":"right","subtype":"sprung"},{"gridx":9,"gridy":5,"type":"trackwye","orientation":2,"state":"right","subtype":"prompt"},{"gridx":9,"gridy":6,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":9,"gridy":7,"type":"track90","orientation":4,"state":"left","subtype":""},null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":2,"state":"left","subtype":"home"},{"gridx":10,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":10,"gridy":6,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":11,"gridy":1,"type":"trackwyeleft","orientation":6,"state":"left","subtype":"sprung"},{"gridx":11,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,{"gridx":12,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":12,"gridy":2,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":5,"gridy":4,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":4,"gridy":4,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}}]]';

    trx[68]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';

    trx[69]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":3,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":5,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add
    trx[70]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//add
    trx[71]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":4,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//increment + add
    trx[72]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"increment"},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"add"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//subtract
    trx[73]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"subtract"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":7,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
	//multiply
    trx[74]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"multiply"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":3,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
    //divide
    trx[75]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"gridx":1,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":2,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,{"gridx":6,"gridy":7,"type":"trackstraight","orientation":2,"state":"left","subtype":"divide"},{"gridx":6,"gridy":8,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":4,"gridy":7,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007}],[{"gridx":3,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":2,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":2,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":1,"gridy":7,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.6400000000000007,"cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
    //loop+compare
    trx[76]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":"increment"},{"gridx":5,"gridy":8,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},{"gridx":6,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"enginebasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":2,"gridy":5,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":null}]]';
    //loop with decrement then switch                                                    
    trx[77]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"gridx":2,"gridy":5,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":6,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":7,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":2,"gridy":8,"type":"track90","orientation":4,"state":"left","subtype":""},null],[null,null,null,null,null,null,null,{"gridx":3,"gridy":7,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":8,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":3,"gridy":8,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},null],[null,{"gridx":4,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":4,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,{"gridx":4,"gridy":7,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":4,"gridy":8,"type":"trackwyeright","orientation":6,"state":"left","subtype":"sprung"},null],[{"gridx":5,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":1,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":5,"gridy":4,"type":"trackwye","orientation":0,"state":"left","subtype":"compareLess"},null,null,{"gridx":5,"gridy":7,"type":"trackstraight","orientation":6,"state":"left","subtype":"decrement"},{"gridx":5,"gridy":8,"type":"trackstraight","orientation":2,"state":"left","subtype":""},null],[{"gridx":6,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":1,"type":"trackwyeright","orientation":4,"state":"right","subtype":"sprung"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":"home"},{"gridx":6,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":6,"gridy":6,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":6,"gridy":7,"type":"trackwye","orientation":0,"state":"left","subtype":"compareGreater"},{"gridx":6,"gridy":8,"type":"track90","orientation":2,"state":"left","subtype":""},null],[null,null,{"gridx":7,"gridy":2,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,{"gridx":7,"gridy":6,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":7,"gridy":7,"type":"track90","orientation":2,"state":"left","subtype":""},null,null],[{"gridx":8,"gridy":0,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":8,"gridy":1,"type":"trackwyeleft","orientation":4,"state":"left","subtype":"sprung"},{"gridx":8,"gridy":2,"type":"trackstraight","orientation":4,"state":"left","subtype":"home"},{"gridx":8,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":8,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":9,"gridy":0,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":9,"gridy":1,"type":"track90","orientation":2,"state":"left","subtype":""},null,{"gridx":9,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":6,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}},{"gridx":9,"gridy":4,"type":"trackwye","orientation":0,"state":"right","subtype":"compareLess"},null,null,null,null,null],[null,{"gridx":10,"gridy":1,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":2,"type":"trackstraight","orientation":0,"state":"left","subtype":""},{"gridx":10,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":10,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null]],[{"gridx":2,"gridy":7,"type":"enginebasic","orientation":4,"state":"","speed":20,"position":0.5}],[{"gridx":2,"gridy":6,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5,"cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":2,"gridy":5,"type":"carbasic","orientation":4,"state":"","speed":20,"position":0.5}]]';
 	//propmt loop with catapult
    trx[78]='[[[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"gridx":1,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,{"gridx":2,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":3,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":3,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":3,"gridy":4,"type":"trackwyeright","orientation":6,"state":"right","subtype":"sprung"},null,null,null,null,null],[null,null,{"gridx":4,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":4,"gridy":3,"type":"trackstraight","orientation":0,"state":"left","subtype":"increment"},{"gridx":4,"gridy":4,"type":"trackwyeleft","orientation":2,"state":"right","subtype":"prompt"},null,null,null,null,null],[null,{"gridx":5,"gridy":1,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":5,"gridy":2,"type":"track90","orientation":4,"state":"left","subtype":""},null,{"gridx":5,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[{"gridx":6,"gridy":0,"type":"trackcargo","orientation":0,"state":"left","subtype":"","cargo":{"value":0,"type":["stuffedAnimals","bunny"]}},{"gridx":6,"gridy":1,"type":"trackstraight","orientation":6,"state":"left","subtype":"supply"},{"gridx":6,"gridy":2,"type":"trackstraight","orientation":2,"state":"left","subtype":""},{"gridx":6,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},{"gridx":6,"gridy":4,"type":"trackstraight","orientation":6,"state":"left","subtype":""},null,null,null,null,null],[null,{"gridx":7,"gridy":1,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":7,"gridy":2,"type":"trackwyeleft","orientation":0,"state":"right","subtype":"sprung"},{"gridx":7,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":"catapult"},{"gridx":7,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null],[null,null,null,{"gridx":11,"gridy":3,"type":"trackcargo","orientation":0,"state":"left","subtype":""},null,null,null,null,null,null],[null,null,{"gridx":12,"gridy":2,"type":"track90","orientation":6,"state":"left","subtype":""},{"gridx":12,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":"pickDrop"},{"gridx":12,"gridy":4,"type":"track90","orientation":4,"state":"left","subtype":""},null,null,null,null,null],[null,null,{"gridx":13,"gridy":2,"type":"track90","orientation":0,"state":"left","subtype":""},{"gridx":13,"gridy":3,"type":"trackstraight","orientation":4,"state":"left","subtype":""},{"gridx":13,"gridy":4,"type":"track90","orientation":2,"state":"left","subtype":""},null,null,null,null,null]],[{"gridx":2,"gridy":4,"type":"enginebasic","orientation":2,"state":"","speed":20,"position":0.5}],[{"gridx":1,"gridy":4,"type":"carbasic","orientation":2,"state":"","speed":20,"position":0.5,"cargo":{"value":1,"type":["numbers","0","1","2","3","4","5","6","7","8","9"]}}]]';
 */   
 //   trx[1]='[{"-1,-1":{"gridx":0,"gridy":0,"type":"trackstraight","orientation":4,"state":"left","subtype":"","immutable":false}},[],[]]';
//    trx[1]='[{"0,0":{"gridx":0,"gridy":0,"type":"trackstraight","orientation":0,"state":"left","subtype":"","immutable":false}},[],[]]';
  //  openTrxJSON(trx[1]);
 	//buildTrains();

	// make Toolbar for Levels
	toolButtonsLevels.push(new ToolButton(buttonPadding, 8+1*buttonPadding+0*(1.1*buttonWidth), buttonWidth, buttonWidth, "Play", 0));

	toolButtonsLevels.push(new ToolButton(buttonPadding, 14+2*buttonPadding+1*(1.1*buttonWidth), buttonWidth, buttonWidth, "Track", 1, true));
	toolButtonsLevels.push(new ToolButton(buttonPadding, 14+2*buttonPadding+2*(1.1*buttonWidth), buttonWidth, buttonWidth, "Engine", 1));
	toolButtonsLevels.push(new ToolButton(buttonPadding, 14+2*buttonPadding+3*(1.1*buttonWidth), buttonWidth, buttonWidth, "Car", 1));
	toolButtonsLevels.push(new ToolButton(buttonPadding, 14+2*buttonPadding+4*(1.1*buttonWidth), buttonWidth, buttonWidth, "Cargo", 1));

	toolButtonsLevels.push(new ToolButton(buttonPadding, 20+3*buttonPadding+5*(1.1*buttonWidth), buttonWidth, buttonWidth, "Home", 2));
	
	// make Toolbar for Freeplay
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 1*buttonPadding+0*(1.1*buttonWidth), buttonWidth, buttonWidth, "Play", 0));

	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 2*buttonPadding+1*(1.1*buttonWidth), buttonWidth, buttonWidth, "Track", 1, true));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 2*buttonPadding+2*(1.1*buttonWidth), buttonWidth, buttonWidth, "Engine", 1));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 2*buttonPadding+3*(1.1*buttonWidth), buttonWidth, buttonWidth, "Car", 1));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 2*buttonPadding+4*(1.1*buttonWidth), buttonWidth, buttonWidth, "Cargo", 1));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 3*buttonPadding+5*(1.1*buttonWidth), buttonWidth, buttonWidth, "Eraser", 1));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 3*buttonPadding+6*(1.1*buttonWidth), buttonWidth, buttonWidth, "Select", 1));
	toolButtonsFreeplay.push(new ToolButton(buttonPadding, 4*buttonPadding+7*(1.1*buttonWidth), buttonWidth, buttonWidth, "Home"));

	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 1*buttonPadding+0*(1.1*buttonWidth), buttonWidth, buttonWidth, "Octagon"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 2*buttonPadding+1*(1.1*buttonWidth), buttonWidth, buttonWidth, "Save"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 2*buttonPadding+2*(1.1*buttonWidth), buttonWidth, buttonWidth, "Open"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 2*buttonPadding+3*(1.1*buttonWidth), buttonWidth, buttonWidth, "Download"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 2*buttonPadding+4*(1.1*buttonWidth), buttonWidth, buttonWidth, "Upload"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 3*buttonPadding+5*(1.1*buttonWidth), buttonWidth, buttonWidth, "Clear"));
	if (debugMode) toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 3*buttonPadding+6*(1.1*buttonWidth), buttonWidth, buttonWidth, "Write"));
	toolButtonsFreeplay.push(new ToolButton(0.5*toolBarWidthFreeplay+0.5*buttonPadding, 4*buttonPadding+7*(1.1*buttonWidth), buttonWidth, buttonWidth, "Signin"));
	
	//download trx for a trackID passed through URL
	if (passedTrackID) downloadTrackID(passedTrackID);
	
	var trainerLevelLocked = []; //show lock icon on levels page for each trainer level
	var unlockedTrx = []; // e.g. unlockedTrx['Trainee-1'] = true if unlocked, in not unlocked then undefined or false
	for (i=0; i<trainerLevelNames.length; i++) {
		trainerLevelLocked[trainerLevelNames[i+1]] = false;	
		text= trainerLevelNames[i] + "-1"; //unlocked first trx of each level so place to start
		unlockedTrx[text] = true;
		for (j=1; j<=10; j++) { //check if high score > 0 . If so unlock
			var highScore = 0;
			text = "highscore-" + trainerLevelNames[i] + "-" + j;
			if (localStorage.getObject(text)) highScore = localStorage.getObject(text);
			text = trainerLevelNames[i] + "-" + j;
			if (highScore > 0) unlockedTrx[text] = true;
			else trainerLevelLocked[trainerLevelNames[i+1]] = true;	//lock the next level unless all tracks on this level are unlocked
		}
	}
	trainerLevelLocked['Trainee'] = false; //unlock first level so somewhere to start
	
	console.log("Ready!!");
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
		tracks[mi(gridx,gridy)] = this;
		this.gridx = gridx || 0;
		this.gridy = gridy || 0;
		this.type = type || "trackstraight";
		this.orientation = orientation || 0;
		this.state = state || "left"; //left or right
		this.subtype = subtype || ""; //for TrackWye, TrackWyeLeft, TrackWyeRight subtype can be sprung, lazy, prompt, alternate, compareless, comparegreater, random
		//for TrackStraight- subtype can be increment, decrement, add, subtract, divide, multiply, sligshot, catapult
		this.cargo = undefined;// a reference to a Cargo object carried by this track
		this.immutable = false; //can this track be deleted or changed
	}	
	
	function updateUndoHistory() {
//		console.log("Update undo history. Index="+undoCurrentIndex);
	 	var trx = [tracks, engines, cars];
		undoCurrentIndex += 1;
		undoHistory[undoCurrentIndex] =	compress(JSON.stringify(JSON.decycle(trx)));
	}

	function undoTrx() {
		console.log("undo trx. Index="+undoCurrentIndex);
		if (undoCurrentIndex>1) {
			undoCurrentIndex -= 1;
			openTrxJSON(decompress(undoHistory[undoCurrentIndex]));
			buildTrains();
			draw();
		}
	}
	
	function redoTrx() {
		console.log("redo trx");
		if (undoCurrentIndex < undoHistory.length-1) {
			undoCurrentIndex += 1;
			openTrxJSON(decompress(undoHistory[undoCurrentIndex]));
			buildTrains();
			draw();
		}
	}
	
	function mi(x,y) { //make index
		return (x+','+y);
	}
	
	function compress(decompressedTrx) {
		if (!decompressedTrx) return;
		var compressedTrx = decompressedTrx;
		for (var key in swap) {
		    compressedTrx = compressedTrx.replace(new RegExp(key, 'g'), swap[key]);
		}
		return "TRXv1.0:"+compressedTrx
	}
	
	function decompress (compressedTrx) {
		if (!compressedTrx) return;
		var decompressedTrx = compressedTrx.replace("TRXv1.0:", "");
		for (var key in swap) {
		    decompressedTrx = decompressedTrx.replace(new RegExp(swap[key], 'g'), key);
		}
		return decompressedTrx;
	}
	
	function drawTitleScreen() {
		ctx.save();
		xScale = canvasWidth/imgTitleScreen.width;
		yScale = canvasHeight/imgTitleScreen.height;
		ctx.scale(xScale, yScale);
		ctx.drawImage(imgTitleScreen, 0, 0);
		ctx.restore();
		
		drawTextButton(0.25*canvasWidth, 0.7*canvasHeight, 0.2*canvasWidth, 0.1*canvasHeight, "Levels", false, false, buttonColor, buttonBorderColor);
		buttonDims['Levels'] = new box(0.25*canvasWidth, 0.7*canvasHeight, 0.2*canvasWidth, 0.1*canvasHeight);
		
		drawTextButton(0.75*canvasWidth, 0.7*canvasHeight, 0.2*canvasWidth, 0.1*canvasHeight, "Freeplay", false, false, buttonColor, buttonBorderColor);
		buttonDims['Freeplay'] = new box(0.75*canvasWidth, 0.7*canvasHeight, 0.2*canvasWidth, 0.1*canvasHeight);

		drawTextButton(0.5*canvasWidth, 0.85*canvasHeight, 0.15*canvasWidth, 0.07*canvasHeight, "About", false, false, "lightGray", "gray");
		buttonDims['About'] = new box(0.5*canvasWidth, 0.85*canvasHeight, 0.15*canvasWidth, 0.7*canvasHeight);
	}
	
	function drawButtonScreen() { // draws the screen for different sets of buttons such levels, trainee, conductor
		ctx.save();
		xScale = canvasWidth/imgTitleScreen.width;
		yScale = canvasHeight/imgTitleScreen.height;
		ctx.scale(xScale, yScale);
		ctx.drawImage(imgTitleScreen, 0, 0);
		ctx.restore();
		
		ctx.fillStyle = aboutColor;
		ctx.fillRect (0,0,canvasWidth, canvasHeight);
		ctx.font = "40px Arial";
		ctx.fillStyle = fontColor;
		ctx.textAlign = 'center';
		ctx.fillText (interactionState, 0.5*canvasWidth,0.2*canvasHeight);
		
		var maxY=5;
		if (interactionState == 'Levels') maxY=4;
		for (x=0; x<2; x++) {
			for (y=maxY-1; y>=0; y--) {
				var text, unlocked, badge;
				var index = x*maxY + y +1;
				if (interactionState == 'Levels') {
					text = trainerLevelNames[index+1];
					badge = !trainerLevelLocked[text];
					text = trainerLevelNames[index];
					unlocked = !trainerLevelLocked[text];
				} else {
					text = currentTrackSet + "-" + index;
					unlocked = unlockedTrx[text];
					text = "track "+index;
					badge = false;
				}
				//badge = true;
				drawTextButton((x*2-1)*0.25*canvasWidth+0.5*canvasWidth, 0.3*canvasHeight+y*0.12*canvasHeight, 0.38*canvasWidth, 0.08*canvasHeight, text, !unlocked, unlocked, buttonColor, buttonBorderColor);
				if (badge) ctx.drawImage(imgBadgeIconSmall, (x*2-1)*0.25*canvasWidth+0.5*canvasWidth+0.12*canvasWidth, 0.23*canvasHeight+y*0.12*canvasHeight);
				buttonDimLevels[text] = new box((x*2-1)*0.25*canvasWidth+0.5*canvasWidth, 0.3*canvasHeight+y*0.12*canvasHeight, 0.38*canvasWidth, 0.08*canvasHeight);
			}
		}
		
		drawTextButton(0.5*canvasWidth, 0.88*canvasHeight, 0.15*canvasWidth, 0.08*canvasHeight, "Back", false, false, "lightGray", "gray");
		text= interactionState + "-back";
		buttonDimLevels[text] = new box(0.5*canvasWidth, 0.88*canvasHeight, 0.15*canvasWidth, 0.08*canvasHeight);
		
	}
		
	function drawTextButton(x, y, width, height, text, isLocked, isUnlocked, fillColor, strokeColor) { //draw button centered at x,y
		//console.log ("drawTextButton x="+x+" y="+y);
		ctx.fillStyle = fillColor;
		ctx.strokeStyle = strokeColor;
		roundRect (x-0.5*width, y-0.5*height, width, height, 5, true, true);
		ctx.font = "normal bold 30px Arial";
		ctx.fillStyle = fontColor;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText(text, x, y);	
		if (isLocked) ctx.drawImage(imgLockedIcon, x-0.5*width, y-0.5*imgLockedIcon.height);
		if (isUnlocked) ctx.drawImage(imgUnlockedIcon, x-0.5*width, y-0.5*imgUnlockedIcon.height);
	}	

	function roundRect(x, y, width, height, radius, fill, stroke) {
	  if (typeof stroke == 'undefined') {
	    stroke = true;
	  }
	  if (typeof radius === 'undefined') {
	    radius = 5;
	  }
	  if (typeof radius === 'number') {
	    radius = {tl: radius, tr: radius, br: radius, bl: radius};
	  } else {
	    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
	    for (var side in defaultRadius) {
	      radius[side] = radius[side] || defaultRadius[side];
	    }
	  }
	  ctx.lineWidth = 1;
	  ctx.beginPath();
	  ctx.moveTo(x + radius.tl, y);
	  ctx.lineTo(x + width - radius.tr, y);
	  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	  ctx.lineTo(x + width, y + height - radius.br);
	  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	  ctx.lineTo(x + radius.bl, y + height);
	  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	  ctx.lineTo(x, y + radius.tl);
	  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	  ctx.closePath();
	  if (fill) {
	    ctx.fill();
	  }
	  if (stroke) {
	    ctx.stroke();
	  }
	
	}		

	function box(centerX, centerY, width, height) {
		var x1, x2, y1, y2;
		x1 = centerX-0.5*width;
		x2 = centerX+0.5*width;
		y1 = centerY-0.5*height;
		y2 = centerY+0.5*height;
		
		this.inside = function (x,y) {
			if (x>x1 && x<x2 && y>y1 && y<y2) return true;
			else return false;
		}
	}
	
	function drawTrack(track) {  //draws this track
		if (!track) return;
		
		ctx.save();
		ctx.translate((0.5+track.gridx)*tileWidth, (0.5+track.gridy)*tileWidth*tileRatio); //center origin on tile
			
		//rotate tile
		ctx.rotate(track.orientation * Math.PI/4);
						
		//draw tile interior specific to type of track
		switch (track.type) {
			case "track90":
			case "track45":
			case "trackcargo":
			case "trackblank":
			case "trackcross":
				drawSprite(track.type, track.orientation);
				break; 
			case "trackstraight":
				if (track.subtype == "none" || track.subtype == "" || track.subtype == "greentunnel" || track.subtype == "redtunnel" || track.subtype == "bluetunnel") drawSprite("trackstraight", track.orientation);
				else drawSprite(track.subtype, track.orientation);
				break;
			case "trackwyeleft":
			case "trackwyeright":
			case "trackwye":
				var name = track.type + "-";
				switch (track.subtype) {
					case "prompt":
						name += "prompt";
						break;
					case "alternate":
						name += "alternate";
						break;
					case "comparegreater":
						name += "greater";
						break;
					case "compareless":
						name += "less";
						break;
					case "sprung":
						name += "sprung";
						break;
					case "lazy":
						name += "lazy";
						break;
					case "random":
						name += "random";
						break;
					default:
						name += "lazy";
						console.log("ERROR-uncaught case track.subtype="+track.subtype+" type="+track.type);
						break;
				}
				if (track.state == "left") name += "-l";
				else name += "-r";
				
//				console.log("name="+name);
				drawSprite(name, track.orientation);
				break; 
		}
		
        if (showToolBar && track.immutable) {
			ctx.fillStyle = trackImmutableColorFill;
			ctx.fillRect(-0.5*tileWidth, -0.5*tileWidth, tileWidth, tileWidth);
			ctx.lineWidth = 2;
			ctx.strokeStyle = trackImmutableColorBorder;
			ctx.rect(-0.5*tileWidth, -0.5*tileWidth, tileWidth, tileWidth);
		}
		
		var cargoOri = Math.PI/4*track.orientation;
		if (track.type == "trackblank") cargoOri = 16;
		drawCargo(track, cargoOri);
					
		ctx.restore();
	
	}		
	
	function drawTrackInset() {
		ctx.lineWidth = 1;
		ctx.fillStyle = insetFillColor;
		ctx.strokeStyle = insetStrokeColor;

		roundRect (0,0, insetWidth, insetWidth, insetWidth/8, true, true);	
		
	}		    

	function drawSprite(name, ori, value) { //draws an image either from scratch or via a loaded image at the current position. ori used for choosing image from array of renders from different orientations. Value for choosing from array of values for cargo type
		ctx.rotate(-ori * Math.PI/4);
		//console.log("drawSprite="+name); //kkk
        var cargoOffsetX = -37;
        var cargoOffsetY = -26;
        var stationOffsetX = -53;
        var stationOffsetY = -31;
        var wyeOffsetX = -69;
        var wyeOffsetY = -43;
		switch (name) {
			case "Captionblocks":
                ctx.drawImage(imgCargoBlocks[2][12], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Caption1":
                ctx.drawImage(imgCargoBlocks[value][12], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionuppercase":
                ctx.drawImage(imgCargoUppercase[0][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "CaptionA":
                ctx.drawImage(imgCargoUppercase[value][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionlowercase":
				ctx.drawImage(imgCargoLowercase[0][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captiona":
				ctx.drawImage(imgCargoLowercase[value][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captioncolors":
				ctx.drawImage(imgCargoColors[0][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionwhite":
				ctx.drawImage(imgCargoColors[value][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captiondinosaurs":
				ctx.drawImage(imgCargoDinosaurs[0][5], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionraptor":
				ctx.drawImage(imgCargoDinosaurs[value][5], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionstuffedanimals":
				ctx.drawImage(imgCargoStuffedAnimals[0][34], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionbear":
				ctx.drawImage(imgCargoStuffedAnimals[value][34], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionnumbers":
				ctx.drawImage(imgCargoNumbers[0][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Caption0":
				ctx.drawImage(imgCargoNumbers[value][16], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionbinary":
				ctx.drawImage(imgCargoBinary[0][5], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionyes":
				ctx.drawImage(imgCargoBinary[value][5], cargoOffsetX, cargoOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionnone":
				ctx.drawImage(imgCaptionNone, stationOffsetX+37, stationOffsetY+9,imgTrackWidth*0.45,imgTrackWidth*0.45);
				break;
			case "Captionalternate":
				ctx.drawImage(imgCaptionAlternate, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captionrandom":
				ctx.drawImage(imgCaptionRandom, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captioncomparegreater":
				ctx.drawImage(imgCaptionGreater, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captionlazy":
				ctx.drawImage(imgCaptionLazy, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captioncompareless":
				ctx.drawImage(imgCaptionLesser, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captionprompt":
				ctx.drawImage(imgCaptionPrompt, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captionsprung":
				ctx.drawImage(imgCaptionSprung, wyeOffsetX, wyeOffsetY,imgTrackWidth,imgTrackWidth);
				break;
			case "Captionadd":
				ctx.drawImage(imgCaptionAdd, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captioncatapult":
				ctx.drawImage(imgCaptionCatapult, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captiondecrement":
				ctx.drawImage(imgCaptionDecrement, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captiondivide":
				ctx.drawImage(imgCaptionDivide, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captiondump":
				ctx.drawImage(imgCaptionDump, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionincrement":
				ctx.drawImage(imgCaptionIncrement, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionmultiply":
				ctx.drawImage(imgCaptionMultiply, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionhome":
				ctx.drawImage(imgCaptionHome, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionredtunnel":
				ctx.drawImage(imgCaptionRedTunnel, stationOffsetX+31, stationOffsetY+18,imgTrackWidth*0.45,imgTrackWidth*0.45);
				break;
			case "Captiongreentunnel":
				ctx.drawImage(imgCaptionGreenTunnel, stationOffsetX+31, stationOffsetY+18,imgTrackWidth*0.45,imgTrackWidth*0.45);
				break;
			case "Captionbluetunnel":
				ctx.drawImage(imgCaptionBlueTunnel, stationOffsetX+31, stationOffsetY+18,imgTrackWidth*0.45,imgTrackWidth*0.45);
				break;
			case "Captionpickdrop":
				ctx.drawImage(imgCaptionPickDrop, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionslingshot":
				ctx.drawImage(imgCaptionSlingshot, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionsubtract":
				ctx.drawImage(imgCaptionSubtract, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "Captionsupply":
				ctx.drawImage(imgCaptionSupply, stationOffsetX, stationOffsetY,imgTrackWidth*0.8,imgTrackWidth*0.8);
				break;
			case "track90":
				ctx.drawImage(imgTrack90[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "track45":
				ctx.drawImage(imgTrack45[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "tracksquareSE": //draw the little squares between diagonal tracks 
				ctx.drawImage(imgTrackDiagonalSquare[7], 0, 0,imgTrackWidth,imgTrackWidth);
				break;
			case "tracksquareSW": //draw the little squares between diagonal tracks 
				ctx.drawImage(imgTrackDiagonalSquare[1], 0, 0,imgTrackWidth,imgTrackWidth);
				break;
			case "trackstraight":
				var oriRot = (ori+4)%8; // this is to correct an error in the rendering angle
				ctx.drawImage(imgTrackStraight[oriRot], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-alternate-l":
				ctx.drawImage(imgTrackWyeRightAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-alternate-r":
				ctx.drawImage(imgTrackWyeRightAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-lazy-l":
				ctx.drawImage(imgTrackWyeRightLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-lazy-r":
				ctx.drawImage(imgTrackWyeRightLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-less-l":
				ctx.drawImage(imgTrackWyeRightLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-less-r":
				ctx.drawImage(imgTrackWyeRightLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-greater-l":
				ctx.drawImage(imgTrackWyeRightGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-greater-r":
				ctx.drawImage(imgTrackWyeRightGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-sprung-l":
				ctx.drawImage(imgTrackWyeRightSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-sprung-r":
				ctx.drawImage(imgTrackWyeRightSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-prompt-l":
				ctx.drawImage(imgTrackWyeRightPromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-prompt-r":
				ctx.drawImage(imgTrackWyeRightPromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-random-r":
				ctx.drawImage(imgTrackWyeRightRandomR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeright-random-l":
				ctx.drawImage(imgTrackWyeRightRandomL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-alternate-l":
				ctx.drawImage(imgTrackWyeLeftAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-alternate-r":
				ctx.drawImage(imgTrackWyeLeftAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-lazy-l":
				ctx.drawImage(imgTrackWyeLeftLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-lazy-r":
				ctx.drawImage(imgTrackWyeLeftLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-less-l":
				ctx.drawImage(imgTrackWyeLeftLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-less-r":
				ctx.drawImage(imgTrackWyeLeftLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-greater-l":
				ctx.drawImage(imgTrackWyeLeftGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-greater-r":
				ctx.drawImage(imgTrackWyeLeftGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-prompt-l":
				ctx.drawImage(imgTrackWyeLeftPromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-prompt-r":
				ctx.drawImage(imgTrackWyeLeftPromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-random-l":
				ctx.drawImage(imgTrackWyeLeftRandomL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-random-r":
				ctx.drawImage(imgTrackWyeLeftRandomR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-sprung-l":
				ctx.drawImage(imgTrackWyeLeftSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwyeleft-sprung-r":
				ctx.drawImage(imgTrackWyeLeftSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-alternate-l":
				ctx.drawImage(imgTrackWyeAlternateL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-alternate-r":
				ctx.drawImage(imgTrackWyeAlternateR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-less-l":
				ctx.drawImage(imgTrackWyeLesserL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-less-r":
				ctx.drawImage(imgTrackWyeLesserR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-lazy-l":
				ctx.drawImage(imgTrackWyeLazyL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-lazy-r":
				ctx.drawImage(imgTrackWyeLazyR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-greater-l":
				ctx.drawImage(imgTrackWyeGreaterL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-greater-r":
				ctx.drawImage(imgTrackWyeGreaterR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-sprung-l":
				ctx.drawImage(imgTrackWyeSprungL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-sprung-r":
				ctx.drawImage(imgTrackWyeSprungR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-prompt-l":
				ctx.drawImage(imgTrackWyePromptL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-prompt-r":
				ctx.drawImage(imgTrackWyePromptR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-random-l":
				ctx.drawImage(imgTrackWyeRandomL[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackwye-random-r":
				ctx.drawImage(imgTrackWyeRandomR[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackcross":
				var oriRot = (ori+4)%8; // this is to correct an error in the rendering angle
				ctx.drawImage(imgTrackCross[oriRot], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "trackblank":
				break;
			case "trackcargo":
				var oriRot = ori%2;
				ctx.drawImage(imgTrackCargo[oriRot], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "increment":
				ctx.drawImage(imgStationIncrement[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "decrement":
				ctx.drawImage(imgStationDecrement[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "add":
				ctx.drawImage(imgStationAdd[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "subtract":
				ctx.drawImage(imgStationSubtract[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "multiply":
				ctx.drawImage(imgStationMultiply[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "divide":
				ctx.drawImage(imgStationDivide[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "catapult":
				ctx.drawImage(imgStationCatapult[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "slingshot":
				ctx.drawImage(imgStationSlingshot[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "supply":
				ctx.drawImage(imgStationSupply[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "pickdrop":
				ctx.drawImage(imgStationPickDrop[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "dump":
				ctx.drawImage(imgStationDump[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "home":
				ctx.drawImage(imgStationHome[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "redtunnel":
				ctx.drawImage(imgRedTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "greentunnel":
				ctx.drawImage(imgGreenTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
				break;
			case "bluetunnel":
				ctx.drawImage(imgBlueTunnel[ori], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
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
			 	ctx.fillStyle = "gray";
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
			 	ctx.strokeStyle = "gray";
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
		if (!track) return;
		if (!track.type) return;
		var dif = (track.orientation - orientation + 8)%8;
		switch (track.type) {
			case "trackstraight":
				if (dif == 0 || dif == 4) return true;
				else return false;
			case "track90":
				if (dif == 2 || dif == 4) return true;
				else return false;
			case "track45":
				if (dif == 1 || dif == 4) return true;
				else return false;
			case "trackcross":
			case "trackbridge":
				if (dif == 0 || dif == 2 || dif == 4 || dif == 6) return true;
				else return false;
			case "trackwyeleft":
				if (dif == 2 || dif == 4 || dif == 0) return true;
				else return false;
			case "trackwyeright":
				if (dif == 6 || dif == 4 || dif == 0) return true;
				else return false;
			case "trackwye":
				if (dif == 6 || dif == 2 || dif == 4) return true;
				else return false;
			case "trackblank":
			case "trackcargo":
				return false;
			default:
				console.log("ERROR: trackConnect didn't detect track type. Type="+track.type);
				return false;
		}
	}
	
	function EC(gridx, gridy, type, orientation, state, speed, position) { //object representing an Engine or Car
		//this object is stored by JSON.stringify so no functions allowed in object
		this.gridx = gridx || 0; //integer. location of engine or car in grid coordinates
		this.gridy = gridy || 0; //integer. location of engine or car in grid coordinates
		this.type = type || "enginebasic";
		this.orientation = orientation || 0; //orientation when entering a track 0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SW, 6=W, 7=NW
		this.state = state || "";
		this.speed = speed || 0; //can be + or -. In millitiles/iteration
		this.position = position || 0.50; //position across tile in range of [0,1) with respect to orientation of engine. 0=begining, 1=end
		this.cargo = undefined;// a reference to a Cargo object carried by this EC
		this.immutable = false; //can this EC be deleted or changed type?
		this.tunnelfrom = []; //used to return EC to a tunnel. This is the (grid,gridy) of the tunnel that sent the EC 
		this.tunnelto = []; //used to return EC to a tunnel. This is the (grid,gridy) of the tunnel that the EC got sent to 

		if (type == "enginebasic") engines.push(this);
		else cars.push(this);
		
		return this;
	}

	function drawEC(ec) {  
		if (!ec) return;
		if (!tracks[mi(ec.gridx,ec.gridy)]) {
			alert ("Draw ec- Undefined track. gridx=" + ec.gridx + ", gridy=" + ec.gridy + " ec ori=" + ec.orientation);
			return;
		}
		var track=tracks[mi(ec.gridx,ec.gridy)];

		ctx.save();
		ctx.translate((0.5+ec.gridx)*tileWidth, (0.5+ec.gridy)*tileWidth*tileRatio); //center origin on tile
			
		//rotate tile
		ctx.rotate(ec.orientation * Math.PI/4);

		//calculate offset
		var offset = getOffset(ec);
		if (ec.orientation %4 == 0) {
			ctx.translate(offset.X*tileWidth, offset.Y*tileWidth*tileRatio);
		} else {
			ctx.translate(offset.X*tileWidth, offset.Y*tileWidth);
		}
			//console.log("offsetx="+offset.X+" y="+offset.Y);
		
		var type = getTypeForWye(ec, track);

		//rotate ec
		var rotation = 0;
		switch (type) {
			case "track90":
				if (ec.speed>=0) {
					if (ec.orientation != track.orientation) rotation = (Math.PI/2*ec.position); 
					else rotation = (-Math.PI/2*ec.position); 
				} else {
					if ((ec.orientation - track.orientation+8)%8 == 4) rotation = (-Math.PI/2*(1-ec.position)); 
					else rotation = (Math.PI/2*(1-ec.position));
				}
				break;
			case "track90right":
				if (ec.speed>=0) {
					if (ec.orientation != track.orientation) rotation = (-Math.PI/2*ec.position); 
					else rotation = (Math.PI/2*ec.position); 
				} else {
					if ((ec.orientation - track.orientation+8)%8 == 4) rotation = (Math.PI/2*(1-ec.position)); 
					else rotation = (-Math.PI/2*(1-ec.position));
				}
				break;
			case "track45":
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

		if (ec.type == "enginebasic") {
			ctx.rotate(-ec.orientation * Math.PI/4); //rotate back to normal
			var frame = (ec.orientation/8*imgEngine.length  + Math.round(rotation/(2*Math.PI/imgEngine.length)) +imgEngine.length)%imgEngine.length;
			ctx.drawImage(imgEngine[frame], -imgEngineWidth/2, -imgEngineWidth/2,imgTrackWidth,imgTrackWidth);
			//console.log("Draw engine frame="+frame);
					
		} else	if (ec.type == "carbasic") {
			ctx.rotate(-ec.orientation * Math.PI/4); //rotate back to normal
			var frame = (ec.orientation/8*imgCar.length*2  + Math.round(rotation/(2*Math.PI/imgCar.length/2)) +imgCar.length)%imgCar.length;
			ctx.drawImage(imgCar[frame], -imgCarWidth/2, -imgCarWidth/2,imgTrackWidth,imgTrackWidth);
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
		this.type = type || 0; //integer. Text name of type is cargoValues[type][0]. Index of cargoValues to type. One of predefined cargo types like cargoNumbers, cargoColors, cargoLowercase, cargoUppercase, cargoAfricanAnimals
	}
	
	function drawCargo(obj, rotation) { //draws cargo for obj= car or track. Animated is drawn on one pass because not relative to ctx translate/rotate
		if (obj == undefined || obj.cargo == undefined || obj.cargo.isanimating) return;
		
		//draws relative to current tile so after ctx has been translated and rotated to draw ec or tile
		var imgCargo = imgCargoNumbers;
//		console.log("OBBJJ=");
		//console.log(obj.cargo.type);
		//switch (obj.cargo.type[0]) {
		switch (cargoValues[obj.cargo.type][0]) {
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
			case "stuffedanimals":
				imgCargo = imgCargoStuffedAnimals;
				break;
			case "binary":
				imgCargo = imgCargoBinary;
				break;
			case "blocks":
				imgCargo = imgCargoBlocks;
				break;
			default:
				console.log ("ERROR-cargotype not found");
		}
		
		var value = obj.cargo.value;
		var frame = (obj.orientation/8*imgCargo[0].length  + Math.round(rotation/(2*Math.PI/imgCargo[0].length)) +imgCargo[0].length)%imgCargo[0].length;
		if (cargoValues[obj.cargo.type] == "dinosaurs") frame = (frame+32)%64; //flip dinos because rendered wrong
		if (obj.type == "trackcargo" || obj.type == "trackblank") frame = 16;
		
		ctx.drawImage(imgCargo[value][frame], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
	}

	function drawCargoAnimated(obj, rot) { //draws cargo for obj= car or track. Animated is drawn on one pass because not relative to ctx translate/rotate
		if (obj == undefined || obj.cargo == undefined || obj.cargo.isanimating != true) return;
		
		var rotation = 0;
		if (rot) rotation = rot; 
		
		var imgCargo = imgCargoNumbers;
		switch (cargoValues[obj.cargo.type][0]) {
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
			case "stuffedanimals":
				imgCargo = imgCargoStuffedAnimals;
				break;
			case "binary":
				imgCargo = imgCargoBinary;
				break;
			case "blocks":
				imgCargo = imgCargoBlocks;
				break;
			default:
				console.log ("ERROR-cargotype not found");
		}
		
		//animate cargo
		var xOffset = 0, yOffset = 0;
		var fraction = obj.cargo.animatedframes/obj.cargo.animatetotalframes;
		if (fraction>1) fraction = 1;
		var opacity = 1;
		if (obj.cargo && obj.cargo.animatetype == "supply") fraction = 1-fraction;
		xOffset = tileWidth*(obj.cargo.animateendobj.gridx - obj.cargo.animatestartobj.gridx) * fraction;
		yOffset = tileWidth*tileRatio*(obj.cargo.animateendobj.gridy - obj.cargo.animatestartobj.gridy) * fraction;
//		xOffset = tileWidth*zoomScale*(obj.cargo.animateendobj.gridx - obj.cargo.animatestartobj.gridx) * fraction;
//		yOffset = tileWidth*tileRatio*zoomScale*(obj.cargo.animateendobj.gridy - obj.cargo.animatestartobj.gridy) * fraction;
		obj.cargo.animatedframes++;
		
		if (obj.cargo.animatedframes > obj.cargo.animatetotalframes) {
			if (obj.cargo.animatetype == "dump" || obj.cargo.animatetype == "dump-poof") {
				if (obj.cargo.animatedframes > obj.cargo.animatetotalframes*2) {
					obj.cargo.isanimating = false;
					obj.cargo = undefined;
					return;
				} else {
					opacity = 1-(obj.cargo.animatedframes-obj.cargo.animatetotalframes)/obj.cargo.animatetotalframes; //fade once on station
//					console.log ("Opacity="+opacity);
				}
			} else { // for "move" and "supply"	
				obj.cargo.isanimating = false;
				if (obj.cargo.animatetype == "move" || obj.cargo.animatetype == "move-spin") { //???
					obj.cargo.animateendobj.cargo = obj.cargo;
					obj.cargo = undefined;
				} 
				return;
			}
		}
		
		var value = obj.cargo.value;
		//var endFrame = (obj.orientation/8*imgCargo[0].length  + Math.round(rotation/(2*Math.PI/imgCargo[0].length)) +imgCargo[0].length)%imgCargo[0].length;
		var endFrame = obj.cargo.animateendobj.orientation*8;
		if (cargoValues[obj.cargo.type] == "dinosaurs") endFrame = (endFrame+32)%64; //flip dinos because rendered wrong
		if (obj.cargo && (obj.cargo.animatetype == "dump" || obj.cargo.animatetype == "dump-poof")) endFrame = obj.cargo.animatestartobj.orientation*8;
		if (obj.cargo.animateendobj.type == "trackcargo" || obj.cargo.animateendobj.type == "trackblank") endFrame = 16;
		
		var startFrame = obj.cargo.animatestartobj.orientation*8;
		if (obj.cargo.animatestartobj.type == "trackcargo" || obj.cargo.animatestartobj.type == "trackblank") startFrame = 16;
		
		var frame = startFrame + Math.round(fraction*(endFrame-startFrame));
		if (obj.cargo && (obj.cargo.animatetype == "spin" || obj.cargo.animatetype == "move-spin")) frame = startFrame + Math.round(fraction*64);
		frame %=64;
//		console.log("Frame="+frame+" frac="+Math.round(fraction*64));
		
		if (obj.cargo.animatetype != "ontrackcargo") {
			ctx.save();
			var translateX=(0.5+obj.cargo.animatestartobj.gridx)*tileWidth+xOffset;
			var translateY=(0.5+obj.cargo.animatestartobj.gridy)*tileWidth*tileRatio+yOffset
//			var translateX=(0.5+obj.cargo.animatestartobj.gridx)*tileWidth*zoomScale+xOffset;
//			var translateY=(0.5+obj.cargo.animatestartobj.gridy)*tileWidth*tileRatio*zoomScale+yOffset
			ctx.translate(translateX, translateY); //center origin on tile
	    	ctx.globalAlpha = opacity;
	//		console.log("offset="+xOffset+","+yOffset+" opacity="+opacity+" translate="+translateX+","+translateY);
			if (obj.cargo.animatedframes > obj.cargo.animatetotalframes && obj.cargo.animatetype == "dump-poof") ctx.drawImage(imgPoof, -imgTrackWidth/2+15, -imgTrackWidth/2+10);
			else ctx.drawImage(imgCargo[value][frame], -imgTrackWidth/2, -imgTrackWidth/2,imgTrackWidth,imgTrackWidth);
	    	ctx.restore();
		}
	}
	
	function drawAllPoofs() {
		for (var i=0; i<poofs.length; i++) {
			var poof = poofs[i];
			ctx.save();
			var translateX=(0.5+poof.gridx)*tileWidth;
			var translateY=(0.5+poof.gridy)*tileWidth*tileRatio
			ctx.translate(translateX, translateY); 
	    	ctx.globalAlpha = 1 - poof.animatedframes / poof.animatetotalframes;
			ctx.drawImage(imgPoof, -imgTrackWidth/2+15, -imgTrackWidth/2+10);
	    	ctx.restore();
	    	poof.animatedframes++;
	    	if (poof.animatedframes > poof.animatetotalframes) {
	    		poofs.splice(i,1);
	    		poof = undefined;
	    	}
		}	
	}


///////////////////////////////////////	
	function getButton(name) { //returns button in toolbar with text name
		var toolButtons = getCurrentToolButtons();
	    
	    for (var i=0; i<toolButtons.length; i++) {
	  	    if (toolButtons[i].name == name) {
	  		    return toolButtons[i];
	  	    } 
	    }
	 	
	    console.log ("Button not found");
	    return undefined;
	}
	
	// mouse detection==
	$('#canvas').mousedown(function(e) {
        //console.log("MouseDown");
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop; //screen coordinates
        onClickDown(mouseX, mouseY, e);
	});	

    function onClickDown (mouseX, mouseY, e) { //for handling both mouse and touch events
    	var worldMouse = screenToWorld(mouseX, mouseY);
    	var screenMouse = worldToScreen(worldMouse.xtile, worldMouse.ytile);
//        console.log("onClickDown mouse="+mouseX+","+mouseY+" world="+worldMouse.xtile+","+worldMouse.ytile+" screenMouse="+screenMouse.x+","+screenMouse.y);
		if (interactionState == 'TitleScreen') {
			if (buttonDims['Levels'].inside(mouseX, mouseY)) {
				interactionState = 'Levels';
				draw();
			}	
			else if (buttonDims['Freeplay'].inside(mouseX, mouseY)) {
				interactionState = 'Freeplay';
				calculateLayout();
				draw();
			}	
			else if (buttonDims['HelloWorld'] && buttonDims['HelloWorld'].inside(mouseX, mouseY)) {
				console.log("Hello World"); 
				interactionState = 'Freeplay';
				openTrxJSON(decompress(trxHelloWorld));
				updateUndoHistory();
				buildTrains();
				pushPlayButton();
			}
			else if (buttonDims['About'].inside(mouseX, mouseY)) {
				ctx.fillStyle = aboutColor;
				ctx.fillRect (0,0,canvasWidth,0.63*canvasHeight);
				ctx.font = "20px Arial";
				ctx.textAlign = 'center'; 
				ctx.fillStyle = fontColor;
				text = '"Train" is a completely visual programming language to teach 2-6 year olds how to code.\n\nPrograms in Train look just like a wooden toy train set. Executing a program means starting\nthe engines and watching the trains move about the tracks. Each engine represents a seperate\nthread so a multithreaded program is just train tracks with multiple trains. Cars attached to an\nengine are variables/memory. Wooden blocks that rest on cars are the values of the variables.\nThere are several sets of wooden blocks that represent different data types in Train including\nnumbers, colors, letters, binary, and dinosaurs. Program control is provided by forks ("wyes")\nand physcial loops in the track which implement if/then and while/loop logic. Stations in Train\nallow wooden blocks to be operated on including adding a value to memory (adding a block to\na car), freeing memory (removing a block from a car), incrementing, decrementing, addition,\nsubtraction, multiplication, and division. Wyes include greater than, less than, lazy, sprung,\nprompt, and random. Slingshot and catapult station remove blocks from cars and place them\non the ground as a form of output. "Magic" tunnels act as goto statements allowing for the creation\nof functions. Programs are created in Train by simply drawing them on the screen--drawing tracks\nand wyes and placing engines, cars, cargo, and stations.';
				var lineHeight = ctx.measureText("M").width * 1.35;
				var lines = text.split("\n");
				var x=canvasWidth/2, y=canvasHeight*0.1;
				for (var i = 0; i < lines.length; ++i) {
				    ctx.fillText(lines[i], x, y);
				    y += lineHeight;
				}
				ctx.fillStyle = "blue";
				y += 15;
				ctx.fillText('"Hello World"', x, y);
				buttonDims['HelloWorld'] = new box(x, y, 100, 20);
			}	
		} else if (interactionState == 'Levels') {
			// loop through button positions to see if clicked in button
			for (i=1; i<trainerLevelNames.length; i++) {
				index = trainerLevelNames[i];
				if (buttonDimLevels[index].inside(mouseX, mouseY)) {
					if (!trainerLevelLocked[index] || debugMode) {
						currentTrackSet = index;
						interactionState = 'Choose track';
						draw();
					}
				}
			}
			if(buttonDimLevels['Levels-back'].inside(mouseX, mouseY)) {
				interactionState = 'TitleScreen';
				draw();
			}
		} else if (interactionState == 'Choose track') {
			// loop through button positions to see if clicked in button
			for (i=1; i<11; i++) {
				index = "track "+ i;
				if (buttonDimLevels[index].inside(mouseX, mouseY)) {
					text = currentTrackSet + "-" + i; 
					if (unlockedTrx[text] || debugMode) {
						currentTrackNumber = i;
						interactionState = 'Try level';
						calculateLayout();
						console.log("Open set="+currentTrackSet+" numbree="+currentTrackNumber);
						openTrxJSON(decompress(trxLevels[currentTrackSet][currentTrackNumber]));
						buildTrains();
						draw();
						pushPlayButton();
					}
				}
			}
			if(buttonDimLevels['Levels-back'].inside(mouseX, mouseY)) {
				interactionState = 'Levels';
				draw();
			}
		} else if (interactionState == 'StarScreen') {
			if (buttonDims['Try again'].inside(mouseX, mouseY)) {
				console.log ("Try again");
				interactionState = "Try level";
				openTrxJSON(decompress(trxLevels[currentTrackSet][currentTrackNumber]));
				buildTrains();
				draw();
				getButton("Play").down=false;	
				pushPlayButton();
			} else if (buttonDims['Next track'].inside(mouseX, mouseY)) {
				console.log("Next track");
				interactionState = "Try level";
				currentTrackNumber++;
				if (trxLevels[currentTrackSet][currentTrackNumber]) {
					openTrxJSON(decompress(trxLevels[currentTrackSet][currentTrackNumber]));
					buildTrains();
					draw();
					getButton("Play").down = false;
					pushPlayButton();
				} else {
					interactionState = 'Levels';
					draw();
				}
			} else if (buttonDims['Back'].inside(mouseX, mouseY)) {
				interactionState = 'Levels';
				draw();
			}
		} else if (modalTrack) { //detect clicks for choosing wye prompt direction 
			console.log("Click down for promt");	
			worldMouse.xtile -= 0.5;
			worldMouse.ytile -= 0.5;
			var angle = (10+8/(2*Math.PI)*Math.atan2 (modalTrack.gridy-worldMouse.ytile, modalTrack.gridx-worldMouse.xtile)-modalTrack.orientation)%8;	
			//console.log ("angle="+angle+" modalY="+modalTrack.gridy+" mouseY="+worldMouse.ytile+" modalX="+modalTrack.gridx+" mouseX="+worldMouse.xtile);	
			//console.log ("anlge="+angle+" ori="+modalTrack.orientation);
			if (angle > 4)  modalTrack.state = "right";
			else modalTrack.state = "left";
			modalTrack = undefined;
			interval = setInterval(interpretAndDraw, 20);			
        } else if (showToolBar) { //freeplay
        	if (shiftIsPressed) {
        		isPanning = true;
        		panStartX = mouseX;
        		panStartY = mouseY;
        		startCenterTileX = centerTileX;
        		startCenterTileY = centerTileY;
        	} else if (optionIsPressed) {
        		console.log("Start zoom");
        		isZooming = true;
        		zoomStartX = mouseX;
        		zoomStartY = mouseY;
        		startZoomScale = zoomScale;
 				e.target.style.cursor = 'zoom-in';
       		} else {
       			//console.log("mouseX="+mouseX+","+mouseY);
			    var mouseYWorld = mouseY*tileRatio; //world coordinates
				
				//see if clicked in button caption (button caption is a caption balloon that pops up from button in button bar)
				if (currentCaptionedButton != undefined) {	
			    	if (mouseX > buttonCaptionX && mouseX < (buttonCaptionX+3*tileWidth) && mouseYWorld > buttonCaptionY && mouseYWorld < (buttonCaptionY+3*tileWidth)) {
			    		//inside caption
			    		var nBin = 3*Math.floor((mouseYWorld-buttonCaptionY)/tileWidth) + Math.floor((mouseX-buttonCaptionX)/tileWidth);
			    		console.log ("Clicked in button caption. bin=" + nBin);
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
			    if (mouseX < tracksWidth && mouseY < tracksHeight) { //in track space
			    	var worldMouse = screenToWorld(mouseX, mouseY);
	       			var screenMouse = worldToScreen(worldMouse.xtile, worldMouse.ytile);
		  			startXPoint = mouseX;
		  			startYPoint = mouseY;
			    	
			    	//check if track button down
			    	if (getButton("Track").down) {
			    		isDrawingTrack = true;
			    		addPointTrack(worldMouse.xtile, worldMouse.ytile);
			    	}
			    	
			    	//check if engine button down
			    	if (getButton("Engine").down) {
			    		isDrawingEngine = true;
			    		addPointEC(worldMouse.xtile, worldMouse.ytile);
			    	}
			    	
			    	//check if select button down
			    	if (getButton("Select")) if (getButton("Select").down) {
			    		console.log("Select button down----");
			   			if (worldMouse.xtile>Math.min(startSelectXTile, endSelectXTile) && worldMouse.ytile*zoomScale>Math.min(startSelectYTile, endSelectYTile)
			   			   && worldMouse.xtile<Math.max(startSelectXTile, endSelectXTile) && worldMouse.ytile<Math.max(startSelectYTile, endSelectYTile)) {
			   				//move current selection
			   				console.log("In selection. Move");
				    		isMoving = true;
				    		startMoveXTile = worldMouse.xtile;
				    		startMoveYTile = worldMouse.ytile;
			   				
			   			} else { 
			   				//start new selection
				    		isSelecting = true;
				    		startSelectXTile = Math.round(worldMouse.xtile);
				    		startSelectYTile = Math.round(worldMouse.ytile);
				    		console.log("startSelectXTile="+startSelectXTile+","+startSelectYTile);
//				    		startSelectXTile = tempPointScreen.x;
	//			    		startSelectYTile = tempPointScreen.y;
			    		}
			    	} 
			    	
			    	//check if car button down
			    	if (getButton("Car").down) {
			    		isDrawingCar = true;
			    		addPointEC(worldMouse.xtile, worldMouse.ytile);
			    	}
			    	
			    	//check if cargo button down
			    	if (getButton("Cargo").down && currentCaptionedObject == undefined) {
						var worldPoint = screenToWorld(mouseX, mouseY); 
						var gridx = Math.floor(worldPoint.xtile); 
						var gridy = Math.floor(worldPoint.ytile);
		                console.log("gridx="+gridx+" gridy"+gridy);
			    		if (tracks[mi(gridx,gridy)] == undefined || tracks[mi(gridx,gridy)] == null) {
				    		//if no track at that location then add TrackBlank with "A"
			    			console.log("Empty grid, add blank Track");
			    			new Track(gridx, gridy, "trackblank");
			    			tracks[mi(gridx,gridy)].cargo = new Cargo(0,1);
		                    updateUndoHistory();
		                    //console.log("DRAW");
		                    draw();
		                }
			    		
			    		
			    	}
			    	
			    	//check if erase button down
			    	if (getButton("Eraser") && getButton("Eraser").down) {
			    		if (!commandIsPressed) {
				    		isErasing = true;
							var worldPoint = screenToWorld(mouseX, mouseY); 
							var gridx = Math.floor(worldPoint.xtile); 
							var gridy = Math.floor(worldPoint.ytile);
				    		//console.log("gridx="+gridx+" gridy="+gridy);
							var train;
							
							//delete clicked engine
				    		for (var i=0; i<engines.length; i++) {
				    			if (engines[i].gridx == gridx && engines[i].gridy == gridy && !engines[i].immutable) {
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
				    			if (cars[i].gridx == gridx && cars[i].gridy == gridy && !cars[i].immutable) {
				    				if (cars[i].cargo == null) {
					    				console.log("Delete car i=" + i);
					    				train = getTrain(cars[i]);
					    				//console.log("Deleted car is in train of length="+train.length);
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
			    					if (train[t].type != "enginebasic") {
				    					if (train[t].speed < 0) reverseSpeed(train[t]);
				    					train[t].speed = 0;
			    					}
			    				}
			    				
			    				buildTrains(); 
			    				draw();
			    			}
			    		} else { //command is click so toggle track immutable
							var worldPoint = screenToWorld(mouseX, mouseY); 
							var gridx = Math.floor(worldPoint.xtile); 
							var gridy = Math.floor(worldPoint.ytile);
			    			if (tracks[mi(gridx,gridy)]) {
			    				console.log("Make immutable");
			    				tracks[mi(gridx,gridy)].immutable = !tracks[mi(gridx,gridy)].immutable;
			    			}
			    			draw();
			    		}
			    	}
			    } else { // in toolBar
			    	//deselect track area captions
			    	currentCaptionedObject = undefined;
			    	secondaryCaption = undefined;
			    	endSelectXTile = startSelectXTile;
			    	endSelectYTile = startSelectYTile;
			    	
				    //check if buttons clicked
				    var pushedButton;
					var toolButtons = getCurrentToolButtons();
	
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
							var iframeBrowse = parent.document.getElementById('browseframeid');
							if (iframeBrowse) {
								iframeBrowse.height = 750;
								var iframeTrain = parent.document.getElementById('trainframeid');
								if (iframeTrain) iframeTrain.height = 0;
							} else {
								downloadTrackDialog();
							}
				  			break;
				  		case "Clear":
				  			//tracks.length=0;
		                    tracks = {};//createArray(trackArrayWidth, trackArrayHeight);
				  			engines.length = 0;
				  			cars.length = 0;
				  			trains.length = 0;
				  			captionX = undefined;
				  			secondaryCaption = undefined;
				  			draw();
				  			break;
				  		case "Home":
				  			getButton("Play").down = false;
							clearInterval(interval);
				  			interactionState = 'TitleScreen';
				  			draw();
				  			break;
				  		case "Write":
				  			writeTrx();
				  			break;
				  		case "Octagon":
				  			getButton("Octagon").down = !getButton("Octagon").down;
				  			useOctagons = getButton("Octagon").down;
				  			break;
				  		case "Signin":
				  			signinUserDialog();
				  		default:
				  			console.log("button not found");
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
			}
		} else { //if toolbar hidden then toggle play trains for any click
        	console.log("Push play button");
        	pushPlayButton();
        }
	}
	
	function pushPlayButton() {
		if (getButton("Play").down) {
			playSound("stop");
			clearInterval(interval);
		} else {
			updateUndoHistory();
			clearInterval(interval);
			playSound("choochoo");
			skip = 10;
			var d = new Date();
			startTimePlay = d.getTime();
			interval = setInterval(interpretAndDraw, 20);
		}
		getButton("Play").down = !getButton("Play").down; // toggle state
	}	
	
	function getCurrentToolButtons() {
		var retValue;
	    if (interactionState == 'Freeplay') retValue = toolButtonsFreeplay;
	    else retValue = toolButtonsLevels;
	    
	    return retValue;
	}	
	
	$('#canvas').mousemove(function(e){
    //console.log("Mousemove");
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop;
        onClickMove(mouseX,mouseY, e);
	});
        
    function onClickMove(mouseX,mouseY, e) { //for mouse move or touch move events
        if (!showToolBar) return; //if toolbar hidden then ignore events
		var worldMouse = screenToWorld(mouseX,mouseY);
        
	    //change mouse cursor
        if (e) if (mouseX<tracksWidth)  { // in track area
	    	if (getButton("Engine").down || getButton("Track").down) {
	   			e.target.style.cursor = 'crosshair';
			} else if (getButton("Eraser").down) {
	   			e.target.style.cursor = 'no-drop';
	   		} else if (!isSelecting) {
	   			if (worldMouse.xtile>Math.min(startSelectXTile, endSelectXTile) && worldMouse.ytile>Math.min(startSelectYTile, endSelectYTile)
	   		          && worldMouse.xtile<Math.max(startSelectXTile, endSelectXTile) && worldMouse.ytile<Math.max(startSelectYTile, endSelectYTile)) {
	   				e.target.style.cursor = 'move';
	   				allTilesDirty = true;
	   			} else {
	   				e.target.style.cursor = 'default';
	   			}	
	   		} else if (isMoving) {
	   			e.target.style.cursor = 'move';
	   			allTilesDirty = true;
		   	} else {
	   			e.target.style.cursor = 'default';
		   	}
	    } else {
   			e.target.style.cursor = 'default';
	    }

		if (isZooming || optionIsPressed) {
			e.target.style.cursor = 'zoom-in';
   			allTilesDirty = true;
		}
		if (isPanning || shiftIsPressed) {
			 e.target.style.cursor = 'move';
   			allTilesDirty = true;
			}
		
	    if (mouseX < tracksWidth && mouseY < tracksHeight) {
	    	if (isDrawingTrack) {
	    		addPointTrack(worldMouse.xtile, worldMouse.ytile);
	    	}
	    	
	    	if (isDrawingEngine || isDrawingCar) {
	    		addPointEC(worldMouse.xtile, worldMouse.ytile);
	    	}
	    	
       		if (isPanning) {
       			centerTileX = startCenterTileX - (mouseX-panStartX)/tileWidth;
       			centerTileY = startCenterTileY - (mouseY-panStartY)/(tileWidth*tileRatio);
       			draw();
       			return;
       		}
 	    	if (isZooming) {
	    		zoomScale = startZoomScale * Math.pow(zoomMultiplier, 10*(zoomStartY - mouseY)/canvasHeight);
	    		if (zoomScale<0.2) zoomScale = 0.2;
	    		if (zoomScale>5) zoomScale = 5;
	    		draw();
	    		return;	
	    	}
	    	
	    	if (isSelecting) {
	    		endSelectXTile = worldMouse.xtile;
	    		endSelectYTile = worldMouse.ytile;
	    		draw();
	    	}
	    	
	    	if (isMoving) {
	    		endMoveXTile = worldMouse.xtile;
	    		endMoveYTile = worldMouse.ytile;
	    		draw();
	    	}
	    	
	    	if (isErasing) {
				var worldPoint = screenToWorld(mouseX, mouseY); 
				var gridx = Math.floor(worldPoint.xtile); 
				var gridy = Math.floor(worldPoint.ytile);
	    		var ecDel = getEC(gridx, gridy);
	    		var redraw = false;
	    		if (ecDel) {
	    			deleteEC(ecDel); 
	    			redraw = true;
	    		}
	    		if (tracks[mi(gridx,gridy)]) if (!tracks[mi(gridx,gridy)].immutable) {
	    			delete tracks[mi(gridx,gridy)]; 
	    			redraw = true;
	    		}
	    		if (redraw) draw();
	    	}
	    }
	}
	   
	$('#canvas').mouseup(function(e){
	    var mouseX = e.pageX - this.offsetLeft;
	    var mouseY = e.pageY - this.offsetTop;
        onClickUp(mouseX, mouseY, e);
	});
    
    function onClickUp(mouseX, mouseY, e) {
//        console.log ("onClickUp");
		allTilesDirty = true;
        if (!showToolBar) return; //if toolbar hidden then ignore events
		isPanning = false;
		isZooming = false;
		
		var mouseWorld = screenToWorld(mouseX, mouseY);
		lastClickUp = mouseWorld;

	    if (mouseX < tracksWidth && mouseY < tracksHeight) { //in track space
	    	var distanceSq = Math.pow((startXPoint-mouseX),2) + Math.pow((startYPoint-mouseY),2);
	    	if (distanceSq<10) { //select object for caption if mouse up near mouse down
				var gridx = Math.floor(mouseWorld.xtile); 
				var gridy = Math.floor(mouseWorld.ytile);
	    		
	    		if ((secondaryCaption) && captionSecondaryX !=undefined && gridx >= captionSecondaryX && gridx< captionSecondaryX+3 && gridy >= captionSecondaryY && gridy< captionSecondaryY+3) {
    				//clicked in secondary caption ***********************
    				//console.log ("Clicked in secondary caption bubble");
					var worldPoint = screenToWorld(mouseX, mouseY); 
					var fracX = (worldPoint.xtile- (captionSecondaryX+0.1))/(captionSecondaryWidth-0.2); //account for for border then divide
					var fracY = (worldPoint.ytile- (captionSecondaryY+0.1))/(captionSecondaryHeight-0.2);
					//get cargo subarray
					var iCargo;
					for (var i=0; i<cargoValues.length; i++) {
						//console.log("cv="+cargoValues[i][0]+" sct="+secondaryCaption.type);
						if (cargoValues[i][0] == secondaryCaption.type) iCargo = i;
						//console.log ("cargovalue="+cargoValues[i][0]+" i="+i);
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
					currentCaptionedObject.cargo = new Cargo(i,iCargo); 
					updateUndoHistory();
					secondaryCaption = undefined;
					captionX = undefined;
					currentCaptionedObject = undefined;
					//console.log("SEC HERE");
					//console.log(captionX);
    			} else {
    				secondaryCaption = undefined;
					captionSecondaryX = undefined;
					////////
    			
    			
					if (captionX !=undefined && gridx >= captionX && gridx< captionX+captionWidth && gridy >= captionY && gridy< captionY+captionHeight) {
						//clicked in caption (primary) *******************
						var worldPoint = screenToWorld(mouseX, mouseY); 
						var fracX = (worldPoint.xtile- (captionX+0.1))/(captionWidth-0.2);
						var fracY = (worldPoint.ytile- (captionY+0.1))/(captionHeight-0.2);
					
						//which caption was cliked in
					// console.log("Captioned object="+currentCaptionedObject.type);
						switch (currentCaptionedObject.type) {
							case "enginebasic":
								//adjust speed
								fracX = (worldPoint.xtile-captionX)/captionWidth;
								fracY = (worldPoint.ytile-captionY)/captionHeight;
								var angle = Math.atan2(fracY-0.8,fracX-0.5);
								if (angle>1) angle = -Math.PI;
								var speed = (2*angle/Math.PI+1)*maxEngineSpeed;
								speed = Math.min(speed, maxEngineSpeed);
								speed = Math.max(speed, -maxEngineSpeed);
								speed = (maxEngineSpeed/(nNumSpeeds/2))*Math.round(speed/(maxEngineSpeed/(nNumSpeeds/2)));
								//console.log("Speed="+speed);
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
							case "carbasic":
							case "trackblank":
							case "trackcargo":
								var row = Math.floor(fracY*buttonsCargoTypes.length);
								var col = Math.floor(fracX*buttonsCargoTypes[row].length);
	//    						currentCaptionedObject.subtype = buttonsCargoTypes[row][col];
								secondaryCaption = {
									'type': buttonsCargoTypes[row][col],
									'X': mouseX,
									'Y': mouseY/tileRatio
								};
								break;
							case "trackstraight":
								var row = Math.floor(fracY*buttonsStation.length);
								var col = Math.floor(fracX*buttonsStation[row].length);
								currentCaptionedObject.subtype = buttonsStation[row][col];
								if (!(currentCaptionedObject.subtype == "redtunnel" ||
									currentCaptionedObject.subtype == "bluetunnel" ||
									//currentCaptionedObject.subtype == "increment" ||
									//currentCaptionedObject.subtype == "decrement" ||
									currentCaptionedObject.subtype == "greentunnel"))
										addTrackCargo(currentCaptionedObject);
								break;
							case "trackwye":
							case "trackwyeleft":
							case "trackwyeright":
								var row = Math.floor(fracY*buttonsWye.length);
								var col = Math.floor(fracX*buttonsWye[row].length);
								currentCaptionedObject.subtype = buttonsWye[row][col];
								if (currentCaptionedObject.subtype  == "compareless"
								|| currentCaptionedObject.subtype  == "comparegreater" ) {
									addTrackCargo(currentCaptionedObject);
								}
								break;
						}
							
					} else if (secondaryCaption == undefined) { //select object for new caption *****************
						//console.log("Select object for new caption. objecttype="+tracks[mi(gridx,gridy)].type);
						currentCaptionedObject = undefined;

						//see if clicked engine or car
						var foundEC = false;
						if (getButton("Eraser")) if (!getButton("Eraser").down) {
							captionX = undefined;
							currentCaptionedObject = getEC(gridx, gridy); 
							if (currentCaptionedObject != undefined) foundEC = true;
						}
						
						//see if clicked track
						if (!getButton("Eraser").down && !foundEC ) {
							if (tracks[mi(gridx,gridy)] != undefined) {
								if (tracks[mi(gridx,gridy)].type == "trackwye" || tracks[mi(gridx,gridy)].type == "trackwyeleft" 
								|| tracks[mi(gridx,gridy)].type == "trackwyeright" || tracks[mi(gridx,gridy)].type == "trackstraight"
								|| tracks[mi(gridx,gridy)].type == "trackcargo"|| tracks[mi(gridx,gridy)].type == "trackblank") {
									currentCaptionedObject = tracks[mi(gridx,gridy)];
									captionX = undefined;
									console.log("Captioned object="+tracks[mi(gridx,gridy)]+" xy="+gridx+","+gridy);
								}
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
    		//console.log("Drawing engine");
    		//make engine at startpoint in direction from down to up

    		if (startXPoint != undefined) {
    			//var startWorldPoint = screenToWorld(mouseX,mouseY); 
    			var startXTile = Math.floor(mouseWorld.xtile); 
    			var startYTile = Math.floor(mouseWorld.ytile);
    			var distSq = Math.pow((startXPoint-mouseX),2) + Math.pow((startYPoint-mouseY),2);
//    			console.log ("distSq=" + distSq + "Make new engine at x=" + startXTile + " y=" + startYTile + " orientation=" + orientation + " fraction=" + fraction);
				if (tracks[mi(startXTile,startYTile)] && distSq>10 /* && 
				(tracks[mi(startXTile,startYTile)].type == "trackstraight" ||
				 tracks[mi(startXTile,startYTile)].type == "track45" ||
				 tracks[mi(startXTile,startYTile)].type == "track90" ||
			tracks[mi(startXTile,startYTile)].type == "trackcross")*/) {
	    			var fraction = Math.atan2(mouseY-startYPoint, mouseX-startXPoint)/(2*Math.PI) + 0.25;
	    			var orientation = Math.round(8*fraction+8)%8;
	    			if (trackConnects(tracks[mi(startXTile,startYTile)], (orientation+4)%8)) {
	    				if (getEC(startXTile, startYTile) == undefined) { //dont put ec on top of current ec
							if (isDrawingEngine) new EC(startXTile, startYTile, "enginebasic", orientation, "", 20, 0.5);
							if (isDrawingCar) new EC(startXTile, startYTile, "carbasic", orientation, "", 0, 0.5);
							updateUndoHistory();
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
    		endSelectXTile = Math.round(mouseWorld.xtile);
    		endSelectYTile = Math.round(mouseWorld.ytile);
    		draw();
   			if (e) {
   				if (mouseWorld.xtile>Math.min(startSelectXTile, endSelectXTile) 
	   			 && mouseWorld.ytile>Math.min(startSelectYTile, endSelectYTile)
	   			 && mouseWorld.xtile<Math.max(startSelectXTile, endSelectXTile)
	   			 && mouseWorld.ytile<Math.max(startSelectYTile, endSelectYTile))
 	  			  e.target.style.cursor = 'move';
 	  		}
    	}
    	
    	if (isMoving) {
    		endMoveXTile = mouseWorld.xtile;
    		endMoveYTile = mouseWorld.ytile;
    		moveX = undefined
			isMoving = false;
			
			//copy tracks and ecs
			var upperLeftSelectXTile = Math.round(Math.min(startSelectXTile, endSelectXTile)); 
			var upperLeftSelectYTile = Math.round(Math.min(startSelectYTile, endSelectYTile));
			var lowerRightSelectXTile = Math.round(Math.max(startSelectXTile, endSelectXTile)); 
			var lowerRightSelectYTile = Math.round(Math.max(startSelectYTile, endSelectYTile));
    		console.log("IsMoving copy: start gridx="+upperLeftSelectXTile+" y="+upperLeftSelectYTile+" end select grix="+lowerRightSelectXTile+","+lowerRightSelectYTile);
	    	for (gridx= upperLeftSelectXTile; gridx<lowerRightSelectXTile; gridx++) {
		    	for (gridy= upperLeftSelectYTile; gridy<lowerRightSelectYTile; gridy++) {
		    		//copy track 
		    		var track = tracks[mi(gridx,gridy)];
		    		console.log("COpy tracl at "+gridx+", "+gridy);
		    		if (track) {
		    			console.log("endMoveXTile="+endMoveXTile+ " stMvX="+startMoveXTile);
		    			console.log("New track at "+ gridx+Math.round(endMoveXTile-startMoveXTile)+", "+gridy+Math.round(endMoveYTile-startMoveYTile));
		    			var newTrack = new Track ( gridx+Math.round(endMoveXTile-startMoveXTile), gridy+Math.round(endMoveYTile-startMoveYTile), track.type, track.orientation, track.state, track.subtype);
		    			newTrack.cargo = track.cargo;
		    			buildTrains();
		    		}
		    		// delete any ECs for which new track is placed on top of
		    		var ecOld =getEC(gridx+Math.round(endMoveXTile-startMoveXTile), gridy+Math.round(endMoveYTile-startMoveYTile));
					if (ecOld) deleteEC(ecOld); // delete any ECs for which new track is placed on top of
		    		//copy EC
		    		var ec=getEC(gridx,gridy);
		    		if (ec) {
		    			var newEC = new EC (gridx+Math.round(endMoveXTile-startMoveXTile), gridy+Math.round(endMoveYTile-startMoveYTile), ec.type, ec.orientation, ec.state, ec.speed, ec.position);
		    			newEC.cargo = ec.cargo; //copy cargo
		    		}
		    	}
	    	}
			updateUndoHistory();			
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
		cargoTrack = tracks[mi(track.gridx+step.stepX,track.gridy+step.stepY)];
		if (cargoTrack &&	cargoTrack.type == "trackcargo") return;
		
		if (cargoTrack && track.type == "trackstraight") {
			 if (!tracks[mi(track.gridx-step.stepX,track.gridy-step.stepY)]) { //blocked in one way but not other so rotate and new trackcargo
				track.orientation = (track.orientation +4)%8;// rotate track
				new Track(track.gridx-step.stepX, track.gridy-step.stepY, "trackcargo");
				console.log("Rotate track then new cargo");
			} else if (tracks[mi(track.gridx-step.stepX,track.gridy-step.stepY)].type == "trackcargo") { //blocked in one way and trackcargo in other way so rotate and reuse trackcargo
				track.orientation = (track.orientation +4)%8;// rotate track
				console.log("Rotate track then reuse cargo");
			} else {  //blocked both ways so make new trackcargo to replace something else
				new Track(track.gridx+step.stepX, track.gridy+step.stepY, "trackcargo");
				console.log("new track cargo");
			}
		} else { //make new TrackCargo over empty spot
			new Track(track.gridx+step.stepX, track.gridy+step.stepY, "trackcargo");
			console.log("new track cargo");
		} 		
	}
	
	function getTrackCargoStep(track) { //used for getting cargo from TrackCargo tiles to be used for adjacent wyes and stations. Returns the displacement of the cargo tile compared to the wye or station
		if (!track) console.log("ERROR- track is null for cargo. Track at "+track.gridx+" ,"+track.gridy);
		var dif = 6; //rotate differently depending on track type
		switch (track.type) {
			case "trackwyeright":
				dif = 2;
				break;
			case "trackwye":
				dif = 4;
				break;
		}
		var angle = ((tracks[mi(track.gridx,track.gridy)].orientation + 2 + dif) %8)*Math.PI/4;
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
				
				if (ec) if (ec.type != "enginebasic") {
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
			} while (ec && train.length < 200 && ec.type != "enginebasic")  //max train length of 200 to prevent circular trains causing infinite loop

			//step backwards from engine and add adjacent cars to train	
			var ec = engines[i];
			do {
				//get ec at previous position
				if (ec.speed>=0) prev = getPreviousTrack(ec);
				else prev = getNextTrack(ec);
//				console.log("prevx="+prev.gridx+" prevy="+prev.gridy+" ori="+ec.orientation+" speed="+ec.speed);
				ec = getEC(prev.gridx, prev.gridy);
				
				if (ec) if (ec.type != "enginebasic")  {
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
			} while (ec && train.length < 200 && ec.type != "enginebasic")  //max train length of 200 to prevent circular trains causing infinite loop

		}
	}
	
    function doOnOrientationChange() {
        calculateLayout();
        draw();
    }

	function doMouseWheel(e)  {
		console.log ("MOuse Wheel");
	}
	
    function doTouchStart(e) {
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
        var x = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser
        var y = parseInt(touchobj.clientY) // get y position of touch point relative to top edge of browser
        console.log("TOUCH start!!!! x="+x+" y="+y);
        e.preventDefault();
        onClickDown(x, y, e);
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
    //	if (resizeCanvas) {
	        windowWidth = window.innerWidth; //maximize canvas to screen or device
	        windowHeight = window.innerHeight;
	        pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device
	        console.log ("width="+windowWidth+" height="+windowHeight+" ratio="+pixelRatio);
	        canvas.width = windowWidth;// * pixelRatio;   /// resolution of canvas
	        canvas.height = windowHeight;// * pixelRatio;
	        canvas.style.width = windowWidth + 'px';   /// CSS size of canvas
	        canvas.style.height = windowHeight + 'px';
	  //  }
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        toolBarHeight = canvasHeight; //height of toolbar in pixels
        if (!showToolBar) {
        	toolBarHeight = 0;
        }
        tracksWidth = canvasWidth-getToolBarWidth(); //width of the tracks area in pixels
        tracksHeight = canvasHeight; //height of the tracks area in pixels
//        numTilesX = Math.floor(tracksWidth/tileWidth);
//        numTilesY = Math.floor(tracksHeight/tileRatio/tileWidth);
    }
    
    function getToolBarWidth () {
    	if (!showToolBar) return 0;
    	if (interactionState == "Freeplay") return toolBarWidthFreeplay
    	
    	return toolBarWidthLevels;
    }
    
	//////////////////////
	function draw() {
		if (modalTrack) {
			return;
		}
		
		if (interactionState == 'TitleScreen') {
			drawTitleScreen();
			return;
		}        
	
		if (interactionState == 'Levels') {
			drawButtonScreen();
			return;
		}        
	
		if (interactionState == 'Choose track') {
			drawButtonScreen();
			return;
		}        
	
		//add background texture
//        ctx.save();
//		ctx.scale(zoomScale, zoomScale);
		//ctx.drawImage(imgTerrain,0,0,canvasWidth,canvasHeight);
 //       ctx.restore();
        
        ctx.save();
        //goal is to put centerTileX,centerTileY at tracksWidth/2, canvasHeight/2
//		if (getButton("Track").down || getButton("Cargo").down || getButton("Select").down) drawGrid();
        var screenCenter = worldToScreen(centerTileX, centerTileY);
//		ctx.translate(screenCenter.x-centerTileX*tileWidth*zoomScale*zoomScale, screenCenter.y-centerTileY*tileWidth*tileRatio*zoomScale*zoomScale);
		ctx.translate(screenCenter.x-centerTileX*tileWidth*zoomScale, screenCenter.y-centerTileY*tileWidth*tileRatio*zoomScale);
		ctx.scale(zoomScale, zoomScale);

		//if (getButton("Track").down || getButton("Cargo").down || getButton("Select").down) drawGrid();

		// draw all currently visible tiles (must redraw all because have to redraw from top to bottom because of overlap)
		var upperLeftWorld = screenToWorld(0, 0);
		var lowerRightWorld = screenToWorld(tracksWidth, canvasHeight);
		for (var i=upperLeftWorld.xtile; i<=lowerRightWorld.xtile+1; i++) {
			for (var j=upperLeftWorld.ytile; j<=lowerRightWorld.ytile+1; j++) {
				drawTrack(tracks[mi(Math.floor(i),Math.floor(j))]);
			}
		}	

		drawGrid();
		
		drawSquares();
		drawAllTracks();
		drawAllEnginesAndCars();
		drawAllTunnels();
		drawAllCargoAnimated();
		drawAllPoofs();
		
		if (showToolBar) {
			drawCaption();
			drawSecondaryCaption();
		}
		
        ctx.restore();
//		drawAllCargoAnimated();

		if (showToolBar) { //toolbar doesn't zoom
			drawSelection();
			drawPathEC();
			drawPathTrack();
			drawToolBar();
			drawButtonCaption();
		}
		
		if (interactionState == 'StarScreen') {
			drawStarScreen();
		}
		
	}
	
	function interpretAndDraw() {
		interpretAll();
		detectCrashes();
		detectStations();
		draw();
	}

	draw(); //draw scene before play button pressed first time
	
	function drawStarScreen() {  //draw popup screen showing score, number of stars, success/failure, try again/next
//		console.log ("Draw star screen"); 
		x = canvasWidth/2; //center of popup
		y = canvasHeight/2;
		width = canvasWidth*0.7;
		height = canvasHeight*0.4;

		//draw badge
		if (currentTrackNumber == 10 && currentTrackScore > 0) {
			//console.log ("Draw badge");
			y = canvasHeight * 0.35;
			ctx.fillStyle = starColor;
			ctx.fillRect(x-width/2,y+height*0.7,width,height*0.3);
			ctx.font = "bold 28px Arial";
			ctx.fillStyle = fontColor;
			ctx.textAlign = 'center';
			ctx.fillText("Congratulations! You are now a "+currentTrackSet, x, y+0.85*height);
			ctx.drawImage (imgBadgeIcon, x- imgBadgeIcon.width/2-width*0.55, y+height*.5);
		}

		var highScore = 0;
		text = "highscore-" + currentTrackSet + "-" + (currentTrackNumber);
//		console.log ("textHS="+text);
		if (localStorage.getObject(text)) highScore = localStorage.getObject(text);
//		console.log("current="+currentTrackScore+" HS="+highScore);
		if (currentTrackScore > highScore) {
			console.log("New high score");
			newHighScore = true;
			highScore = currentTrackScore;
			localStorage.setObject(text, currentTrackScore);
		} 
		ctx.fillStyle = starColor;
		ctx.fillRect(x-width/2,y-height/2,width,height);
		
		ctx.font = "32px Arial";
		ctx.fillStyle = fontColor;
		ctx.textAlign = 'center';
		ctx.fillText("Score = "+currentTrackScore, x, y-0.17*height);
		ctx.font = "26px Arial";
		message = ".";
		if (newHighScore) {
//			console.log ("NewHS");
			message = ". New high score!";
		}
		ctx.fillText("High score = "+highScore+message, x, y-0.05*height);
		drawTextButton(x-0.25*width, y+0.15*height, 0.4*width, 0.22*height, "Try again", false, false, buttonColor, buttonBorderColor);
		buttonDims['Try again'] = new box(x-0.25*width, y+0.15*height, 0.4*width, 0.22*height);
		drawTextButton(x, y+0.38*height, 0.2*width, 0.14*height, "Back", false, false, "lightGray", "gray");
		buttonDims['Back'] = new box(x, y+0.38*height, 0.2*width, 0.14*height);
		ctx.font = "40px Arial";
		if (currentTrackScore == 0) {
			ctx.fillText("Crash!!!", x, y-0.3*height);
			if (currentTrackNumber<10) {
				drawTextButton(x+0.25*width, y+0.15*height, 0.4*width, 0.22*height, "Next track", true, false, buttonColorGreen, buttonBorderColorGreen);
				buttonDims['Next track'] = new box(x+0.25*width, y+0.15*height, 0,0); //box is zero so can't click
			}
//			if (animationFrame == 0) {console.log("Failure"); playSound("failure");}
		} else {
			ctx.fillText("Success!!!", x, y-0.3*height);
			if (currentTrackNumber<10) {
				drawTextButton(x+0.25*width, y+0.15*height, 0.4*width, 0.22*height, "Next track", false, true, buttonColorGreen, buttonBorderColorGreen);
				buttonDims['Next track'] = new box(x+0.25*width, y+0.15*height, 0.4*width, 0.22*height);
			}
			
			//draw star
			drawStar(x-0.35*width-imgStar.width/2, y-0.35*height-imgStar.height/2, 0);
			if (animationFrame == 100) playSound ("tada1");
			if (currentTrackScore >500) {
				drawStar (x-imgStar.width/2-0.015*width, y-0.6*height-imgStar.height/2, 100);
				if (animationFrame == 200) playSound ("tada2");
			}
			if (currentTrackScore >999) {
				drawStar (x+0.35*width-imgStar.width/2, y-0.38*height-imgStar.height/2, 200);
				if (animationFrame == 300) playSound ("tada3");
			}
			
		}
		if (animationFrame<304) animationFrame+=2.5;
	}

	function drawStar(x,y, delay) {
		if (animationFrame<delay) return;
		ctx.save();
		ctx.translate(x,y);
		//ctx.rotate(animationFrame);
		var scale = 1;
		if (animationFrame-delay<100) scale = 1/(Math.sqrt(100-(animationFrame-delay)));
		ctx.scale(scale, scale);
		ctx.drawImage(imgStar, 0, 0);
		ctx.restore();
	}	
			
	function drawAllTracks() {
		var upperLeftWorld = screenToWorld(0, 0);
		var lowerRightWorld = screenToWorld(tracksWidth, canvasHeight);
		for (var i=upperLeftWorld.xtile; i<=lowerRightWorld.xtile+1; i++) {
			for (var j=upperLeftWorld.ytile; j<=lowerRightWorld.ytile+1; j++) {
				drawTrack(tracks[mi(Math.floor(i),Math.floor(j))]);
			}
		}	
	}	

	function drawAllCargoAnimated() { //draws only cargo that is being animated
		//draw all track cargo
		var upperLeftWorld = screenToWorld(0, 0);
		var lowerRightWorld = screenToWorld(tracksWidth, canvasHeight);
		for (var i=upperLeftWorld.xtile; i<=lowerRightWorld.xtile+1; i++) {
			for (var j=upperLeftWorld.ytile; j<=lowerRightWorld.ytile+1; j++) {
				drawCargoAnimated(tracks[mi(Math.floor(i),Math.floor(j))]);
			}
		}	
		
		//draw all EC cargo
		var ECs = engines.concat(cars);
		for (var i=0; i<ECs.length; i++) {
			drawCargoAnimated(ECs[i]);
		}
	}
	
	function drawAllTunnels() {
		for (var key in tracks) {
		    if (tracks[key].subtype == "redtunnel" || tracks[key].subtype == "greentunnel" || tracks[key].subtype == "bluetunnel") {;
				ctx.save();
				ctx.translate((0.5+tracks[key].gridx)*tileWidth, (0.5+tracks[key].gridy)*tileWidth*tileRatio); //center origin on tile
				ctx.rotate(tracks[key].orientation * Math.PI/4);
		    	drawSprite(tracks[key].subtype, tracks[key].orientation);
		    	ctx.restore();
		    }
		}
	}	
	
	function drawSquares() { 
		//console.log("Draw squares"); 
		// draw tracks in the squares in the diagonals of tracks where needed
		var upperLeftWorld = screenToWorld(0, 0);
		var lowerRightWorld = screenToWorld(tracksWidth, tracksHeight);
		for (var i=Math.floor(upperLeftWorld.xtile); i<=lowerRightWorld.xtile+1; i++) {
			for (var j=Math.floor(upperLeftWorld.ytile); j<=lowerRightWorld.ytile+1; j++) {
				//console.log ("i="+i+" j="+j);
                var track;
		    	track = tracks[mi(i,j)];
		        if (track) {
		        	//console.log("track type=" + entry[j].type);
		        	if (tracks[mi(i+1,j+1)]) {
		        		//only draw diagonal if both tracks line up with square
		        		if (trackConnects(tracks[mi(i,j)],3)) if (trackConnects(tracks[mi(i+1,j+1)],7)) {
							ctx.save();
							ctx.translate((track.gridx+0.25)*tileWidth, (track.gridy+0.18)*tileWidth*tileRatio); //center origin on tile
			        		//draw diagnol is SE
							drawSprite("tracksquareSE",0,0);
			        		ctx.restore();
			        	}
		        	}
		        	if (tracks[mi(i-1,j+1)]) {
//		        		console.log("Draw SW diagnol for x=" + i + " y=" + j); 
		        		//only draw diagonal if both tracks line up with square
		        		if (trackConnects(tracks[mi(i,j)],5)) if (trackConnects(tracks[mi(i-1,j+1)],1)) {
							ctx.save();
							ctx.translate((track.gridx-0.76)*tileWidth, (track.gridy+0.14)*tileWidth*tileRatio); //center origin on tile
			        		//draw diagnol is SE
							drawSprite("tracksquareSW",0,0);
			        		ctx.restore();
			        	}
		        	}
		        }
			}
		}	
		
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

		if (startSelectXTile == endSelectXTile) return;
		if (startSelectYTile == endSelectYTile) return;
//		if (!(isSelecting || isMoving)) return;
		
		ctx.lineWidth = 2;
	    ctx.strokeStyle = "red";
	    ctx.beginPath();
	    
	    var screenPoint = worldToScreen(startSelectXTile, startSelectYTile);
	    var startX = screenPoint.x;
	    var startY = screenPoint.y;
	    screenPoint = worldToScreen(endSelectXTile, endSelectYTile);
	    var endX = screenPoint.x;
	    var endY = screenPoint.y;
	    if (isMoving) {
	    	//console.log("startMoveYTile="+startMoveYTile+" endMoveYTile="+endMoveYTile);
	    	var startScreen= worldToScreen(startMoveXTile, startMoveYTile);
	    	var endScreen= worldToScreen(endMoveXTile, endMoveYTile);
    		startX = startX + (endScreen.x - startScreen.x);
    		startY = startY + (endScreen.y - startScreen.y);
    		endX = endX +  (endScreen.x - startScreen.x);
    		endY = endY + (endScreen.y - startScreen.y);
	    }
		ctx.dashedLine( startX, startY, endX, startY, [4,3]);
		ctx.dashedLine( endX, startY, endX, endY, [4,3]);
		ctx.dashedLine( endX, endY, startX, endY, [4,3]);
		ctx.dashedLine( startX, endY, startX, startY, [4,3]);
		ctx.stroke();

		//show tracks and ecs being moved
	    if (isMoving) { 
			var upperLeftSelectXTile = Math.round(Math.min(startSelectXTile, endSelectXTile)); 
			var upperLeftSelectYTile = Math.round(Math.min(startSelectYTile, endSelectYTile));
			var lowerRightSelectXTile = Math.round(Math.max(startSelectXTile, endSelectXTile)); 
			var lowerRightSelectYTile = Math.round(Math.max(startSelectYTile, endSelectYTile));
//    		console.log("IsMoving drag:start gridx="+upperLeftSelectXTile+" y="+upperLeftSelectYTile+" end select grix="+lowerRightSelectXTile+","+lowerRightSelectYTile);

			ctx.save();
			var screenCenter = worldToScreen(centerTileX, centerTileY);
			ctx.translate(screenCenter.x-centerTileX*tileWidth*zoomScale, screenCenter.y-centerTileY*tileWidth*tileRatio*zoomScale);
			ctx.translate(tileWidth*zoomScale*(endMoveXTile - startMoveXTile), tileWidth*tileRatio*zoomScale*(endMoveYTile - startMoveYTile)); 
			ctx.scale(zoomScale, zoomScale);
	    	for (gridx= upperLeftSelectXTile; gridx<lowerRightSelectXTile; gridx++) {
		    	for (gridy= upperLeftSelectYTile; gridy<lowerRightSelectYTile; gridy++) {
					//translate
					//ctx.translate(startX-startSelectXTile*tileWidth, startY-startSelectYTile*tileWidth); //center origin on tile
					///ctx.translate(startX, startY); //center origin on tile
		    		//draw track 
		    		//console.log ("Drag draw x="+gridx+","+gridy+"  track="+tracks[mi(gridx,gridy)]);
		    		drawTrack(tracks[mi(gridx,gridy)]);
		    		//draw EC
		    		var ec=getEC(gridx,gridy);
		    		drawEC(ec);
		    	}
	    	}
    		ctx.restore();

	    }
	}
	
	function getOffset(ec) { //returns the center of an engine or car in tiles with origin at center of current tile so (-0.5,0.5]
		//also adjust offset to smooth over the squares that go across diagonals
		var enterSquareDist = 0;
		var exitSquareDist = 0;
		var offsetx = 0;
		var offsety = 0; //fraction of a tile offset
		
		var track = tracks[mi(ec.gridx,ec.gridy)];
		
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
			case "trackwyeleft":
				if (track.state == "left") type = "track90";
				else type = "trackstraight";
				break;
			case "trackwyeright":
				if (track.state == "left") type = "trackstraight";
				else {
					type = "track90right";
				}
				break;
			case "trackwye":
				if (track.state == "left") type = "track90";
				else {
					type = "track90right";
				}
				break;
		}

		if (ec.position < enterSquareDist/totalDist) { 
		//the ec is in the entering square
			var frac = (enterSquareDist/totalDist - ec.position)/(enterSquareDist/totalDist); //fraction across enter square
			var oriDif = (ec.orientation - exitOri +8)%8;
			switch (type) {
				case "trackstraight":
				case "trackcross":
				case "trackbridge":
					offsety = frac*(Math.SQRT2/2 - 0.5) + 0.5;
					break;
				case "track90":
				case "track90right":
					//console.log("frac="+frac);
					if (ec.speed>=0) {
						offsety = frac*(Math.SQRT2/2 - 0.5) + 0.5;
					} else {
						if (oriDif ==6) offsetx = (frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsetx = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					}
					break;
				case "track45":
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
	
			if (type == "track90right") offsetx = -offsetx;
			//console.log ("In enterSquare. offsetx="+offsetx+" offsety="+offsety+" position="+ec.position+" frac="+frac);
		} else if (ec.position <= (1 + enterSquareDist)/totalDist) { 
		//the ec is in tile proper
			frac = (ec.position - enterSquareDist/totalDist) / ((1 + enterSquareDist)/totalDist - enterSquareDist/totalDist);
			//console.log("frac="+frac);
			switch (type) {
				case "trackstraight":
				case "trackcross":
				case "trackbridge":
					offsety = 0.5 - frac;
					break;
				case "track90":
				case "track90right":
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
				case "track45":
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
						} else { 
							offsetx = Math.cos(Math.PI/2*(1-frac)/2)*1.25 - 1.25;
							offsety = Math.sin(Math.PI/2*(1-frac)/2)*1.25 - 0.5;
						}
					}
					break;
			}
	
			if (type == "track90right") offsetx = -offsetx;
//			console.log ("In tileProper. offsetx="+offsetx+" offsety="+offsety+" position="+ec.position+" frac="+frac);
		} else { 
		// ec is in exiting square
			// should range from -sqrt2 to -0.5
			var frac = (ec.position - (1+exitSquareDist)/totalDist)/(exitSquareDist/totalDist);
			var oriDif = (ec.orientation - exitOri +8)%8;
			switch (type) {
				case "trackstraight":
				case "trackcross":
				case "trackbridge":
					offsety = -frac*(Math.SQRT2/2 - 0.5) - 0.5; // [-0.5, -0.207]
					break;
				case "track90":
				case "track90right":
					//console.log("frac="+frac);
					if (ec.speed>=0) {
						if (oriDif == 6) offsetx = (frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsetx = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					} else {
						if (oriDif == 6) offsety = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
						else offsety = -(frac*(Math.SQRT2/2 - 0.5) + 0.5);
					}
					break;
				case "track45":
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
	
			if (type == "track90right") offsetx = -offsetx;
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
		if (obj.type == "enginebasic" || obj.type == "carbasic") {
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
		if (currentCaptionedObject == undefined) return;
		//console.log("Draw caption. Type="+currentCaptionedObject.type);
		
		captionWidth =2;
		captionHeight =2;
		if (currentCaptionedObject.type == 'TrackStraight') { //make bigger to show station types
			captionHeight =3;
		}
		if (currentCaptionedObject.type == 'CarBasic' || currentCaptionedObject.type == 'TrackCargo' || currentCaptionedObject.type == 'TrackBlank') { //make bigger to show cargo types
			captionWidth =3;
		}

		if (captionX == undefined) { //choose coordinates for caption bubble
			var retVal = spiral (currentCaptionedObject.gridx, currentCaptionedObject.gridy, captionWidth, captionHeight);
			captionX = retVal.gridx;
			captionY = retVal.gridy;
		}

		//if (captionX == -1) return;
				
		var obj = getCenter(currentCaptionedObject);
		//console.log("objx="+obj.X+" objy="+obj.Y);

		drawCaptionBubble(captionX, captionY*tileRatio, captionWidth, captionHeight*tileRatio, obj.X, obj.Y*tileRatio);
		
		switch (currentCaptionedObject.type) {
			case "enginebasic":
				drawSprite("speedController");
				break;
			case "carbasic":
			case "trackcargo":
			case "trackblank":
		 		drawButtonsArray(buttonsCargoTypes);
				break;
			case "trackstraight":
		 		drawButtonsArray(buttonsStation);
				break;
			case "trackwye":
			case "trackwyeleft":
			case "trackwyeright":
		 		drawButtonsArray(buttonsWye);
				break;
		}
		 
	}
	
	function drawSecondaryCaption() { //draw caption bubble attached to primary caption bubble (used for submenus)
		if (secondaryCaption == undefined) return;
		
		captionSecondaryWidth =3;
		captionSecondaryHeight =3;
		if (captionSecondaryX == undefined) { //choose coordinates for secondary caption bubble
			var retVal = spiral (captionX, captionY, captionSecondaryWidth, captionSecondaryHeight);
			captionSecondaryX = retVal.gridx;
			captionSecondaryY = retVal.gridy;
		}
		//if (captionX == -1) return;
				
		//console.log("capX="+captionX+","+captionY+" captionWidth="+captionWidth+","+captionHeight);
		drawCaptionBubble(captionSecondaryX, captionSecondaryY, captionSecondaryWidth, captionSecondaryHeight, lastClickUp.xtile*tileWidth, lastClickUp.ytile*tileWidth*tileRatio, true);
		//drawCaptionBubble(captionSecondaryX, captionSecondaryY, captionSecondaryWidth, captionSecondaryHeight, (captionX+captionWidth/2)*tileWidth, (captionY+captionHeight/2)*tileWidth, true);
		
		//console.log("Draw button array="+secondaryCaption.type)
		
		//get cargo subarray
		var iCargo;
		for (var i=0; i<cargoValues.length; i++) {
			if (cargoValues[i][0] == secondaryCaption.type) iCargo = i;
		}
		if (iCargo == undefined) {
			console.log("ERROR- cargo not found");
			return;
		}
		
		i=1;
		var array = [];
		var nCols = Math.floor(Math.sqrt(cargoValues[iCargo].length-1));
		var nRows = Math.ceil((cargoValues[iCargo].length-1) / nCols);
		for (var row=0; row<nRows; row++) {
			var rowArray = [];
			for (var col=0; col<nCols; col++) {
				if (i<cargoValues[iCargo].length) { 
					rowArray.push (cargoValues[iCargo][i]);
				}
				i++;
			}
			array.push(rowArray);
		}
		
 		drawButtonsArray(array, true);
		
	}
	
	function drawButtonsArray(array, isSecondary) {
		
		var width;
		var height;
		if (isSecondary) {
			width = captionSecondaryWidth;
			height = captionSecondaryHeight;
		} else {
			width = captionWidth;
			height = captionHeight;
		}
		
 		for (var row=0; row<array.length; row++) {
 			for (var col=0; col<array[row].length; col++) {
				//var xSpacing = (width*tileWidth-array[row].length*insetWidth)/(array[row].length+1);
				var xSpacing = (width*tileWidth-array[row].length*captionIconWidth)/(array[row].length+1);
				var ySpacing = (height*tileWidth*tileRatio-array.length*captionIconWidth)/(array.length+1);
				//var ySpacing = (height*tileWidth*tileRatio-array.length*insetWidth)/(array.length+1);
			 	ctx.save();
			 	if (isSecondary) {
			 		ctx.translate(xSpacing*(col+1)+((col+0.5)*captionIconWidth)+(captionSecondaryX)*tileWidth, 5+ (ySpacing*(row+1)+((row+0.5)*captionIconWidth)+(captionSecondaryY)*tileWidth));
			 	} else {
			 		ctx.translate(xSpacing*(col+1)+((col+0.5)*captionIconWidth)+(captionX)*tileWidth, (ySpacing*(row+1)+((row+0.5)*captionIconWidth)+(captionY)*tileWidth)*tileRatio);
			 	}
			 	if (isSecondary) {
                    if (array[row][col] != undefined) {
                        var index = 1;
                        index = row*(array.length-1)+col;
                        drawSprite("Caption"+array[0][0],0, index); //kkk
                    }
                } else {
                    drawSprite("Caption"+array[row][col],0, 0); //kkk
                }
			 	ctx.restore();
 			}
 		}
	}
	
	function drawCaptionBubble (capX, capY, captionWidth, captionHeight, objX, objY, isSecondary) { //capX, capY is upperleft corner of caption, objX, objY is location of where pointer goes
		//draw caption bubble
		//console.log("Cap bubble at capX="+capX+" capY="+capY+" width="+captionWidth+" height="+captionHeight+" objX="+objX+","+objY);
		var angle = Math.atan2(objY-(capY+0.5*captionHeight)*tileWidth, objX-(capX+0.5*captionWidth)*tileWidth);
		ctx.beginPath();
		ctx.moveTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle+Math.PI/2)*0.2*tileWidth+Math.cos(angle)*captionWidth*0.45*tileWidth, (capY+0.5*captionHeight)*tileWidth+Math.sin(angle+Math.PI/2)*0.2*tileWidth+Math.sin(angle)*captionHeight*0.45*tileWidth);
//		ctx.moveTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle+Math.PI/2)*0.2*tileWidth, (capY+0.5*captionHeight)*tileWidth+Math.sin(angle+Math.PI/2)*0.2*tileWidth);
		ctx.lineTo (objX, objY);
		ctx.lineTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle-Math.PI/2)*0.2*tileWidth+Math.cos(angle)*captionWidth*0.45*tileWidth, (capY+0.5*captionHeight)*tileWidth+Math.sin(angle-Math.PI/2)*0.2*tileWidth+Math.sin(angle)*captionHeight*0.45*tileWidth);
//		ctx.lineTo ((capX+0.5*captionWidth)*tileWidth+Math.cos(angle-Math.PI/2)*0.2*tileWidth, (capY+0.5*captionHeight)*tileWidth-Math.sin(angle+Math.PI/2)*0.2*tileWidth);
		
		if (isSecondary) ctx.fillStyle = secondaryCaptionColor;
		else ctx.fillStyle = captionColor;
		ctx.fill();
		roundRect((capX-0.06)*tileWidth, (capY-0.06)*tileWidth, (captionWidth+0.12)*tileWidth, (captionHeight+0.12)*tileWidth, 0.2*tileWidth, true, false);
		
	}
			 	
	function spiral (gridx, gridy, width, height) { //gridx and gridy are the center tile to spiral out from. Width and height are how much space is needed
		//this function spirals outward from x,y = 0,0 to max of X,Y
		// then exits when an empty space is found

		//don't spiral, just put adjacent
		var retx, rety;
		var tracksWorld = screenToWorld(tracksWidth/2, tracksHeight/2);
		//console.log("gridx="+gridx+" tracksWorld.xtile="+tracksWorld.xtile);
		//console.log("gridy="+gridy+" tracksWorld.ytile="+tracksWorld.ytile);
		if (gridx<tracksWorld.xtile) retx=gridx;
		else retx=gridx-width-1;
		if (gridy<tracksWorld.ytile) rety=gridy;
		else rety=gridy-height+1;
	    return {
	        'gridx': retx + 1,
	        'gridy': rety
	    };  

		//spiral
/*		var maxX=5;
		var maxY=5;
	    var x,y,dx,dy;
	    x = y = dx =0;
	    dy = -1;
	    var t = Math.max(maxX,maxY);
	    var maxI = t*t;
	    for (var i =0; i < maxI; i++) {
	    	if ((-maxX/2 < x && x <= maxX/2) && (-maxY/2 < y && y <= maxY/2)) {
	    		console.log ("x=" + (gridx+x) + " y=" + (gridy+y));
	    		if (isSpace(gridx+x, gridy+y, width, height)) {
	    			console.log ("Found empty space at x=" + (gridx+x) + " y=" + (gridy+y));
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
    	console.log("failed to find empty space");
	    return {
	        'gridx': currentCaptionedObject.gridx + 1,
	        'gridy': currentCaptionedObject.gridy
	    };  
	*/   }
    
    function isSpace (capx,capy,width, height) {
    	//returns true if the space has all empty tiles, else false
    	for (var a=capx; a<capx+width; a++) {
	    	for (var b=capy; b<capy+height; b++) {
                if (tracks[mi(a,b)] != undefined) {
                    //console.log("No space at capx=" + capx + " capy=" + capy);
                    return false;
                }
    		}
    	}
    	
    	//check if in tracks area
    	var screenPoint = worldToScreen(capx+width, capy+height);
    	if (screenPoint.x > tracksWidth) return false;
    	if (screenPoint.y > tracksHeight) return false;
    	
    	//check if intersects current caption
    	if (!secondaryCaption) return true; 
    	if (capx+width<=captionX) return true;
    	if (capy+height<=captionY) return true;
    	if (capx>=captionX+width) return true;
    	if (capy>=captionY+height) return true;

    	return false;
    }

	function drawGrid () {
		var upperLeftWorld = screenToWorld(0, 0);
		var lowerRightWorld = screenToWorld(tracksWidth, canvasHeight);
		for (var i=upperLeftWorld.xtile; i<=lowerRightWorld.xtile+1; i++) {
			for (var j=upperLeftWorld.ytile; j<=lowerRightWorld.ytile+1; j++) {
				//console.log("i="+i+" j="+j);
				drawTileBorder(Math.floor(i),Math.floor(j));
			}
		}	
	}

	function drawTileBorder(tilex, tiley) {
		//draw tile border
		ctx.save();
		ctx.translate((0.5+tilex)*tileWidth, (0.5+tiley)*tileWidth*tileRatio); //center origin on tile
		ctx.strokeStyle = gridColor;
		drawOctagonOrSquare(tilex, tiley);
		ctx.restore();
	}
	
	function drawOctagonOrSquare(tilex, tiley) {
		var rx = Math.sin(tilex+tiley*77) * 10000;
		var index = Math.floor((rx - Math.floor(rx))*imgParquet.length);
		var img = imgParquet;
		if (useOctagons) img=imgParquetOct;
		if ((tilex+tiley)%2 == 0) {
			ctx.rotate(-Math.PI/2);
			ctx.drawImage(img[index], -0.5*tileWidth*tileRatio-1, -0.5*tileWidth-1, tileWidth*tileRatio+2, tileWidth+2);
		} else {
			ctx.drawImage(img[index], -0.5*tileWidth-1, -0.5*tileWidth*tileRatio-1, tileWidth+2, tileWidth*tileRatio+2);
		}
	}
		
	function drawToolBar () {
		ctx.fillStyle = toolBarBackColor;
		ctx.fillRect(tracksWidth, 0, getToolBarWidth(), toolBarHeight);
		
		var toolButtons = getCurrentToolButtons();
		
		for (var i=0; i<toolButtons.length; i++) {
			toolButtons[i].draw();
		}
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
				if (localStorage.getObject('trx-'+nBin) == undefined) {
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

		var trx = [tracks, engines, cars];
		localStorage.setObject('trx-'+nBin, trx);
//		localStorage.setObject('trx-tracks'+nBin, tracks);
//		localStorage.setObject('trx-engines'+nBin, engines);
//		localStorage.setObject('trx-cars'+nBin, cars);
		playSound("save");
		draw();
	}
	
	function openTrx(nBin) { //opens trx stored in bin nButton
		if (localStorage.getObject('trx-'+nBin) == undefined) {
			console.log("No trx in bin"+nBin);
			return;
		}

		var trxOpen = localStorage.getObject('trx-'+nBin);
		tracks = trxOpen[0];
		engines = trxOpen[1];
		cars = trxOpen[2];
//		tracks = localStorage.getObject('trx-tracks'+nBin);
//		engines = localStorage.getObject('trx-engines'+nBin);
//		cars = localStorage.getObject('trx-cars'+nBin);
		playSound("open");
		buildTrains();
	}

	function openTrxJSON(string) { //opens trx stored in JSON string 
		var trxOpen = JSON.retrocycle(JSON.parse(string));
		tracks = trxOpen[0];
		engines = trxOpen[1];
		cars = trxOpen[2];
		
		//turn on octagons if not on and trx contain octagons
		if (!useOctagons) {
			for (var key in tracks) {
				if (tracks[key].orientation %2 == 1) useOctagons = true;
			}
		}
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
		                
		                //store locally
		                localStorage.setObject('currentUserID', currentUserID);
		                localStorage.setObject('currentUsername', currentUsername);

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

	function uploadTrackGet() { // uses GET
		console.log ("Function Upload track");
 		var trx = [tracks, engines, cars];
		var strTrx = compress(JSON.stringify(JSON.decycle(trx)));
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
		var strTrx = compress(JSON.stringify(JSON.decycle(trx)));

      	var valid = true;
      	valid = valid && checkLength( trackname, "trackname", 3, 25 );
     	valid = valid && checkLength( trackdescription, "trackdescription", 6, 300 );

      	if ( valid ) {
			var http = new XMLHttpRequest();
			var url = "php/uploadTrackPost.php";
			
			//shrink image of canvas
			var destCtx = canvas2.getContext('2d');
			//destCtx.drawImage(canvas, 0, 0, 50,50);
			destCtx.drawImage(imgPoof,5,5);
			var img    = canvas2.toDataURL("image/png");
			var img2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM0AAADNCAMAAAAsYgRbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABJQTFRF3NSmzMewPxIG//ncJEJsldTou1jHgAAAARBJREFUeNrs2EEKgCAQBVDLuv+V20dENbMY831wKz4Y/VHb/5RGQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0PzMWtyaGhoaGhoaGhoaGhoaGhoxtb0QGhoaGhoaGhoaGhoaGhoaMbRLEvv50VTQ9OTQ5OpyZ01GpM2g0bfmDQaL7S+ofFC6xv3ZpxJiywakzbvd9r3RWPS9I2+MWk0+kbf0Hih9Y17U0nTHibrDDQ0NDQ0NDQ0NDQ0NDQ0NTXbRSL/AK72o6GhoaGhoRlL8951vwsNDQ0NDQ1NDc0WyHtDTEhDQ0NDQ0NTS5MdGhoaGhoaGhoaGhoaGhoaGhoaGhoaGposzSHAAErMwwQ2HwRQAAAAAElFTkSuQmCC";
			//document.write('<img src="'+img+'"/>');
//			var params = "userID="+currentUserID+"&trx="+strTrx+"&trackName="+encodeURI(trackname.val())+"&trackDescription="+encodeURI(trackdescription.val())+"&imgPreview="+encodeURI(img2);
			var params = "userID="+currentUserID+"&trx="+strTrx+"&trackName="+encodeURI(trackname.val())+"&trackDescription="+encodeURI(trackdescription.val())+"&imgPreview="+img2;
			console.log("params="+params);
			http.open("POST", url, true);
			
			//Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			http.onreadystatechange = function() {//Call a function when the state changes.
			    if(http.readyState == 4 && http.status == 200) {
			    	console.log("response="+http.responseText);
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
//	        Cancel: function() {
//	          dialog.dialog( "close" );
//	        }
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
//	        Cancel: function() {
//	          dialog.dialog( "close" );
//	        }
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
//	        Cancel: function() {
//	          dialog.dialog( "close" );
//	        }
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
		//downloadTrack();
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
	        "Upload Track": uploadTrackPost,
//	        Cancel: function() {
//	          dialog.dialog( "close" );
//	        }
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
		var strTrx= JSON.stringify(JSON.decycle(trx));
		//console.log("    trx[]=\'"+strTrx+"\'\;");
		var compressed= compress(strTrx);
		console.log("comptrx[]=\'"+compressed+"\'\;");
		//var decompressed= decompress(compressed);
		//console.log("decomptrx[]=\'"+decompressed+"\'\;");
	}

	function loadTrack() { //load tracks from the trx array
		nCurrentTrx = prompt("Please enter level number to load", "1");
		openTrxJSON(decompress(trx[nCurrentTrx]));
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
				openTrxJSON(decompress(strTrxD));
				updateUndoHistory();
				buildTrains();
				draw();
            }
        };
        xmlhttp.open("GET",url,true);
        xmlhttp.send();
 
 	}
	
	function interpretAll() {
		//iterate through all trains  and ECs to interpet
		for (var t=0; t<trains.length; t++) { 
			var train = trains[t];
			for (c=train.length-1; c>=0; c--) { // go through train backwards so wye doesn't switch under a car
				if (!modalTrack) {
					interpret (train[c]);
				}
			}
		}
		
		// see if ec crashed into another ec -- todo probably slower than could be
		for (var t=0; t<trains.length; t++) { //iterate through trains
			var train = trains[t];
			for (var c=train.length-1; c>=0; c--) {
				for (var t2=t; t2<trains.length; t2++) { //iterate through trains. Crashing is symmetric so start t2=t
					var train2 = trains[t2];
					for (var c2=train2.length-1; c2>=0; c2--) {
						//console.log("t=",train[c].gridx+","+train[c].gridy+" t2="+train2[c2].gridx+","+train2[c2].gridy);
						if (train[c] != train2[c2] && train[c].gridx == train2[c2].gridx && train[c].gridy == train2[c2].gridy) {
							console.log ("CRASH ecs");
							crash(train[c]);
							crash(train2[c2]);
						}
					}
				}
			}
		}
		
	}
	
	function interpret(ec) { //interprets an engine or car one iteration (moves engine or car down track)
		ec.position += ec.speed/1000;

		if (ec.position>=1 || ec.position<0) { //stepped past current tile so figure out which one to jump to
			var x = Math.floor(ec.gridx);
			var y = Math.floor(ec.gridy);
			var startTrack = tracks[mi(x,y)];
			var startOri = ec.orientation; // this was missing for a while so I added back, not sure if right

			//figure out next tile
			next = getNextTrack(ec);

			//check for crashes
			if (tracks[mi(next.gridx,next.gridy)] == undefined) {
				console.log("Undef crash");
				crash(ec);
			} else {	
				//clamp position to [0,1)]
	 			if (ec.position>=1) ec.position -= 1;		
	 			if (ec.position<0) ec.position += 1;		
	
				//advance ec		
				ec.gridx = next.gridx;
				ec.gridy = next.gridy;
				ec.orientation = next.orientation;

				//check for crashes with other ecs
/*				for (var t=0; t<trains.length; t++) { //iterate through trains
					var train = trains[t];
					for (var c=train.length-1; c>=0; c--) {
						if (train[c] != ec && train[c].gridx == ec.gridx && train[c].gridy == ec.gridy) {
							console.log ("CRASH ecs");
							crash(ec);
							crash(train[c]);
						}
					}
				}*/
				
				//check for lazy wyes
				var oriDif = (ec.orientation - tracks[mi(ec.gridx,ec.gridy)].orientation +8)%8;
				if (tracks[mi(ec.gridx,ec.gridy)].subtype == "lazy") {
					console.log("Lazy wye. Ori dif="+oriDif);
					var state = tracks[mi(ec.gridx,ec.gridy)].state;
					switch 	(tracks[mi(ec.gridx,ec.gridy)].type) {
						case "trackwyeleft":
							if (oriDif == 2) state = "left";
							if (oriDif == 4) state = "right";
							break;
						case "trackwyeright":
							if (oriDif == 4) state = "left";
							if (oriDif == 6) state = "right";
							break;
						case "trackwye":
							if (oriDif == 2) state = "left";
							if (oriDif == 6) state = "right";
							break;
					}
					
					if (tracks[mi(ec.gridx,ec.gridy)].state != state) { //switch
						tracks[mi(ec.gridx,ec.gridy)].state = state;
						playSound("switch");
					}
				}
				
				//check for prompt on entering tile
				if (tracks[mi(ec.gridx,ec.gridy)].subtype == "prompt" && oriDif == 0 && isFirstCarInTrain(ec)) {
					console.log("Interpret prompt");
					clearInterval(interval);
					ctx.save();
					ctx.fillStyle = "rgba(128,128,128,0.4)";
					ctx.fillRect(0,0, canvasWidth, canvasHeight); //grey out background
					
			        var screenCenter = worldToScreen(centerTileX, centerTileY);
					ctx.translate(screenCenter.x-centerTileX*tileWidth*zoomScale, screenCenter.y-centerTileY*tileWidth*tileRatio*zoomScale);
					ctx.scale(zoomScale, zoomScale);
					ctx.translate((0.5+ec.gridx)*tileWidth, (0.5+ ec.gridy)*tileWidth*tileRatio); //center origin on tile
					ctx.rotate(ec.orientation*2*Math.PI/8);
					ctx.drawImage(imgArrowIcon,-tileWidth,-0.5*tileWidth*tileRatio);
					ctx.rotate(Math.PI);
					ctx.drawImage(imgArrowIcon,-tileWidth,-0.5*tileWidth*tileRatio*tileRatio);
					modalTrack = tracks[mi(ec.gridx,ec.gridy)];
					ctx.restore();
					//ctx.lineWidth = 3;
					//ctx.strokeStyle = highlightColor;
					//roundRect(tracks[mi(ec.gridx,ec.gridy)].gridx*tileWidth, tracks[mi(ec.gridx,ec.gridy)].gridy*tileWidth, tileWidth, tileWidth,3, false, true);
					//var retVal = confirm("Go left ?");
					
					//if (retVal)	tracks[mi(ec.gridx,ec.gridy)].state = "left";
					//else tracks[mi(ec.gridx,ec.gridy)].state = "right";	
					//ctx.lineWidth = 1;
					console.log("Doneprompt");
				}
	
				//check for alternate on exiting tile
				if (startTrack.subtype == "alternate" && (startOri - startTrack.orientation +8)%8 == 0 && isLastCarInTrain(ec)) {
					if (startTrack.state == "left") startTrack.state = "right";
					else startTrack.state = "left";
					playSound("switch");
				}
				
				//check for random wye on exiting tile
				if (tracks[mi(ec.gridx,ec.gridy)].subtype == "random" && oriDif == 0 && isFirstCarInTrain(ec)) {
					console.log("Random wye");
					if (Math.random() < 0.5) {
						console.log("switch");
						if (tracks[mi(ec.gridx,ec.gridy)].state == "left") tracks[mi(ec.gridx,ec.gridy)].state = "right";
						else tracks[mi(ec.gridx,ec.gridy)].state = "left";
						playSound("switch");
					}
				}
				
				//check for compareless or comparegreater on engine entering tile
				var step = getTrackCargoStep(tracks[mi(ec.gridx,ec.gridy)]);
				if ((tracks[mi(ec.gridx,ec.gridy)].subtype == "compareless" || tracks[mi(ec.gridx,ec.gridy)].subtype == "comparegreater") && oriDif == 0 && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined && isFirstCarInTrain(ec)) {
					//iterate through train to find first car with same type as switch cargo type. Use it for comparison
//					console.log("COmpare greater less");
					var train = getTrain(ec);
					var car;
					for (var c=1; c<train.length && car == undefined;  c++) {
						if (train[c].cargo) if (train[c].cargo.type == tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type) car = train[c];
					}
					
					if (car) {
						var state;
						if (tracks[mi(ec.gridx,ec.gridy)].subtype == "compareless") { //for compareLess
							if (car.cargo.value < tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value) state = "left";
							else state = "right";
						} else { //for comparegreater
							if (car.cargo.value < tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value) state = "right";
							else state = "left";
						}
						if (state != tracks[mi(ec.gridx,ec.gridy)].state) playSound("switch");
						tracks[mi(ec.gridx,ec.gridy)].state = state;
					}
	
				}
			}
		}
	}
	
	function detectCrashes() { // determine if any ec is <1 tile from another ec
		var rebuildTrains = false;
		for (var t=0; t<trains.length; t++) { 
			var train = trains[t];
			if (train[0].speed >= 0) {
				var next = getNextTrack(train[0]);
				//console.log ("Beginning of train is a x="+train[0].gridx+" y="+train[0].gridy+". Next is x="+next.gridx+" y="+next.gridy);
				var nextEC = getEC(next.gridx, next.gridy);
				if (nextEC != undefined) {
					console.log ("NextEC pos="+nextEC.position+" this pos="+train[0].position);
					//if (train[0].position>0.9) {
					if (nextEC.position+1-train[0].position < 0.9) {
						if (!isInTrain(nextEC)) {
							//console.log("Join free car");
							playSound("connect");
							rebuildTrains = true;
						} else {
							console.log ("CrashAAA at x="+next.gridx+" y="+next.gridy);
							crash(train[0]);
						}
					}
				}
			} else {
				var next = getNextTrack(train[train.length-1]);
				//console.log ("Beginning of train is a x="+train[0].gridx+" y="+train[0].gridy+". Next is x="+next.gridx+" y="+next.gridy);
				var nextEC = getEC(next.gridx, next.gridy);
				if (nextEC != undefined) {
					//if (train[0].position<0.1) {
					if (nextEC.position+1-train[train.length-1].position < 1.0) {
						if (!isInTrain(nextEC)) {
							console.log("Join free car");
							rebuildTrains = true;
						} else {
							console.log ("CrashBBB at x="+next.gridx+" y="+next.gridy);
							crash(train[0]);
						}
					}
				}
			}
		}	

		if (rebuildTrains) buildTrains(); //make trains if any new cars added

	}

	function detectStations() {
		for (var t=0; t<trains.length; t++) { //iterate through trains
			var train = trains[t];
			for (var c=0; c<train.length; c++) {
				var ec = train[c];
				//console.log("t="+t+" c="+c);
				if (ec.position >= 0.5 && ec.position < 0.5+ec.speed/1000 /*&& ec.type == "carbasic"*/) { //perform action when car reaches middle of track
					//console.log("detect stations");
					// pickup cargo lying on track (not on station)
					if (ec.cargo == undefined && tracks[mi(ec.gridx,ec.gridy)].cargo != undefined && ec.type == "carbasic") {
						//move cargo
						ec.cargo = tracks[mi(ec.gridx,ec.gridy)].cargo;
						tracks[mi(ec.gridx,ec.gridy)].cargo = undefined;
					} 
					
					var step = getTrackCargoStep(tracks[mi(ec.gridx,ec.gridy)]);
					var cargoLength;
					//console.log("****"+ec.cargo.type);
					if (ec.cargo !=undefined) cargoLength = cargoValues[ec.cargo.type].length-1;

					//divide cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "divide") {
						console.log("Divide");
						if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined)  { //station has cargo 
							if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec.cargo.type) { // same type so divide
								playSound("divide");
								ec.cargo.value = Math.round(ec.cargo.value / tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value);
								animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], ec, "dump-poof");
							}
						} else { // station does not have cargo so transfer cargo
							tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
							//animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo,0,0,0,0,0,"ontrackcargo");
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					} 
					
					//multiply cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "multiply") {
						if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined)  { //station has cargo 
							if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec.cargo.type) { // same type so multiply
								playSound("multiply");
								ec.cargo.value = (ec.cargo.value * tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value)%cargoLength;
								animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], ec, "dump-poof");
							}
						} else { // station does not have cargo so transfer cargo
							//tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					} 

					//subtract cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "subtract") {
						if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined)  { //station has cargo 
							if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec.cargo.type) { // same type so subtract
								playSound("subtract");
								ec.cargo.value = (ec.cargo.value - tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value + cargoLength)%cargoLength;
								animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], ec, "dump-poof");
							}
						} else { // station does not have cargo so transfer cargo
							//tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					} 

					//add cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "add") {
						if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined)  { //station has cargo 
							if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec.cargo.type) { // same type so add
								playSound("add");
								ec.cargo.value = (ec.cargo.value + tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value)%cargoLength;
								animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], ec, "dump-poof");
							}
						} else { // station does not have cargo so transfer cargo
							//tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					} 

					//catapult cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "catapult") {
						console.log("Catapult switch");
						if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined)  { //station has cargo so catapult ec cargo and remove number from station and cargo from car
							playSound("catapult");
							var angle = ((tracks[mi(ec.gridx,ec.gridy)].orientation + 2 + 2) %8)*Math.PI/4;
							var value = tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value;
							if (cargoValues[tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type][0] == "blocks") value++;
							var stepX = value * Math.round(Math.cos(angle));
							var stepY = value * Math.round(Math.sin(angle));
							//console.log("stepX="+stepX+" stepY="+stepY)
							if (tracks[mi(ec.gridx+stepX,ec.gridy+stepY)] == undefined) new Track (ec.gridx+stepX, ec.gridy+stepY, "trackblank");
							animateCargo(ec, tracks[mi(ec.gridx+stepX,ec.gridy+stepY)], "move-spin");
							//tracks[mi(ec.gridx+stepX,ec.gridy+stepY)].cargo = ec.cargo; //catapult
							//ec.cargo = undefined;
							//tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = undefined;
							animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)],tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)],"dump");
						} else { // station does not have cargo so transfer cargo if its a number
							console.log("Value type="+cargoValues[ec.cargo.type][0]);
							if (cargoValues[ec.cargo.type][0] == "numbers" || cargoValues[ec.cargo.type][0] == "blocks") {
								console.log("Wind up catapult");
								playSound("catapultWindup");
//								tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
//								animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "dump"); 
								animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move");
							}
						}
					} 

					//slingshot cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "slingshot") {
						if (!tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)] || !tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo || tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec. cargo.type) { //type specific
							playSound("slingshot");
							var angle = ((tracks[mi(ec.gridx,ec.gridy)].orientation + 2 + 2) %8)*Math.PI/4;
							var stepX = Math.round(Math.cos(angle));
							var stepY = Math.round(Math.sin(angle));
							
							var curX = ec.gridx;
							var curY = ec.gridy;
							var loops = 0; //???
	
							do {
								var nextX = curX + stepX;
								var nextY = curY + stepY;
								if (tracks[mi(nextX,nextY)] == undefined) new Track(nextX, nextY, "trackblank");
								if (loops == 0) {
									first = false;
									animateCargo(ec, tracks[mi(nextX,nextY)], "move", 15-loops);
								} else animateCargo(tracks[mi(curX,curY)], tracks[mi(nextX,nextY)], "move", 15-loops);
								curX = nextX;
								curY = nextY;
								loops++;
							} while (tracks[mi(curX,curY)].cargo);
						}							
					}
					
					//pickdrop cargo
					//console.log("subtype="+tracks[mi(ec.gridx,ec.gridy)].subtype);
					if (ec.type == "carbasic" && tracks[mi(ec.gridx,ec.gridy)].subtype == "pickdrop") {
						//console.log("pickdrop");
						//if station has cargo and car doesn't, then swap station cargo to car
						if (ec.cargo == undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined) {
							playSound("pickdrop");
							animateCargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], ec, "move"); 
						}
						//if car has cargo and station doesn't, then swap car cargo to station
						else if (ec.cargo != undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo == undefined) {
							playSound("pickdropreverse");
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					}
					
					//home cargo
					//console.log("subtype="+tracks[mi(ec.gridx,ec.gridy)].subtype);
					if (tracks[mi(ec.gridx,ec.gridy)].subtype == "home") {
						//console.log("home");
						//if car has cargo and station doesn't, then swap car cargo to station
						//console.log("Cargo value="+ec.cargo.value);
						//console.log("Type="+cargoValues[ec.cargo.type][0]);
						if (ec.cargo != undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo == undefined
						&& cargoValues[ec.cargo.type][0] == "stuffedanimals" && ec.cargo.value == 0) {
							playSound("home");
							console.log("Stuffed animal delivered successfully");
							if (interactionState == 'Try level') {
								index = currentTrackSet + "-" + (currentTrackNumber+1);
								console.log("trx unlocked for index=" + index);
								unlockedTrx[index] = true;
								animationFrame = 0;
								interactionState = 'StarScreen';
								text = currentTrackSet + "-" + (currentTrackNumber);
								bestTime = 1;
								if (bestTrackTime[text]) bestTime= bestTrackTime[text];
								var d = new Date();
								now = d.getTime();
								currentTrackTime = now - startTimePlay;
								currentTrackScore = Math.round(1000*bestTrackTime[text]/currentTrackTime);
								newHighScore = false;
								if (currentTrackScore>1000) currentTrackScore = 1000; 
								console.log("bestTrackTime['"+text+"'] = "+currentTrackTime);
							}
							//tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo = new Cargo(ec.cargo.value, ec.cargo.type);
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					}
					
					//dump cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "dump") {
						//dump only if cargo type on trackCargo matches or is nonexistent
						if (!tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)] || !tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo || tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec. cargo.type) {
							playSound("dump");
							//ec.cargo = undefined;
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "dump-poof"); 
						}
					}
					
					//increment cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "increment") {
						//increment only if cargo type on trackCargo matches or is nonexistent
						if (!tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)] || !tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo || tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec. cargo.type) {
							playSound("increment");
							ec.cargo.value++;
							ec.cargo.value %= cargoValues[ec.cargo.type].length-1;
							animateCargo(ec, ec, "spin", 8);
						}
					}
					
					//decrement cargo
					if (ec.cargo !=undefined && tracks[mi(ec.gridx,ec.gridy)].subtype == "decrement") {
						playSound("decrement");
						//decrement only if cargo type on trackCargo matches or is nonexistent
						if (!tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)] || !tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo || tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type == ec. cargo.type) {
							ec.cargo.value--;
							ec.cargo.value += cargoValues[ec.cargo.type].length-1;
							ec.cargo.value %= cargoValues[ec.cargo.type].length-1;
							console.log("Value="+ec.cargo.value);
							animateCargo(ec, ec, "spin", 8);
						}
					}
					
					//supply station
					if (tracks[mi(ec.gridx,ec.gridy)].subtype == "supply") {
						//increment uniqueid each time train passes for use to ensure that cargo only added once per train per pass
						if (isFirstCarInTrain(ec)  && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined) {
							if (tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid) tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid += 1;
							else tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid = 1000*(ec.gridx+step.stepX) + 1000000*ec.gridy+step.stepY;
//							console.log ("First car. Uniqueid="+tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid);
						}

						if (ec.type == "carbasic") {
							//if station has cargo and car doesn't, then copy station cargo to car
							if (ec.cargo == undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo != undefined) {
								//only add once per train each trip
								var addedBefore = false;
								var train = getTrain(ec);
//								console.log("Train length="+train.length);
								for (var i=0; i<train.length; i++) {
									if (train[i].cargo && train[i].cargo.uniqueid && train[i].cargo.uniqueid == tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid) {
										addedBefore = true;
//										console.log ("Added before is true. i="+i);
									}
								}
								if (!addedBefore) {
									playSound("supply");
									ec.cargo = new Cargo(tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.value, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.type); //copy cargo
									//ec.cargo = jQuery.extend({},tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo); //copy cargo
									ec.cargo.uniqueid = tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo.uniqueid;
									animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "supply"); 
								}
							}
							
							
							//if car has cargo and station doesn't, then move car cargo to station
							if (ec.cargo != undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo == undefined) {
								playSound("supply");
								animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move");
							}
						}
					}

					//tunnel
					if (tracks[mi(ec.gridx,ec.gridy)].subtype == "greentunnel" || tracks[mi(ec.gridx,ec.gridy)].subtype == "redtunnel" || tracks[mi(ec.gridx,ec.gridy)].subtype == "bluetunnel") {
//						console.log ("Enter  tunnel");
						var transportKey, distance;
						
						//see if ec has arrived at this tunnel before if so transport back to sending tunnel and remove entry
						for (var i=0; i<ec.tunnelto.length; i++) {
							if (ec.tunnelto[i] == mi(ec.gridx,ec.gridy)) {
								transportKey = ec.tunnelfrom[i];
								ec.tunnelto.splice(i,1);
								ec.tunnelfrom.splice(i,1);
							}
						}
						if (transportKey) playSound("tunnelReverse");

						//if not transported before then transport to the closest tunnel of same color
						if (!transportKey) {
							for (var key in tracks) {
							    if (tracks[key].subtype == tracks[mi(ec.gridx,ec.gridy)].subtype && key != mi(ec.gridx,ec.gridy)) {
							    	//console.log("KEY="+key+" y="+tracks[key].gridy);
							    	if (!transportKey) {
							    		transportKey = key;
							    		distance = Math.pow((tracks[key].gridx-ec.gridx),2) + Math.pow((tracks[key].gridy-ec.gridy),2);
							    		//console.log("NEW key="+key+" distance="+distance);
							    	} else if (Math.pow((tracks[key].gridx-ec.gridx),2) + Math.pow((tracks[key].gridy-ec.gridy),2) < distance) {
							    		transportKey = key;
							    		distance = Math.pow((tracks[key].gridx-ec.gridx),2) + Math.pow((tracks[key].gridy-ec.gridy),2);
							    		//console.log("REPLACE key="+key+" distance="+distance);
							    	}
							    }
							}
							
							if (transportKey) {
								playSound("tunnel");
								ec.tunnelto.push(mi(tracks[transportKey].gridx, tracks[transportKey].gridy));
								ec.tunnelfrom.push(mi(ec.gridx, ec.gridy));
							}
						}
						
						if (transportKey) { // transport EC is found another tunnel
							ec.orientation = (ec.orientation - (tracks[mi(ec.gridx,ec.gridy)].orientation - tracks[transportKey].orientation))%8;
							ec.gridx = tracks[transportKey].gridx;
							ec.gridy = tracks[transportKey].gridy;
						}
					}
					//console.log ("type="+tracks[mi(ec.gridx,ec.gridy)].subtype);

					//drop off cargo at empty compareless or comapregreater wyes
					if (tracks[mi(ec.gridx,ec.gridy)].subtype == "compareless" || tracks[mi(ec.gridx,ec.gridy)].subtype == "comparegreater") {
						//if car has cargo and station doesn't, then swap car cargo to station
						if (ec.cargo != undefined && tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)].cargo == undefined) {
							playSound("supply");
							animateCargo(ec, tracks[mi(ec.gridx+step.stepX,ec.gridy+step.stepY)], "move"); 
						}
					}
				}
			}
		}
		
	}	
	
	function animateCargo (startObj, endObj, type, frames) {
		startObj.cargo.isanimating = true;
		startObj.cargo.animatestartobj = startObj;
		startObj.cargo.animateendobj = endObj;	
		var defaultFrames = 15;
		startObj.cargo.animatetype = type || "straight";
		startObj.cargo.animatetotalframes = frames || defaultFrames;
		startObj.cargo.animatedframes = 0;
	}
	
	function animatePoof (gridx, gridy, frames) {
		var poof = {};
		var defaultFrames = 15;
		poof.gridx = gridx;
		poof.gridy = gridy;
		poof.animatetotalframes = frames || defaultFrames;
		poof.animatedframes = 0;
		poofs.push(poof);
	}
	
/*	function animateCargo (cargo, startX, startY, ori, endX, endY, type, frames) { //moves cargo along path (type=straight or arc) from start to end 
		//type
		// "ontrackcargo"- hides cargo untl "totrackcargo" is done animating
		// "totrackcargo"- for cargo going from car to trackcargo
		// "dump"- for cargo going from car to trackcargo
		cargo.isanimating = true;
		cargo.animatestartx = startX;
		cargo.animatestarty = startY;
		cargo.startframe = ori*8;
		cargo.animateendx = endX;
		cargo.animateendy = endY;
		cargo.animatetype = type || "straight";
		var defaultFrames = 10;
		cargo.animatetotalframes = frames || defaultFrames;
		cargo.animatedframes = 0;
		//console.log(cargo);
} */
	
	function playSound(name) { // play sound for the named event
		if (sounds[name]) {
			sounds[name].play();
		} else {
			console.log("ERROR- Play sound name undefined name="+name);
		}
	}
	
	function isInTrain(ec) { //returns true if ec is part of a train, returns false for free cars
		if (ec.type == "enginebasic") return true; //trivial case because engines are part of a train by definition
		
		for (var nTrain=0; nTrain<trains.length; nTrain++) {
			var train = trains[nTrain];
			for (var j=0; j<train.length; j++) {
				if (train[j] == ec) return true;
			}
		}
		
		return false;
	}
	
	function reverseOrientation(ec) { //flips the orientation of the ec so it is going the other way on the track. For track straight just ori+=4
		//console.log("ReverseOri");
		var track=tracks[mi(ec.gridx,ec.gridy)];
		for (var dif=1; dif<8; dif++) {
			var oriCheck = (ec.orientation+dif)%8;
			if (ec.speed >=0) oriCheck = (oriCheck+4)%8; //add 4 since orientation is based on orientation when entering
			if (trackConnects(track, oriCheck)) {
//				console.log("Found reverse ori. original ori="+ec.orientation+" new ori="+(ec.orientation+dif)%8);
				ec.orientation = (oriCheck+4)%8;
				return;
			}
		}
		
		console.log("ERROR- couldn't reverse orientation");
	}
	
	function reverseSpeed(ec) { //reverse the speed of this engine or car. If straight then just speed = -speed. If on corner then must change ori
		console.log("ReverseSpeed");
		var type = getTypeForWye(ec, tracks[mi(ec.gridx,ec.gridy)]);
		if (type != "trackstraight" && type != "trackbridge" && type != "trackcross") {
			var ori;
			for (var dif=1; dif<9 && ori == undefined; dif++) {
				var testOri = (ec.orientation+dif)%8;
				//if (ec.speed<0) testOri = (testOri+4)%8; //since going backwards use opposite orientation
				var oriDif = (testOri-ec.orientation+8)%8;
				if ((trackConnects(tracks[mi(ec.gridx,ec.gridy)], testOri)) && oriDif !=4) {
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
		var track = tracks[mi(ec.gridx,ec.gridy)];
		if (!track) {
			console.log("ERROR no track found for getNextTrack ec.gridx="+ec.gridx+" y="+ec.gridy);
			return;
		}
		var type = getTypeForWye(ec, track);
		var gridx=0, gridy=0;
		var orientation = ec.orientation;
		var oriDif = (orientation - track.orientation+8)%8;
		
		switch (type)  {
			case "trackstraight":
			case "trackcross":
			case "trackbridge":
				if (ec.speed>=0 ) {
					gridx = ec.gridx + Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy + Math.round(Math.sin(Math.PI/4*(orientation-2)));
				} else {
					gridx = ec.gridx - Math.round(Math.cos(Math.PI/4*(orientation-2)));
					gridy = ec.gridy - Math.round(Math.sin(Math.PI/4*(orientation-2)));
				}
				break;
			case "track90":
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
			case "track90right":
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
			case "track45":
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
		if (!track) return;
		if (!ec) return;
		var oriDif = (ec.orientation - track.orientation + 8)%8;
		if (ec.speed < 0) oriDif = (oriDif+4)%8;
		var type = track.type;
	//	var orientation = engine.orientation;
		switch (type) {
			case "trackwyeleft":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "track90";
						else type = "trackstraight";
						break;
					case 4:
						type = "trackstraight";
						break;
					case 2:
						type = "track90";
						break;
					default:
						crash(ec);
						console.log("Crash AAA");
						break;
				}
				break;
			case "trackwyeright":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "trackstraight";
						else type = "track90right";
						break;
					case 4:
						type = "trackstraight";
						break;
					case 6:
						type = "track90right";
						break;
					default:
						crash(ec);
						console.log("Crash YYY");
						break;
				}
				break;
			case "trackwye":
				switch (oriDif) {
					case 0:
						if (track.state == "left") type = "track90";
						else type = "track90right";
						break;
					case 2:
						type = "track90";
						break;
					case 6:
						type = "track90right";
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
		animatePoof(ec.gridx, ec.gridy);
		if (interactionState == 'Try level') { 
			console.log ("Crashed on levels");
			interactionState = 'StarScreen';
			currentTrackScore = 0;
			newHighScore = false;
			// stop the train
			clearInterval(interval);
			getButton("Play").down = false;
			playSound("failure");
		} else {
			//delete train if crashes
			var nEngine;
			var train = getTrain(ec);
			if (!train) return;
			console.log("Train length="+train.length);
			for (var i=0; i<train.length; i++) {
				if (train[i].type == "enginebasic") nEngine = i;
				console.log("delete i="+i);
				deleteEC(train[i]);
			}
			trains.splice(i,1);
		}
		buildTrains();		
	}
	
	function deleteEC(ecdel) { //removes engines and cars from their arrays
		if (ecdel.immutable) return;
		var found = false;
		if (ecdel.type == "enginebasic") {
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
		
		if (found) delete ecdel;
		
	}
		
	function screenToWorld(x,y) { //converts point in pixels of canvas on screen to world coordinates in xtiles, ytiles
		var worldPoint = {};
		worldPoint.xtile = (x-(tracksWidth/2-centerTileX*tileWidth))/zoomScale/tileWidth;
		worldPoint.ytile = (y-(canvasHeight/2-centerTileY*tileWidth*tileRatio))/zoomScale/tileWidth/tileRatio;
//		worldPoint.xtile = (x*zoomScale-(tracksWidth/2-centerTileX*tileWidth))/zoomScale/tileWidth;
	//	worldPoint.ytile = (y*zoomScale-(canvasHeight/2-centerTileY*tileWidth*tileRatio))/zoomScale/tileWidth/tileRatio;
		return worldPoint;	
	}
	
	function worldToScreen(xtile, ytile) { //converts points in world cordidates (units tiles) to screen coordinates (units pixels)
		var screenPoint	= {};
		screenPoint.x = xtile*tileWidth*zoomScale+(tracksWidth/2-centerTileX*tileWidth);
		screenPoint.y = ytile*tileWidth*zoomScale*tileRatio+(canvasHeight/2-centerTileY*tileWidth*tileRatio);
		return screenPoint;
	}
	
	function addPointTrack(x,y) { //x,y are in world coords
		var screenPoint = worldToScreen(x,y);
		if (screenPoint.x > tracksWidth) {console.log("Greater than trackWidth");return; }
		if (screenPoint.y > tracksHeight) return;

		drawingPointsTrackX.push(x);
		drawingPointsTrackY.push(y);
		if (!getButton("Play").down) drawPathTrack();
		
		//get tile coords
		var trackTileX = Math.floor(x);
		var trackTileY = Math.floor(y);
						
		//get tile quadrant (tile split into 3x3 grid, center is 8, 0 is N, 1 is NE, 2 is E...)
		var xFraction = (x-trackTileX) * (2+2*Math.SQRT2);
		var yFraction = (y-trackTileY) * (2+2*Math.SQRT2);
		var tileOrientation;

		if (useOctagons) {
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
		} else { //use squares
			//divide square with an X to make 4 triangle shaped quadrants
			if (xFraction > yFraction) {
				if (xFraction > (2+2*Math.SQRT2)-yFraction) {
					tileOrientation = 2;
				} else {
					tileOrientation = 0;
				}
			} else {
				if (xFraction > (2+2*Math.SQRT2)-yFraction) {
					tileOrientation = 4;
				} else {
					tileOrientation = 6;
				}
			}
		}
//		console.log ("ori="+tileOrientation);
		
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
						type="track135"; 
						break;
					case 2: 
						type="track90"; 
						orientation=(exitingOrientation+4)%8;
						break;
					case 3: 
						type="track45"; 
						orientation=(exitingOrientation+4)%8;
						break;
					case 4:
						type="trackstraight";
						orientation = (enteringOrientation+4)%8;
						break;
					case 5: 
						type="track45"; 
						orientation=(enteringOrientation+4)%8;
						break;
					case 6: 
						type="track90"; 
						orientation=(enteringOrientation+4)%8;
						break;
					case 7: 
						type="track135"; 
						break;
				}
				
				//make wyes and crosses when new track is on top of existing track for special cases (perpendicular and no 45s)
				switch (type) {
					case "track90":
						//console.log("track90");
						//if there is already a straight track then make a wye left track
						if (tracks[mi(currentXTile,currentYTile)]) {
							switch (tracks[mi(currentXTile,currentYTile)].type) {
								case "trackstraight":
									var difEnter = (tracks[mi(currentXTile,currentYTile)].orientation - enteringOrientation +8)%8;
									var difExit = (tracks[mi(currentXTile,currentYTile)].orientation - exitingOrientation +8)%8;
									//console.log ("difEnter=" + difEnter + " difExit=" + difExit);
									//console.log("current ori=" + tracks[mi(currentXTile,currentYTile)].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									if ((difEnter == 4 && difExit == 2) || (difEnter == 2 && difExit == 4) || (difEnter == 0 && difExit == 6) || (difEnter == 6 && difExit == 0)) {
											type = "trackwyeleft";
											state = "left";
											subtype = "sprung";
									    } else {
											type = "trackwyeright";
											state = "right";
											orientation = (orientation+2)%8;
											subtype = "sprung";
									    }
								break;
								case "track90":
									//console.log("current ori=" + tracks[mi(currentXTile,currentYTile)].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									switch ((tracks[mi(currentXTile,currentYTile)].orientation - enteringOrientation +8)%8) {
										case 0:
										case 2:
											type = "trackwye";
											state = "left";
											subtype = "sprung";
											break;
										case 4:
										case 6:
											type = "trackwye";
											orientation = (orientation+2)%8;
											state = "right";
											subtype = "sprung";
											break;
									}
									break;
							}
						}
						break;	
					case "trackstraight":
						if (tracks[mi(currentXTile,currentYTile)] != undefined) {
							switch (tracks[mi(currentXTile,currentYTile)].type) {
								case "trackstraight":
								case "trackcross":
								//if new straight track crosses straight or cross track then make cross track
									switch ((tracks[mi(currentXTile,currentYTile)].orientation - enteringOrientation +8)%8) {
										case 2:
										case 6:
											type = "trackcross";
											break;
									}
									break;
								case "track90":
								//if new straight track crosses straight or cross track then make cross track
									var difEnter = (tracks[mi(currentXTile,currentYTile)].orientation - enteringOrientation +8)%8;
									var difExit = (tracks[mi(currentXTile,currentYTile)].orientation - exitingOrientation +8)%8;
									console.log ("XXX difEnter=" + difEnter + " difExit=" + difExit);
									//console.log("current ori=" + tracks[mi(currentXTile,currentYTile)].orientation + " entering ori=" + enteringOrientation + " exit ori=" + exitingOrientation);
									if ((difEnter == 4 && difExit == 0) || (difEnter == 0 && difExit == 4)) {
											type = "trackwyeleft";
											state = "right";
											subtype = "sprung";
											if (difEnter == 0) orientation = (orientation+4)%8;
									    } else {
											type = "trackwyeright";
											state = "left";
											subtype = "sprung";
											if (difEnter == 6) orientation = (orientation+4)%8;
									    }
								break;
							}
						}
						break;
				}
				
				if (type != "track135") { // 135 not allowed because too sharp
					new Track(currentXTile, currentYTile, type, orientation, state, subtype);
					ctx.save();
			        var screenCenter = worldToScreen(centerTileX, centerTileY);
					ctx.translate(screenCenter.x-centerTileX*tileWidth*zoomScale, screenCenter.y-centerTileY*tileWidth*tileRatio*zoomScale);
					ctx.scale(zoomScale, zoomScale);
					drawTrack(tracks[mi(currentXTile,currentYTile)]);
					ctx.restore();
					updateUndoHistory();
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
				
        ctx.beginPath();
        var screenPoint = worldToScreen(drawingPointsTrackX[0], drawingPointsTrackY[0]);
        ctx.moveTo(screenPoint.x, screenPoint.y);
        for (i=1; i<drawingPointsTrackX.length; i++) {
        	screenPoint = worldToScreen(drawingPointsTrackX[i], drawingPointsTrackY[i]);
	        ctx.lineTo(screenPoint.x, screenPoint.y);
        	
        }
	    ctx.stroke();
	    ctx.restore();
	}	

	function addPointEC(x,y) { //for drawing mouse movements when manually placing engines or cars //x,y are in world coords
		var screenPoint = worldToScreen(x,y);
		if (screenPoint.x > tracksWidth) return;
		if (screenPoint.y > tracksHeight) return;

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
				
        ctx.beginPath();
        var screenPoint = worldToScreen(drawingPointsECX[0], drawingPointsECY[0]);
        ctx.moveTo(screenPoint.x, screenPoint.y);
        for (i=1; i<drawingPointsECX.length; i++) {
        	screenPoint = worldToScreen(drawingPointsECX[i], drawingPointsECY[i]);
	        ctx.lineTo(screenPoint.x, screenPoint.y);
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
	
	function ToolButton(x, y, width, height, name, group, down) {
//		toolButtons.push(this);
		
		this.x = x || 10;
		this.y = y || 10;
		this.width = width || 50;
		this.height = height || 50;
		this.name = name || "default";
		this.group = group; //an integer. All buttons within same group act as radios
		this.down = down || false; 
		
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
					ctx.drawImage(imgTrackStraight[1], -10,-10,imgTrackWidth,imgTrackWidth);
					if (this.down) {
						ctx.lineWidth = 3;
					    ctx.strokeStyle = "yellow";
					    ctx.strokeRect(0, 0, width, height);        
					}
					break;
				case "Home":
					ctx.drawImage(imgButtonHome, 6, 5);
					break;
				case "Write":
					ctx.fillStyle = fontColor;
					ctx.font = "20px Arial";
					ctx.fillText("Write",17,45);
					break;
				case "Cargo":
					ctx.drawImage(imgCargoUppercase[0][14], -8,3,imgTrackWidth,imgTrackWidth);
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
					ctx.drawImage(imgEngine[46], offset,offset,imgTrackWidth,imgTrackWidth);
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
					ctx.drawImage(imgCar[14], offset,offset,imgTrackWidth,imgTrackWidth);
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
				case "Octagon":
					ctx.strokeStyle = gridColorDark;
					ctx.translate(width/2, height/2);
					ctx.scale (0.8,0.8);
					drawOctagonOrSquare(1,1);
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
					ctx.drawImage(imgSaveIcon,5,8);
					break;
				case "Open":
					ctx.drawImage(imgLoadIcon,5,8);
					break;
				case "Download":
					ctx.drawImage(imgDownloadIcon,5,7);
					break;
				case "Upload":
					ctx.drawImage(imgUploadIcon,5,7);
					break;
				case "Signin":
					ctx.drawImage(imgSigninIcon,5,7);
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
		
});

/*
    cycle.js
    2017-02-07
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

// The file uses the WeakMap feature of ES6.

/*jslint es6, eval */

/*property
    $ref, decycle, forEach, get, indexOf, isArray, keys, length, push,
    retrocycle, set, stringify, test
*/

if (typeof JSON.decycle !== "function") {
    JSON.decycle = function decycle(object, replacer) {
        "use strict";

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form

//      {"$ref": PATH}

// where the PATH is a JSONPath string that locates the first occurance.

// So,

//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));

// produces the string '[{"$ref":"$"}]'.

// If a replacer function is provided, then it will be called for each value.
// A replacer function receives a value and returns a replacement value.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child element or
// property.

        var objects = new WeakMap();     // object to path mappings

        return (function derez(value, path) {

// The derez function recurses through the object, producing the deep copy.

            var old_path;   // The path of an earlier occurance of value
            var nu;         // The new object or array

// If a replacer function was provided, then call it to get a replacement value.

            if (replacer !== undefined) {
                value = replacer(value);
            }

// typeof null === "object", so go on if this value is really an object but not
// one of the weird builtin objects.

            if (
                typeof value === "object" && value !== null &&
                !(value instanceof Boolean) &&
                !(value instanceof Date) &&
                !(value instanceof Number) &&
                !(value instanceof RegExp) &&
                !(value instanceof String)
            ) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a {"$ref":PATH} object. This uses an
// ES6 WeakMap.

                old_path = objects.get(value);
                if (old_path !== undefined) {
                    return {$ref: old_path};
                }

// Otherwise, accumulate the unique value and its path.

                objects.set(value, path);

// If it is an array, replicate the array.

                if (Array.isArray(value)) {
                    nu = [];
                    value.forEach(function (element, i) {
                        nu[i] = derez(element, path + "[" + i + "]");
                    });
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    Object.keys(value).forEach(function (name) {
                        nu[name] = derez(
                            value[name],
                            path + "[" + JSON.stringify(name) + "]"
                        );
                    });
                }
                return nu;
            }
            return value;
        }(object, "$"));
    };
}


if (typeof JSON.retrocycle !== "function") {
    JSON.retrocycle = function retrocycle($) {
        "use strict";

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\([\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            if (value && typeof value === "object") {
                if (Array.isArray(value)) {
                    value.forEach(function (element, i) {
                        if (typeof element === "object" && element !== null) {
                            var path = element.$ref;
                            if (typeof path === "string" && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(element);
                            }
                        }
                    });
                } else {
                    Object.keys(value).forEach(function (name) {
                        var item = value[name];
                        if (typeof item === "object" && item !== null) {
                            var path = item.$ref;
                            if (typeof path === "string" && px.test(path)) {
                                value[name] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    });
                }
            }
        }($));
        return $;
    };
}
