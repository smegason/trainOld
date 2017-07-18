<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
Cache-Control:public;
>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
		<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
		<meta content="utf-8" http-equiv="encoding">        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Train- Browse Tracks</title>
  		<link rel="stylesheet" href="css/normalize.css">
    </head>

    <body>
        		
<!--
	    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.8.3.min.js"><\/script>')</script>
        <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <script src="js/train.js" type="text/javascript"></script>
-->
		<img src=img/trainLogo.png>
        <h1>Browse Tracks</h1>
		<?php
		include 'php/connect.php';
		$con = mysqli_connect('localhost',$dbroot,$dbpassword,$dbname);
		if (!$con) {
		    echo "fail-connect";
		}
		$sql = "SELECT * FROM users, tracks WHERE users.userID = tracks.userID";
		$result = mysqli_query($con,$sql);
		if ($result) {
			while($row = mysqli_fetch_array($result)) {   //Creates a loop to loop through results
				$userID = $row['userID'];
				$trackID = $row['trackID'];
				$trackName = $row['trackName'];
				$trackDescription = $row['trackDescription'];
				$trainusername = $row['userName'];
				$encodedTrx = urlencode($row['track']);
				echo "<table>";
				echo "<tr><td>";
				echo "<h2>".$trackName."</h2>";
				echo "<h3> by ".$trainusername."</h3>";
				echo "<p>".$trackDescription."</p>";
				echo "<p>encTrx=".$encodedTrx."</p>";
				echo "</td><td>";

				echo '<td class="style24" style="width: 400px">';
				echo '<div id="outerdiv" style="width:400px; overflow-x:hidden;">';
				echo '<iframe src="train.html?resize=0&toolbar=0&trx='.$encodedTrx.' width="400" frameborder="0" id="inneriframe" scrolling=no >< /iframe>';
				echo '</div>';
				echo '</td>';

				echo "</td>";
				echo "</table>";
			}
		} else {
			echo "fail-login";
		}
		mysqli_close($con);
		?>
		       
		<!-- Dialog box for new user -->
		<div id="dialog-newUser" title="Create new user" style="display: none;">
		  <p class="validateTips"> </p>
		 
		  <form>
		    <fieldset>
		      <label for="name">Username</label>
		      <input type="text" name="username" id="username" value="" class="text ui-widget-content ui-corner-all">
		      <label for="password">Password</label>
		      <input type="password" name="password" id="password" value="" class="text ui-widget-content ui-corner-all">
		      <label for="email">Email</label>
		      <input type="text" name="email" id="email" value="" class="text ui-widget-content ui-corner-all">
		 
		      <!-- Allow form submission with keyboard without duplicating the dialog button -->
		      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
		    </fieldset>
		  </form>
		</div>
		 
		<!-- Dialog box for forgot password -->
		<div id="dialog-forgotPassword" title="Forgot password" style="display: none;">
		  <p class="validateTips"> </p>
		 
		  <form>
		    <fieldset>
		      <label for="email">Email</label>
		      <input type="text" name="email" id="email" value="" class="text ui-widget-content ui-corner-all">
		 
		      <!-- Allow form submission with keyboard without duplicating the dialog button -->
		      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
		    </fieldset>
		  </form>
		</div>
		 
		<!-- Dialog box for signinUser -->
		<div id="dialog-signinUser" title="Sign-in user" style="display: none;">
		  <p class="validateTips"> </p>
		  <form>
		    <fieldset>
		      <label for="name">Username</label>
		      <input type="text" name="username" id="usernameSignin" value="" class="text ui-widget-content ui-corner-all">
		      <label for="password">Password</label>
		      <input type="password" name="password" id="passwordSignin" value="" class="text ui-widget-content ui-corner-all">
		 	  <!---<input type="button" value="New User" id="newuser" style="float: right;">  --->
		 	  <div id="newuserlink" style="color:#0000FF; float: right;">New User</div>
		      <!-- Allow form submission with keyboard without duplicating the dialog button -->
		      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
		    </fieldset>
		  </form>
		</div>
		 
		<!-- Dialog box for browse tracks for download -->
		<div id="dialog-downloadTrack" title="Download track" style="display: none;">
		  <p class="validateTips"> </p>
		 
		  <form>
		    <fieldset>
		      <label for="name">Username</label>
		      <input type="text" name="username" id="username" value="" class="text ui-widget-content ui-corner-all">
		 
		      <!-- Allow form submission with keyboard without duplicating the dialog button -->
		      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
		    </fieldset>
		  </form>
		</div>
		 
		<!-- Dialog box for upload tracks -->
		<div id="dialog-uploadTrack" title="Upload track" style="display: none;">
		  <p class="validateTips"> </p>
		  <form>
		  	Upload your current track to train-hub.org
		    <fieldset>
		      <label for="trackname">Track name</label>
		      <input type="text" name="trackname" id="trackname" value="" class="text ui-widget-content ui-corner-all">
		      <label for="trackdescription">Track description</label>
		      <textarea name="trackdescription" id="trackdescription" value="" class="text ui-widget-content ui-corner-all" cols="35" rows="6"></textarea>
		      <!-- Allow form submission with keyboard without duplicating the dialog button -->
		      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
		    </fieldset>
		  </form>
		</div>


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
