/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Battle extends Phaser.State {
        init(ships) {
            // Re-add background
            this.game.add.tileSprite(0, 0, 2560, 1440, "background");
            Battle.STATUS_MENU = Game.addStatusMenu(this.game);
            // Reconstruct the ships
            Game.PhysicsObject.clearObjects();
            this.allShips = new Array();
            for (let aShip of ships) {
                let shipType = aShip.getType();
                let shipX = aShip.sprite.x;
                let shipY = aShip.sprite.y;
                let shipTeam = aShip.team;
                this.allShips.push(new shipType(this.game, shipX, shipY, shipTeam));
            }
            Battle.CurrentBattle = this;
        }
        preload() {
            Battle.started = false;
            const WORLD_WIDTH = this.game.world.bounds.width;
            const WORLD_HEIGHT = this.game.world.bounds.height;
            // Build a wall and make the ships pay for it!
            // For some reason horizontal walls only go half way across so need to double width
            let wallWidth = 1;
            new Game.Wall(this.game, 0, 0, WORLD_WIDTH, wallWidth, false); // Top
            new Game.Wall(this.game, 0, WORLD_HEIGHT - wallWidth, WORLD_WIDTH, wallWidth, false); // Bottom
            new Game.Wall(this.game, 0, 0, wallWidth, WORLD_HEIGHT, false); // Left
            new Game.Wall(this.game, WORLD_WIDTH - wallWidth, 0, wallWidth, WORLD_HEIGHT, false); // Right
            // Set up a Play button to trigger the fight to start
            this.playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, "play", this.start, this);
            this.playButton.anchor.setTo(0.5, 0.5);
            this.playButton.scale.setTo(4, 4);
        }
        start() {
            Battle.started = true;
            this.playButton.destroy();
            Battle.STATUS_MENU.setText(Game.getStatusText(this.game));
        }
        addEndingText(prompt, x, y) {
            let promptText = this.game.add.text(x, y, prompt, {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 100px Titillium Web"
            });
            promptText.anchor.setTo(0.5, 0.5);
            promptText.inputEnabled = true;
            promptText.events.onInputDown.addOnce(function () {
                this.game.state.start("DifficultyMenu");
            }, this);
        }
        update() {
            if (!Battle.started) {
                return;
            }
            let enemiesAlive = this.allShips.some(function (ship) {
                return ship.team !== 1 && ship.health > 0;
            });
            let alliesAlive = this.allShips.some(function (ship) {
                return ship.team === 1 && ship.health > 0;
            });
            if (!enemiesAlive) {
                this.addEndingText("Green team won!", this.game.world.centerX, this.game.world.centerY - 100);
            }
            else if (!alliesAlive) {
                this.addEndingText("Green team lost!", this.game.world.centerX, this.game.world.centerY - 100);
            }
            if (!enemiesAlive || !alliesAlive) {
                this.addEndingText("Click here to play again.", this.game.world.centerX, this.game.world.centerY + 100);
                Battle.started = false;
                Battle.STATUS_MENU.setText(Game.getStatusText(this.game));
                return;
            }
            if (Game.PhysicsObject.objects) {
                for (let object of Game.PhysicsObject.objects) {
                    object.update();
                }
            }
        }
    }
    Battle.CurrentBattle = null;
    Battle.started = false;
    Game.Battle = Battle;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "too-many-lasers/assets/loader.png");
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        }
        create() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            if (this.game.device.desktop) {
            }
            else {
            }
            this.game.state.start("Preloader", true, false);
        }
    }
    Game.Boot = Boot;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class DifficultyMenu extends Phaser.State {
        create() {
            this.game.add.tileSprite(0, 0, 2560, 1440, "background");
            Game.Battle.STATUS_MENU = Game.addStatusMenu(this.game);
            Game.makeTitle(this.game);
            this.addDifficultyText("Play Easy", Game.Difficulty.Easy, this.game.world.centerX, this.game.world.centerY - 60);
            this.addDifficultyText("Play Medium", Game.Difficulty.Medium, this.game.world.centerX, this.game.world.centerY + 140);
            this.addDifficultyText("Play Hard", Game.Difficulty.Hard, this.game.world.centerX, this.game.world.centerY + 340);
        }
        setMode(diff) {
            Game.ModeMenu.Difficulty = diff;
            this.game.state.start("ModeMenu");
        }
        addDifficultyText(prompt, diff, x, y) {
            let promptText = this.game.add.text(x, y, prompt, {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 100px Titillium Web"
            });
            promptText.anchor.setTo(0.5, 0.5);
            promptText.inputEnabled = true;
            promptText.events.onInputDown.addOnce(function () {
                this.setMode(diff);
            }, this);
        }
    }
    Game.DifficultyMenu = DifficultyMenu;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game_1) {
    class Game extends Phaser.Game {
        constructor() {
            super(2560, 1440, Phaser.AUTO, "game-container", null);
            this.state.add("Boot", Game_1.Boot, false);
            this.state.add("Preloader", Game_1.Preloader, false);
            this.state.add("DifficultyMenu", Game_1.DifficultyMenu, false);
            this.state.add("ModeMenu", Game_1.ModeMenu, false);
            this.state.add("Placement", Game_1.Placement, false);
            this.state.add("Battle", Game_1.Battle, false);
            this.state.start("Boot");
        }
    }
    Game_1.Game = Game;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class ModeMenu extends Phaser.State {
        create() {
            this.game.add.tileSprite(0, 0, 2560, 1440, "background");
            Game.Battle.STATUS_MENU = Game.addStatusMenu(this.game);
            Game.makeTitle(this.game);
            this.addModeText("Player vs Player", Game.Mode.pvp, this.game.world.centerX, this.game.world.centerY - 60);
            this.addModeText("Player vs AI", Game.Mode.pve, this.game.world.centerX, this.game.world.centerY + 140);
            this.addModeText("AI vs AI", Game.Mode.eve, this.game.world.centerX, this.game.world.centerY + 340);
        }
        startBattle(mode) {
            Game.Placement.Difficulty = ModeMenu.Difficulty;
            Game.Placement.Mode = mode;
            this.game.state.start("Placement");
        }
        addModeText(prompt, mode, x, y) {
            let promptText = this.game.add.text(x, y, prompt, {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 100px Titillium Web"
            });
            promptText.anchor.setTo(0.5, 0.5);
            promptText.inputEnabled = true;
            promptText.events.onInputDown.addOnce(function () {
                this.startBattle(mode);
            }, this);
        }
    }
    Game.ModeMenu = ModeMenu;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class PhysicsObject {
        constructor(game, sprite, health, team) {
            this.sprite = sprite;
            this.health = health;
            this.team = team;
            game.physics.p2.enableBody(sprite, false);
            this.sprite = sprite;
            this.body = this.sprite.body;
            // TODO: add correct shape for object...
            // this.body.clearShapes();
            // Initialize groups if needed
            if (PhysicsObject.collisionGroups == null) {
                PhysicsObject.collisionGroups = new Array();
                for (let i = 0; i < PhysicsObject.numCollisionGroups; i++) {
                    PhysicsObject.collisionGroups.push(game.physics.p2.createCollisionGroup());
                }
            }
            if (PhysicsObject.objects == null) {
                PhysicsObject.objects = new Array();
            }
            // set collisions
            this.body.setCollisionGroup(PhysicsObject.collisionGroups[this.team]);
            for (let i = 0; i < PhysicsObject.numCollisionGroups; i++) {
                // everything collides with obstacles, and every other group besides their own.
                if (i === 0 || i !== this.team) {
                    this.body.collides(PhysicsObject.collisionGroups[i], collideBodies, null);
                }
            }
            // store reference to self for access in collide
            this.body.physicsObject = this;
            PhysicsObject.objects.push(this);
        }
        update() {
            // Do stuff
        }
        // TODO: ensure collide is called
        collide(otherThing) {
            if (!otherThing) {
                return;
            }
            // Interesting concept: Kill the thing with lower health,
            // and subtract that health from the other thing's health
            if (otherThing.health < this.health) {
                this.takeDamage(otherThing.health);
                otherThing.die();
            }
            else if (this.health < otherThing.health) {
                otherThing.takeDamage(this.health);
                this.die();
            }
            else {
                // If both healths are equal, kill both
                otherThing.die();
                this.die();
            }
        }
        takeDamage(amount) {
            this.health -= amount;
            if (this.health <= 0) {
                this.die();
            }
        }
        die() {
            // Do stuff
            if (!this.body || !this.sprite) {
                return;
            }
            this.health = 0;
            this.sprite.destroy();
            let i = PhysicsObject.objects.indexOf(this);
            if (i !== -1) {
                PhysicsObject.objects.splice(i, 1);
            }
        }
        static clearObjects() {
            PhysicsObject.objects = null;
            PhysicsObject.collisionGroups = null;
        }
    }
    // Collision groups - one for each team, with team 0 being obstacles etc.
    PhysicsObject.collisionGroups = null;
    PhysicsObject.objects = null;
    PhysicsObject.numCollisionGroups = 4;
    Game.PhysicsObject = PhysicsObject;
    function collideBodies(body1, body2) {
        if (!body1 || !body2) {
            return;
        }
        body1.physicsObject.collide(body2.physicsObject);
    }
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    // these map to the enemy resource amount in FleetCompGenerator
    (function (Difficulty) {
        Difficulty[Difficulty["Easy"] = 1] = "Easy";
        Difficulty[Difficulty["Medium"] = 0.9] = "Medium";
        Difficulty[Difficulty["Hard"] = 0.75] = "Hard";
    })(Game.Difficulty || (Game.Difficulty = {}));
    var Difficulty = Game.Difficulty;
    (function (Mode) {
        Mode[Mode["pvp"] = 1] = "pvp";
        Mode[Mode["pve"] = 2] = "pve";
        Mode[Mode["eve"] = 3] = "eve";
    })(Game.Mode || (Game.Mode = {}));
    var Mode = Game.Mode;
    class Placement extends Phaser.State {
        constructor(...args) {
            super(...args);
            this.enemies = null;
            this.allies = null;
            this.allShips = null;
            this.costText = new Array();
            this.shouldUpdate = false;
        }
        preload() {
            Game.PhysicsObject.clearObjects();
            this.enemies = new Array();
            this.allies = new Array();
            this.allShips = new Array();
            this.graphics = this.game.add.graphics(0, 0);
            this.game.add.tileSprite(0, 0, 2560, 1440, "background");
            Game.Battle.STATUS_MENU = Game.addStatusMenu(this.game);
            // enable p2 physics
            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.setImpactEvents(true);
            // pick a random seed
            Placement.Seed = this.game.rnd.integer();
            // if console is open, prompt the user to select a seed
            let element = new Image();
            Object.defineProperty(element, "id", {
                get: function () {
                    Placement.Seed = parseInt(prompt("Enter a seed value", Placement.Seed.toString()), 10);
                }
            });
            console.log("%cTesting if console is open.", element);
            console.log("Using seed: %i.", Placement.Seed);
            // Seed RNG with selected seed.
            this.game.rnd.sow([Placement.Seed]);
            const WORLD_WIDTH = this.game.world.bounds.width;
            const WORLD_HEIGHT = this.game.world.bounds.height;
            // Fleet generator and parameters per team
            this.fleetGenerator = new Game.FleetCompGenerator(this.game);
            this.alliesParams = {
                maxX: WORLD_WIDTH / 2 - Placement.FLEET_BOUNDS_PADDING,
                maxY: WORLD_HEIGHT - Placement.FLEET_BOUNDS_PADDING,
                minX: Placement.FLEET_BOUNDS_PADDING,
                minY: Placement.FLEET_BOUNDS_PADDING,
                resources: Placement.EnemyResourceCount * Placement.Difficulty,
                teamNumber: 1,
            };
            this.enemiesParams = {
                maxX: WORLD_WIDTH - Placement.FLEET_BOUNDS_PADDING,
                maxY: WORLD_HEIGHT - Placement.FLEET_BOUNDS_PADDING,
                minX: WORLD_WIDTH / 2 + Placement.FLEET_BOUNDS_PADDING,
                minY: Placement.FLEET_BOUNDS_PADDING,
                resources: Placement.EnemyResourceCount,
                teamNumber: 2,
            };
            // Generate enemy fleet if applicable
            this.fleetGenerator.setParams(this.enemiesParams);
            this.enemiesResourcesAvailable = this.fleetGenerator.params.resources;
            if (Placement.Mode > 1) {
                this.enemies = this.fleetGenerator.generateFleet();
                this.enemiesResourcesAvailable = -1;
            }
            // Generate ally fleet if applicable
            this.fleetGenerator.setParams(this.alliesParams);
            this.alliesResourcesAvailable = this.fleetGenerator.params.resources;
            if (Placement.Mode > 2) {
                this.allies = this.fleetGenerator.generateFleet();
                this.alliesResourcesAvailable = -1;
            }
            this.initializePlacementUI();
            this.game.input.onDown.add(this.click, this);
            this.confirmKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.confirmKeyState = true;
        }
        initializePlacementUI() {
            this.instructionsText = this.game.add.text(10, 10, "Press (key) to place a ship, click a ship to remove it, enter to accept placement.", {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 35px Titillium Web"
            });
            this.resourcesText = this.game.add.text(10, 60, "Resources Remaining: ", {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 40px Titillium Web"
            });
            this.costText = new Array();
            let types = this.fleetGenerator.typesOrderedByCost;
            let position = 120;
            let index = 1;
            for (let type of types) {
                let text = this.addShipCostText("(" + index + ") " + type.name + " Cost: " + type.RESOURCE_COST, 10, position);
                this.costText.push(text);
                position += 50;
                index += 1;
            }
            this.keyCodes = [
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE)
            ];
            this.keyStates = [
                true,
                true,
                true
            ];
            this.shouldUpdate = true;
        }
        addShipCostText(text, x, y) {
            return this.game.add.text(x, y, text, {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "bold 30px Titillium Web"
            });
        }
        click(pointer) {
            if (this.enemiesResourcesAvailable > -1) {
                let sprites = new Array();
                for (let enemy of this.enemies) {
                    sprites.push(enemy.sprite);
                }
                let bodies = this.game.physics.p2.hitTest(pointer.position, sprites);
                if (bodies.length > 0) {
                    for (let i = 0; i < this.enemies.length; i++) {
                        if (this.enemies[i].body.id === bodies[0].id) {
                            this.enemiesResourcesAvailable += this.enemies[i].getType().RESOURCE_COST;
                            this.enemies[i].die();
                            this.enemies.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            else if (this.alliesResourcesAvailable > -1) {
                let sprites = new Array();
                for (let ally of this.allies) {
                    sprites.push(ally.sprite);
                }
                let bodies = this.game.physics.p2.hitTest(pointer.position, sprites);
                if (bodies.length > 0) {
                    for (let i = 0; i < this.allies.length; i++) {
                        if (this.allies[i].body.id === bodies[0].id) {
                            this.alliesResourcesAvailable += this.allies[i].getType().RESOURCE_COST;
                            this.allies[i].die();
                            this.allies.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
        update() {
            let x;
            let y;
            let width;
            let height;
            let resourcesAvailable;
            this.graphics.destroy();
            if (this.confirmKey.isDown && this.confirmKeyState) {
                if (this.enemiesResourcesAvailable > -1) {
                    this.enemiesResourcesAvailable = -1;
                    this.confirmKeyState = false;
                }
                else if (this.alliesResourcesAvailable > -1) {
                    this.alliesResourcesAvailable = -1;
                    this.confirmKeyState = false;
                }
            }
            else if (!this.confirmKey.isDown) {
                this.confirmKeyState = true;
            }
            if (this.enemiesResourcesAvailable > -1) {
                x = this.enemiesParams.minX;
                y = this.enemiesParams.minY;
                width = this.enemiesParams.maxX - this.enemiesParams.minX;
                height = this.enemiesParams.maxY - this.enemiesParams.minY;
                resourcesAvailable = this.enemiesResourcesAvailable;
            }
            else if (this.alliesResourcesAvailable > -1) {
                x = this.alliesParams.minX;
                y = this.alliesParams.minY;
                width = this.alliesParams.maxX - this.alliesParams.minX;
                height = this.alliesParams.maxY - this.alliesParams.minY;
                resourcesAvailable = this.alliesResourcesAvailable;
            }
            else {
                this.resourcesText.destroy();
                this.instructionsText.destroy();
                for (let text of this.costText) {
                    text.destroy();
                }
                this.allShips = this.allies.concat(this.enemies);
                this.game.state.start("Battle", false, false, this.allShips);
                return;
            }
            this.graphics = this.game.add.graphics(0, 0);
            this.graphics.lineStyle(2, 0xffd900, 1);
            this.graphics.drawRect(x, y, width, height);
            this.resourcesText.setText("Resources Remaining: " + resourcesAvailable);
            if (!this.shouldUpdate) {
                return;
            }
            let types = this.fleetGenerator.typesOrderedByCost;
            let mouseX = this.game.input.mousePointer.x;
            let mouseY = this.game.input.mousePointer.y;
            if (mouseX < x || mouseX > x + width || mouseY < y || mouseY > y + height) {
                return;
            }
            for (let i = 0; i < this.keyCodes.length; i++) {
                if (!this.keyCodes[i].isDown) {
                    this.keyStates[i] = true;
                }
                else if (this.keyStates[i] && this.keyCodes[i].isDown && resourcesAvailable >= types[i].RESOURCE_COST) {
                    this.keyStates[i] = false;
                    resourcesAvailable -= types[i].RESOURCE_COST;
                    if (this.enemiesResourcesAvailable > -1) {
                        this.enemiesResourcesAvailable = resourcesAvailable;
                        this.enemies.push(new types[i](this.game, mouseX, mouseY, this.enemiesParams.teamNumber));
                    }
                    else if (this.alliesResourcesAvailable > -1) {
                        this.alliesResourcesAvailable = resourcesAvailable;
                        this.allies.push(new types[i](this.game, mouseX, mouseY, this.alliesParams.teamNumber));
                    }
                }
            }
        }
    }
    Placement.Seed = 31337;
    Placement.EnemyResourceCount = 3000;
    Placement.Difficulty = Difficulty.Easy;
    Placement.Mode = Mode.eve;
    Placement.FLEET_BOUNDS_PADDING = 50;
    Placement.CurrentBattle = null;
    Game.Placement = Placement;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Preloader extends Phaser.State {
        preload() {
            Game.makeTitle(this.game);
            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "preloadBar");
            this.preloadBar.anchor.setTo(0.5, 0.5);
            this.load.setPreloadSprite(this.preloadBar);
            this.preloadBar.scale.setTo(4, 4);
            // Load assets here
            this.load.image("background", "too-many-lasers/assets/Backgrounds/darkPurple.png");
            // fighters
            this.load.image("fighter_1", "too-many-lasers/assets/playerShip1_green.png");
            this.load.image("fighter_2", "too-many-lasers/assets/playerShip1_red.png");
            this.load.image("fighter_3", "too-many-lasers/assets/playerShip1_blue.png");
            // this.load.image("fighter_4", "assets/playerShip1_orange.png");
            // cruisers
            this.load.image("cruiser_1", "too-many-lasers/assets/playerShip2_green.png");
            this.load.image("cruiser_2", "too-many-lasers/assets/playerShip2_red.png");
            this.load.image("cruiser_3", "too-many-lasers/assets/playerShip2_blue.png");
            // this.load.image("cruiser_4", "assets/playerShip2_orange.png");
            // battleships
            this.load.image("battleship_1", "too-many-lasers/assets/playerShip3_green.png");
            this.load.image("battleship_2", "too-many-lasers/assets/playerShip3_red.png");
            this.load.image("battleship_3", "too-many-lasers/assets/playerShip3_blue.png");
            // this.load.image("battleship_4", "assets/playerShip3_orange.png");
            // bullets
            this.load.image("bullet_1", "too-many-lasers/assets/Lasers/laserGreen05.png");
            this.load.image("bullet_2", "too-many-lasers/assets/Lasers/laserRed03.png");
            this.load.image("bullet_3", "too-many-lasers/assets/Lasers/laserBlue03.png");
            // NOTE: orange lasers do not exist currently...
            // this.load.image("bullet_4", "assets/Lasers/laserOrange03.png");
            // Load damage overlays
            this.load.image("fighter_damage_1", "too-many-lasers/assets/Damage/playerShip1_damage1.png");
            this.load.image("fighter_damage_2", "too-many-lasers/assets/Damage/playerShip1_damage2.png");
            this.load.image("fighter_damage_3", "too-many-lasers/assets/Damage/playerShip1_damage3.png");
            this.load.image("cruiser_damage_1", "too-many-lasers/assets/Damage/playerShip2_damage1.png");
            this.load.image("cruiser_damage_2", "too-many-lasers/assets/Damage/playerShip2_damage2.png");
            this.load.image("cruiser_damage_3", "too-many-lasers/assets/Damage/playerShip2_damage3.png");
            this.load.image("battleship_damage_1", "too-many-lasers/assets/Damage/playerShip3_damage1.png");
            this.load.image("battleship_damage_2", "too-many-lasers/assets/Damage/playerShip3_damage2.png");
            this.load.image("battleship_damage_3", "too-many-lasers/assets/Damage/playerShip3_damage3.png");
            // Walls can be visible or invisible
            this.load.image("red-pixel", "too-many-lasers/assets/red-pixel.png");
            this.load.image("transparent-pixel", "too-many-lasers/assets/transparent-pixel.png");
            this.load.image("play", "too-many-lasers/assets/play.png");
            // load laser sounds
            this.load.audio("fighter_fire", "too-many-lasers/assets/Sounds/SoundsCrate-SciFi-Laser4.mp3");
            this.load.audio("cruiser_fire", "too-many-lasers/assets/Sounds/SoundsCrate-SciFi-Laser1.mp3");
            this.load.audio("battleship_fire", "too-many-lasers/assets/Sounds/SoundsCrate-SciFi-Laser5.mp3");
        }
        create() {
            const pressKeyText = "Click anywhere to start...";
            const pressKeyX = this.game.world.centerX;
            const pressKeyY = this.game.world.centerY + this.game.height * 0.25;
            let pressKey = this.game.add.text(pressKeyX, pressKeyY, pressKeyText, {
                boundsAlignH: "center",
                boundsAlignV: "middle",
                fill: "#ff0",
                font: "80px Titillium Web"
            });
            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "preloadBar");
            this.preloadBar.anchor.setTo(0.5, 0.5);
            this.preloadBar.scale.setTo(4, 4);
            pressKey.anchor.setTo(0.5, 0.5);
            this.input.onDown.addOnce(this.startDifficultyMenu, this);
        }
        startDifficultyMenu() {
            this.game.state.start("DifficultyMenu");
        }
    }
    Game.Preloader = Preloader;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
if ((location.protocol !== "https:") && (location.hostname === "capstone.fenichelar.com")) {
    location.protocol = "https:";
}
window.onload = function () {
    let game = new Game.Game();
};
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    Game.name = "Too Many Lasers";
    function makeTitle(game) {
        const titleX = game.world.centerX;
        const titleY = game.world.centerY - game.height * 0.25;
        let title = game.add.text(titleX, titleY, Game.name, {
            boundsAlignH: "center",
            boundsAlignV: "middle",
            fill: "#fff",
            font: "140px Titillium Web"
        });
        title.anchor.setTo(0.5, 0.5);
        return title;
    }
    Game.makeTitle = makeTitle;
    function teamToSprite(game, x, y, spritePrefix, team, scale) {
        let spriteKey = spritePrefix + String(team);
        let sprite = game.add.sprite(x, y, spriteKey);
        sprite.scale.setTo(scale, scale);
        return sprite;
    }
    Game.teamToSprite = teamToSprite;
    function shipDist(ship1, ship2) {
        // If either ship is dead, return INFINITY
        if (!ship1 || ship1.health < 0 || !ship1.sprite || !ship1.body) {
            return Number.POSITIVE_INFINITY;
        }
        if (!ship2 || ship2.health < 0 || !ship2.sprite || !ship2.body) {
            return Number.POSITIVE_INFINITY;
        }
        let s1X = ship1.body.x;
        let s1Y = ship1.body.y;
        let s2X = ship2.body.x;
        let s2Y = ship2.body.y;
        let dx = s1X - s2X;
        let dy = s1Y - s2Y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    Game.shipDist = shipDist;
    function shipDistMinusRadius(agent, target) {
        let dist = shipDist(agent, target);
        if (dist === Number.POSITIVE_INFINITY) {
            return Number.POSITIVE_INFINITY;
        }
        dist -= Math.max(agent.sprite.width, agent.sprite.height);
        dist -= Math.max(target.sprite.width, target.sprite.height);
        return dist;
    }
    Game.shipDistMinusRadius = shipDistMinusRadius;
    function fixAngle(radians) {
        let fixed = radians;
        while (fixed < -Math.PI) {
            fixed += Math.PI * 2;
        }
        while (fixed > Math.PI) {
            fixed -= Math.PI * 2;
        }
        return fixed;
    }
    Game.fixAngle = fixAngle;
    function outsideMap(game, x, y) {
        if (x < 0 || y < 0) {
            return true;
        }
        if (x > game.world.bounds.width) {
            return true;
        }
        if (y > game.world.bounds.height) {
            return true;
        }
        return false;
    }
    Game.outsideMap = outsideMap;
    function getStatusText(game) {
        let soundOnText = "Press M to disable sound.";
        let soundOffText = "Press M to enable sound.";
        let pausedText = "Press P to resume.";
        let unpausedText = "Press P to pause.";
        let otherText = "Press Q to exit.";
        let text = "";
        if (game.paused) {
            return pausedText;
        }
        else if (Game.Battle.started) {
            text += unpausedText;
        }
        if (game.sound.mute) {
            text += " " + soundOffText;
        }
        else {
            text += " " + soundOnText;
        }
        text += " " + otherText;
        return text;
    }
    Game.getStatusText = getStatusText;
    function addStatusMenu(game) {
        let statusText = game.add.text(game.width - 10, 10, this.getStatusText(game), {
            boundsAlignH: "center",
            boundsAlignV: "middle",
            fill: "#ff0",
            font: "bold 20px Titillium Web"
        });
        statusText.anchor.x = 1;
        if (game.sound.mute) {
            statusText.setText(getStatusText(game));
        }
        game.input.onDown.add(function () {
            statusText.setText(getStatusText(game));
        }, this);
        game.input.keyboard.addKey(Phaser.Keyboard.M).onDown.add(function () {
            if (!game.paused) {
                if (game.sound.mute) {
                    game.sound.mute = false;
                    statusText.setText(getStatusText(game));
                }
                else {
                    game.sound.mute = true;
                    statusText.setText(getStatusText(game));
                }
            }
        }, this);
        game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(function () {
            if (Game.Battle.started) {
                if (game.paused) {
                    game.paused = false;
                    statusText.setText(getStatusText(game));
                }
                else {
                    game.paused = true;
                    statusText.setText(getStatusText(game));
                }
            }
        }, this);
        game.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(function () {
            if (!game.paused) {
                game.state.start("DifficultyMenu");
            }
        }, this);
        return statusText;
    }
    Game.addStatusMenu = addStatusMenu;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Bullet extends Game.PhysicsObject {
        constructor(game, health, team, angle, x, y, velocity, scale) {
            super(game, Game.teamToSprite(game, x, y, "bullet_", team, scale), health, team);
            this.health = health;
            this.angle = angle;
            this.velocity = velocity;
            this.scale = scale;
            this.lifespan = 60; // 1 second in glorious 60FPS master race
            this.ticksElapsed = 0;
            this.sprite.rotation = angle;
            let angleR = this.sprite.rotation - (Math.PI / 2);
            this.body.velocity.x = Math.cos(angleR) * velocity;
            this.body.velocity.y = Math.sin(angleR) * velocity;
            this.body.mass = 0.001;
        }
        update() {
            this.ticksElapsed++;
            // bullets don't spin, but otherwise have proper physics
            this.body.rotation = this.angle;
            let angleR = this.body.rotation - (Math.PI / 2);
            this.body.velocity.x = Math.cos(angleR) * this.velocity;
            this.body.velocity.y = Math.sin(angleR) * this.velocity;
            // bullets die after they've lived out their lifespawn
            if (this.ticksElapsed > this.lifespan) {
                this.die();
            }
        }
    }
    Bullet.DefaultVelocity = 1000;
    Bullet.DefaultHealth = 8;
    Bullet.DefaultScale = .5;
    Game.Bullet = Bullet;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Ship extends Game.PhysicsObject {
        constructor(game, sprite, state, health, team) {
            super(game, sprite, health, team);
            this.state = state;
            this.health = health;
            // TODO: rotation speed's unit doesn't seem to be defined in the docs.
            // We need to determine reasonable values for this.
            // Also, ship types should probably rotate at different speeds.
            this.maxTurnSpeed = 20;
            // TODO: determine a good value for this, should be in pixels/s
            this.maxThrustSpeed = 50;
            // TODO: determine a good value for this.
            this.fireDelay = 60;
            this.roundsPerFire = 2;
            this.roundSpacing = 5;
            this.roundVelocity = Game.Bullet.DefaultVelocity;
            this.roundHealth = Game.Bullet.DefaultHealth;
            this.roundScale = Game.Bullet.DefaultScale;
            this.ticksSinceLastFire = 1000; // Let them fire immediately
            this.damageLevel = 0;
            this.baseHealth = health;
            // Super constructor enables body
            // Set orientation based on team
            let angle = 0;
            switch (team) {
                case 1:
                    angle = 90;
                    break;
                case 2:
                    angle = -90;
                    break;
                default: angle = 0;
            }
            this.body.angle = angle;
        }
        showDamage(damage) {
            // Override this
        }
        setDamage(damage) {
            if (damage !== this.damageLevel) {
                this.damageLevel = damage;
                this.showDamage(damage);
            }
        }
        update() {
            // Do stuff
            this.state = this.state.update(this);
            this.ticksSinceLastFire++;
            // Make sure we don't stay alive when we shouldn't
            if (this.health <= 0) {
                this.die();
            }
            else if (this.health < .25 * this.baseHealth) {
                this.setDamage(3);
            }
            else if (this.health < .50 * this.baseHealth) {
                this.setDamage(2);
            }
            else if (this.health < .75 * this.baseHealth) {
                this.setDamage(1);
            }
        }
        collide(otherThing) {
            // Don't do ship-to-ship collision for now
            if (!(otherThing instanceof Ship)) {
                super.collide(otherThing);
            }
        }
        getType() {
            // Ship isn't a ship subclass, we'll never instantiate it directly
            return null;
        }
        // positive rotates right, negative rotates left
        rotate(speed) {
            if (speed > this.maxTurnSpeed) {
                speed = this.maxTurnSpeed;
            }
            else if (speed < -this.maxTurnSpeed) {
                speed = -this.maxTurnSpeed;
            }
            // If speed is negative, this will go left
            this.body.rotateRight(speed);
        }
        // positive moves forward, negative moves backwards
        thrust(speed) {
            if (speed > this.maxThrustSpeed) {
                speed = this.maxThrustSpeed;
            }
            else if (speed < -this.maxThrustSpeed) {
                speed = -this.maxThrustSpeed;
            }
            // If speed is negative, this will go backwards
            this.body.thrust(speed);
        }
        angleTo(targetX, targetY) {
            let dx = targetX - this.sprite.centerX;
            let dy = targetY - this.sprite.centerY;
            // note: phaser's angles range from -180 to 180 (in degrees)
            // 0 is upwards, therefore we need to map our angles into this range
            return Game.fixAngle(Math.atan2(dy, dx) + (Math.PI / 2)); // in radians
        }
        targetInFiringArc() {
            let angleToTarget = this.angleTo(this.target.sprite.centerX, this.target.sprite.centerY);
            let angleDelta = angleToTarget - this.body.rotation;
            return (Math.abs(angleDelta) < this.firingArc);
        }
        fire() {
            if (!this.sprite || !this.body) {
                return;
            }
            let game = this.sprite.game;
            if (this.ticksSinceLastFire >= this.fireDelay && this.targetInFiringArc() && Game.shipDist(this, this.target) <= this.firingRange) {
                let angle = this.sprite.rotation - Math.PI;
                let offsetAmount = -this.roundsPerFire * this.roundSpacing / 2;
                for (let i = 0; i < this.roundsPerFire; i++) {
                    let offset = offsetAmount + this.roundSpacing * i;
                    let x = this.sprite.x + Math.cos(angle) * offset;
                    let y = this.sprite.y + Math.sin(angle) * offset;
                    new Game.Bullet(game, this.roundHealth, this.team, this.body.rotation, x, y, this.roundVelocity, this.roundScale);
                }
                this.ticksSinceLastFire = 0;
                this.playFireSound();
            }
        }
        playFireSound() {
            // override me
        }
        stopRotating() {
            this.body.setZeroRotation();
        }
        turnTowardsShip(other) {
            if (!other || !other.sprite || !other.body) {
                return;
            }
            this.turnTowards(other.sprite.centerX, other.sprite.centerY);
        }
        turnTowards(targetX, targetY) {
            if (!this.sprite || !this.body) {
                return;
            }
            let angle = this.angleTo(targetX, targetY);
            let angleDelta = angle - this.sprite.body.rotation;
            if (angleDelta < -Math.PI) {
                angle += Math.PI * 2;
            }
            if (angleDelta > Math.PI) {
                angle -= Math.PI * 2;
            }
            if (angleDelta > 0) {
                this.rotate(this.maxTurnSpeed);
            }
            else if (angleDelta < 0) {
                this.rotate(-this.maxTurnSpeed);
            }
            else {
                this.stopRotating();
            }
        }
        die() {
            super.die();
            // Remove ourselves from the list of ships
            if (Game.Battle.CurrentBattle && Game.Battle.CurrentBattle.allShips) {
                for (let i = 0; i < Game.Battle.CurrentBattle.allShips.length; i++) {
                    if (Game.Battle.CurrentBattle.allShips[i] === this) {
                        Game.Battle.CurrentBattle.allShips.splice(i, 1);
                        break;
                    }
                }
            }
        }
        selectTargetFrom(allShips) {
            // By default, pick the closest enemy ship
            let closestEnemy = null;
            for (let otherShip of allShips) {
                if (this.team !== otherShip.team && Game.shipDist(this, otherShip) < Game.shipDist(this, closestEnemy)) {
                    closestEnemy = otherShip;
                }
            }
            return closestEnemy;
        }
    }
    Game.Ship = Ship;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class State {
        update(ship) {
            // do stuff with ship
            // return new state or self
            return this;
        }
    }
    Game.State = State;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Wall extends Game.PhysicsObject {
        // This is basically a dummy object
        constructor(game, x, y, width, height, visible) {
            super(game, Wall.createWallSprite(game, x, y, width, height, visible), 0, 0);
            this.body.kinematic = true;
        }
        static createWallSprite(game, x, y, width, height, visible) {
            let sprite = game.add.sprite(x, y, visible ? "red-pixel" : "transparent-pixel");
            sprite.scale.setTo(width * 2, height * 2);
            return sprite;
        }
        update() {
            // Walls don't do anything!
        }
        collide(otherThing) {
            // Walls only interact in the physics engine
            // But some things just plain die when they hit them
            if (otherThing instanceof Game.Bullet) {
                otherThing.die();
            }
        }
        takeDamage(amount) {
            // Walls don't take damage!
        }
        die() {
            // Walls can't die!
        }
    }
    Game.Wall = Wall;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Battleship extends Game.Ship {
        constructor(game, x, y, team) {
            super(game, Game.teamToSprite(game, x, y, "battleship_", team, 1), new Game.ChaseAndShoot(), Battleship.BATTLESHIP_BASE_HEALTH, team);
            this.team = team;
            this.body.mass = Battleship.BATTLESHIP_MASS;
            this.maxTurnSpeed = Battleship.BATTLESHIP_TURN_SPEED;
            this.maxThrustSpeed = Battleship.BATTLESHIP_THRUST_SPEED;
            // these will need tweaking.
            // battleships fire lots of rounds, slower, larger, with more health/damage
            this.fireDelay = 220;
            this.roundsPerFire = 6;
            this.roundSpacing = 4;
            this.roundHealth *= 2;
            this.roundScale = 0.75;
            this.roundVelocity *= 0.6;
            // pew pew
            this.fireSound = game.add.audio("battleship_fire");
            this.firingArc = Math.PI / 6;
            this.firingRange = 1200;
        }
        getType() {
            return Battleship;
        }
        showDamage(damage) {
            let damageSprite;
            if (damage === 1) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "battleship_damage_1");
            }
            else if (damage === 2) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "battleship_damage_2");
            }
            else if (damage === 3) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "battleship_damage_3");
            }
            this.sprite.addChild(damageSprite);
            damageSprite.anchor.setTo(0.5, 0.5);
        }
        playFireSound() {
            this.fireSound.play();
        }
        static getSupportGroups() {
            return [{
                    maxDistance: 250,
                    maxNumber: 4,
                    shipType: Game.Cruiser
                }];
        }
    }
    Battleship.BATTLESHIP_BASE_HEALTH = 1200;
    Battleship.BATTLESHIP_MASS = 600;
    Battleship.BATTLESHIP_TURN_SPEED = 25;
    Battleship.BATTLESHIP_THRUST_SPEED = Battleship.BATTLESHIP_MASS * 30;
    ///// Static stuff used by fleet generation /////
    Battleship.RESOURCE_COST = 120;
    Game.Battleship = Battleship;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Cruiser extends Game.Ship {
        constructor(game, x, y, team) {
            super(game, Game.teamToSprite(game, x, y, "cruiser_", team, .75), new Game.Idle(), Cruiser.CRUISER_BASE_HEALTH, team);
            this.team = team;
            this.body.mass = Cruiser.CRUISER_MASS;
            this.maxTurnSpeed = Cruiser.CRUISER_TURN_SPEED;
            this.maxThrustSpeed = Cruiser.CRUISER_THRUST_SPEED;
            // these will need tweaking.
            // cruisers fire more rounds, slower, larger, with more health/damage
            this.fireDelay = 90;
            this.roundsPerFire = 3;
            this.roundSpacing = 6;
            this.roundHealth *= 1.5;
            this.roundScale = 0.65;
            this.roundVelocity *= 0.8;
            // pew pew
            this.fireSound = game.add.audio("cruiser_fire");
            this.firingArc = Math.PI / 6;
            this.firingRange = 900;
        }
        getType() {
            return Cruiser;
        }
        showDamage(damage) {
            let damageSprite;
            if (damage === 1) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "cruiser_damage_1");
            }
            else if (damage === 2) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "cruiser_damage_2");
            }
            else if (damage === 3) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "cruiser_damage_3");
            }
            this.sprite.addChild(damageSprite);
            damageSprite.anchor.setTo(0.5, 0.5);
        }
        playFireSound() {
            this.fireSound.play();
        }
        static getSupportGroups() {
            return [{
                    maxDistance: 100,
                    maxNumber: 5,
                    shipType: Game.Fighter
                }];
        }
    }
    Cruiser.CRUISER_BASE_HEALTH = 200;
    Cruiser.CRUISER_MASS = 250;
    Cruiser.CRUISER_TURN_SPEED = 50;
    Cruiser.CRUISER_THRUST_SPEED = Cruiser.CRUISER_MASS * 50;
    ///// Static stuff used by fleet generation /////
    Cruiser.RESOURCE_COST = 50;
    Game.Cruiser = Cruiser;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class Fighter extends Game.Ship {
        constructor(game, x, y, team) {
            super(game, Game.teamToSprite(game, x, y, "fighter_", team, .5), new Game.Idle(), Fighter.FIGHTER_BASE_HEALTH, team);
            this.team = team;
            this.body.mass = Fighter.FIGHTER_MASS;
            this.maxTurnSpeed = Fighter.FIGHTER_TURN_SPEED;
            this.maxThrustSpeed = Fighter.FIGHTER_THRUST_SPEED;
            this.roundHealth *= .4;
            // pew pew
            this.fireSound = game.add.audio("fighter_fire");
            this.firingArc = Math.PI / 6;
            this.firingRange = 600;
        }
        getType() {
            return Fighter;
        }
        showDamage(damage) {
            let damageSprite;
            if (damage === 1) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "fighter_damage_1");
            }
            else if (damage === 2) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "fighter_damage_2");
            }
            else if (damage === 3) {
                damageSprite = this.sprite.game.make.sprite(0, 0, "fighter_damage_3");
            }
            this.sprite.addChild(damageSprite);
            damageSprite.anchor.setTo(0.5, 0.5);
        }
        playFireSound() {
            this.fireSound.play();
        }
        static getSupportGroups() {
            return [];
        }
    }
    Fighter.FIGHTER_BASE_HEALTH = 15;
    Fighter.FIGHTER_MASS = 50;
    Fighter.FIGHTER_TURN_SPEED = 160;
    Fighter.FIGHTER_THRUST_SPEED = Fighter.FIGHTER_MASS * 350;
    ///// Static stuff used by fleet generation /////
    Fighter.RESOURCE_COST = 10;
    Game.Fighter = Fighter;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class ChaseAndShoot extends Game.State {
        update(agent) {
            if (!agent.target || agent.target.health <= 0) {
                agent.target = null;
                if (Game.Battle.CurrentBattle) {
                    agent.target = agent.selectTargetFrom(Game.Battle.CurrentBattle.allShips);
                }
            }
            if (agent.target != null) {
                agent.turnTowardsShip(agent.target);
                agent.thrust(agent.maxThrustSpeed);
                agent.fire();
            }
            return this;
        }
    }
    Game.ChaseAndShoot = ChaseAndShoot;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    // In this state, agents attempt to path to an enemy while avoiding combat
    class Dogfight extends Game.State {
        static inDogfightRange(agent, target) {
            return Game.shipDistMinusRadius(agent, target) <= Dogfight.DOGFIGHT_RANGE;
        }
        update(agent) {
            // if the target is not in fighting range, look for a target that is
            if (Game.shipDist(agent, agent.target) > Dogfight.DOGFIGHT_RANGE) {
                let alternateTarget = agent.selectTargetFrom(Game.Battle.CurrentBattle.allShips);
                if (Dogfight.inDogfightRange(agent, alternateTarget)) {
                    agent.target = alternateTarget;
                }
            }
            // and switch to idle when necessary
            if (!agent.target || agent.target.health <= 0) {
                return new Game.Idle();
            }
            // otherwise we want to try to stay behind towards the target.
            let offset = Math.max(agent.target.sprite.width, agent.target.sprite.height) * 4.0;
            let thrustAmount = agent.maxThrustSpeed * .75;
            let currentAngle = agent.body.rotation;
            let targetAngle = agent.target.body.rotation;
            // if we're roughly behind the target, we just want to point and shoot,
            // otherwise we want to move around it.
            if (Math.abs(Game.fixAngle(currentAngle - targetAngle)) < Math.PI / 3) {
                offset = 0;
            }
            else {
                targetAngle += Math.PI / 2;
            }
            // when too close, thrust back
            if (Game.shipDistMinusRadius(agent, agent.target) < Dogfight.DOGFIGHT_RANGE * .5) {
                thrustAmount = -thrustAmount;
            }
            let targetX = agent.target.body.x + Math.cos(targetAngle) * offset;
            let targetY = agent.target.body.y + Math.sin(targetAngle) * offset;
            // if our circling location isn't within the map, just point and shoot,
            // and switch to dogfighting
            if (Game.outsideMap(agent.sprite.game, targetX, targetY)) {
                agent.turnTowardsShip(agent.target);
            }
            else {
                agent.turnTowards(targetX, targetY);
            }
            agent.thrust(thrustAmount);
            agent.fire();
            // continue doghfigting until we are out of range.
            if (!Dogfight.inDogfightRange(agent, agent.target)) {
                return new Game.Strafe();
            }
            else {
                return this;
            }
        }
    }
    Dogfight.DOGFIGHT_RANGE = 100;
    Game.Dogfight = Dogfight;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    // In this state, agents attempt to path to an enemy while avoiding combat
    class Idle extends Game.State {
        update(agent) {
            // select a new target
            if (Game.Battle.CurrentBattle) {
                agent.target = agent.selectTargetFrom(Game.Battle.CurrentBattle.allShips);
                if (!agent.target || agent.target.health <= 0) {
                    agent.target = null;
                }
                // don't do anything else if there are no targets
                if (!agent.target || !agent.target.sprite || !agent.target.body) {
                    return this;
                }
                // otherwise strafe towards target
                return new Game.Strafe();
            }
            // continue to idle
            return this;
        }
    }
    Game.Idle = Idle;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    // In this state, agents attempt to path to an enemy while avoiding combat
    class Strafe extends Game.State {
        update(agent) {
            let nextState = this;
            // select a new target when necessary
            if (!agent.target || agent.target.health <= 0) {
                return new Game.Idle();
            }
            // if the target is not in fighting range, look for a target that is
            if (Game.shipDist(agent, agent.target) > Game.Dogfight.DOGFIGHT_RANGE) {
                let alternateTarget = agent.selectTargetFrom(Game.Battle.CurrentBattle.allShips);
                if (Game.Dogfight.inDogfightRange(agent, alternateTarget)) {
                    agent.target = alternateTarget;
                }
                nextState = new Game.Dogfight();
            }
            // otherwise we want to strafe towards the target.
            let dx = agent.target.sprite.x - agent.sprite.x;
            let dy = agent.target.sprite.y - agent.sprite.y;
            // note: phaser's angles range from -180 to 180 (in degrees)
            // 0 is upwards, therefore we need to map our angles into this range
            let targetDistance = Game.shipDist(agent, agent.target);
            let offset = targetDistance * .66 + Game.Dogfight.DOGFIGHT_RANGE / 4;
            let targetAngle = Math.atan2(dy, dx) - Math.PI / 2;
            let targetX = agent.target.sprite.x + Math.cos(targetAngle) * offset;
            let targetY = agent.target.sprite.y + Math.sin(targetAngle) * offset;
            // if our strafing location isn't within the map, just point and shoot,
            // and switch to dogfighting
            if (Game.outsideMap(agent.sprite.game, targetX, targetY)) {
                agent.turnTowardsShip(agent.target);
                nextState = new Game.Dogfight();
            }
            else {
                agent.turnTowards(targetX, targetY);
            }
            agent.thrust(agent.maxThrustSpeed);
            agent.fire();
            // continue strafing until we are within range.
            if (Game.Dogfight.inDogfightRange(agent, agent.target)) {
                nextState = new Game.Dogfight();
            }
            return nextState;
        }
    }
    Game.Strafe = Strafe;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
