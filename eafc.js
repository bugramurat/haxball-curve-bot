// BUGGYRAZ
const HaxballJS = require("haxball.js") // Required to connect to Haxball Headless API 
const fs = require('fs'); // Required to work with the file system

//----------------------- !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------
//------------------------ ROOM CONFIGS -----------------------------------------
const HEADLESS_TOKEN = "insert_your_headless_haxball_token_here" // You must paste your token here to run this bot (https://www.haxball.com/headlesstoken)
const ROOM_NAME = "your_room_name"
const MAX_PLAYER_NUMBER = 12
const IS_PUBLIC = true

const TIME_LIMIT = 3
const SCORE_LIMIT = 0
const IS_TEAMS_LOCKED = true

//------------------------ BALL CONFIGS -----------------------------------------
const CURVED_SHOT_MULTIPLIER = 0.15 // Multiplies the ball's curve for curved shots
const CURVED_SHOT_DURATION = 1.6 // Curved shot duration in seconds

const POWER_SHOT_MULTIPLIER = 1.7 // Multiplies the ball's speed for power shots
const POWER_SHOT_DURATION = 0.2 // Power shot duration in seconds

//------------------------ STADIUM CONFIG -----------------------------------------
const STADIUM_PATH = 'eafc.hbs'; // Make sure your custom stadium have extra discs for indicators (6)
//------------------------ !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------

function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    return Math.sqrt(dx * dx + dy * dy)
}

function findClosestPlayer(posBall, players) {
    let closestPlayer = null
    let closestDistance = 26

    players.forEach((player) => {
        if (player.position == null) {
            return
        }

        const distance = calculateDistance(posBall, player.position)
        if (distance < closestDistance) {
            closestDistance = distance
            closestPlayer = player
        }
    })

    return closestPlayer
}

function isClosestPlayerTouchingBall(posBall, closestPlayer) {
    const TOUCH_DISTANCE = 25

    if (closestPlayer && closestPlayer.position) {
        const distance = calculateDistance(posBall, closestPlayer.position)
        const isTouching = distance <= TOUCH_DISTANCE

        if (isTouching) {
            if (closestPlayer.position.y > posBall.y) {
                return 1 // Player is below the ball (touching from downside)
            } else {
                return 2 // Player is above the ball (touching from upside)
            }
        }
    }
    return 0 // Not touching
}

function calculateCurveEffectDirection(ball, player) {
    const kickDirection = { // Calculate the direction vector of the kick
        x: ball.x - player.position.x,
        y: ball.y - player.position.y,
    }
    const magnitude = Math.sqrt(kickDirection.x ** 2 + kickDirection.y ** 2) // Normalize the direction vector
    if (magnitude === 0) return { x: 0, y: 0 } // Avoid division by zero
    const isReversed = // Determine if we should reverse the curve direction
        (player.position.x < ball.x && player.position.y < ball.y) || // Left-top
        (player.position.x > ball.x && player.position.y > ball.y) // Right-bottom
    const directionMultiplier = isReversed ? -1 : 1

    return { // Return the perpendicular direction with reversal applied
        x: (-kickDirection.y / magnitude) * directionMultiplier, // Perpendicular direction (curve direction)
        y: (kickDirection.x / magnitude) * directionMultiplier, // Perpendicular direction (curve direction)
    }
}

let touchState = {
    touchingPlayerId: null,
    touchStartTime: null,
    lastTouchDuration: 0,
    lastTouchedPlayerName: "",
}

let curveState = {
    isCurving: false,
    curveStartTime: null,
    curveDirection: null,
    initialXspeed: 0,
    initialYspeed: 0,
    curveEffect: { xspeed: 0, yspeed: 0 },
    curveDuration: CURVED_SHOT_DURATION,
}

let powerState = {
    isPower: false,
    powerStartTime: null,
    powerDuration: POWER_SHOT_DURATION,
}

let powerBallState = {
    isPowerBall: false,
    powerBallStartTime: null,
    powerBallDuration: 1.6,
    isGoal: false,
}

function resetCurveState() {
    curveState.isCurving = false
    curveState.curveStartTime = null
    curveState.curveDirection = null
    curveState.curveIntensity = 0
}

function resetPowerState() {
    powerState.isPower = false
    powerState.powerStartTime = null
}

