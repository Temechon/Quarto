var QUARTO = QUARTO || {};

// The number of turn
QUARTO.nbTurn = 0;

// The player currently playing
var currentPlayer = 1;

// All game states
var GAME_STATES = {
    // True if the game has started
    GAME_STARTED : false,

    PICK_FOR_PLAYER : true,

    SET_ON_BOARD : false,

    // True if a player won
    IS_FINISHED : false
};

// The function onload is loaded when the DOM has been loaded
document.addEventListener("DOMContentLoaded", function () {
    // Load sounds
    loadSounds();

    // Engine creation
    var canvas = GUI.getCanvas();
    QUARTO.engine = new BABYLON.Engine(canvas, true);

    // Resize the babylon engine when the window is resized
    window.addEventListener("resize", function () {
        if (QUARTO.engine) {
            QUARTO.engine.resize();
        }
    },false);

    // The render function
    QUARTO.engine.runRenderLoop(function () {
        if (QUARTO.scene) {
            QUARTO.scene.render();
        }
    });

}, false);


var initGame = function() {

    QUARTO.board.reset();
    // Position piece
    var alpha = 0, r = 120;
    QUARTO.pieces.forEach(function(p){
        var x = Math.cos(alpha)*r;
        var z = Math.sin(alpha)*r;
        p.setInitialPosition(new BABYLON.Vector3(x, p.size/2, z));
        alpha += Math.PI*2/16;

        // Reset piece
        p.reset();
    });

    // Current action
    GUI.setCurrentAction(1, GUI.PICK_ACTION);
    GAME_STATES.IS_FINISHED = false;
    GAME_STATES.PICK_FOR_PLAYER = true;
    var currentPlayer = 1;
    QUARTO.nbTurn = 0;

    // Disbale physics
    QUARTO.scene.disablePhysicsEngine();

    GUI.resetGUI();
};


/**
 * Onload function : creates the babylon engine and the scene
 */
var onload = function () {

    // The game scene
    QUARTO.scene = new BABYLON.Scene(QUARTO.engine);

    // Hide the login screen when the scene is ready
    QUARTO.scene.executeWhenReady(function() {
        GUI.removeLogin();
        GUI.displayStartingTutorial();
    });

    // Environment
	initEnvironment();

    // Game
    QUARTO.board = new Gameboard(100, QUARTO.scene);

    QUARTO.pieces = [];

    // Create pieces
    var count = 0;
    for (var i=0; i<Gameboard.LINE; i++) {
        for (var j=0; j<Gameboard.COL; j++) {
            var isTall, isBlack, isCubic, isSolidTop;
            isSolidTop = ((count & 1) == 1);
            isCubic = ((count & 2) == 2);
            isBlack = ((count & 4) == 4);
            isTall = ((count & 8) == 8);
            count ++;
            var p = new Piece(QUARTO.board.getBasePosition(i, j), isTall, isBlack, isCubic, isSolidTop, QUARTO.scene);
            QUARTO.pieces.push(p);
        }
    }

    initGame();
    GUI.showGUI();

    var selectedMesh;

    /** GAME LOGIC **/
    QUARTO.scene.onPointerDown = function (evt, pickResult) {
        if (GAME_STATES.GAME_STARTED) {
            if (pickResult.hit && !GAME_STATES.IS_FINISHED) {
                var mesh = pickResult.pickedMesh;

                // IF the player choose a piece for the other player
                if (GAME_STATES.PICK_FOR_PLAYER && mesh instanceof Piece && !mesh.isOnBoard) {
                    // Unselect all pieces
                    QUARTO.pieces.forEach(function(p) {
                        p.setSelected(false);
                    });
                    // Set this mesh as selected
                    mesh.setSelected(true, QUARTO.scene.getMaterialByID("sp"));
                    // Keep in memory the selected one
                    selectedMesh = mesh;
                    // Switch player
                    switchPlayer();
                } else if (GAME_STATES.SET_ON_BOARD && mesh instanceof Base) {

                    // If the base does not contain a piece already
                    if (!mesh.piece) {

                        //move the piece to the selected base
                        var base = QUARTO.board.getBase(mesh.line, mesh.col);
                        GAME_STATES.SET_ON_BOARD = false;
                        GAME_STATES.PICK_FOR_PLAYER = true;

                        selectedMesh.putOnBoard(base, function() {
                            if (selectedMesh != null) {
                                selectedMesh.setSelected(false);
                                selectedMesh = null;
                                var winTest = QUARTO.board.isWin();
                                if (winTest.isWin) {
                                    goFinish(winTest.bases);
                                } else {
                                    // display next action
                                    GUI.setCurrentAction(currentPlayer, GUI.PICK_ACTION);
                                }
                            }
                        });
                    }
                }
            }
        }
    };

    // Attach events
    GUI._get("tutorial").onclick = function() {
        if (! QUARTO.isTutorialActivated) {
            var t = new Tutorial(QUARTO.scene, false);
            t.step1();
            QUARTO.isTutorialActivated = true;
        }
    };

};

