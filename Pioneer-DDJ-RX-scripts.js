////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global midi                                                        */
/* global bpm                                                         */
/* global components                                                  */
/* global ColorMapper                                                  */
////////////////////////////////////////////////////////////////////////
var PioneerDDJRX = function() {};

/*
	Author: 		DJMaxergy
	Version: 		1.19, 05/01/2018
	Description: 	Pioneer DDJ-SX Controller Mapping for Mixxx
    Source: 		http://github.com/DJMaxergy/mixxx/tree/pioneerDDJSX_mapping

    Copyright (c) 2018 DJMaxergy, licensed under GPL version 2 or later
    Copyright (c) 2014-2015 various contributors, base for this mapping, licensed under MIT license

    Contributors:
    - Michael Stahl (DG3NEC): original DDJ-SB2 mapping for Mixxx 2.0
    - Sophia Herzog: midiAutoDJ-scripts
    - Joan Ardiaca Jové (joan.ardiaca@gmail.com): Pioneer DDJ-SB mapping for Mixxx 2.0
    - wingcom (wwingcomm@gmail.com): start of Pioneer DDJ-SB mapping
      https://github.com/wingcom/Mixxx-Pioneer-DDJ-SB
    - Hilton Rudham: Pioneer DDJ-SR mapping
      https://github.com/hrudham/Mixxx-Pioneer-DDJ-SR

    GPL license notice for current version:
    This program is free software; you can redistribute it and/or modify it under the terms of the
    GNU General Public License as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See
    the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with this program; if
    not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


    MIT License for earlier versions:
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software
    and associated documentation files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or
    substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

///////////////////////////////////////////////////////////////
//                       USER OPTIONS                        //
///////////////////////////////////////////////////////////////

// Sets the jogwheels sensitivity. 1 is default, 2 is twice as sensitive, 0.5 is half as sensitive.
PioneerDDJRX.jogwheelSensitivity = 1;

// Sets how much more sensitive the jogwheels get when holding shift.
// Set to 1 to disable jogwheel sensitivity increase when holding shift (default: 10).
PioneerDDJRX.jogwheelShiftMultiplier = 10;

// If true, vu meters twinkle if AutoDJ is enabled (default: true).
PioneerDDJRX.twinkleVumeterAutodjOn = true;
// If true, selected track will be added to AutoDJ queue-top on pressing shift + rotary selector,
// else track will be added to AutoDJ queue-bottom (default: false).
PioneerDDJRX.autoDJAddTop = false;
// Sets the duration of sleeping between AutoDJ actions if AutoDJ is enabled [ms] (default: 1000).
PioneerDDJRX.autoDJTickInterval = 1000;
// Sets the maximum adjustment of BPM allowed for beats to sync if AutoDJ is enabled [BPM] (default: 10).
PioneerDDJRX.autoDJMaxBpmAdjustment = 10;
// If true, AutoDJ queue is being shuffled after skipping a track (default: false).
// When using a fixed set of tracks without manual intervention, some tracks may be unreachable,
// due to having an unfortunate place in the queue ordering. This solves the issue.
PioneerDDJRX.autoDJShuffleAfterSkip = false;

// If true, by releasing rotary selector,
// track in preview player jumps forward to "jumpPreviewPosition"
// (default: jumpPreviewEnabled = true, jumpPreviewPosition = 0.3).
PioneerDDJRX.jumpPreviewEnabled = true;
PioneerDDJRX.jumpPreviewPosition = 0.3;

// If true, pad press in SAMPLER-PAD-MODE repeatedly causes sampler to play
// loaded track from cue-point, else it causes to play loaded track from the beginning (default: false).
PioneerDDJRX.samplerCueGotoAndPlay = false;

// If true, PFL / Cue (headphone) is being activated by loading a track into certain deck (default: true).
PioneerDDJRX.autoPFL = true;


///////////////////////////////////////////////////////////////
//               INIT, SHUTDOWN & GLOBAL HELPER              //
///////////////////////////////////////////////////////////////

PioneerDDJRX.shiftPressed = false;
PioneerDDJRX.rotarySelectorChanged = false;
PioneerDDJRX.panels = [false, false]; // view state of effect and sampler panel
PioneerDDJRX.shiftPanelSelectPressed = false;

PioneerDDJRX.syncRate = [0, 0, 0, 0];
PioneerDDJRX.gridAdjustSelected = [false, false, false, false];
PioneerDDJRX.gridSlideSelected = [false, false, false, false];
PioneerDDJRX.needleSearchTouched = [false, false, false, false];
PioneerDDJRX.chFaderStart = [null, null, null, null];
PioneerDDJRX.toggledBrake = [false, false, false, false];
PioneerDDJRX.scratchMode = [true, true, true, true];
PioneerDDJRX.setUpSpeedSliderRange = [0.08, 0.08, 0.08, 0.08];
PioneerDDJRX.platterLoaded = [false, false, false, false];
PioneerDDJRX.platterMoving = [null, null, null, null];

// PAD mode storage:
PioneerDDJRX.padModes = {
    'hotCue': 0,
    'loopRoll': 1,
    'slicer': 2,
    'sampler': 3,
    'group1': 4,
    'beatloop': 5,
    'group3': 6,
    'group4': 7
};
PioneerDDJRX.activePadMode = [
    PioneerDDJRX.padModes.hotCue,
    PioneerDDJRX.padModes.hotCue,
    PioneerDDJRX.padModes.hotCue,
    PioneerDDJRX.padModes.hotCue
];
PioneerDDJRX.samplerVelocityMode = [false, false, false, false];

PioneerDDJRX.hotCueColorMap = new ColorMapper({
    0x0000CC: 0x7F,
    0x00CCCC: 0x10,
    0xCCCC00: 0x20,
    0xCC00CC: 0x30,
    0xFFFFFF: 0x40
});

// FX storage:
PioneerDDJRX.fxKnobMSBValue = [0, 0];
PioneerDDJRX.shiftFxKnobMSBValue = [0, 0];

// used for advanced auto dj features:
PioneerDDJRX.blinkAutodjState = false;
PioneerDDJRX.autoDJTickTimer = 0;
PioneerDDJRX.autoDJSyncBPM = false;
PioneerDDJRX.autoDJSyncKey = false;

// used for PAD parameter selection:
PioneerDDJRX.selectedSamplerBank = 0;
PioneerDDJRX.selectedLoopParam = [0, 0, 0, 0];
PioneerDDJRX.selectedLoopRollParam = [2, 2, 2, 2];
PioneerDDJRX.selectedLoopIntervals = [
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32]
];
PioneerDDJRX.selectedLooprollIntervals = [
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8]
];
PioneerDDJRX.loopIntervals = [
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 16],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4]
];
PioneerDDJRX.selectedSlicerQuantizeParam = [1, 1, 1, 1];
PioneerDDJRX.selectedSlicerQuantization = [1 / 4, 1 / 4, 1 / 4, 1 / 4];
PioneerDDJRX.slicerQuantizations = [1 / 8, 1 / 4, 1 / 2, 1];
PioneerDDJRX.selectedSlicerDomainParam = [0, 0, 0, 0];
PioneerDDJRX.selectedSlicerDomain = [8, 8, 8, 8];
PioneerDDJRX.slicerDomains = [8, 16, 32, 64];

// slicer storage:
PioneerDDJRX.slicerBeatsPassed = [0, 0, 0, 0];
PioneerDDJRX.slicerPreviousBeatsPassed = [0, 0, 0, 0];
PioneerDDJRX.slicerActive = [false, false, false, false];
PioneerDDJRX.slicerAlreadyJumped = [false, false, false, false];
PioneerDDJRX.slicerButton = [0, 0, 0, 0];
PioneerDDJRX.slicerModes = {
    'contSlice': 0,
    'loopSlice': 1
};
PioneerDDJRX.activeSlicerMode = [
    PioneerDDJRX.slicerModes.contSlice,
    PioneerDDJRX.slicerModes.contSlice,
    PioneerDDJRX.slicerModes.contSlice,
    PioneerDDJRX.slicerModes.contSlice
];


PioneerDDJRX.init = function(id) {
    PioneerDDJRX.scratchSettings = {
        'alpha': 1.0 / 8,
        'beta': 1.0 / 8 / 32,
        'jogResolution': 2048,
        'vinylSpeed': 33 + 1 / 3,
    };

    PioneerDDJRX.channelGroups = {
        '[Channel1]': 0x00,
        '[Channel2]': 0x01,
        '[Channel3]': 0x02,
        '[Channel4]': 0x03
    };

    PioneerDDJRX.samplerGroups = {
        '[Sampler1]': 0x00,
        '[Sampler2]': 0x01,
        '[Sampler3]': 0x02,
        '[Sampler4]': 0x03,
        '[Sampler5]': 0x04,
        '[Sampler6]': 0x05,
        '[Sampler7]': 0x06,
        '[Sampler8]': 0x07
    };

    PioneerDDJRX.fxUnitGroups = {
        '[EffectRack1_EffectUnit1]': 0x00,
        '[EffectRack1_EffectUnit2]': 0x01,
        '[EffectRack1_EffectUnit3]': 0x02,
        '[EffectRack1_EffectUnit4]': 0x03
    };

    PioneerDDJRX.fxEffectGroups = {
        '[EffectRack1_EffectUnit1_Effect1]': 0x00,
        '[EffectRack1_EffectUnit1_Effect2]': 0x01,
        '[EffectRack1_EffectUnit1_Effect3]': 0x02,
        '[EffectRack1_EffectUnit2_Effect1]': 0x00,
        '[EffectRack1_EffectUnit2_Effect2]': 0x01,
        '[EffectRack1_EffectUnit2_Effect3]': 0x02
    };

    PioneerDDJRX.ledGroups = {
        'hotCue': 0x00,
        'loopRoll': 0x10,
        'slicer': 0x20,
        'sampler': 0x30,
        'group1': 0x40,
        'group2': 0x50,
        'group3': 0x60,
        'group4': 0x70
    };

    PioneerDDJRX.nonPadLeds = {
        'headphoneCue': 0x54,
        'shiftHeadphoneCue': 0x68,
        'cue': 0x0C,
        'shiftCue': 0x48,
        'keyLock': 0x1A,
        'shiftKeyLock': 0x60,
        'play': 0x0B,
        'shiftPlay': 0x47,
        'vinyl': 0x0D,
        'sync': 0x58,
        'shiftSync': 0x5C,
        'autoLoop': 0x14,
        'shiftAutoLoop': 0x50,
        'loopHalve': 0x12,
        'shiftLoopHalve': 0x61,
        'loopDouble': 0x13,
        'shiftLoopDouble': 0x62,
        'loopIn': 0x10,
        'shiftLoopIn': 0x4C,
        'loopOut': 0x11,
        'shiftLoopOut': 0x4D,
        'censor': 0x15,
        'shiftCensor': 0x38,
        'slip': 0x40,
        'shiftSlip': 0x63,
        'gridAdjust': 0x79,
        'shiftGridAdjust': 0x64,
        'gridSlide': 0x0A,
        'shiftGridSlide': 0x65,
        'takeoverPlus': 0x34,
        'takeoverMinus': 0x37,
        'fx1on': 0x47,
        'shiftFx1on': 0x63,
        'fx2on': 0x48,
        'shiftFx2on': 0x64,
        'fx3on': 0x49,
        'shiftFx3on': 0x65,
        'fxTab': 0x4A,
        'shiftFxTab': 0x66,
        'fx1assignDeck1': 0x4C,
        'shiftFx1assignDeck1': 0x70,
        'fx1assignDeck2': 0x4D,
        'shiftFx1assignDeck2': 0x71,
        'fx1assignDeck3': 0x4E,
        'shiftFx1assignDeck3': 0x72,
        'fx1assignDeck4': 0x4F,
        'shiftFx1assignDeck4': 0x73,
        'fx2assignDeck1': 0x50,
        'shiftFx2assignDeck1': 0x54,
        'fx2assignDeck2': 0x51,
        'shiftFx2assignDeck2': 0x55,
        'fx2assignDeck3': 0x52,
        'shiftFx2assignDeck3': 0x56,
        'fx2assignDeck4': 0x53,
        'shiftFx2assignDeck4': 0x57,
        'masterCue': 0x63,
        'shiftMasterCue': 0x62,
        'loadDeck1': 0x46,
        'shiftLoadDeck1': 0x58,
        'loadDeck2': 0x47,
        'shiftLoadDeck2': 0x59,
        'loadDeck3': 0x48,
        'shiftLoadDeck3': 0x60,
        'loadDeck4': 0x49,
        'shiftLoadDeck4': 0x61,
        'hotCueMode': 0x1B,
        'shiftHotCueMode': 0x69,
        'rollMode': 0x1E,
        'shiftRollMode': 0x6B,
        'slicerMode': 0x20,
        'shiftSlicerMode': 0x6D,
        'samplerMode': 0x22,
        'shiftSamplerMode': 0x6F,
        'longPressSamplerMode': 0x41,
        'parameterLeftHotCueMode': 0x24,
        'shiftParameterLeftHotCueMode': 0x01,
        'parameterLeftRollMode': 0x25,
        'shiftParameterLeftRollMode': 0x02,
        'parameterLeftSlicerMode': 0x26,
        'shiftParameterLeftSlicerMode': 0x03,
        'parameterLeftSamplerMode': 0x27,
        'shiftParameterLeftSamplerMode': 0x04,
        'parameterLeftGroup1Mode': 0x28,
        'shiftParameterLeftGroup1Mode': 0x05,
        'parameterLeftGroup2Mode': 0x29,
        'shiftParameterLeftGroup2Mode': 0x06,
        'parameterLeftGroup3Mode': 0x2A,
        'shiftParameterLeftGroup3Mode': 0x07,
        'parameterLeftGroup4Mode': 0x2B,
        'shiftParameterLeftGroup4Mode': 0x08,
        'parameterRightHotCueMode': 0x2C,
        'shiftParameterRightHotCueMode': 0x09,
        'parameterRightRollMode': 0x2D,
        'shiftParameterRightRollMode': 0x7A,
        'parameterRightSlicerMode': 0x2E,
        'shiftParameterRightSlicerMode': 0x7B,
        'parameterRightSamplerMode': 0x2F,
        'shiftParameterRightSamplerMode': 0x7C,
        'parameterRightGroup1Mode': 0x30,
        'shiftParameterRightGroup1Mode': 0x7D,
        'parameterRightGroup2Mode': 0x31,
        'shiftParameterRightGroup2Mode': 0x7E,
        'parameterRightGroup3Mode': 0x32,
        'shiftParameterRightGroup3Mode': 0x7F,
        'parameterRightGroup4Mode': 0x33,
        'shiftParameterRightGroup4Mode': 0x00
    };

    PioneerDDJRX.illuminationControl = {
        'loadedDeck1': 0x00,
        'loadedDeck2': 0x01,
        'loadedDeck3': 0x02,
        'loadedDeck4': 0x03,
        'playPauseDeck1': 0x0C,
        'playPauseDeck2': 0x0D,
        'playPauseDeck3': 0x0E,
        'playPauseDeck4': 0x0F,
        'djAppConnect': 0x09
    };

    PioneerDDJRX.valueVuMeter = {
        '[Channel1]_current': 0,
        '[Channel2]_current': 0,
        '[Channel3]_current': 0,
        '[Channel4]_current': 0,
        '[Channel1]_enabled': 1,
        '[Channel2]_enabled': 1,
        '[Channel3]_enabled': 1,
        '[Channel4]_enabled': 1
    };

    // set 32 Samplers as default:
    if (engine.getValue("[App]", "num_samplers") < 32) {
        engine.setValue("[App]", "num_samplers", 32);
    }

    // activate vu meter timer for Auto DJ:
    if (PioneerDDJRX.twinkleVumeterAutodjOn) {
        PioneerDDJRX.vuMeterTimer = engine.beginTimer(200, PioneerDDJRX.vuMeterTwinkle);
    }

    // initiate control status request:
    midi.sendShortMsg(0x9B, PioneerDDJRX.illuminationControl.djAppConnect, 0x7F);

    // bind controls and init deck parameters:
    PioneerDDJRX.bindNonDeckControlConnections(true);
    PioneerDDJRX.hotCueComponents = {};
    for (var index in PioneerDDJRX.channelGroups) {
        if (PioneerDDJRX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJRX.hotCueComponents[index] = [];
            for (var hotCueIndex = 0; hotCueIndex < 8; hotCueIndex++) {
                PioneerDDJRX.hotCueComponents[index][hotCueIndex] = new components.HotcueButton({
                    midi: [0x97 + PioneerDDJRX.channelGroups[index], hotCueIndex],
                    sendShifted: true,
                    shiftControl: true,
                    shiftOffset: 0x08,
                    number: hotCueIndex + 1,
                    group: index,
                    on: 0x7F,
                    off: 0x00,
                    colorMapper: PioneerDDJRX.hotCueColorMap
                });
            }
            PioneerDDJRX.initDeck(index);
        }
    }

    // init effects section:
    PioneerDDJRX.effectUnit = [];
    PioneerDDJRX.effectUnit[1] = new components.EffectUnit([1, 3]);
    PioneerDDJRX.effectUnit[2] = new components.EffectUnit([2, 4]);
    PioneerDDJRX.effectUnit[1].enableButtons[1].midi = [0x94, PioneerDDJRX.nonPadLeds.fx1on];
    PioneerDDJRX.effectUnit[1].enableButtons[2].midi = [0x94, PioneerDDJRX.nonPadLeds.fx2on];
    PioneerDDJRX.effectUnit[1].enableButtons[3].midi = [0x94, PioneerDDJRX.nonPadLeds.fx3on];
    PioneerDDJRX.effectUnit[1].effectFocusButton.midi = [0x94, PioneerDDJRX.nonPadLeds.fxTab];
    PioneerDDJRX.effectUnit[1].dryWetKnob.input = function(channel, control, value, status, group) {
        this.inSetParameter(this.inGetParameter() + PioneerDDJRX.getRotaryDelta(value) / 30);
    };
    PioneerDDJRX.effectUnit[1].init();
    PioneerDDJRX.effectUnit[2].enableButtons[1].midi = [0x95, PioneerDDJRX.nonPadLeds.fx1on];
    PioneerDDJRX.effectUnit[2].enableButtons[2].midi = [0x95, PioneerDDJRX.nonPadLeds.fx2on];
    PioneerDDJRX.effectUnit[2].enableButtons[3].midi = [0x95, PioneerDDJRX.nonPadLeds.fx3on];
    PioneerDDJRX.effectUnit[2].effectFocusButton.midi = [0x95, PioneerDDJRX.nonPadLeds.fxTab];
    PioneerDDJRX.effectUnit[2].dryWetKnob.input = function(channel, control, value, status, group) {
        this.inSetParameter(this.inGetParameter() + PioneerDDJRX.getRotaryDelta(value) / 30);
    };
    PioneerDDJRX.effectUnit[2].init();
};

PioneerDDJRX.shutdown = function() {
    for (var group in PioneerDDJRX.hotCueComponents) {
        if (PioneerDDJRX.hotCueComponents.hasOwnProperty(group)) {
            for (var hotCueIndex = 0; hotCueIndex < PioneerDDJRX.hotCueComponents[group].length; hotCueIndex++) {
                PioneerDDJRX.hotCueComponents[group][hotCueIndex].disconnect();
            }
        }
    }

    PioneerDDJRX.resetDeck("[Channel1]");
    PioneerDDJRX.resetDeck("[Channel2]");
    PioneerDDJRX.resetDeck("[Channel3]");
    PioneerDDJRX.resetDeck("[Channel4]");

    PioneerDDJRX.resetNonDeckLeds();
};


///////////////////////////////////////////////////////////////
//                      VU - METER                           //
///////////////////////////////////////////////////////////////

PioneerDDJRX.vuMeterTwinkle = function() {
    if (engine.getValue("[AutoDJ]", "enabled")) {
        PioneerDDJRX.blinkAutodjState = !PioneerDDJRX.blinkAutodjState;
    }
    PioneerDDJRX.valueVuMeter["[Channel1]_enabled"] = PioneerDDJRX.blinkAutodjState ? 1 : 0;
    PioneerDDJRX.valueVuMeter["[Channel3]_enabled"] = PioneerDDJRX.blinkAutodjState ? 1 : 0;
    PioneerDDJRX.valueVuMeter["[Channel2]_enabled"] = PioneerDDJRX.blinkAutodjState ? 1 : 0;
    PioneerDDJRX.valueVuMeter["[Channel4]_enabled"] = PioneerDDJRX.blinkAutodjState ? 1 : 0;
};


///////////////////////////////////////////////////////////////
//                        AUTO DJ                            //
///////////////////////////////////////////////////////////////

PioneerDDJRX.autodjToggle = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl("[AutoDJ]", "enabled");
    }
};

PioneerDDJRX.autoDJToggleSyncBPM = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJRX.autoDJSyncBPM = !PioneerDDJRX.autoDJSyncBPM;
        PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck1, PioneerDDJRX.autoDJSyncBPM);
    }
};

PioneerDDJRX.autoDJToggleSyncKey = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJRX.autoDJSyncKey = !PioneerDDJRX.autoDJSyncKey;
        PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck2, PioneerDDJRX.autoDJSyncKey);
    }
};

PioneerDDJRX.autoDJTimer = function(value, group, control) {
    if (value) {
        PioneerDDJRX.autoDJTickTimer = engine.beginTimer(PioneerDDJRX.autoDJTickInterval, PioneerDDJRX.autoDJControl);
    } else if (PioneerDDJRX.autoDJTickTimer) {
        engine.stopTimer(PioneerDDJRX.autoDJTickTimer);
        PioneerDDJRX.autoDJTickTimer = 0;
    }
    engine.setValue("[Channel1]", "quantize", value);
    engine.setValue("[Channel2]", "quantize", value);
};

PioneerDDJRX.autoDJControl = function() {
    var prev = 1,
        next = 2,
        prevPos = 0,
        nextPos = 0,
        nextPlaying = 0,
        prevBpm = 0,
        nextBpm = 0,
        diffBpm = 0,
        diffBpmDouble = 0,
        keyOkay = 0,
        prevKey = 0,
        nextKey = 0,
        diffKey = 0;

    if (!PioneerDDJRX.autoDJSyncBPM && !PioneerDDJRX.autoDJSyncKey) {
        return;
    }

    prevPos = engine.getValue("[Channel" + prev + "]", "playposition");
    nextPos = engine.getValue("[Channel" + next + "]", "playposition");
    if (prevPos < nextPos) {
        var tmp = nextPos;
        nextPos = prevPos;
        prevPos = tmp;
        next = 1;
        prev = 2;
    }
    nextPlaying = engine.getValue("[Channel" + next + "]", "play_indicator");
    prevBpm = engine.getValue("[Channel" + prev + "]", "visual_bpm");
    nextBpm = engine.getValue("[Channel" + next + "]", "visual_bpm");
    diffBpm = Math.abs(nextBpm - prevBpm);
    // diffBpm, with bpm of ONE track doubled
    // Note: Where appropriate, Mixxx will automatically match two beats of one.
    if (nextBpm < prevBpm) {
        diffBpmDouble = Math.abs(2 * nextBpm - prevBpm);
    } else {
        diffBpmDouble = Math.abs(2 * prevBpm - nextBpm);
    }

    // Next track is playing --> Fade in progress
    // Note: play_indicator is falsely true, when analysis is needed and similar
    if (nextPlaying && (nextPos > 0.0)) {
        // Bpm synced up --> disable sync before new track loaded
        // Note: Sometimes, Mixxx does not sync close enough for === operator
        if (diffBpm < 0.01 || diffBpmDouble < 0.01) {
            engine.setValue("[Channel" + prev + "]", "sync_mode", 0.0);
            engine.setValue("[Channel" + next + "]", "sync_mode", 0.0);
        } else { // Synchronize
            engine.setValue("[Channel" + prev + "]", "sync_mode", 1.0); // First,  set prev to follower
            engine.setValue("[Channel" + next + "]", "sync_mode", 2.0); // Second, set next to master
        }

        // Only adjust key when approaching the middle of fading
        if (PioneerDDJRX.autoDJSyncKey) {
            var diffFader = Math.abs(engine.getValue("[Master]", "crossfader") - 0.5);
            if (diffFader < 0.25) {
                nextKey = engine.getValue("[Channel" + next + "]", "key");
                engine.setValue("[Channel" + prev + "]", "key", nextKey);
            }
        }
    } else if (!nextPlaying) { // Next track is stopped --> Disable sync and refine track selection
        // First, disable sync; should be off by now, anyway
        engine.setValue("[Channel" + prev + "]", "sync_mode", 0.0); // Disable sync, else loading new track...
        engine.setValue("[Channel" + next + "]", "sync_mode", 0.0); // ...or skipping tracks would break things.

        // Second, refine track selection
        var skip = 0;
        if (diffBpm > PioneerDDJRX.autoDJMaxBpmAdjustment && diffBpmDouble > PioneerDDJRX.autoDJMaxBpmAdjustment) {
            skip = 1;
        }
        // Mixing in key:
        //     1  the difference is exactly 12 (harmonic switch of tonality), or
        //     2  both are of same tonality, and
        //     2a difference is 0, 1 or 2 (difference of up to two semitones: equal key or energy mix)
        //     2b difference corresponds to neighbours in the circle of fifth (harmonic neighbours)
        //   If neither is the case, we skip.
        if (PioneerDDJRX.autoDJSyncKey) {
            keyOkay = 0;
            prevKey = engine.getValue("[Channel" + prev + "]", "visual_key");
            nextKey = engine.getValue("[Channel" + next + "]", "visual_key");
            diffKey = Math.abs(prevKey - nextKey);
            if (diffKey === 12.0) {
                keyOkay = 1; // Switch of tonality
            }
            // Both of same tonality:
            if ((prevKey < 13 && nextKey < 13) || (prevKey > 12 && nextKey > 12)) {
                if (diffKey < 3.0) {
                    keyOkay = 1; // Equal or Energy
                }
                if (diffKey === 5.0 || diffKey === 7.0) {
                    keyOkay = 1; // Neighbours in Circle of Fifth
                }
            }
            if (!keyOkay) {
                skip = 1;
            }
        }

        if (skip) {
            engine.setValue("[AutoDJ]", "skip_next", 1.0);
            engine.setValue("[AutoDJ]", "skip_next", 0.0); // Have to reset manually
            if (PioneerDDJRX.autoDJShuffleAfterSkip) {
                engine.setValue("[AutoDJ]", "shuffle_playlist", 1.0);
                engine.setValue("[AutoDJ]", "shuffle_playlist", 0.0); // Have to reset manually
            }
        }
    }
};


///////////////////////////////////////////////////////////////
//                      CONTROL BINDING                      //
///////////////////////////////////////////////////////////////

PioneerDDJRX.bindDeckControlConnections = function(channelGroup, bind) {
    var i,
        index,
        deck = PioneerDDJRX.channelGroups[channelGroup],
        controlsToFunctions = {
            'play_indicator': 'PioneerDDJRX.playLed',
            'play': 'PioneerDDJRX.jogPlayState',
            'cue_indicator': 'PioneerDDJRX.cueLed',
            'pfl': 'PioneerDDJRX.headphoneCueLed',
            'bpm_tap': 'PioneerDDJRX.shiftHeadphoneCueLed',
            'VuMeter': 'PioneerDDJRX.VuMeterLeds',
            'keylock': 'PioneerDDJRX.keyLockLed',
            'slip_enabled': 'PioneerDDJRX.slipLed',
            'quantize': 'PioneerDDJRX.quantizeLed',
            'loop_in': 'PioneerDDJRX.loopInLed',
            'loop_out': 'PioneerDDJRX.loopOutLed',
            'loop_enabled': 'PioneerDDJRX.autoLoopLed',
            'loop_double': 'PioneerDDJRX.loopDoubleLed',
            'loop_halve': 'PioneerDDJRX.loopHalveLed',
            'reloop_andstop': 'PioneerDDJRX.shiftLoopInLed',
            'beatjump_1_forward': 'PioneerDDJRX.loopShiftFWLed',
            'beatjump_1_backward': 'PioneerDDJRX.loopShiftBKWLed',
            'beatjump_forward': 'PioneerDDJRX.hotCueParameterRightLed',
            'beatjump_backward': 'PioneerDDJRX.hotCueParameterLeftLed',
            'reverse': 'PioneerDDJRX.reverseLed',
            'duration': 'PioneerDDJRX.loadLed',
            'sync_enabled': 'PioneerDDJRX.syncLed',
            'beat_active': 'PioneerDDJRX.slicerBeatActive'
        };

    for (index in PioneerDDJRX.selectedLoopIntervals[deck]) {
        if (PioneerDDJRX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
            controlsToFunctions["beatloop_" + PioneerDDJRX.selectedLoopIntervals[deck][index] + "_enabled"] = "PioneerDDJRX.beatloopLeds";
        }
    }

    for (index in PioneerDDJRX.selectedLooprollIntervals[deck]) {
        if (PioneerDDJRX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
            controlsToFunctions["beatlooproll_" + PioneerDDJRX.selectedLooprollIntervals[deck][index] + "_activate"] = "PioneerDDJRX.beatlooprollLeds";
        }
    }

    script.bindConnections(channelGroup, controlsToFunctions, !bind);

    for (index in PioneerDDJRX.fxUnitGroups) {
        if (PioneerDDJRX.fxUnitGroups.hasOwnProperty(index)) {
            if (PioneerDDJRX.fxUnitGroups[index] < 2) {
                engine.connectControl(index, "group_" + channelGroup + "_enable", "PioneerDDJRX.fxAssignLeds", !bind);
                if (bind) {
                    engine.trigger(index, "group_" + channelGroup + "_enable");
                }
            }
        }
    }
};

PioneerDDJRX.bindNonDeckControlConnections = function(bind) {
    var index;

    for (index in PioneerDDJRX.samplerGroups) {
        if (PioneerDDJRX.samplerGroups.hasOwnProperty(index)) {
            engine.connectControl(index, "duration", "PioneerDDJRX.samplerLeds", !bind);
            engine.connectControl(index, "play", "PioneerDDJRX.samplerLedsPlay", !bind);
            if (bind) {
                engine.trigger(index, "duration");
            }
        }
    }

    engine.connectControl("[Master]", "headSplit", "PioneerDDJRX.shiftMasterCueLed", !bind);
    if (bind) {
        engine.trigger("[Master]", "headSplit");
    }

    engine.connectControl("[AutoDJ]", "enabled", "PioneerDDJRX.autoDJTimer", !bind);
};


///////////////////////////////////////////////////////////////
//                     DECK INIT / RESET                     //
///////////////////////////////////////////////////////////////

PioneerDDJRX.initDeck = function(group) {
    var deck = PioneerDDJRX.channelGroups[group];

    PioneerDDJRX.platterLoaded[deck] = false;
    PioneerDDJRX.platterMoving[deck] = null;

    // save set up speed slider range from the Mixxx settings:
    PioneerDDJRX.setUpSpeedSliderRange[deck] = engine.getValue(group, "rateRange");

    PioneerDDJRX.bindDeckControlConnections(group, true);

    PioneerDDJRX.updateParameterStatusLeds(
        group,
        PioneerDDJRX.selectedLoopRollParam[deck],
        PioneerDDJRX.selectedLoopParam[deck],
        PioneerDDJRX.selectedSamplerBank,
        PioneerDDJRX.selectedSlicerQuantizeParam[deck],
        PioneerDDJRX.selectedSlicerDomainParam[deck]
    );
    PioneerDDJRX.triggerVinylLed(deck);

    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.hotCueMode, true); // set HOT CUE Pad-Mode
};

PioneerDDJRX.resetDeck = function(group) {
    PioneerDDJRX.bindDeckControlConnections(group, false);

    PioneerDDJRX.VuMeterLeds(0x00, group, 0x00); // reset VU meter Leds
    var deck = PioneerDDJRX.channelGroups[group];
    if (PioneerDDJRX.platterLoaded[deck]) {
        PioneerDDJRX.illuminateFunctionControl(
            PioneerDDJRX.illuminationControl["playPauseDeck" + (deck + 1)],
            false
        );
    }
    PioneerDDJRX.platterLoaded[deck] = false;
    PioneerDDJRX.platterMoving[deck] = false;
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.hotCueMode, true); // reset HOT CUE Pad-Mode
    // pad Leds:
    for (var i = 0; i < 8; i++) {
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.hotCue, i, false, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.loopRoll, i, false, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.slicer, i, false, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.sampler, i, false, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.group2, i, false, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.hotCue, i, true, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.loopRoll, i, true, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.slicer, i, true, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.sampler, i, true, false);
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.group2, i, true, false);
    }
    // non pad Leds:
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.headphoneCue, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftHeadphoneCue, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.cue, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftCue, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.keyLock, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftKeyLock, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.play, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftPlay, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.vinyl, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.sync, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftSync, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.autoLoop, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftAutoLoop, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopHalve, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopHalve, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopIn, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopIn, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopOut, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopOut, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.censor, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftCensor, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.slip, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftSlip, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.gridAdjust, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftGridAdjust, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.gridSlide, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftGridSlide, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftRollMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftSlicerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterLeftSlicerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftSamplerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftGroup2Mode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightRollMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightSlicerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterRightSlicerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightSamplerMode, false);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightGroup2Mode, false);
};


///////////////////////////////////////////////////////////////
//            HIGH RESOLUTION MIDI INPUT HANDLERS            //
///////////////////////////////////////////////////////////////

PioneerDDJRX.highResMSB = {
    '[Channel1]': {},
    '[Channel2]': {},
    '[Channel3]': {},
    '[Channel4]': {},
    '[Master]': {},
    '[Samplers]': {}
};

PioneerDDJRX.tempoSliderMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].tempoSlider = value;
};

PioneerDDJRX.tempoSliderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].tempoSlider << 7) + value,
        sliderRate = 1 - (fullValue / 0x3FFF),
        deck = PioneerDDJRX.channelGroups[group];

    engine.setParameter(group, "rate", sliderRate);

    if (PioneerDDJRX.syncRate[deck] !== 0) {
        if (PioneerDDJRX.syncRate[deck] !== engine.getValue(group, "rate")) {
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJRX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJRX.gainKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].gainKnob = value;
};

PioneerDDJRX.gainKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].gainKnob << 7) + value;
    engine.setParameter(group, "pregain", fullValue / 0x3FFF);
};

PioneerDDJRX.filterHighKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].filterHigh = value;
};

PioneerDDJRX.filterHighKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].filterHigh << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter3", fullValue / 0x3FFF);
};

PioneerDDJRX.filterMidKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].filterMid = value;
};

PioneerDDJRX.filterMidKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].filterMid << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter2", fullValue / 0x3FFF);
};

PioneerDDJRX.filterLowKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].filterLow = value;
};

PioneerDDJRX.filterLowKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].filterLow << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter1", fullValue / 0x3FFF);
};

PioneerDDJRX.deckFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].deckFader = value;
};

PioneerDDJRX.deckFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].deckFader << 7) + value;

    if (PioneerDDJRX.shiftPressed &&
        engine.getValue(group, "volume") === 0 &&
        fullValue !== 0 &&
        engine.getValue(group, "play") === 0
    ) {
        PioneerDDJRX.chFaderStart[channel] = engine.getValue(group, "playposition");
        engine.setValue(group, "play", 1);
    } else if (
        PioneerDDJRX.shiftPressed &&
        engine.getValue(group, "volume") !== 0 &&
        fullValue === 0 &&
        engine.getValue(group, "play") === 1 &&
        PioneerDDJRX.chFaderStart[channel] !== null
    ) {
        engine.setValue(group, "play", 0);
        engine.setValue(group, "playposition", PioneerDDJRX.chFaderStart[channel]);
        PioneerDDJRX.chFaderStart[channel] = null;
    }
    engine.setParameter(group, "volume", fullValue / 0x3FFF);
};

PioneerDDJRX.filterKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].filterKnob = value;
};

PioneerDDJRX.filterKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].filterKnob << 7) + value;
    engine.setParameter("[QuickEffectRack1_" + group + "]", "super1", fullValue / 0x3FFF);
};

PioneerDDJRX.crossfaderCurveKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].crossfaderCurveKnob = value;
};

PioneerDDJRX.crossfaderCurveKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].crossfaderCurveKnob << 7) + value;
    script.crossfaderCurve(fullValue, 0x00, 0x3FFF);
};

PioneerDDJRX.samplerVolumeFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].samplerVolumeFader = value;
};

PioneerDDJRX.samplerVolumeFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].samplerVolumeFader << 7) + value;
    for (var i = 1; i <= 32; i++) {
        engine.setParameter("[Sampler" + i + "]", "volume", fullValue / 0x3FFF);
    }
};

PioneerDDJRX.crossFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJRX.highResMSB[group].crossFader = value;
};

PioneerDDJRX.crossFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJRX.highResMSB[group].crossFader << 7) + value;
    engine.setParameter(group, "crossfader", fullValue / 0x3FFF);
};


///////////////////////////////////////////////////////////////
//           SINGLE MESSAGE MIDI INPUT HANDLERS              //
///////////////////////////////////////////////////////////////

PioneerDDJRX.shiftButton = function(channel, control, value, status, group) {
    var index = 0;
    PioneerDDJRX.shiftPressed = (value === 0x7F);
    for (index in PioneerDDJRX.chFaderStart) {
        if (typeof index === "number") {
            PioneerDDJRX.chFaderStart[index] = null;
        }
    }
    if (value) {
        PioneerDDJRX.effectUnit[1].shift();
        PioneerDDJRX.effectUnit[2].shift();
    }
    if (!value) {
        PioneerDDJRX.effectUnit[1].unshift();
        PioneerDDJRX.effectUnit[2].unshift();
    }
};

PioneerDDJRX.playButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group],
        playing = engine.getValue(group, "play");

    if (value) {
        if (playing) {
            script.brake(channel, control, value, status, group);
            PioneerDDJRX.toggledBrake[deck] = true;
        } else {
            script.toggleControl(group, "play");
        }
    } else {
        if (PioneerDDJRX.toggledBrake[deck]) {
            script.brake(channel, control, value, status, group);
            script.toggleControl(group, "play");
            PioneerDDJRX.toggledBrake[deck] = false;
        }
    }
};

PioneerDDJRX.playStutterButton = function(channel, control, value, status, group) {
    engine.setValue(group, "play_stutter", value ? 1 : 0);
};

PioneerDDJRX.cueButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "cue_default");
};

PioneerDDJRX.jumpToBeginningButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "start_stop");
};

PioneerDDJRX.headphoneCueButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "pfl");
    }
};

PioneerDDJRX.headphoneShiftCueButton = function(channel, control, value, status, group) {
    if (value) {
        bpm.tapButton(PioneerDDJRX.channelGroups[group] + 1);
    }
};

PioneerDDJRX.headphoneSplitCueButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "headSplit");
    }
};

PioneerDDJRX.toggleHotCueMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    //HOTCUE
    if (value) {
        PioneerDDJRX.activePadMode[deck] = PioneerDDJRX.padModes.hotCue;
        PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.contSlice;
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.hotCueMode, value);
    }
};

PioneerDDJRX.toggleBeatloopRollMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    //ROLL
    if (value) {
        PioneerDDJRX.activePadMode[deck] = PioneerDDJRX.padModes.loopRoll;
        PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.contSlice;
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.rollMode, value);
    }
};

PioneerDDJRX.toggleSlicerMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    //SLICER
    if (value) {
        if (PioneerDDJRX.activePadMode[deck] === PioneerDDJRX.padModes.slicer &&
            PioneerDDJRX.activeSlicerMode[deck] === PioneerDDJRX.slicerModes.contSlice) {
            PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.loopSlice;
            engine.setValue(group, "slip_enabled", true);
        } else {
            PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.contSlice;
            engine.setValue(group, "slip_enabled", false);
        }
        PioneerDDJRX.activePadMode[deck] = PioneerDDJRX.padModes.slicer;
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.slicerMode, value);
    }
};

PioneerDDJRX.toggleSamplerMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    //SAMPLER
    if (value) {
        PioneerDDJRX.activePadMode[deck] = PioneerDDJRX.padModes.sampler;
        PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.contSlice;
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.samplerMode, value);
    }
};

PioneerDDJRX.toggleSamplerVelocityMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group],
        index = 0;
    PioneerDDJRX.samplerVelocityMode[deck] = value ? true : false;
    if (value) {
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.longPressSamplerMode, value);
        for (index = 1; index <= 32; index++) {
            engine.setParameter("[Sampler" + index + "]", "volume", 0);
        }
    } else {
        for (index = 1; index <= 32; index++) {
            engine.setParameter("[Sampler" + index + "]", "volume", 1);
        }
    }
};

PioneerDDJRX.toggleBeatloopMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    //GROUP2
    if (value) {
        PioneerDDJRX.activePadMode[deck] = PioneerDDJRX.padModes.beatloop;
        PioneerDDJRX.activeSlicerMode[deck] = PioneerDDJRX.slicerModes.contSlice;
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftRollMode, value);
    }
};

PioneerDDJRX.hotCueButtons = function(channel, control, value, status, group) {
    var index = control + 1;
    script.toggleControl(group, "hotcue_" + index + "_activate");
};

PioneerDDJRX.clearHotCueButtons = function(channel, control, value, status, group) {
    var index = control - 0x08 + 1;
    script.toggleControl(group, "hotcue_" + index + "_clear");
};

PioneerDDJRX.beatloopButtons = function(channel, control, value, status, group) {
    var index = control - 0x50,
        deck = PioneerDDJRX.channelGroups[group];
    script.toggleControl(
        group,
        "beatloop_" + PioneerDDJRX.selectedLoopIntervals[deck][index] + "_toggle"
    );
};

PioneerDDJRX.slicerButtons = function(channel, control, value, status, group) {
    var index = control - 0x20,
        deck = PioneerDDJRX.channelGroups[group],
        domain = PioneerDDJRX.selectedSlicerDomain[deck],
        beatsToJump = 0;

    if (PioneerDDJRX.activeSlicerMode[deck] === PioneerDDJRX.slicerModes.loopSlice) {
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.slicer, index, false, !value);
    } else {
        PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.slicer, index, false, value);
    }
    PioneerDDJRX.slicerActive[deck] = value ? true : false;
    PioneerDDJRX.slicerButton[deck] = index;

    if (value) {
        beatsToJump = (PioneerDDJRX.slicerButton[deck] * (domain / 8)) - ((PioneerDDJRX.slicerBeatsPassed[deck] % domain) + 1);
        if (PioneerDDJRX.slicerButton[deck] === 0 && beatsToJump === -domain) {
            beatsToJump = 0;
        }
        if (PioneerDDJRX.slicerBeatsPassed[deck] >= Math.abs(beatsToJump) &&
            PioneerDDJRX.slicerPreviousBeatsPassed[deck] !== PioneerDDJRX.slicerBeatsPassed[deck]) {
            PioneerDDJRX.slicerPreviousBeatsPassed[deck] = PioneerDDJRX.slicerBeatsPassed[deck];
            if (Math.abs(beatsToJump) > 0) {
                engine.setValue(group, "beatjump", beatsToJump);
            }
        }
    }

    if (PioneerDDJRX.activeSlicerMode[deck] === PioneerDDJRX.slicerModes.contSlice) {
        engine.setValue(group, "slip_enabled", value);
        engine.setValue(group, "beatloop_size", PioneerDDJRX.selectedSlicerQuantization[deck]);
        engine.setValue(group, "beatloop_activate", value);
    }
};

PioneerDDJRX.beatloopRollButtons = function(channel, control, value, status, group) {
    var index = control - 0x10,
        deck = PioneerDDJRX.channelGroups[group];
    script.toggleControl(
        group,
        "beatlooproll_" + PioneerDDJRX.selectedLooprollIntervals[deck][index] + "_activate"
    );
};

PioneerDDJRX.samplerButtons = function(channel, control, value, status, group) {
    var index = control - 0x30 + 1,
        deckOffset = PioneerDDJRX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        playMode = PioneerDDJRX.samplerCueGotoAndPlay ? "cue_gotoandplay" : "start_play";

    if (engine.getValue(sampleDeck, "track_loaded")) {
        engine.setValue(sampleDeck, playMode, value ? 1 : 0);
    } else {
        engine.setValue(sampleDeck, "LoadSelectedTrack", value ? 1 : 0);
    }
};

PioneerDDJRX.stopSamplerButtons = function(channel, control, value, status, group) {
    var index = control - 0x38 + 1,
        deckOffset = PioneerDDJRX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        trackLoaded = engine.getValue(sampleDeck, "track_loaded"),
        playing = engine.getValue(sampleDeck, "play");

    if (trackLoaded && playing) {
        script.toggleControl(sampleDeck, "stop");
    } else if (trackLoaded && !playing && value) {
        script.toggleControl(sampleDeck, "eject");
    }
};

PioneerDDJRX.samplerVelocityVolume = function(channel, control, value, status, group) {
    var index = control - 0x30 + 1,
        deck = PioneerDDJRX.channelGroups[group],
        deckOffset = PioneerDDJRX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        vol = value / 0x7F;

    if (PioneerDDJRX.samplerVelocityMode[deck]) {
        engine.setParameter(sampleDeck, "volume", vol);
    }
};

PioneerDDJRX.changeParameters = function(group, ctrl, value) {
    var deck = PioneerDDJRX.channelGroups[group],
        index,
        offset = 0,
        samplerIndex = 0,
        beatjumpSize = 0;

    //Hot Cue Mode:
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftHotCueMode) {
        engine.setValue(group, "beatjump_backward", value);
    }
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterRightHotCueMode) {
        engine.setValue(group, "beatjump_forward", value);
    }
    if (ctrl === PioneerDDJRX.nonPadLeds.shiftParameterLeftHotCueMode) {
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterLeftHotCueMode, value);
        if (value) {
            beatjumpSize = engine.getValue(group, "beatjump_size");
            engine.setValue(group, "beatjump_size", beatjumpSize / 2);
        }
    }
    if (ctrl === PioneerDDJRX.nonPadLeds.shiftParameterRightHotCueMode) {
        PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterRightHotCueMode, value);
        if (value) {
            beatjumpSize = engine.getValue(group, "beatjump_size");
            engine.setValue(group, "beatjump_size", beatjumpSize * 2);
        }
    }

    // ignore other cases if button is released:
    if (!value) {
        return;
    }

    //Roll Mode:
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftRollMode || ctrl === PioneerDDJRX.nonPadLeds.parameterRightRollMode) {
        // unbind previous connected controls:
        for (index in PioneerDDJRX.selectedLooprollIntervals[deck]) {
            if (PioneerDDJRX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatlooproll_" + PioneerDDJRX.selectedLooprollIntervals[deck][index] + "_activate",
                    "PioneerDDJRX.beatlooprollLeds",
                    true
                );
            }
        }
        // change parameter set:
        if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftRollMode && PioneerDDJRX.selectedLoopRollParam[deck] > 0) {
            PioneerDDJRX.selectedLoopRollParam[deck] -= 1;
        } else if (ctrl === PioneerDDJRX.nonPadLeds.parameterRightRollMode && PioneerDDJRX.selectedLoopRollParam[deck] < 3) {
            PioneerDDJRX.selectedLoopRollParam[deck] += 1;
        }
        PioneerDDJRX.selectedLooprollIntervals[deck] = PioneerDDJRX.loopIntervals[PioneerDDJRX.selectedLoopRollParam[deck]];
        // bind new controls:
        for (index in PioneerDDJRX.selectedLooprollIntervals[deck]) {
            if (PioneerDDJRX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatlooproll_" + PioneerDDJRX.selectedLooprollIntervals[deck][index] + "_activate",
                    "PioneerDDJRX.beatlooprollLeds",
                    false
                );
            }
        }
    }

    //Group2 (Beatloop) Mode:
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftGroup2Mode || ctrl === PioneerDDJRX.nonPadLeds.parameterRightGroup2Mode) {
        // unbind previous connected controls:
        for (index in PioneerDDJRX.selectedLoopIntervals[deck]) {
            if (PioneerDDJRX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatloop_" + PioneerDDJRX.selectedLoopIntervals[deck][index] + "_enabled",
                    "PioneerDDJRX.beatloopLeds",
                    true
                );
            }
        }
        // change parameter set:
        if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftGroup2Mode && PioneerDDJRX.selectedLoopParam[deck] > 0) {
            PioneerDDJRX.selectedLoopParam[deck] -= 1;
        } else if (ctrl === PioneerDDJRX.nonPadLeds.parameterRightGroup2Mode && PioneerDDJRX.selectedLoopParam[deck] < 3) {
            PioneerDDJRX.selectedLoopParam[deck] += 1;
        }
        PioneerDDJRX.selectedLoopIntervals[deck] = PioneerDDJRX.loopIntervals[PioneerDDJRX.selectedLoopParam[deck]];
        // bind new controls:
        for (index in PioneerDDJRX.selectedLoopIntervals[deck]) {
            if (PioneerDDJRX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatloop_" + PioneerDDJRX.selectedLoopIntervals[deck][index] + "_enabled",
                    "PioneerDDJRX.beatloopLeds",
                    false
                );
            }
        }
    }

    //Sampler Mode:
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftSamplerMode || ctrl === PioneerDDJRX.nonPadLeds.parameterRightSamplerMode) {
        // unbind previous connected controls:
        for (index in PioneerDDJRX.samplerGroups) {
            if (PioneerDDJRX.samplerGroups.hasOwnProperty(index)) {
                offset = PioneerDDJRX.selectedSamplerBank * 8;
                samplerIndex = (PioneerDDJRX.samplerGroups[index] + 1) + offset;
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "duration",
                    "PioneerDDJRX.samplerLeds",
                    true
                );
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "play",
                    "PioneerDDJRX.samplerLedsPlay",
                    true
                );
            }
        }
        // change sampler bank:
        if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftSamplerMode && PioneerDDJRX.selectedSamplerBank > 0) {
            PioneerDDJRX.selectedSamplerBank -= 1;
        } else if (ctrl === PioneerDDJRX.nonPadLeds.parameterRightSamplerMode && PioneerDDJRX.selectedSamplerBank < 3) {
            PioneerDDJRX.selectedSamplerBank += 1;
        }
        // bind new controls:
        for (index in PioneerDDJRX.samplerGroups) {
            if (PioneerDDJRX.samplerGroups.hasOwnProperty(index)) {
                offset = PioneerDDJRX.selectedSamplerBank * 8;
                samplerIndex = (PioneerDDJRX.samplerGroups[index] + 1) + offset;
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "duration",
                    "PioneerDDJRX.samplerLeds",
                    false
                );
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "play",
                    "PioneerDDJRX.samplerLedsPlay",
                    false
                );
                engine.trigger("[Sampler" + samplerIndex + "]", "duration");
            }
        }
    }

    //Slicer Mode:
    if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftSlicerMode || ctrl === PioneerDDJRX.nonPadLeds.parameterRightSlicerMode) {
        // change parameter set:
        if (ctrl === PioneerDDJRX.nonPadLeds.parameterLeftSlicerMode && PioneerDDJRX.selectedSlicerQuantizeParam[deck] > 0) {
            PioneerDDJRX.selectedSlicerQuantizeParam[deck] -= 1;
        } else if (ctrl === PioneerDDJRX.nonPadLeds.parameterRightSlicerMode && PioneerDDJRX.selectedSlicerQuantizeParam[deck] < 3) {
            PioneerDDJRX.selectedSlicerQuantizeParam[deck] += 1;
        }
        PioneerDDJRX.selectedSlicerQuantization[deck] = PioneerDDJRX.slicerQuantizations[PioneerDDJRX.selectedSlicerQuantizeParam[deck]];
    }
    //Slicer Mode + SHIFT:
    if (ctrl === PioneerDDJRX.nonPadLeds.shiftParameterLeftSlicerMode || ctrl === PioneerDDJRX.nonPadLeds.shiftParameterRightSlicerMode) {
        // change parameter set:
        if (ctrl === PioneerDDJRX.nonPadLeds.shiftParameterLeftSlicerMode && PioneerDDJRX.selectedSlicerDomainParam[deck] > 0) {
            PioneerDDJRX.selectedSlicerDomainParam[deck] -= 1;
        } else if (ctrl === PioneerDDJRX.nonPadLeds.shiftParameterRightSlicerMode && PioneerDDJRX.selectedSlicerDomainParam[deck] < 3) {
            PioneerDDJRX.selectedSlicerDomainParam[deck] += 1;
        }
        PioneerDDJRX.selectedSlicerDomain[deck] = PioneerDDJRX.slicerDomains[PioneerDDJRX.selectedSlicerDomainParam[deck]];
    }

    // update parameter status leds:
    PioneerDDJRX.updateParameterStatusLeds(
        group,
        PioneerDDJRX.selectedLoopRollParam[deck],
        PioneerDDJRX.selectedLoopParam[deck],
        PioneerDDJRX.selectedSamplerBank,
        PioneerDDJRX.selectedSlicerQuantizeParam[deck],
        PioneerDDJRX.selectedSlicerDomainParam[deck]
    );
};

PioneerDDJRX.parameterLeft = function(channel, control, value, status, group) {
    PioneerDDJRX.changeParameters(group, control, value);
};

PioneerDDJRX.parameterRight = function(channel, control, value, status, group) {
    PioneerDDJRX.changeParameters(group, control, value);
};

PioneerDDJRX.shiftParameterLeft = function(channel, control, value, status, group) {
    PioneerDDJRX.changeParameters(group, control, value);
};

PioneerDDJRX.shiftParameterRight = function(channel, control, value, status, group) {
    PioneerDDJRX.changeParameters(group, control, value);
};

PioneerDDJRX.vinylButton = function(channel, control, value, status, group) {
    PioneerDDJRX.toggleScratch(channel, control, value, status, group);
};

PioneerDDJRX.slipButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "slip_enabled");
    }
};

PioneerDDJRX.keyLockButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "keylock");
    }
};

PioneerDDJRX.shiftKeyLockButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group],
        range = engine.getValue(group, "rateRange");

    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftKeyLock, value);

    if (range === 0.90) {
        range = PioneerDDJRX.setUpSpeedSliderRange[deck];
    } else if ((range * 2) > 0.90) {
        range = 0.90;
    } else {
        range = range * 2;
    }

    if (value) {
        engine.setValue(group, "rateRange", range);
    }
};

PioneerDDJRX.tempoResetButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    if (value) {
        engine.setValue(group, "rate", 0);
        if (PioneerDDJRX.syncRate[deck] !== engine.getValue(group, "rate")) {
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJRX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJRX.autoLoopButton = function(channel, control, value, status, group) {
    if (value) {
        if (engine.getValue(group, "loop_enabled")) {
            engine.setValue(group, "reloop_toggle", true);
            engine.setValue(group, "reloop_toggle", false);
        } else {
            engine.setValue(group, "beatloop_activate", true);
            engine.setValue(group, "beatloop_activate", false);
        }
    }
};

PioneerDDJRX.loopActiveButton = function(channel, control, value, status, group) {
    engine.setValue(group, "reloop_toggle", value);
};

PioneerDDJRX.loopInButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_in");
};

PioneerDDJRX.shiftLoopInButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reloop_andstop");
};

PioneerDDJRX.loopOutButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_out");
};

PioneerDDJRX.loopExitButton = function(channel, control, value, status, group) {
    engine.setValue(group, "reloop_toggle", value);
};

PioneerDDJRX.loopHalveButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_halve");
};

PioneerDDJRX.loopDoubleButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_double");
};

PioneerDDJRX.loopMoveBackButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "beatjump_1_backward");
};

PioneerDDJRX.loopMoveForwardButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "beatjump_1_forward");
};

PioneerDDJRX.loadButton = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "LoadSelectedTrack", true);
        if (PioneerDDJRX.autoPFL) {
            for (var index in PioneerDDJRX.channelGroups) {
                if (PioneerDDJRX.channelGroups.hasOwnProperty(index)) {
                    if (index === group) {
                        engine.setValue(index, "pfl", true);
                    } else {
                        engine.setValue(index, "pfl", false);
                    }
                }
            }
        }
    }
};

PioneerDDJRX.crossfaderAssignCenter = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 1);
    }
};

PioneerDDJRX.crossfaderAssignLeft = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 0);
    }
};

PioneerDDJRX.crossfaderAssignRight = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 2);
    }
};

PioneerDDJRX.reverseRollButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reverseroll");
};

PioneerDDJRX.reverseButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reverse");
};

PioneerDDJRX.gridAdjustButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];

    PioneerDDJRX.gridAdjustSelected[deck] = value ? true : false;
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.gridAdjust, value);
};

PioneerDDJRX.gridSetButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "beats_translate_curpos");
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftGridAdjust, value);
};

PioneerDDJRX.gridSlideButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];

    PioneerDDJRX.gridSlideSelected[deck] = value ? true : false;
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.gridSlide, value);
};

PioneerDDJRX.syncButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "sync_enabled");
    }
};

PioneerDDJRX.quantizeButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "quantize");
    }
};

PioneerDDJRX.needleSearchTouch = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    if (engine.getValue(group, "play")) {
        PioneerDDJRX.needleSearchTouched[deck] = PioneerDDJRX.shiftPressed && (value ? true : false);
    } else {
        PioneerDDJRX.needleSearchTouched[deck] = value ? true : false;
    }
};

PioneerDDJRX.needleSearchStripPosition = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    if (PioneerDDJRX.needleSearchTouched[deck]) {
        var position = value / 0x7F;
        engine.setValue(group, "playposition", position);
    }
};

PioneerDDJRX.panelSelectButton = function(channel, control, value, status, group) {
    if (value) {
        if ((PioneerDDJRX.panels[0] === false) && (PioneerDDJRX.panels[1] === false)) {
            PioneerDDJRX.panels[0] = true;
        } else if ((PioneerDDJRX.panels[0] === true) && (PioneerDDJRX.panels[1] === false)) {
            PioneerDDJRX.panels[1] = true;
        } else if ((PioneerDDJRX.panels[0] === true) && (PioneerDDJRX.panels[1] === true)) {
            PioneerDDJRX.panels[0] = false;
        } else if ((PioneerDDJRX.panels[0] === false) && (PioneerDDJRX.panels[1] === true)) {
            PioneerDDJRX.panels[1] = false;
        }

        engine.setValue("[Samplers]", "show_samplers", PioneerDDJRX.panels[0]);
        engine.setValue("[EffectRack1]", "show", PioneerDDJRX.panels[1]);
    }
};

PioneerDDJRX.shiftPanelSelectButton = function(channel, control, value, status, group) {
    var channelGroup;
    PioneerDDJRX.shiftPanelSelectPressed = value ? true : false;

    for (var index in PioneerDDJRX.fxUnitGroups) {
        if (PioneerDDJRX.fxUnitGroups.hasOwnProperty(index)) {
            if (PioneerDDJRX.fxUnitGroups[index] < 2) {
                for (channelGroup in PioneerDDJRX.channelGroups) {
                    if (PioneerDDJRX.channelGroups.hasOwnProperty(channelGroup)) {
                        engine.connectControl(index, "group_" + channelGroup + "_enable", "PioneerDDJRX.fxAssignLeds", value);
                        if (value) {
                            engine.trigger(index, "group_" + channelGroup + "_enable");
                        }
                    }
                }
            }
            if (PioneerDDJRX.fxUnitGroups[index] >= 2) {
                for (channelGroup in PioneerDDJRX.channelGroups) {
                    if (PioneerDDJRX.channelGroups.hasOwnProperty(channelGroup)) {
                        engine.connectControl(index, "group_" + channelGroup + "_enable", "PioneerDDJRX.fxAssignLeds", !value);
                        if (value) {
                            engine.trigger(index, "group_" + channelGroup + "_enable");
                        } else {
                            PioneerDDJRX.fxAssignLedControl(index, PioneerDDJRX.channelGroups[channelGroup], false);
                        }
                    }
                }
            }
        }
    }
};


///////////////////////////////////////////////////////////////
//                          LED HELPERS                      //
///////////////////////////////////////////////////////////////

PioneerDDJRX.deckConverter = function(group) {
    if (PioneerDDJRX.channelGroups.hasOwnProperty(group)) {
        return PioneerDDJRX.channelGroups[group];
    }
    return group;
};

PioneerDDJRX.flashLedState = 0;

PioneerDDJRX.flashLed = function(deck, ledNumber) {
    if (PioneerDDJRX.flashLedState === 0) {
        PioneerDDJRX.nonPadLedControl(deck, ledNumber, 1);
        PioneerDDJRX.flashLedState = 1;
    } else if (PioneerDDJRX.flashLedState === 1) {
        PioneerDDJRX.nonPadLedControl(deck, ledNumber, 0);
        PioneerDDJRX.flashLedState = 0;
    }
};

PioneerDDJRX.resetNonDeckLeds = function() {
    var indexFxUnit;

    // fx Leds:
    for (indexFxUnit in PioneerDDJRX.fxUnitGroups) {
        if (PioneerDDJRX.fxUnitGroups.hasOwnProperty(indexFxUnit)) {
            if (PioneerDDJRX.fxUnitGroups[indexFxUnit] < 2) {
                for (var indexFxLed in PioneerDDJRX.fxEffectGroups) {
                    if (PioneerDDJRX.fxEffectGroups.hasOwnProperty(indexFxLed)) {
                        PioneerDDJRX.fxLedControl(
                            PioneerDDJRX.fxUnitGroups[indexFxUnit],
                            PioneerDDJRX.fxEffectGroups[indexFxLed],
                            false,
                            false
                        );
                        PioneerDDJRX.fxLedControl(
                            PioneerDDJRX.fxUnitGroups[indexFxUnit],
                            PioneerDDJRX.fxEffectGroups[indexFxLed],
                            true,
                            false
                        );
                    }
                }
                PioneerDDJRX.fxLedControl(PioneerDDJRX.fxUnitGroups[indexFxUnit], 0x03, false, false);
                PioneerDDJRX.fxLedControl(PioneerDDJRX.fxUnitGroups[indexFxUnit], 0x03, true, false);
            }
        }
    }

    // fx assign Leds:
    for (indexFxUnit in PioneerDDJRX.fxUnitGroups) {
        if (PioneerDDJRX.fxUnitGroups.hasOwnProperty(indexFxUnit)) {
            for (var channelGroup in PioneerDDJRX.channelGroups) {
                if (PioneerDDJRX.channelGroups.hasOwnProperty(channelGroup)) {
                    PioneerDDJRX.fxAssignLedControl(
                        indexFxUnit,
                        PioneerDDJRX.channelGroups[channelGroup],
                        false
                    );
                }
            }
        }
    }

    // general Leds:
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftMasterCue, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.loadDeck1, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck1, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.loadDeck2, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck2, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.loadDeck3, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck3, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.loadDeck4, false);
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftLoadDeck4, false);
};

PioneerDDJRX.fxAssignLedControl = function(unit, ledNumber, active) {
    var fxAssignLedsBaseChannel = 0x96,
        fxAssignLedsBaseControl = 0;

    if (unit === "[EffectRack1_EffectUnit1]") {
        fxAssignLedsBaseControl = PioneerDDJRX.nonPadLeds.fx1assignDeck1;
    }
    if (unit === "[EffectRack1_EffectUnit2]") {
        fxAssignLedsBaseControl = PioneerDDJRX.nonPadLeds.fx2assignDeck1;
    }
    if (unit === "[EffectRack1_EffectUnit3]") {
        fxAssignLedsBaseControl = PioneerDDJRX.nonPadLeds.shiftFx1assignDeck1;
    }
    if (unit === "[EffectRack1_EffectUnit4]") {
        fxAssignLedsBaseControl = PioneerDDJRX.nonPadLeds.shiftFx2assignDeck1;
    }

    midi.sendShortMsg(
        fxAssignLedsBaseChannel,
        fxAssignLedsBaseControl + ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJRX.fxLedControl = function(unit, ledNumber, shift, active) {
    var fxLedsBaseChannel = 0x94,
        fxLedsBaseControl = (shift ? 0x63 : 0x47);

    midi.sendShortMsg(
        fxLedsBaseChannel + unit,
        fxLedsBaseControl + ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJRX.padLedControl = function(deck, groupNumber, ledNumber, shift, active) {
    var padLedsBaseChannel = 0x97,
        padLedControl = (shift ? 0x08 : 0x00) + groupNumber + ledNumber,
        midiChannelOffset = PioneerDDJRX.deckConverter(deck);

    if (midiChannelOffset !== null) {
        midi.sendShortMsg(
            padLedsBaseChannel + midiChannelOffset,
            padLedControl,
            active ? 0x7F : 0x00
        );
    }
};

PioneerDDJRX.nonPadLedControl = function(deck, ledNumber, active) {
    var nonPadLedsBaseChannel = 0x90,
        midiChannelOffset = PioneerDDJRX.deckConverter(deck);

    if (midiChannelOffset !== null) {
        midi.sendShortMsg(
            nonPadLedsBaseChannel + midiChannelOffset,
            ledNumber,
            active ? 0x7F : 0x00
        );
    }
};

PioneerDDJRX.illuminateFunctionControl = function(ledNumber, active) {
    var illuminationBaseChannel = 0x9B;

    midi.sendShortMsg(
        illuminationBaseChannel,
        ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJRX.syncPlatterMotion = function(group, force) {
    var deck = PioneerDDJRX.channelGroups[group];

    if (!PioneerDDJRX.platterLoaded[deck]) {
        return;
    }

    var moving = engine.getValue(group, "play") > 0;
    if (force || PioneerDDJRX.platterMoving[deck] !== moving) {
        PioneerDDJRX.illuminateFunctionControl(
            PioneerDDJRX.illuminationControl["playPauseDeck" + (deck + 1)],
            moving
        );
        PioneerDDJRX.platterMoving[deck] = moving;
    }
};

PioneerDDJRX.generalLedControl = function(ledNumber, active) {
    var generalLedBaseChannel = 0x96;

    midi.sendShortMsg(
        generalLedBaseChannel,
        ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJRX.updateParameterStatusLeds = function(group, statusRoll, statusLoop, statusSampler, statusSlicerQuant, statusSlicerDomain) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftRollMode, statusRoll & (1 << 1));
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightRollMode, statusRoll & 1);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftGroup2Mode, statusLoop & (1 << 1));
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightGroup2Mode, statusLoop & 1);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftSamplerMode, statusSampler & (1 << 1));
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightSamplerMode, statusSampler & 1);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftSlicerMode, statusSlicerQuant & (1 << 1));
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightSlicerMode, statusSlicerQuant & 1);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterLeftSlicerMode, statusSlicerDomain & (1 << 1));
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftParameterRightSlicerMode, statusSlicerDomain & 1);
};


///////////////////////////////////////////////////////////////
//                             LEDS                          //
///////////////////////////////////////////////////////////////

PioneerDDJRX.fxAssignLeds = function(value, group, control) {
    var channelGroup = control.replace("group_", '').replace("_enable", '');
    PioneerDDJRX.fxAssignLedControl(group, PioneerDDJRX.channelGroups[channelGroup], value);
};

PioneerDDJRX.headphoneCueLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.headphoneCue, value);
};

PioneerDDJRX.shiftHeadphoneCueLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftHeadphoneCue, value);
};

PioneerDDJRX.shiftMasterCueLed = function(value, group, control) {
    PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds.shiftMasterCue, value);
};

PioneerDDJRX.keyLockLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.keyLock, value);
};

PioneerDDJRX.playLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.play, value);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftPlay, value);
};

PioneerDDJRX.jogPlayState = function(value, group, control) {
    PioneerDDJRX.syncPlatterMotion(group, false);
};

PioneerDDJRX.cueLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.cue, value);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftCue, value);
};

PioneerDDJRX.loadLed = function(value, group, control) {
    var deck = PioneerDDJRX.channelGroups[group];
    if (value > 0) {
        PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds["loadDeck" + (deck + 1)], true);
        if (!PioneerDDJRX.platterLoaded[deck]) {
            PioneerDDJRX.illuminateFunctionControl(
                PioneerDDJRX.illuminationControl["loadedDeck" + (deck + 1)],
                true
            );
            PioneerDDJRX.platterLoaded[deck] = true;
            PioneerDDJRX.platterMoving[deck] = null;
            PioneerDDJRX.syncPlatterMotion(group, true);
        }
    } else {
        PioneerDDJRX.generalLedControl(PioneerDDJRX.nonPadLeds["loadDeck" + (deck + 1)], false);
        if (PioneerDDJRX.platterLoaded[deck]) {
            PioneerDDJRX.illuminateFunctionControl(
                PioneerDDJRX.illuminationControl["playPauseDeck" + (deck + 1)],
                false
            );
        }
        PioneerDDJRX.platterLoaded[deck] = false;
        PioneerDDJRX.platterMoving[deck] = false;
    }
};

PioneerDDJRX.reverseLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.censor, value);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftCensor, value);
};

PioneerDDJRX.slipLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.slip, value);
};

PioneerDDJRX.quantizeLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftSync, value);
};

PioneerDDJRX.syncLed = function(value, group, control) {
    var deck = PioneerDDJRX.channelGroups[group];
    var rate = engine.getValue(group, "rate");
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.sync, value);
    if (value) {
        PioneerDDJRX.syncRate[deck] = rate;
        if (PioneerDDJRX.syncRate[deck] > 0) {
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, 1);
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, 0);
        } else if (PioneerDDJRX.syncRate[deck] < 0) {
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, 1);
        }
    }
    if (!value) {
        if (PioneerDDJRX.syncRate[deck] !== rate || rate === 0) {
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJRX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJRX.autoLoopLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.autoLoop, value);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopOut, value);
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftAutoLoop, value);
};

PioneerDDJRX.loopInLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopIn, value);
};

PioneerDDJRX.shiftLoopInLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopIn, value);
};

PioneerDDJRX.loopOutLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopOut, value);
};

PioneerDDJRX.loopHalveLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopHalve, value);
};

PioneerDDJRX.loopDoubleLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.loopDouble, value);
};

PioneerDDJRX.loopShiftFWLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopDouble, value);
};

PioneerDDJRX.loopShiftBKWLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.shiftLoopHalve, value);
};

PioneerDDJRX.hotCueParameterRightLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterRightHotCueMode, value);
};

PioneerDDJRX.hotCueParameterLeftLed = function(value, group, control) {
    PioneerDDJRX.nonPadLedControl(group, PioneerDDJRX.nonPadLeds.parameterLeftHotCueMode, value);
};

PioneerDDJRX.samplerLeds = function(value, group, control) {
    var samplerIndex = (group.replace("[Sampler", '').replace(']', '') - 1) % 8,
        sampleDeck = "[Sampler" + (samplerIndex + 1) + "]",
        padNum = PioneerDDJRX.samplerGroups[sampleDeck];

    for (var index in PioneerDDJRX.channelGroups) {
        if (PioneerDDJRX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJRX.padLedControl(
                PioneerDDJRX.channelGroups[index],
                PioneerDDJRX.ledGroups.sampler,
                padNum,
                false,
                value
            );
        }
    }
};

PioneerDDJRX.samplerLedsPlay = function(value, group, control) {
    var samplerIndex = (group.replace("[Sampler", '').replace(']', '') - 1) % 8,
        sampleDeck = "[Sampler" + (samplerIndex + 1) + "]",
        padNum = PioneerDDJRX.samplerGroups[sampleDeck];

    if (!engine.getValue(sampleDeck, "duration")) {
        return;
    }

    for (var index in PioneerDDJRX.channelGroups) {
        if (PioneerDDJRX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJRX.padLedControl(
                PioneerDDJRX.channelGroups[index],
                PioneerDDJRX.ledGroups.sampler,
                padNum,
                false, !value
            );
            PioneerDDJRX.padLedControl(
                PioneerDDJRX.channelGroups[index],
                PioneerDDJRX.ledGroups.sampler,
                padNum,
                true,
                value
            );
        }
    }
};

PioneerDDJRX.beatloopLeds = function(value, group, control) {
    var padNum,
        shifted = false,
        deck = PioneerDDJRX.channelGroups[group];

    for (var index in PioneerDDJRX.selectedLoopIntervals[deck]) {
        if (PioneerDDJRX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
            if (control === "beatloop_" + PioneerDDJRX.selectedLoopIntervals[deck][index] + "_enabled") {
                padNum = index % 8;
                PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.group2, padNum, shifted, value);
            }
        }
    }
};

PioneerDDJRX.beatlooprollLeds = function(value, group, control) {
    var padNum,
        shifted = false,
        deck = PioneerDDJRX.channelGroups[group];

    for (var index in PioneerDDJRX.selectedLooprollIntervals[deck]) {
        if (PioneerDDJRX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
            if (control === "beatlooproll_" + PioneerDDJRX.selectedLooprollIntervals[deck][index] + "_activate") {
                padNum = index % 8;
                PioneerDDJRX.padLedControl(group, PioneerDDJRX.ledGroups.loopRoll, padNum, shifted, value);
            }
        }
    }
};

PioneerDDJRX.VuMeterLeds = function(value, group, control) {
    // Remark: Only deck vu meters can be controlled! Master vu meter is handled by hardware!
    var midiBaseAdress = 0xB0,
        channel = 0x02,
        midiOut = 0x00;

    value = parseInt(value * 0x76); //full level indicator: 0x7F

    if (engine.getValue(group, "peak_indicator")) {
        value = value + 0x09;
    }

    PioneerDDJRX.valueVuMeter[group + "_current"] = value;

    for (var index in PioneerDDJRX.channelGroups) {
        if (PioneerDDJRX.channelGroups.hasOwnProperty(index)) {
            midiOut = PioneerDDJRX.valueVuMeter[index + "_current"];
            if (PioneerDDJRX.twinkleVumeterAutodjOn) {
                if (engine.getValue("[AutoDJ]", "enabled")) {
                    if (PioneerDDJRX.valueVuMeter[index + "_enabled"]) {
                        midiOut = 0;
                    }
                    if (midiOut < 5 && !PioneerDDJRX.valueVuMeter[index + "_enabled"]) {
                        midiOut = 5;
                    }
                }
            }
            midi.sendShortMsg(
                midiBaseAdress + PioneerDDJRX.channelGroups[index],
                channel,
                midiOut
            );
        }
    }
};


///////////////////////////////////////////////////////////////
//                          JOGWHEELS                        //
///////////////////////////////////////////////////////////////

PioneerDDJRX.getJogWheelDelta = function(value) {
    // The Wheel control centers on 0x40; find out how much it's moved by.
    return value - 0x40;
};

PioneerDDJRX.jogRingTick = function(channel, control, value, status, group) {
    PioneerDDJRX.pitchBendFromJog(group, PioneerDDJRX.getJogWheelDelta(value));
};

PioneerDDJRX.jogRingTickShift = function(channel, control, value, status, group) {
    PioneerDDJRX.pitchBendFromJog(
        group,
        PioneerDDJRX.getJogWheelDelta(value) * PioneerDDJRX.jogwheelShiftMultiplier
    );
};

PioneerDDJRX.jogPlatterTick = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];

    if (PioneerDDJRX.gridAdjustSelected[deck]) {
        if (PioneerDDJRX.getJogWheelDelta(value) > 0) {
            script.toggleControl(group, "beats_adjust_faster");
        }
        if (PioneerDDJRX.getJogWheelDelta(value) <= 0) {
            script.toggleControl(group, "beats_adjust_slower");
        }
        return;
    }
    if (PioneerDDJRX.gridSlideSelected[deck]) {
        if (PioneerDDJRX.getJogWheelDelta(value) > 0) {
            script.toggleControl(group, "beats_translate_later");
        }
        if (PioneerDDJRX.getJogWheelDelta(value) <= 0) {
            script.toggleControl(group, "beats_translate_earlier");
        }
        return;
    }

    if (PioneerDDJRX.scratchMode[deck] && engine.isScratching(deck + 1)) {
        engine.scratchTick(deck + 1, PioneerDDJRX.getJogWheelDelta(value));
    } else {
        PioneerDDJRX.pitchBendFromJog(group, PioneerDDJRX.getJogWheelDelta(value));
    }
};

PioneerDDJRX.jogPlatterTickShift = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];

    if (PioneerDDJRX.scratchMode[deck] && engine.isScratching(deck + 1)) {
        engine.scratchTick(deck + 1, PioneerDDJRX.getJogWheelDelta(value));
    } else {
        PioneerDDJRX.pitchBendFromJog(
            group,
            PioneerDDJRX.getJogWheelDelta(value) * PioneerDDJRX.jogwheelShiftMultiplier
        );
    }
};

PioneerDDJRX.jogTouch = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];

    if (PioneerDDJRX.scratchMode[deck]) {
        if (value) {
            engine.scratchEnable(
                deck + 1,
                PioneerDDJRX.scratchSettings.jogResolution,
                PioneerDDJRX.scratchSettings.vinylSpeed,
                PioneerDDJRX.scratchSettings.alpha,
                PioneerDDJRX.scratchSettings.beta,
                true
            );
        } else {
            engine.scratchDisable(deck + 1, true);
        }
    }
};

PioneerDDJRX.toggleScratch = function(channel, control, value, status, group) {
    var deck = PioneerDDJRX.channelGroups[group];
    if (value) {
        PioneerDDJRX.scratchMode[deck] = !PioneerDDJRX.scratchMode[deck];
        PioneerDDJRX.triggerVinylLed(deck);
    }
};

PioneerDDJRX.triggerVinylLed = function(deck) {
    PioneerDDJRX.nonPadLedControl(deck, PioneerDDJRX.nonPadLeds.vinyl, PioneerDDJRX.scratchMode[deck]);
};

PioneerDDJRX.pitchBendFromJog = function(group, movement) {
    engine.setValue(group, "jog", movement / 5 * PioneerDDJRX.jogwheelSensitivity);
};


///////////////////////////////////////////////////////////////
//             ROTARY SELECTOR & NAVIGATION BUTTONS          //
///////////////////////////////////////////////////////////////

PioneerDDJRX.loadPrepareButton = function(channel, control, value, status) {
    if (PioneerDDJRX.rotarySelectorChanged === true) {
        if (value) {
            engine.setValue("[PreviewDeck1]", "LoadSelectedTrackAndPlay", true);
        } else {
            if (PioneerDDJRX.jumpPreviewEnabled) {
                engine.setValue("[PreviewDeck1]", "playposition", PioneerDDJRX.jumpPreviewPosition);
            }
            PioneerDDJRX.rotarySelectorChanged = false;
        }
    } else {
        if (value) {
            if (engine.getValue("[PreviewDeck1]", "stop")) {
                script.toggleControl("[PreviewDeck1]", "play");
            } else {
                script.toggleControl("[PreviewDeck1]", "stop");
            }
        }
    }
};

PioneerDDJRX.backButton = function(channel, control, value, status) {
    script.toggleControl("[Library]", "MoveFocusBackward");
};

PioneerDDJRX.shiftBackButton = function(channel, control, value, status) {
    if (value) {
        script.toggleControl("[Skin]", "show_maximized_library");
    }
};

PioneerDDJRX.getRotaryDelta = function(value) {
    var delta = 0x40 - Math.abs(0x40 - value),
        isCounterClockwise = value > 0x40;

    if (isCounterClockwise) {
        delta *= -1;
    }
    return delta;
};

PioneerDDJRX.rotarySelector = function(channel, control, value, status) {
    var delta = PioneerDDJRX.getRotaryDelta(value);

    engine.setValue("[Library]", "MoveVertical", delta);
    PioneerDDJRX.rotarySelectorChanged = true;
};

PioneerDDJRX.rotarySelectorShifted = function(channel, control, value, status) {
    var delta = PioneerDDJRX.getRotaryDelta(value),
        f = (delta > 0 ? "SelectNextPlaylist" : "SelectPrevPlaylist");

    engine.setValue("[Library]", "MoveHorizontal", delta);
};

PioneerDDJRX.rotarySelectorClick = function(channel, control, value, status) {
    script.toggleControl("[Library]", "GoToItem");
};

PioneerDDJRX.rotarySelectorShiftedClick = function(channel, control, value, status) {
    if (PioneerDDJRX.autoDJAddTop) {
        script.toggleControl("[Library]", "AutoDjAddTop");
    } else {
        script.toggleControl("[Library]", "AutoDjAddBottom");
    }
};


///////////////////////////////////////////////////////////////
//                             FX                            //
///////////////////////////////////////////////////////////////

PioneerDDJRX.fxAssignButton = function(channel, control, value, status, group) {
    if (value) {
        if ((control >= 0x4C) && (control <= 0x4F)) {
            script.toggleControl("[EffectRack1_EffectUnit1]", "group_" + group + "_enable");
        } else if ((control >= 0x50) && (control <= 0x53)) {
            script.toggleControl("[EffectRack1_EffectUnit2]", "group_" + group + "_enable");
        } else if ((control >= 0x70) && (control <= 0x73) && PioneerDDJRX.shiftPanelSelectPressed) {
            script.toggleControl("[EffectRack1_EffectUnit3]", "group_" + group + "_enable");
        } else if ((control >= 0x54) && (control <= 0x57) && PioneerDDJRX.shiftPanelSelectPressed) {
            script.toggleControl("[EffectRack1_EffectUnit4]", "group_" + group + "_enable");
        }
    }
};


///////////////////////////////////////////////////////////////
//                          SLICER                           //
///////////////////////////////////////////////////////////////

PioneerDDJRX.slicerBeatActive = function(value, group, control) {
    // This slicer implementation will work for constant beatgrids only!
    var deck = PioneerDDJRX.channelGroups[group],
        bpm = engine.getValue(group, "bpm"),
        playposition = engine.getValue(group, "playposition"),
        duration = engine.getValue(group, "duration"),
        slicerPosInSection = 0,
        ledBeatState = true,
        domain = PioneerDDJRX.selectedSlicerDomain[deck];

    if (engine.getValue(group, "beat_closest") === engine.getValue(group, "beat_next")) {
        return;
    }

    PioneerDDJRX.slicerBeatsPassed[deck] = Math.round((playposition * duration) * (bpm / 60));
    slicerPosInSection = Math.floor((PioneerDDJRX.slicerBeatsPassed[deck] % domain) / (domain / 8));

    if (PioneerDDJRX.activePadMode[deck] === PioneerDDJRX.padModes.slicer) {
        if (PioneerDDJRX.activeSlicerMode[deck] === PioneerDDJRX.slicerModes.contSlice) {
            ledBeatState = true;
        }
        if (PioneerDDJRX.activeSlicerMode[deck] === PioneerDDJRX.slicerModes.loopSlice) {
            ledBeatState = false;
            if (((PioneerDDJRX.slicerBeatsPassed[deck] - 1) % domain) === (domain - 1) &&
                !PioneerDDJRX.slicerAlreadyJumped[deck] &&
                PioneerDDJRX.slicerPreviousBeatsPassed[deck] < PioneerDDJRX.slicerBeatsPassed[deck]) {
                engine.setValue(group, "beatjump", -domain);
                PioneerDDJRX.slicerAlreadyJumped[deck] = true;
            } else {
                PioneerDDJRX.slicerAlreadyJumped[deck] = false;
            }
        }
        // PAD Led control:
        for (var i = 0; i < 8; i++) {
            if (PioneerDDJRX.slicerActive[deck]) {
                if (PioneerDDJRX.slicerButton[deck] !== i) {
                    PioneerDDJRX.padLedControl(
                        group,
                        PioneerDDJRX.ledGroups.slicer,
                        i,
                        false,
                        (slicerPosInSection === i) ? ledBeatState : !ledBeatState
                    );
                }
            } else {
                PioneerDDJRX.padLedControl(
                    group,
                    PioneerDDJRX.ledGroups.slicer,
                    i,
                    false,
                    (slicerPosInSection === i) ? ledBeatState : !ledBeatState
                );
            }
        }
    } else {
        PioneerDDJRX.slicerAlreadyJumped[deck] = false;
        PioneerDDJRX.slicerPreviousBeatsPassed[deck] = 0;
        PioneerDDJRX.slicerActive[deck] = false;
    }
};