function resetPowerBallState() {
    powerBallState.isPowerBall = false
    powerBallState.powerBallStartTime = null
}

HaxballJS.then((HBInit) => { // Haxball API
    var gameConfig = { // Init config
        roomName: ROOM_NAME,
        // ------ !!! Change this line if you want to change the location of your room !!! -------------------------------------
        // geo: { code: "TR", lat: parseFloat(38.674816), lon: parseFloat(39.222515) },
        // ------ !!! Change this line if you want to change the location of your room !!! -------------------------------------
        maxPlayers: MAX_PLAYER_NUMBER,
        public: IS_PUBLIC,
        noPlayer: true,
        token: HEADLESS_TOKEN,
    }

    const room = HBInit(gameConfig) // Launch room
    room.onRoomLink = function(link) {
        console.log(link) // Print room url
    }

    var stadium = null
    fs.readFile(STADIUM_PATH, 'utf8', (err, data) => { // Load stadium and set room settings
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        stadium = data; // Store the content of the file in the 'stadium' variable
        room.setCustomStadium(stadium)
    });

    room.setTimeLimit(TIME_LIMIT)
    room.setScoreLimit(SCORE_LIMIT)
    room.setTeamsLock(IS_TEAMS_LOCKED)

    function updateAdmins() { // If there are no admins left in the room give admin to one of the remaining players.
        var players = room.getPlayerList() // Get all players
        if (players.length == 0) return // No players left, do nothing.
        if (players.find((player) => player.admin) != null) return // There's an admin left so do nothing.
        room.setPlayerAdmin(players[0].id, true) // Give admin to the first non admin player in the list
    }

    function sendAnno(playerId) {
        room.sendAnnouncement(
            "Dribble the ball to give a curve, wait for the indicator to turn purple for the power shot",
            playerId,
            0x00ff00,
            "italic",
            2
        )
        room.sendAnnouncement(
            "Green --> little, Yellow --> medium, Red --> hard curve",
            playerId,
            0x00dd00,
            "italic",
            2
        )
        room.sendAnnouncement(
            "The curve bot is compatible with every map.",
            playerId,
            0x00bb00,
            "italic",
            2
        );
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------
        room.sendAnnouncement(
            "For your bot and map requests --> Discord: buggyraz",
            playerId,
            0xda70d6,
            "bold",
            2
        );
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------
    }

    room.onPlayerJoin = function(player) {
        updateAdmins()
        sendAnno(player.id)
    }

    room.onTeamGoal = function(team) {
        powerBallState.isGoal = true

        room.setDiscProperties(0, {
            radius: 31,
            color: 0x39e600,
        })

        var players = room.getPlayerList()
        var ball = room.getDiscProperties(0)
        var ballSpeed = Math.sqrt(ball.xspeed ** 2 + ball.yspeed ** 2) // Maintain the ball's current speed magnitude

        if (team == 1) {
            room.sendAnnouncement(
                `⚽ ${touchState.lastTouchedPlayerName} (${(ballSpeed * 12).toFixed(
          3
        )} km/h)`,
                null,
                0xfa8072,
                "italic",
                2
            )
            for (let i = 0; i < players.length; i++) {
                room.setPlayerDiscProperties(players[i].id, { xspeed: -30 })
            }
        } else {
            room.sendAnnouncement(
                `⚽ ${touchState.lastTouchedPlayerName} (${(ballSpeed * 12).toFixed(
          3
        )} km/h)`,
                null,
                0x89cff0,
                "italic",
                2
            )
            for (let i = 0; i < players.length; i++) {
                room.setPlayerDiscProperties(players[i].id, { xspeed: 30 })
            }
        }
    }

    room.onPositionsReset = function() {
        powerBallState.isGoal = false
    }

    let nextLogTime = Date.now()
    room.onGameTick = function() {
        const now = Date.now();
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------
        if (now >= nextLogTime) { // Check if it's time to log
            room.sendAnnouncement(
                "For your bot and map requests --> Discord: buggyraz",
                null,
                0xda70d6,
                "bold",
                2
            )
            nextLogTime = now + 5 * 60 * 1000 // Schedule next log (5 minutes later)
        }
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------

        var ballPosition = room.getBallPosition()
        var ball = room.getDiscProperties(0)
        var players = room.getPlayerList()

        const closestPlayer = findClosestPlayer(ballPosition, players)
        const touchType = isClosestPlayerTouchingBall(ballPosition, closestPlayer)

        if (touchType) { // If a new player starts touching the ball
            if (touchState.touchingPlayerId !== closestPlayer.id) {
                touchState.touchingPlayerId = closestPlayer.id
                touchState.touchStartTime = Date.now() // Start new touch
                touchState.lastTouchedPlayerName = closestPlayer.name
            }
            touchState.lastTouchDuration =
                (Date.now() - touchState.touchStartTime) / 1000 // Duration in seconds

            const isDurationGreaterThanFour = touchState.lastTouchDuration > 4
            const isDurationGreaterThanD3 = touchState.lastTouchDuration > 2.45
            const isDurationGreaterThanD2 = touchState.lastTouchDuration > 1.65
            const isDurationGreaterThanD1 = touchState.lastTouchDuration > 0.85
            const discSettings = [{
                    duration: 0.85,
                    discs: [
                        { id: 9, offsetX: -20, color: 0x00ff00 },
                        { id: 10, offsetX: -12, color: 0x99ff00 },
                    ],
                },
                {
                    duration: 1.65,
                    discs: [
                        { id: 11, offsetX: -4, color: 0xffff00 },
                        { id: 12, offsetX: 4, color: 0xffbb00 },
                    ],
                },
                {
                    duration: 2.45,
                    discs: [
                        { id: 13, offsetX: 12, color: 0xff7700 },
                        { id: 14, offsetX: 20, color: 0xff0000 },
                    ],
                },
            ]
            const disc0Colors = [
                { duration: 0.85, color: 0x00ff00 },
                { duration: 1.65, color: 0xffff00 },
                { duration: 2.45, color: 0xff0000 },
            ]

            if (!powerBallState.isGoal) {
                discSettings.forEach((setting) => {
                    if (touchState.lastTouchDuration > setting.duration) {
                        setting.discs.forEach((disc) => {
                            room.setDiscProperties(disc.id, {
                                radius: 4,
                                x: closestPlayer.position.x + disc.offsetX,
                                y: closestPlayer.position.y + 25,
                                xspeed: room.getPlayerDiscProperties(closestPlayer.id).xspeed,
                                yspeed: room.getPlayerDiscProperties(closestPlayer.id).yspeed,
                                ...(isDurationGreaterThanFour ? {} : { color: disc.color }),
                            })
                        })
                    }
                })
                disc0Colors.forEach((setting) => {
                    if (
                        touchState.lastTouchDuration > setting.duration &&
                        !isDurationGreaterThanFour &&
                        isDurationGreaterThanD2
                    ) {
                        room.setDiscProperties(0, {
                            color: setting.color,
                        })
                    }
                })
                disc0Colors.forEach((setting) => {
                    if (
                        touchState.lastTouchDuration > setting.duration &&
                        !isDurationGreaterThanD3 &&
                        isDurationGreaterThanD1
                    ) {
                        room.setDiscProperties(0, {
                            color: setting.color,
                        })
                    }
                })
                disc0Colors.forEach((setting) => {
                    if (
                        touchState.lastTouchDuration > setting.duration &&
                        !isDurationGreaterThanD2
                    ) {
                        room.setDiscProperties(0, {
                            color: setting.color,
                        })
                    }
                })
                if (isDurationGreaterThanFour) {
                    for (let i = 9; i < 15; i++) {
                        room.setDiscProperties(i, {
                            color: 0x7f00ff,
                        })
                    }
                    room.setDiscProperties(0, {
                        color: 0x7f00ff,
                    })
                }
            }
        } else {
            touchState.touchingPlayerId = null
            touchState.touchStartTime = null
            for (i = 9; i < 15; i++) {
                room.setDiscProperties(i, {
                    radius: 0,
                })
            }
        }
        if (powerState.isPower) {
            const elapsedPowerTime = (Date.now() - powerState.powerStartTime) / 1000 // Time since curve started
            if (elapsedPowerTime <= powerState.powerDuration) {
                const newPowerVelocity = { // Calculate new velocity by adding the curve effect
                    xspeed: ball.xspeed * POWER_SHOT_MULTIPLIER,
                    yspeed: ball.yspeed * POWER_SHOT_MULTIPLIER,
                }
                if ( // Check if the ball's speed or direction has changed abruptly
                    Math.abs(newPowerVelocity.xspeed - ball.xspeed) > 8 || // Threshold for collision detection
                    Math.abs(newPowerVelocity.yspeed - ball.yspeed) > 8
                ) {
                    resetPowerState() // Stop the power
                    return
                }
                room.setDiscProperties(0, { // Apply new velocity
                    xspeed: newPowerVelocity.xspeed,
                    yspeed: newPowerVelocity.yspeed,
                })
            } else {
                resetPowerState() // End the power effect naturally
            }
        }
        if (powerBallState.isPowerBall) {
            let elapsedPowerBallTime =
                (Date.now() - powerBallState.powerBallStartTime) / 1000 // Time since curve started
            if (
                elapsedPowerBallTime <= powerBallState.powerBallDuration &&
                !powerBallState.isGoal
            ) {
                room.setDiscProperties(0, {
                    color: 0x7f00ff,
                })
            } else {
                if (!powerBallState.isGoal) {
                    room.setDiscProperties(0, { color: 0xffcc00 })
                }
                resetPowerBallState() // Stop the power
            }
        }
        if (curveState.isCurving) {
            const elapsedTime = (Date.now() - curveState.curveStartTime) / 1000 // Time since curve started
            if (elapsedTime <= curveState.curveDuration) {
                const remainingFactor = 1 - elapsedTime / curveState.curveDuration // Reduce curve effect over time
                const speedMagnitude = Math.sqrt(ball.xspeed ** 2 + ball.yspeed ** 2) // Maintain the ball's current speed magnitude
                const curveEffect = { // Apply the curve effect
                    x: curveState.curveDirection.x *
                        curveState.curveIntensity *
                        remainingFactor,
                    y: curveState.curveDirection.y *
                        curveState.curveIntensity *
                        remainingFactor,
                }
                const newVelocity = { // Calculate new velocity by adding the curve effect
                    xspeed: ball.xspeed + curveEffect.x,
                    yspeed: ball.yspeed + curveEffect.y,
                }
                if ( // Check if the ball's speed or direction has changed abruptly
                    Math.abs(newVelocity.xspeed - ball.xspeed) > 0.65 || // Threshold for collision detection
                    Math.abs(newVelocity.yspeed - ball.yspeed) > 0.65
                ) {
                    resetCurveState() // Stop the curve
                    if (!powerBallState.isGoal) {
                        room.setDiscProperties(0, { color: 0xffcc00 })
                    }
                    return
                }
                const newMagnitude = Math.sqrt( // Normalize the new velocity to keep the same speed magnitude
                    newVelocity.xspeed ** 2 + newVelocity.yspeed ** 2
                )
                const scale = speedMagnitude / newMagnitude
                room.setDiscProperties(0, { // Apply new velocity
                    xspeed: newVelocity.xspeed * scale,
                    yspeed: newVelocity.yspeed * scale,
                })
            } else {
                resetCurveState() // End the curve effect naturally
                if (!powerBallState.isGoal) {
                    room.setDiscProperties(0, { color: 0xffcc00 })
                }
            }
        }
        if (!(
                touchType ||
                powerBallState.isPowerBall ||
                curveState.isCurving ||
                powerBallState.isGoal
            )) {
            room.setDiscProperties(0, { color: 0xffcc00 })
        }
    }

    room.onPlayerBallKick = function(player) {
        const lastTouchDuration = touchState.lastTouchDuration || 0 // Default to 0 if no touch
        const ball = room.getDiscProperties(0)
        if (lastTouchDuration > 4) {
            powerState.isPower = true
            powerState.powerStartTime = Date.now()

            powerBallState.isPowerBall = true
            powerBallState.powerBallStartTime = Date.now()
        } else if (lastTouchDuration > 0.85) {
            const curveDirection = calculateCurveEffectDirection({ x: ball.x, y: ball.y, ...ball }, // Calculate the curve direction
                player
            )
            curveState.isCurving = true
            curveState.curveStartTime = Date.now()
            curveState.curveDirection = curveDirection // Store the curve direction
            curveState.curveIntensity = Math.min(lastTouchDuration * CURVED_SHOT_MULTIPLIER, 0.5) // Scale intensity by touch duration
        } else {
            resetCurveState()
            resetPowerState()
        }
        touchState.lastTouchDuration = 0 // Reset touch duration
    }
})