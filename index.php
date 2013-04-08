<?php include 'partials/header.php'; ?>

<div id="preloader" style="display:none">
    <img src="img/1_1.jpg" width="1" height="1" />
    <img src="img/1_2.jpg" width="1" height="1" />
    <img src="img/1_3.jpg" width="1" height="1" />
    <img src="img/1_4.jpg" width="1" height="1" />
    <img src="img/1_5.jpg" width="1" height="1" />
    <img src="img/1_6.jpg" width="1" height="1" />
    <img src="img/1_7.jpg" width="1" height="1" />
    <img src="img/1_8.jpg" width="1" height="1" />
    <img src="img/1_9.jpg" width="1" height="1" />
    <img src="img/1_10.jpg" width="1" height="1" />
    <img src="img/1_11.jpg" width="1" height="1" />
    <img src="img/1_12.jpg" width="1" height="1" />
    <img src="img/1_13.jpg" width="1" height="1" />
    <img src="img/1_14.jpg" width="1" height="1" />
    <img src="img/3a_1.jpg" width="1" height="1" />
    <img src="img/3a_2.jpg" width="1" height="1" />
    <img src="img/3a_3.jpg" width="1" height="1" />
    <img src="img/3a_4.jpg" width="1" height="1" />
    <img src="img/3a_5.jpg" width="1" height="1" />
    <img src="img/3b_1.jpg" width="1" height="1" />
    <img src="img/3b_2.jpg" width="1" height="1" />
    <img src="img/3b_3.jpg" width="1" height="1" />
    <img src="img/3b_4.jpg" width="1" height="1" />
    <img src="img/3b_5.jpg" width="1" height="1" />
    <img src="img/3b_6.jpg" width="1" height="1" />
    <img src="img/5a_1.jpg" width="1" height="1" />
    <img src="img/5a_2.jpg" width="1" height="1" />
    <img src="img/5a_3.jpg" width="1" height="1" />
    <img src="img/5a_4.jpg" width="1" height="1" />
    <img src="img/5a_5.jpg" width="1" height="1" />
    <img src="img/5a_6.jpg" width="1" height="1" />
    <img src="img/5a_7.jpg" width="1" height="1" />
    <img src="img/5b_1.jpg" width="1" height="1" />
    <img src="img/5b_2.jpg" width="1" height="1" />
    <img src="img/5b_3.jpg" width="1" height="1" />
    <img src="img/5b_4.jpg" width="1" height="1" />
    <img src="img/5b_5.jpg" width="1" height="1" />
    <img src="img/5b_6.jpg" width="1" height="1" />
    <img src="img/9_1.jpg" width="1" height="1" />
    <img src="img/9_2.jpg" width="1" height="1" />
    <img src="img/9_3.jpg" width="1" height="1" />
    <img src="img/9_4.jpg" width="1" height="1" />
    <img src="img/9_5.jpg" width="1" height="1" />
    <img src="img/9_6.jpg" width="1" height="1" />
    <img src="img/9_7.jpg" width="1" height="1" />
    <img src="img/21a_1.jpg" width="1" height="1" />
    <img src="img/21a_2.jpg" width="1" height="1" />
    <img src="img/21a_3.jpg" width="1" height="1" />
    <img src="img/21a_4.jpg" width="1" height="1" />
    <img src="img/21a_5.jpg" width="1" height="1" />
    <img src="img/21a_6.jpg" width="1" height="1" />
    <img src="img/21a_7.jpg" width="1" height="1" />
    <img src="img/21b_1.jpg" width="1" height="1" />
    <img src="img/21b_2.jpg" width="1" height="1" />
    <img src="img/21b_3.jpg" width="1" height="1" />
    <img src="img/21b_4.jpg" width="1" height="1" />
    <img src="img/21b_5.jpg" width="1" height="1" />
    <img src="img/21b_6.jpg" width="1" height="1" />
    <img src="img/21b_7.jpg" width="1" height="1" />
    <img src="img/21b_8.jpg" width="1" height="1" />
    <img src="img/21b_9.jpg" width="1" height="1" />
    <img src="img/21b_10.jpg" width="1" height="1" />
</div>


    <div data-role="page" id="splash" data-fullscreen="true">

        <div data-role="header">
            <img border="0" src="images/header.png" alt="Logo, Facebook" style="display:inline"/> 
        </div><!-- /header -->
    
        <div data-role="content">     
            <h2>Welcome to NSA Mobile</h2>
            <p>A field tool for contractors and architects, this mobile guide is a quick reference to information published in NSA's <strong>Slate Roofs Design and Installation Manual</strong>.</p>    
            <h3>Please select an option:</h3>
            <a href="#home" data-role="button">Roof Installation Techniques</a>
            <a href="http://slateassociation.org/" data-role="button">Full NSA Website</a>

        </div><!-- /content -->

    </div>
    <div data-role="page" id="home" data-fullscreen="true">

        <div data-role="header">
            <img border="0" src="images/header.png" alt="Logo, Facebook" style="display:inline"/> 
        </div><!-- /header -->
    
        <div data-role="content">     
            <h2>NSA Field Guide Installation Topics</h2>
            <h3>Please select an option below:</h3>
            <a href="#nails" data-role="button">Nails and Nailing</a>
            <a href="#headlap" data-role="button">Headlap</a>
            <a href="#repair" data-role="button">Slate Repair</a>
            <a href="#eave" data-role="button">Eave Edge</a>
            <a href="#headwall" data-role="button">Headwall</a>

        </div><!-- /content -->

    </div>

<?php include 'partials/nails.php'; ?>
<?php include 'partials/headlap.php'; ?>
<?php include 'partials/repair.php'; ?>
<?php include 'partials/eave.php'; ?>
<?php include 'partials/headwall.php'; ?>

</body>
</html>
