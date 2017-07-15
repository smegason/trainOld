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
  		<link rel="stylesheet" href="css/normalize.css">
    </head>

    <body>
        		
        <script src="js/train.js" type="text/javascript"></script>
		<img src=img/trainLogo.png>
        <br>Browse Tracks
		<?php
		include 'php/connect.php';
		$con = mysqli_connect('localhost',$dbroot,$dbpassword,$dbname);
		if (!$con) {
		    echo "fail-connect";
		}
		$sql = "SELECT * FROM tracks";
		$result = mysqli_query($con,$sql);
		if ($result) {
			while($row = mysqli_fetch_array($result)) {   //Creates a loop to loop through results
				$userID = $row['userID'];
				$trackID = $row['trackID'];
				$trackName = $row['trackName'];
				$trackDescription = $row['trackDescription'];
				$trainusername = "Username";
				echo "<table>";
				echo "<tr><td>";
				echo "<h1>".$trackName."</h1>";
				echo "<h2> by ".$trainusername."</h2>";
				echo "<p>".$trackDescription."</p>";
				echo "</td><td>";
		     	echo "<div id='container'; width:300px; height:200px;>
		            <canvas id='canvas' width=300 height=200 > </canvas>
			        </div>";
				echo "</td>";
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
