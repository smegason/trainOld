<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
Cache-Control:public;
>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Train- Browse Tracks</title>
        <meta name="description" content="">
		<meta name="viewport" content="user-scalable=no, width=device-width" />
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
       <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/main.css">
		<link rel="apple-touch-startup-image" href="img/startup.png" />
        <!-- <script type="text/javascript" charset="utf-8" src="cordova.js"></script>
        <script type="text/javascript" charset="utf-8" src="loggingHelper.js"></script> -->
        <script src="js/vendor/modernizr-2.6.2.min.js"></script>
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  		<!-- <link rel="stylesheet" href="/resources/demos/style.css"> -->
		<style>
		    label, input { display:block; }
		    input.text { margin-bottom:12px; width:95%; padding: .4em; }
		    fieldset { padding:0; border:0; margin-top:25px; }
		    h1 { font-size: 1.2em; margin: .6em 0; }
		    div#users-contain { width: 350px; margin: 20px 0; }
		    div#users-contain table { margin: 1em 0; border-collapse: collapse; width: 100%; }
		    div#users-contain table td, div#users-contain table th { border: 1px solid #eee; padding: .6em 10px; text-align: left; }
		    .ui-dialog .ui-state-error { padding: .3em; }
		    .validateTips { border: 1px solid transparent; padding: 0.3em; }
	  	</style>
   </head>

    <body ontouchmove="BlockMove(event);">
        
        <script>
	 		function BlockMove(event) {
	  		// Tell Safari not to move the window.
	  			event.preventDefault() ;
	 		}
		</script>
		
       <!-- <script src="http://jsconsole.com/remote.js?<495682754632174>"></script> -->
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.8.3.min.js"><\/script>')</script>
        <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <!--<script src="js/plugins.js"></script> -->
        <script src="js/train.js" type="text/javascript"></script>

     	<div id="container"; width:300px; height:200px;>
            <canvas id="canvas" width="500" height="500" > </canvas>
            <!--<canvas id="canvas" width=viewport.width height=viewport.height > </canvas>-->
            <!--<canvas id="canvas" width=window. window.innerWidth * window.devicePixelRatio height=window.innerHeight * window.devicePixelRatio > </canvas>-->
        </div>
		<!-- <div id="sound_element">
		    <embed src=sound_file_url hidden=false autostart=true loop=false>   
		</div> --> 		
        <br>Browse Tracks
		<?php
		echo "A";
		include 'php/connect.php';
		echo "B";
		$con = mysqli_connect('localhost',$dbroot,$dbpassword,$dbname);
		if (!$con) {
		    echo "fail-connect";
		}
		echo "C";
		$sql = "SELECT * FROM users";
		echo "D";
		$result = mysqli_query($con,$sql);
		echo "E";
		echo "F";
		if ($result) {
			echo "G";
			while($row = mysqli_fetch_array($result)) {   //Creates a loop to loop through results
				echo "H";
				$userID = $row['userID'];
				echo "I";
				$username = $row['userName'];
				echo "J";
				echo "&&&".$userID."&&&".$username."&&&";
			}
		} else {
			echo "fail-login";
		}
		mysqli_close($con);
		?>
		       
        <!--Train is open source on <a href="https://github.com/smegason/train/">github</a> -->
        
        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
        <!-- <script>
            var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
            (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
            s.parentNode.insertBefore(g,s)}(document,'script'));
        </script> -->



    </body>
</html>
        
<!--		<?php
		include 'php/connect.php';
		echo $dbroot.", ".$dbpassword.", ".$dbname;
		$con = mysqli_connect('localhost',$dbroot,$dbpassword,$dbname);
		if (!$con) {
		    echo "fail-connect";
		}
		echo "Connected";
		$sql = "SELECT * FROM tracks";
		$result = mysqli_query($con,$sql);
		echo $result;
		if ($result) {
			echo ".";
			echo "<table>"; // start a table tag in the HTML
			
			while($row = mysql_fetch_array($result)) {   //Creates a loop to loop through results
				echo "<tr><td>" . $row['trackID'] . "</td><td>" . $row['userID'] . "</td> <td>" . $row['trackName'] . "</td><td>" . $row['trackDescription'] . "</tr>"; 
			}
			
			echo "</table>"; //Close the table in HTML
			
		} else {
			echo "fail-login";
		}
		mysqli_close($con);
		?>  -->
