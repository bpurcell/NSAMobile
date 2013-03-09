<?php include 'partials/header.php'; ?>
<div data-role="page" id="headlap_image" class="image_wrap" data-fullscreen="true">
    <div data-role="header">
        <h1>Headlap and Exposure</h1>
    </div><!-- /header -->
    <div data-role="content" style="height:400px">
        
        <img class="zoom" src="img/3a_1.jpg">
        
    </div>
    <div data-role="footer">
        <input type="range" name="slider" id="slider" class="slider" value="1" min="1" max="5" data-folder="3a"  />
        <div data-role="navbar" data-iconpos="left">
              <ul>
                  <li><a href="" data-icon="back" data-rel="back">Back</a></li>
                  <li><a href="#home" data-icon="home">Home</a></li>
                  <li><a href="#headlap_detail" data-rel="dialog" data-icon="bars">Details</a></li>
              </ul>
          </div>
    </div>
</div>




</body>
</html>