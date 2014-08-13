var GUI = {

    PUT_ACTION:"Put",

    PICK_ACTION:"Pick",

    /**
     * Return a HTML element by its id
     * @param id
     * @returns {HTMLElement}
     */
    _get : function(id){
        return document.getElementById(id);
    },

    /**
     * Add the css class name to the given html element
     * @param id
     * @param className
     * @private
     */
    _addClass : function(id, className) {
        GUI._get(id).classList.add(className);
    },

    /**
     * Remove the css class name to the given html element
     * @param id
     * @param className
     * @private
     */
    _removeClass : function(id, className) {
        GUI._get(id).classList.remove(className);
    },

    /**
     * Display the current action on screen for the given player
     * @param playerId
     * @param actionId PUT_ACTION or PICK_ACTION
     */
    setCurrentAction : function(playerId, actionId) {
        // Reset actions
        GUI._removeClass("p1Put", "currentAction");
        GUI._removeClass("p1Pick", "currentAction");
        GUI._removeClass("p2Put", "currentAction");
        GUI._removeClass("p2Pick", "currentAction");

        GUI._removeClass("gui1", "currentPlayer");
        GUI._removeClass("gui2", "currentPlayer");

        var html = "p"+playerId+actionId;
        GUI._addClass(html, "currentAction");
        var gui = "gui"+playerId;
        GUI._addClass(gui, "currentPlayer");
    },

    /**
     * Returns the player name from the login form
     * @param playerId 1 or 2
     * @returns {string}
     */
    getName : function(playerId) {
        return GUI._get("player"+playerId).value || "Player"+playerId;
    },

    /**
     * Display the loader
     */
    displayLoader : function() {
        GUI._get("loader").style.visibility = "";
    },

    /**
     * Display player names on the gui
     * @param name1
     * @param name2
     */
    displayNames : function(name1, name2) {
        GUI._get("p1name").innerHTML = name1;
        GUI._get("p2name").innerHTML = name2;
    },

    /**
     * Remove the login screen
     */
    removeLogin : function() {
        var obj = GUI._get("loginWrapper");
        // remove the login screen
        obj.style.transform = "translateX(-120%)";
        obj.style.webkitTransform = "translateX(-120%)";
        obj.addEventListener("transitionend", function() {
            obj.style.display = "none";
        });
    },

    /**
     * Returns the canvas html element
     * @returns {HTMLElement}
     */
    getCanvas : function() {
        return GUI._get("renderCanvas");
    },

    /**
     * Display the win message with a replay button
     * @param playerId 1 or 2
     */
    displayWin : function(name) {
        GUI._get("winnerName").innerHTML = name;
        GUI._get("win").style.transform = "translateY(0)";
        GUI._get("win").style.webkitTransform = "translateY(0)";
    },

    resetGUI: function() {
        // remove win screen
        GUI._get("win").style.transform = "translateY(-200%)";
        GUI._get("win").style.webkitTransform = "translateY(-200%)";
    },

    /**
     * Display the player GUI (on right and left)
     */
    showGUI : function() {
        GUI._get("gui1").style.transform  = "translateY(0)";
        GUI._get("gui1").style.webkitTransform  = "translateY(0)";
        GUI._get("gui2").style.transform  = "translateY(0)";
        GUI._get("gui2").style.webkitTransform  = "translateY(0)";
        GUI._get("tutorial").style.transform  = "translateY(0)";
        GUI._get("tutorial").style.webkitTransform  = "translateY(0)";
    },

    /**
     * Remove a tutorial
     * @param id
     */
    removeTutorial : function(id) {
        GUI._get("step"+id).style.opacity = "0";
        GUI._get("step"+id).style.visibility = "hidden";
    },

    displayTutorialStep1 : function(clickStep2, ctx) {
        // Attach events for buttons
        GUI._get("toStep2").onclick = function() {
            clickStep2.call(ctx, null);
        };

        GUI._get("step1").style.visibility = "visible";
        GUI._get("step1").style.opacity = "1";
    },

    displayTutorialStep2 : function(clickStep1, clickStep3, ctx) {
        // Attach events for buttons
        GUI._get("toStep3").onclick = function() {
            clickStep3.call(ctx, null);
        };

        GUI._get("backStep1").onclick = function() {
            clickStep1.call(ctx, false);
        };

        GUI._get("step2").style.visibility = "visible";
        GUI._get("step2").style.opacity = "1";
    },

    displayTutorialStep3 : function(clickStep2, finish, ctx) {

        GUI._get("backStep2").onclick = function() {
            clickStep2.call(ctx, null);
        };
        GUI._get("finish").onclick = function() {
            GUI.removeTutorial(1);
            GUI.removeTutorial(2);
            GUI.removeTutorial(3);
            finish.call(ctx, null);
        };

        GUI._get("step3").style.visibility = "visible";
        GUI._get("step3").style.opacity = "1";

    },

    colorTutorial : function() {
        GUI._get("tutorial").style.backgroundColor = "red";
    },

    uncolorTutorial : function() {
        GUI._get("tutorial").style.backgroundColor = "#3f3b60";
    },
    displayStartingTutorial : function() {

        GUI._get("startingTutorial").style.transform  = "translateY(0)";
        GUI._get("startingTutorial").style.webkitTransform  = "translateY(0)";

        // Display tutorial if NO
        GUI._get("startingTutorialNo").onclick = function() {
            if (! QUARTO.isTutorialActivated) {
                // Remove rules
                GUI._get("startingTutorial").style.transform  = "translateY(-300%)";
                GUI._get("startingTutorial").style.webkitTransform  = "translateY(-300%)";

                var t = new Tutorial(QUARTO.scene, true);
                t.step1();
                QUARTO.isTutorialActivated = true;
            }
        };

        // Remove starting tutorial if YES
        GUI._get("startingTutorialYes").onclick = function() {
            // Remove rules
            GUI._get("startingTutorial").style.transform  = "translateY(-300%)";
            GUI._get("startingTutorial").style.webkitTransform  = "translateY(-300%)";
            GAME_STATES.GAME_STARTED = true;
        };
    }


};
