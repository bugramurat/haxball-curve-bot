// BUGGYRAZ
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = require("node-haxball")();
const fs = require('fs'); // Required to work with the file system

//----------------------- !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------
//------------------------ ROOM CONFIGS -----------------------------------------
const HEADLESS_TOKEN = "thr1.AAAAAGeXqcBqZwLpVVsYtQ.5BpIi1nAxuw" // You must paste your token here to run this bot (https://www.haxball.com/headlesstoken)
const ROOM_NAME = "falsolu futsal deneme"
const MAX_PLAYER_NUMBER = 2
const IS_PUBLIC = true

const TIME_LIMIT = 3
const SCORE_LIMIT = 0
const IS_TEAMS_LOCKED = true

//------------------------ BALL CONFIGS -----------------------------------------
const CURVED_SHOT_MULTIPLIER = 0.15 // Multiplies the ball's curve for curved shots
const CURVED_SHOT_DURATION = 1.6 // Curved shot duration in seconds

const POWER_SHOT_MULTIPLIER = 1.08 // Multiplies the ball's speed for power shots
const POWER_SHOT_DURATION = 0.2 // Power shot duration in seconds

//------------------------ STADIUM CONFIG -----------------------------------------
const STADIUM_PATH = 'eafc.hbs'; // Make sure your custom stadium have extra discs for indicators (6)
//------------------------ !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------

function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    return Math.sqrt(dx * dx + dy * dy)
}