/**
 * The winning pieces
 * @param pieces
 */
var goFinish = function(bases) {

    bases.forEach(function(b) {
        b.piece.setWinner();
    });

    // Display win
    GUI.displayWin(QUARTO.players[currentPlayer-1].name);
    GAME_STATES.IS_FINISHED = true;
    // Activate physics ;)
    QUARTO.scene.enablePhysics(null, new BABYLON.OimoJSPlugin());

    QUARTO.board.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0});
    var time = 0;

    OIMO.WORLD_SCALE = 10;
    OIMO.INV_SCALE = 1/10;

    QUARTO.pieces.forEach(function(p) {
        if (! p.isOnBoard) {
            var t = new Timer(time, QUARTO.scene, function() {
                p.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:1});
            });
            t.start();
            time+=250;
        }
    });
};

/**
 * Initialize the game environment : light, skybox, camera
 */
var initEnvironment = function() {

    // Update the scene background color
    QUARTO.scene.clearColor=new BABYLON.Color3(0.8,0.8,0.8);

    // Hemispheric light to light the scene
    new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), QUARTO.scene);

    // Skydome
    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 20, 2000, QUARTO.scene);

    // The sky creation
    BABYLON.Engine.ShadersRepository = "shaders/";

    var shader = new BABYLON.ShaderMaterial("gradient", QUARTO.scene, "gradient", {});
    shader.setFloat("offset", 200);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;

    // Camera attached to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 1.05, 280, BABYLON.Vector3.Zero(), QUARTO.scene);
//    camera.lowerAlphaLimit = -0.0001;
//    camera.upperAlphaLimit = 0.0001;
    camera.lowerRadiusLimit = 150;
    camera.upperRadiusLimit = 350;
    camera.upperBetaLimit = Math.PI/2;
    camera.attachControl(GUI.getCanvas());
    camera.maxZ = 2000;
};

/**
 * Switch the current player
 */
var switchPlayer = function() {
    QUARTO.nbTurn ++;
    currentPlayer = currentPlayer%2+1;
    // Display message
    GUI.setCurrentAction(currentPlayer, GUI.PUT_ACTION);

    GAME_STATES.PICK_FOR_PLAYER = false;
    GAME_STATES.SET_ON_BOARD = true;
};

/*--- LOGIN FUNCTIONS ---*/

var forward = function() {

    // Create players
    var name1 = GUI.getName(1);
    var name2 = GUI.getName(2);
    QUARTO.players = [
        new Player(name1, BABYLON.Color3.Green()),
        new Player(name2, BABYLON.Color3.Red())
    ];

    // Display loader
    GUI.displayLoader();

    // Display names
    GUI.displayNames(name1, name2);

    // forward
    onload();
};

/**
 * Load sound effect
 */
var loadSounds = function() {
    var sound = new Howl({
        urls: ['sfx/boom1.wav']
    });
    QUARTO.sfx = sound;
};

var shake = function(value) {
    var shakeValue = value || 10,
        oldTarget = QUARTO.scene.activeCamera.target,
        min = -0.5,
        max = -min;

    QUARTO.scene.registerBeforeRender(function() {
        if (shakeValue > 0) {
            var dx = randomNumber(min, max),
                dy = randomNumber(min, max),
                dz = randomNumber(min, max);
            var target = QUARTO.scene.activeCamera.target;
            var newTarget = target.add(new BABYLON.Vector3(dx, dy, dz));
            QUARTO.scene.activeCamera.target = newTarget;
            shakeValue --;
            if (shakeValue == 0) {
                QUARTO.scene.activeCamera.target = oldTarget;
            }
        }
    });

};
