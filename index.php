<?php include 'partials/header.php'; ?>
    <div data-role="page" id="splash" data-fullscreen="true">

        <div data-role="header">
            <img border="0" src="img/header.png" alt="Logo, Facebook" style="display:inline"/> 
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
            <img border="0" src="img/header.png" alt="Logo, Facebook" style="display:inline"/> 
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
