Base = function(name, size, position, scene, line, col) {
    BABYLON.Mesh.call(this, name, scene);

    var baseMat = new BABYLON.StandardMaterial("baseMat", scene);
    baseMat.diffuseColor = BABYLON.Color3.FromInts(227, 203, 181);
    baseMat.specularColor = BABYLON.Color3.Black();

    var data = BABYLON.VertexData.CreateCylinder(2, size, size, 60, scene);
    data.applyToMesh(this, false);
    this.position = position;
    this.material = baseMat;

    this.line = line;
    this.col = col;

    this.piece = null;
};

Base.prototype = Object.create(BABYLON.Mesh.prototype);
Base.prototype.constructor = Base;


/**
 * Update the base color to the player color
 * @param player
 */
Base.prototype.setToPlayer = function(player) {
    this.material.diffuseColor = player.color;
};

/**
 * Reset the base to its initial state
 */
Base.prototype.reset = function() {
    this.piece = null;
};

Base.prototype.setPiece = function(p) {
    this.piece = p;
};