function isClosestPlayerTouchingBall(posBall, closestPlayer) {
    const TOUCH_DISTANCE = 25
    if (closestPlayer && closestPlayer.pos) {
        const distance = calculateDistance(posBall, closestPlayer.pos)
        const isTouching = distance <= TOUCH_DISTANCE
        if (isTouching) {
            if (closestPlayer.pos.y > posBall.y) {
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
        x: ball.x - player.pos.x,
        y: ball.y - player.pos.y,
    }
    const magnitude = Math.sqrt(kickDirection.x ** 2 + kickDirection.y ** 2) // Normalize the direction vector
    if (magnitude === 0) return { x: 0, y: 0 } // Avoid division by zero
    const isReversed = // Determine if we should reverse the curve direction
        (player.pos.x < ball.x && player.pos.y < ball.y) || // Left-top
        (player.pos.x > ball.x && player.pos.y > ball.y) // Right-bottom
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

var stadium = null
fs.readFile(STADIUM_PATH, 'utf8', (err, data) => { // Load stadium and set room settings
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    stadium = JSON.parse(data); // Store the content of the file in the 'stadium' variable
});

let allPlayers = null

Room.create({
    name: ROOM_NAME,
    showInRoomList: IS_PUBLIC,
    maxPlayerCount: MAX_PLAYER_NUMBER,
    token: HEADLESS_TOKEN,
    noPlayer: true
}, {
    onOpen: (room) => {
        room.onAfterRoomLink = (roomLink) => {
            console.log(roomLink);
            room.setCurrentStadium(Utils.parseStadium(JSON.stringify(stadium), console.log))
        };
        if (IS_TEAMS_LOCKED) {
            room.lockTeams();
        }
        room.setScoreLimit(SCORE_LIMIT);
        room.setTimeLimit(TIME_LIMIT);
        // room.setTeamColors(1, 270, "FFFFFF", "4D0505", "000000", "4D0505")
        // room.setTeamColors(2, 270, "FFFFFF", "102F4D", "000000", "102F4D")

        function updateAdmins() { // If there are no admins left in the room give admin to one of the remaining players.
            allPlayers = room.players // Get all players
            if (allPlayers.length == 0) return // No players left, do nothing.
            if (allPlayers.find((player) => player.isAdmin) != null) return // There's an admin left so do nothing.
            room.setPlayerAdmin(allPlayers[0].id, true) // Give admin to the first non admin player in the list
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
            console.log(player.id + ' ' + player.name + ' joined')
            setTimeout(() => {
                sendAnno(player.id)
            }, 1000);
        }
        room.onPlayerTeamChange = function(player) {
            allPlayers = room.players
        }
        room.onPlayerLeave = function(player) {
            allPlayers = room.players
        }
        room.onTeamGoal = function(team) {
            powerBallState.isGoal = true
            room.setDiscProperties(0, {
                radius: 31,
                color: 0x39e600,
            });
            var ball = room.getBall()
            var ballSpeed = Math.sqrt(ball.N.x ** 2 + ball.N.y ** 2) // Maintain the ball's current speed magnitude
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
                for (let i = 0; i < allPlayers.length; i++) {
                    room.setPlayerDiscProperties(allPlayers[i].id, { xspeed: -30 })
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
                for (let i = 0; i < allPlayers.length; i++) {
                    room.setPlayerDiscProperties(allPlayers[i].id, { xspeed: 30 })
                }
            }
            touchState.touchingPlayerId = null
            touchState.touchStartTime = null
            lastTouchedPlayerId = null
            ballColor = 0
            for (i = 0; i < 6; i++) {
                isBarNormalized[i] = false
            }
            for (i = 11; i < 31; i++) {
                room.setDiscProperties(i, {
                    x: 10,
                    y: 10,
                    xspeed: 0,
                    yspeed: 0,
                })
            }
            discSettings.forEach((setting) => {
                setting.visible = false
                setting.first_vis = false
                setting.purpled = false
            })
            allResetted = true
            resetPowerState()
            resetCurveState() // End the curve effect naturally
            IS_ANY_ACTIVE_EFFECT = false
            if (!powerBallState.isGoal) {
                room.setDiscProperties(0, { color: 0xffcc00 })
                room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
            }
        }
        room.onPositionsReset = function() {
            powerBallState.isGoal = false
            touchState.touchingPlayerId = null
            touchState.touchStartTime = null
            lastTouchedPlayerId = null
            ballColor = 0
            for (i = 0; i < 6; i++) {
                isBarNormalized[i] = false
            }
            for (i = 11; i < 31; i++) {
                room.setDiscProperties(i, {
                    x: 10,
                    y: 10,
                    xspeed: 0,
                    yspeed: 0,
                })
            }
            discSettings.forEach((setting) => {
                setting.visible = false
                setting.first_vis = false
                setting.purpled = false
            })
            allResetted = true
            resetPowerState()
            resetCurveState() // End the curve effect naturally
            IS_ANY_ACTIVE_EFFECT = false
            if (!powerBallState.isGoal) {
                room.setDiscProperties(0, { color: 0xffcc00 })
                room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
            }
        }

        let IS_ANY_ACTIVE_EFFECT = false
        var touchType = null
        var allResetted = false
        var ballColor = 0
        var isBarNormalized = [false, false, false, false, false, false]
        var discSettings = [{
                duration: 0.85,
                first_vis: false,
                visible: false,
                purpled: false,
            },
            {
                duration: 1.65,
                first_vis: false,
                visible: false,
                purpled: false,
            },
            {
                duration: 2.45,
                first_vis: false,
                visible: false,
                purpled: false,
            },
        ];
        const offsets = [-25, -25, 17, 17, 9, 9, 1, 1, -7, -7, -15, -15, -25, -25, -28, 28];
        const discIds = [29, 30, 27, 28, 25, 26, 23, 24, 21, 22, 19, 20, 17, 18, 15, 16];
        const discIds2 = [29, 30, 15, 16, 17, 19, 21, 23, 25, 27];
        const discPairs = [
            { moving: 18, reference: 17, index: 0, touchThreshold: 0.85, xOffset: 12 },
            { moving: 20, reference: 19, index: 1, touchThreshold: 1.25, xOffset: 12 },
            { moving: 22, reference: 21, index: 2, touchThreshold: 1.65, xOffset: 12 },
            { moving: 24, reference: 23, index: 3, touchThreshold: 2.05, xOffset: 12 },
            { moving: 26, reference: 25, index: 4, touchThreshold: 2.45, xOffset: 12 },
            { moving: 28, reference: 27, index: 5, touchThreshold: 2.85, xOffset: 7 },
        ];
        const colorStages = [
            { min: 0.85, max: 1.65, color: 0x00ff00 },
            { min: 1.65, max: 2.45, color: 0xffff00 },
            { min: 2.45, max: 4.00, color: 0xff0000 },
            { min: 4.00, max: Infinity, color: 0x7f00ff },
        ];
        const discPositions = [
            { id: 11, xOffset: -28, yOffset: 27 },
            { id: 12, xOffset: 28, yOffset: 27 },
            { id: 13, xOffset: -28, yOffset: 23 },
            { id: 14, xOffset: 28, yOffset: 23 },
        ];

        room.onAfterCollisionDiscVsSegment = (discId, discPlayerId, segmentId, customData) => {
            if ((discId === 0 && segmentId !== null)) {
                IS_ANY_ACTIVE_EFFECT = false
            }
        }
        let lastTouchedPlayerId = null
        room.onCollisionDiscVsDisc = (discId1, discPlayerId1, discId2, discPlayerId2, customData) => {
            if ((discId1 === 0 && discPlayerId2 !== null) || (discId2 === 0 && discPlayerId1 !== null)) {
                if (touchState.lastTouchDuration < 0.85) {
                    lastTouchedPlayerId = null
                    IS_ANY_ACTIVE_EFFECT = false
                }
                lastTouchedPlayerId = discId1 === 0 ? discPlayerId2 : discPlayerId1;
            }
        };

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

            var ball = room.getBall()
            var ballPosition = ball.pos

            if (lastTouchedPlayerId) {
                touchType = isClosestPlayerTouchingBall(ballPosition, room.getPlayerDisc(lastTouchedPlayerId))
            } else {
                touchType = null
            }

            if (touchType) { // If a new player starts touching the ball
                if (touchState.touchingPlayerId !== lastTouchedPlayerId) {
                    touchState.touchingPlayerId = lastTouchedPlayerId
                    touchState.touchStartTime = Date.now() // Start new touch
                    touchState.lastTouchedPlayerName = room.getPlayer(lastTouchedPlayerId).name
                }
                touchState.lastTouchDuration =
                    (Date.now() - touchState.touchStartTime) / 1000 // Duration in seconds

                if (!powerBallState.isGoal) {
                    let playerDiscProps = room.getPlayerDisc(lastTouchedPlayerId);
                    discSettings.forEach((setting) => {
                        if (touchState.lastTouchDuration > 0.85 && !setting.first_vis) {
                            discIds.forEach((id, index) => {
                                room.setDiscProperties(id, {
                                    x: playerDiscProps.pos.x + offsets[index],
                                    y: playerDiscProps.pos.y + 25,
                                });
                            });
                            discPositions.forEach(({ id, xOffset, yOffset }) => {
                                room.setDiscProperties(id, {
                                    x: playerDiscProps.pos.x + xOffset,
                                    y: playerDiscProps.pos.y + yOffset,
                                });
                            });
                            setting.first_vis = true
                        }

                        if (touchState.lastTouchDuration > 0.85 && setting.first_vis) {

                            [...discIds2].forEach(id => {
                                room.setDiscProperties(id, {
                                    xspeed: playerDiscProps.N.x * 1.05,
                                    yspeed: playerDiscProps.N.y * 1.05,
                                });
                            });
                            [...discPositions].forEach(disc => {
                                room.setDiscProperties(disc.id, {
                                    xspeed: playerDiscProps.N.x * 1.05,
                                    yspeed: playerDiscProps.N.y * 1.05,
                                });
                            });
                            discPairs.forEach(({ moving, reference, index, touchThreshold, xOffset }) => {
                                if (room.getDisc(moving).pos.x < room.getDisc(reference).pos.x + xOffset && !isBarNormalized[index] && touchState.lastTouchDuration > touchThreshold) {
                                    room.setDiscProperties(moving, {
                                        xspeed: playerDiscProps.N.x * 1.05 + 0.45,
                                        yspeed: playerDiscProps.N.y * 1.05,
                                    });
                                } else {
                                    room.setDiscProperties(moving, {
                                        xspeed: playerDiscProps.N.x * 1.05,
                                        yspeed: playerDiscProps.N.y * 1.05,
                                    });
                                }
                                if (touchState.lastTouchDuration > touchThreshold + 0.4) {
                                    isBarNormalized[index] = true;
                                }
                            });
                        }
                        if (touchState.lastTouchDuration > setting.duration && !setting.visible) {
                            setting.visible = true
                        }
                        if (touchState.lastTouchDuration > 4 && !setting.purpled) {
                            for (i = 17; i < 29; i++) {
                                room.setDiscProperties(i, {
                                    x: 10,
                                    y: 10,
                                    xspeed: 0,
                                    yspeed: 0,
                                })
                            }
                            room.setDiscProperties(30, {
                                x: room.getDisc(29).pos.x + 50,
                            })
                            setting.purpled = true
                        }
                    })
                    colorStages.forEach((stage, index) => {
                        if (touchState.lastTouchDuration > stage.min && touchState.lastTouchDuration <= stage.max && ballColor === index) {
                            room.setDiscProperties(0, { color: stage.color });
                            ballColor = index + 1;
                        }
                    });
                }
                allResetted = false
            }

            if (!allResetted && touchType == 0) {
                touchState.touchingPlayerId = null
                touchState.touchStartTime = null
                lastTouchedPlayerId = null
                ballColor = 0
                for (i = 0; i < 6; i++) {
                    isBarNormalized[i] = false
                }
                for (i = 11; i < 31; i++) {
                    room.setDiscProperties(i, {
                        x: 10,
                        y: 10,
                        xspeed: 0,
                        yspeed: 0,
                    })
                }
                discSettings.forEach((setting) => {
                    setting.visible = false
                    setting.first_vis = false
                    setting.purpled = false
                })
                allResetted = true
            }

            if (powerState.isPower) {
                let elapsedPowerTime = (Date.now() - powerState.powerStartTime) / 1000 // Time since curve started
                if (elapsedPowerTime <= powerState.powerDuration) {
                    var newPowerVelocity = { // Calculate new velocity by adding the curve effect
                        xspeed: ball.N.x * POWER_SHOT_MULTIPLIER,
                        yspeed: ball.N.y * POWER_SHOT_MULTIPLIER,
                    };
                    if ( // Check if the ball's speed or direction has changed abruptly
                        !IS_ANY_ACTIVE_EFFECT
                    ) {
                        resetPowerState() // Stop the power
                        return
                    }
                    room.setDiscProperties(0, { // Apply new velocity
                        xspeed: newPowerVelocity.xspeed,
                        yspeed: newPowerVelocity.yspeed,
                    })
                } else {
                    IS_ANY_ACTIVE_EFFECT = false
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
                    IS_ANY_ACTIVE_EFFECT = false
                    resetPowerBallState() // Stop the power
                }
            }
            if (curveState.isCurving) {
                let elapsedTime = (Date.now() - curveState.curveStartTime) / 1000 // Time since curve started
                if (elapsedTime <= curveState.curveDuration) {
                    let remainingFactor = 1 - elapsedTime / curveState.curveDuration // Reduce curve effect over time
                    let speedMagnitude = Math.sqrt(ball.N.x ** 2 + ball.N.y ** 2) // Maintain the ball's current speed magnitude
                    let curveEffect = { // Apply the curve effect
                        x: curveState.curveDirection.x *
                            curveState.curveIntensity *
                            remainingFactor,
                        y: curveState.curveDirection.y *
                            curveState.curveIntensity *
                            remainingFactor,
                    }
                    let newVelocity = { // Calculate new velocity by adding the curve effect
                        xspeed: ball.N.x + curveEffect.x,
                        yspeed: ball.N.y + curveEffect.y,
                    };
                    if ( // Check if the ball's speed or direction has changed abruptly
                        !IS_ANY_ACTIVE_EFFECT
                    ) {
                        resetCurveState() // Stop the curve
                        if (!powerBallState.isGoal) {
                            room.setDiscProperties(0, { color: 0xffcc00 })
                            room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
                        }
                        return
                    }
                    let newMagnitude = Math.sqrt( // Normalize the new velocity to keep the same speed magnitude
                        newVelocity.xspeed ** 2 + newVelocity.yspeed ** 2
                    )
                    let scale = speedMagnitude / newMagnitude
                    room.setDiscProperties(0, { // Apply new velocity
                        xgravity: newVelocity.xspeed * scale * 0.008,
                        ygravity: -newVelocity.yspeed * scale * 0.015,
                    })
                } else {
                    resetCurveState() // End the curve effect naturally
                    IS_ANY_ACTIVE_EFFECT = false
                    if (!powerBallState.isGoal) {
                        room.setDiscProperties(0, { color: 0xffcc00 })
                        room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
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

        room.onPlayerBallKick = function(playerId) {
            var lastTouchDuration = touchState.lastTouchDuration || 0 // Default to 0 if no touch
            var ball = room.getBall()
            if (lastTouchDuration > 4) {
                IS_ANY_ACTIVE_EFFECT = true
                powerState.isPower = true
                powerState.powerStartTime = Date.now()

                powerBallState.isPowerBall = true
                powerBallState.powerBallStartTime = Date.now()
            } else if (lastTouchDuration > 0.85) {
                var curveDirection = calculateCurveEffectDirection({ x: ball.pos.x, y: ball.pos.y, ...ball }, // Calculate the curve direction
                    room.getPlayerDisc(playerId)
                )
                IS_ANY_ACTIVE_EFFECT = true
                curveState.isCurving = true
                curveState.curveStartTime = Date.now()
                curveState.curveDirection = curveDirection // Store the curve direction
                curveState.curveIntensity = Math.min(lastTouchDuration * CURVED_SHOT_MULTIPLIER, 0.5) // Scale intensity by touch duration
            } else {
                resetCurveState()
                resetPowerState()
                IS_ANY_ACTIVE_EFFECT = false
                if (!powerBallState.isGoal) {
                    room.setDiscProperties(0, { color: 0xffcc00 })
                    room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
                }
            }
            touchState.lastTouchDuration = 0 // Reset touch duration
        }

        room.onGameStart = function(player) {
            powerBallState.isGoal = false
        }
        room.onGameStop = function(player) {
            powerBallState.isGoal = false
            touchState.touchingPlayerId = null
            touchState.touchStartTime = null
            lastTouchedPlayerId = null
            ballColor = 0
            for (i = 0; i < 6; i++) {
                isBarNormalized[i] = false
            }
            for (i = 11; i < 31; i++) {
                room.setDiscProperties(i, {
                    x: 10,
                    y: 10,
                    xspeed: 0,
                    yspeed: 0,
                })
            }
            discSettings.forEach((setting) => {
                setting.visible = false
                setting.first_vis = false
                setting.purpled = false
            })
            allResetted = true
            resetPowerState()
            resetCurveState() // End the curve effect naturally
            IS_ANY_ACTIVE_EFFECT = false
            if (!powerBallState.isGoal) {
                room.setDiscProperties(0, { color: 0xffcc00 })
                room.setDiscProperties(0, { xgravity: 0, ygravity: 0 })
            }
        }
    }
})