var QUARTO = QUARTO ||{};

Piece = function(position, isTall, isBlack, isCubic, isSolidTop, scene) {
    BABYLON.Mesh.call(this, "piece", scene);

    var size  = isTall?Piece.TALL_SIZE:Piece.SMALL_SIZE,
        color = isBlack?Piece.BLACK_COLOR:Piece.WHITE_COLOR,
        meshTemplate, mesh;

    if (isCubic) {
        // Create box
        meshTemplate = BABYLON.Mesh.CreateBox("box", 1, scene);
        meshTemplate.scaling = new BABYLON.Vector3(Piece.SCALING, size, Piece.SCALING);
        this.scaling = new BABYLON.Vector3(Piece.SCALING, size, Piece.SCALING);

    } else {
        meshTemplate = BABYLON.Mesh.CreateCylinder("cylinder", size, Piece.SCALING, Piece.SCALING, 50, scene);
    }

    if (!isSolidTop){
        var toRemoveOnTop = BABYLON.Mesh.CreateSphere("toRemove", 10, Piece.SCALING/1.5, scene);
        toRemoveOnTop.position.y = size/2;
        var toRemove = BABYLON.CSG.FromMesh(toRemoveOnTop);
        var piece = BABYLON.CSG.FromMesh(meshTemplate);
        var res = piece.subtract(toRemove);

        mesh = res.toMesh("piece", null, scene);

        toRemoveOnTop.dispose();
    } else {
        mesh = meshTemplate.clone();
    }

    var g = mesh._geometry;
    g.applyToMesh(this);
    mesh.dispose();
    meshTemplate.dispose();

    var m = new BABYLON.StandardMaterial("m", scene);
    m.diffuseColor = color;
    this.material = m;
    this.oldMaterial = m;

    this.position = position.clone();
    this.position.y = size/2;

    this.isTall = isTall;
    this.isBlack = isBlack;
    this.isCubic = isCubic;
    this.isSolidTop = isSolidTop;
    this.isSelected = false;
    this.isOnBoard = false;
    this.initialPosition = null;
    this.size = size;

};

Piece.prototype = Object.create(BABYLON.Mesh.prototype);
Piece.prototype.constructor = Piece;

Piece.TALL_SIZE = 20;
Piece.SMALL_SIZE = Piece.TALL_SIZE/2;
Piece.SCALING = 10;

Piece.BLACK_COLOR = BABYLON.Color3.FromInts(72, 73, 74);
Piece.WHITE_COLOR = BABYLON.Color3.FromInts(245, 245, 245);

/**
 * Select or unselect this piece.
 * @param isSelected
 * @param material The material when this piece is selected
 */
Piece.prototype.setSelected = function(isSelected, material) {
    this.isSelected = isSelected;

    if (this.isSelected) {
        this.oldMaterial = this.material;
        this.material = material;
    } else {
        this.material = this.oldMaterial;
    }
};

Piece.prototype.setInitialPosition = function(pos) {
    this.position = pos.clone();
    this.initialPosition = pos.clone();
};

Piece.prototype.putOnBoard = function(base, callback) {
    var dst = base.getAbsolutePosition();

    this.animate(dst, callback);

    base.setPiece(this);

    this.isOnBoard = true;
};

Piece.prototype.getCode = function() {
    var code = 0;
    if (this.isSolidTop) {
        code += 1;
    }
    if (this.isCubic) {
        code += 2;
    }
    if (this.isBlack) {
        code += 4;
    }
    if (this.isTall) {
        code += 8;
    }
    return code;
};



var randomNumber = function (min, max) {
    if (min == max) {
        return (min);
    }
    var random = Math.random();
    return ((random * (max - min)) + min);
};


Piece.prototype.animate = function(dst, callback) {

    var oldY = this.position.y;

    var _this = this;

    // Animation from top to board
    var goDown = function() {

        var t = new Timer(250, QUARTO.scene, function() {

            var translationToBot = new BABYLON.Animation(
                "translationToBot",
                "position",
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var startPos = _this.position.clone();
            var endPos = dst.clone();
            endPos.y = oldY;
            // Animation keys
            var keys = [
                {
                    frame:0,
                    value:startPos
                },
                {
                    frame:100,
                    value:endPos
                }
            ];
            translationToBot.setKeys(keys);
            _this.animations.push(translationToBot);
            QUARTO.scene.beginAnimation(_this, 0, 100, false, 20, function() {
                QUARTO.sfx.play();
                shake();
                callback();
            });
        });
        t.start();
    };

    // Animation to top
    var translationToTop = new BABYLON.Animation(
        "translationToTop",
        "position",
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var startPos = this.position.clone();
    var endPos = dst.clone();
    endPos.y = 50;
    // Animation keys
    var keys = [
        {
            frame:0,
            value:startPos
        },
        {
            frame:100,
            value:endPos
        }
    ];
    translationToTop.setKeys(keys);
    this.animations.push(translationToTop);
    QUARTO.scene.beginAnimation(this, 0, 100, false, 10, goDown);
};

/**
 * Reset the piece to its initial state
 */
Piece.prototype.reset = function() {
    this.isSelected = false;
    this.isOnBoard = false;
    this.position.x = this.initialPosition.x;
    this.position.y = this.initialPosition.y;
    this.position.z = this.initialPosition.z;
    this.resetWinner();
};



Piece.prototype.setWinner = function() {
    this.material.diffuseColor = BABYLON.Color3.FromInts(161,152,191);
};

Piece.prototype.resetWinner = function() {
    if (this.isBlack) {
        this.material.diffuseColor = Piece.BLACK_COLOR;
    } else {
        this.material.diffuseColor = Piece.WHITE_COLOR;
    }
};