var Game;
(function (Game) {
    class FleetCompGenerator {
        constructor(game, params) {
            this.game = game;
            // These hold group cost information for each ship type.
            // Built on creation to save time during generation.
            this.groupCosts = new Map();
            this.typesOrderedByCost = new Array();
            this.params = params || this.getDefaultParams();
            // Build the group cost info, including a list of all types
            // in descending order by group cost
            let unorderedTypes = [Game.Fighter, Game.Cruiser, Game.Battleship];
            for (let i = 0; i < unorderedTypes.length; i++) {
                // First get the cost
                let aType = unorderedTypes[i];
                let cost = this.getMaxGroupCost(aType);
                // Cache the cost value and insertion-sort the type
                this.groupCosts.set(aType, cost);
                let inserted = false;
                for (let j = 0; j < this.typesOrderedByCost.length; j++) {
                    if (cost > this.groupCosts.get(this.typesOrderedByCost[j])) {
                        this.typesOrderedByCost.splice(j, 0, aType);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    this.typesOrderedByCost.push(aType);
                }
            }
        }
        getDefaultParams() {
            return {
                maxX: this.game.world.bounds.width,
                maxY: this.game.world.bounds.height,
                minX: this.game.world.bounds.width / 2,
                minY: 0,
                resources: 500,
                teamNumber: 2
            };
        }
        /**
         * Generates a fleet composition from the current params and returns it
         * as a list of ships (which should have positions), for now
         */
        generateFleet() {
            this.resourcesRemaining = this.params.resources;
            let fleet = new Array();
            // Naive implementation: Make as many of the biggest groups as we can first
            for (let i = 0; i < this.typesOrderedByCost.length; i++) {
                let currentType = this.typesOrderedByCost[i];
                while (this.resourcesRemaining >= this.groupCosts.get(currentType) / 2 &&
                    this.resourcesRemaining >= currentType.RESOURCE_COST) {
                    // Buffer the central ship from the edges of fleet bounds by its support radius
                    // Makes it less likely for fleets to overlap
                    let radius = 0;
                    for (let j = 0; j < currentType.getSupportGroups().length; j++) {
                        radius = Math.max(currentType.getSupportGroups()[j].maxDistance, radius);
                    }
                    let x = this.game.rnd.integerInRange(this.params.minX + radius, this.params.maxX - radius);
                    let y = this.game.rnd.integerInRange(this.params.minY + radius, this.params.maxY - radius);
                    let centralShip = new currentType(this.game, x, y, this.params.teamNumber);
                    fleet = fleet.concat(this.createGroup(centralShip));
                }
            }
            return fleet;
        }
        /**
         * Recursively calculate the maximum cost of a battle group
         * for a given ship type, including itself.
         */
        getMaxGroupCost(centralShipType) {
            // If we have a cached value for this type, use it
            if (this.groupCosts.get(centralShipType)) {
                return this.groupCosts.get(centralShipType);
            }
            let cost = centralShipType.RESOURCE_COST;
            let supportGroups = centralShipType.getSupportGroups();
            for (let i = 0; i < supportGroups.length; i++) {
                cost += supportGroups[i].maxNumber * this.getMaxGroupCost(supportGroups[i].shipType);
            }
            return cost;
        }
        /**
         * Place support ships around a central unit,
         * and then recursively place support around each of those.
         * Effectively builds a battle group out from a single unit.
         */
        createGroup(centralShip) {
            // If we can't afford this ship... oops. Do nothing
            if (this.resourcesRemaining < centralShip.getType().RESOURCE_COST) {
                centralShip.die();
                return [];
            }
            // Nuclear option: If the ship spawns out of bounds, just kill it
            if (centralShip.sprite.x - centralShip.sprite.offsetX < 0 ||
                centralShip.sprite.y - centralShip.sprite.offsetY < 0 ||
                centralShip.sprite.right > this.game.world.bounds.width ||
                centralShip.sprite.bottom > this.game.world.bounds.height) {
                centralShip.die();
                return [];
            }
            // If there's no support for this ship type, return just this ship
            let fleet = [centralShip];
            this.resourcesRemaining -= centralShip.getType().RESOURCE_COST;
            let supportGroups = centralShip.getType().getSupportGroups();
            if (supportGroups.length === 0) {
                return fleet;
            }
            for (let i = 0; i < supportGroups.length; i++) {
                // Put a random number of this type of ships around us, up to the maximum
                let numSupportShips = this.game.rnd.integerInRange(0, supportGroups[i].maxNumber);
                for (let j = 0; j < numSupportShips; j++) {
                    // Put the ship at a random distance and angle from us, up to the maximum distance
                    let radius = this.game.rnd.integerInRange(0, supportGroups[i].maxDistance);
                    let angleDeg = this.game.rnd.integerInRange(0, 360);
                    let angleRad = angleDeg * Math.PI / 180;
                    // Turn the polar coordinates into real ones
                    let dx = radius * Math.cos(angleRad);
                    let dy = radius * Math.sin(angleRad);
                    let newX = centralShip.sprite.x + dx;
                    let newY = centralShip.sprite.y + dy;
                    // Create the new ship and give it a group if applicable
                    let newShip = new supportGroups[i].shipType(this.game, newX, newY, this.params.teamNumber);
                    let newGroup = this.createGroup(newShip);
                    // Add the new group to the full fleet
                    fleet = fleet.concat(newGroup);
                }
            }
            return fleet;
        }
        setParams(newParams) {
            this.params = newParams;
        }
    }
    Game.FleetCompGenerator = FleetCompGenerator;
})(Game || (Game = {}));
/**
 * @author Alec Fenichel <alec.fenichel@gmail.com>
 * @author Matt Schmidt
 * @author Benjamin Elder
 * @license {@link https://github.com/fenichelar/CS4731Capstone/blob/master/LICENSE.md|Apache License 2.0}
 */
