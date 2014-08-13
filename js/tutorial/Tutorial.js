var Tutorial = function(scene, showAnimations) {
    this.scene = scene;

    this.startRadius = 280;
    this.endRadius = 350;

    this.showAnimations = showAnimations;

};

Tutorial.prototype = {

    _createAnimationStep1 : function() {

        var s = BABYLON.Mesh.CreateSphere("arrow", 5, 5, this.scene);
        s.material = new BABYLON.StandardMaterial("arrow", this.scene);
        s.material.diffuseColor = BABYLON.Color3.Yellow();
        s.material.specularColor = BABYLON.Color3.Black();
        this.sphere = s;

        var keys = [];
        var f = 0;
        var pos, height = 10;
        var startPos = QUARTO.pieces[0].position.clone();
        startPos.y = startPos.y*2+height;

        QUARTO.pieces.forEach(function(p) {
            pos = p.position.clone();
            pos.y = pos.y*2+height;

            var k = {frame:f, value: pos};
            keys.push(k);
            f+=6;

            k = {frame:f, value: pos};
            keys.push(k);
            f+=6;
        });
        keys.push({frame:f, value:startPos});

        var arrow = new BABYLON.Animation(
            "arrow",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        arrow.setKeys(keys);
        s.animations.push(arrow);
        this.scene.beginAnimation(s, 0, 200, true, 0.5);
    },

    _createAnimationStep2 : function() {

        var pieces = [0,6,8,14];
        var b = 0;
        var that = this;
        pieces.forEach(function(i) {
            var startPos = QUARTO.pieces[i].position;
            var endPos = QUARTO.board.getBasePosition(0,b++);
            endPos.y = QUARTO.pieces[i].position.y;
            var keys = [
                {
                    frame : 0,
                    value: startPos
                },
                {
                    frame:100,
                    value:endPos
                }
            ];

            var p = new BABYLON.Animation(
                "P"+i,
                "position",
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

            p.setKeys(keys);
            QUARTO.pieces[i].animations.push(p);
            that.scene.beginAnimation(QUARTO.pieces[i], 0, 100, false, 0.8);
        });
    },

    /**
     * Display the step 1 of the tutorial
     */
    step1: function(move) {

        // Put the bobble in pastel red
        GUI.colorTutorial();

        // If it's a back step, dont move the camera
        var camMoving = (move === false)?move: true;

        // Remove step 2 and 3
        GUI.removeTutorial(2);
        GUI.removeTutorial(3);

        // Create animation
        if (this.showAnimations) {
            // Remove animations from step 2
            var that = this;
            QUARTO.pieces.forEach(function(p) {
                that.scene.stopAnimation(p);
                p.reset();
            });
            this._createAnimationStep1();
        }

        // GUI
        var _this = this;
        var callback = function() {
            GUI.displayTutorialStep1(_this.step2, _this);
        };

        // Move camera and then call gui draw
        if (camMoving && this.showAnimations) {
            this._moveCamera("right", callback);
        } else {
            callback();
        }
    },

    step2 : function() {
        // Remove step 1 and 3
        GUI.removeTutorial(1);
        GUI.removeTutorial(3);

        if (this.showAnimations) {
            // Remove the animations from step 1
            this.sphere.dispose();
            // run animation
            this._createAnimationStep2();
        }

        var _this = this;
        GUI.displayTutorialStep2(
            _this.step1,
            _this.step3,
            _this
        );
    },

    step3 : function() {
        // Remove step 1 and 2
        GUI.removeTutorial(1);
        GUI.removeTutorial(2);

        if (this.showAnimations) {
            // Remove animations from step 2
            var that = this;
            QUARTO.pieces.forEach(function(p) {
                that.scene.stopAnimation(p);
                p.reset();
            });
        }

        var _this = this;
        GUI.displayTutorialStep3(
            _this.step2,
            _this.exitTutorial,
            _this
        );
    },

    exitTutorial : function() {
        // Revert the bobble background
        GUI.uncolorTutorial();
        if (this.showAnimations) {
            // Move camera to the left
            this._moveCamera("left");
            // Remove the animations from step 1
            this.sphere.dispose();
            // Remove animations from step 2
            var that = this;
            QUARTO.pieces.forEach(function(p) {
                that.scene.stopAnimation(p);
                p.reset();
            });
        }
        QUARTO.isTutorialActivated = false;
        GAME_STATES.GAME_STARTED = true;
    },

    /**
     * Move camera on the left or on the right, according to the given parameter
     * @private
     */
    _moveCamera : function(dir, callback) {
        var startPos = this.scene.activeCamera.target.z;
        var startRadius = this.scene.activeCamera.radius;
        var endPos, endRadius;

        switch (dir) {
            case "left":
                endPos = 0;
                endRadius = this.startRadius;
                break;
            case "right":
                endPos = 100;
                endRadius = this.endRadius;
                break;
        }
        var translate = new BABYLON.Animation(
            "camTranslate",
            "target.z",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        var radius = new BABYLON.Animation(
            "camAlpha",
            "radius",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        var keys = [{frame:0, value:startPos}, {frame:100, value:endPos}];
        var keys2 = [{frame:0, value:startRadius}, {frame:100, value:endRadius}];
        translate.setKeys(keys);
        radius.setKeys(keys2);
        this.scene.activeCamera.animations.push(translate);
        this.scene.activeCamera.animations.push(radius);
        this.scene.beginAnimation(this.scene.activeCamera, 0, 100, false, 5.0, callback);

    }

};