# DDJ-RX + Mixxx Controller Mapping Project

## Objective

Create or adapt a Mixxx DJ controller mapping for the **Pioneer DDJ-RX** running with **Mixxx on a Raspberry Pi 500+**.

There does not appear to be a native DDJ-RX mapping included with the installed version of Mixxx. However, the existing **Pioneer DDJ-SX mapping** is partially compatible with the DDJ-RX and should be used as the starting point.

The goal is to create a dedicated DDJ-RX mapping while preserving all currently working functionality and progressively adding RX-specific hardware feedback and controls.

---

## Hardware / Software Environment

Hardware:

- Raspberry Pi 500+
- Pioneer DDJ-RX
- DDJ-RX connected directly via USB

Software:

- Raspberry Pi OS / Raspbian
- Mixxx DJ
- ALSA audio
- Mixxx DDJ-SX controller mapping currently loaded as the controller preset

The DDJ-RX is successfully detected by Linux through:

```bash
lsusb
aconnect -l
aplay -l
arecord -l
```

Both MIDI and USB audio functionality are available.

---

## DDJ-RX USB Audio Status

ALSA detects the DDJ-RX as:

```text
card 2: DDJRX [DDJ-RX], device 0: USB Audio [USB Audio]
```

The USB audio interface reports:

```text
Playback:
Format: S24_3LE
Channels: 4
Rates: 44100
Bits: 24

Capture:
Format: S24_3LE
Channels: 2
Rates: 44100
Bits: 24
```

Full `/proc/asound/card2/stream0` result:

```text
Pioneer DJ DDJ-RX at usb-xhci-hcd.0-2, full speed : USB Audio

Playback:
  Status: Stop
  Interface 1
    Altset 1
    Format: S24_3LE
    Channels: 4
    Endpoint: 0x01 (1 OUT) (ADAPTIVE)
    Rates: 44100
    Bits: 24
    Channel map: FL FR FC LFE

Capture:
  Status: Stop
  Interface 2
    Altset 1
    Format: S24_3LE
    Channels: 2
    Endpoint: 0x82 (2 IN) (SYNC)
    Rates: 44100
    Bits: 24
    Channel map: FL FR
```

Mixxx has successfully been configured with separate **Main** and **Headphones** output channel pairs.

Audio playback through the DDJ-RX is working.

Therefore, the DDJ-RX USB audio interface is functional with Mixxx on this Raspberry Pi/Linux configuration.

Audio routing is NOT currently considered part of the controller-mapping problem.

---

## Existing DDJ-SX Mapping Compatibility

The Mixxx DDJ-SX controller mapping has been loaded for the DDJ-RX.

Several controls already work correctly.

Confirmed working functionality includes:

- Track Play
- Channel faders
- Crossfader
- Channel EQ controls

Additional controls may already work but have not yet been comprehensively tested.

This indicates substantial MIDI compatibility between the DDJ-SX and DDJ-RX.

Do NOT discard the existing SX mapping or rewrite the mapping from scratch unless inspection demonstrates that this is necessary.

Use the SX mapping as the baseline.

---

## Known Missing / Incorrect Functionality

Two specific features have already been identified.

### 1. RGB Hot Cue Feedback

Hot Cue pads can be used, but the RGB illumination on the physical DDJ-RX performance pads does not synchronize with the Hot Cue colors assigned by Mixxx.

Desired behavior:

```text
Mixxx Hot Cue color
        ↓
DDJ-RX mapping
        ↓
Translate Mixxx cue color into DDJ-RX MIDI LED value
        ↓
Send MIDI OUT
        ↓
Corresponding DDJ-RX performance pad displays matching color
```

The mapping may require JavaScript rather than simple XML MIDI assignments.

The implementation should listen for Mixxx Hot Cue state/color changes and send the appropriate DDJ-RX MIDI output messages.

Do not assume DDJ-SX RGB MIDI messages are identical to DDJ-RX messages.

Use the Pioneer DDJ-RX MIDI specification as the authoritative reference.

---

### 2. Jog Wheel / Platter Playhead Illumination

When using rekordbox DJ, the DDJ-RX platter illumination provides visual playback/playhead feedback.

This animation currently does NOT operate when controlling Mixxx through the DDJ-SX mapping.

Desired behavior:

```text
Mixxx deck playback state / position
        ↓
DDJ-RX JavaScript mapping
        ↓
DDJ-RX jog illumination MIDI messages
        ↓
Physical platter provides playback-position feedback
```

The DDJ-RX MIDI specification includes MIDI OUT functionality associated with jog illumination.

Investigation is required to determine whether:

1. the RX firmware performs the animation internally after receiving appropriate deck/play-state messages;

OR

2. Mixxx must continually transmit position/state messages to animate the platter.

Do not assume the mechanism until the MIDI specification and existing mapping code have been inspected.

---

## Mapping Architecture

The existing Mixxx DDJ-SX mapping likely consists of an XML mapping plus JavaScript controller logic.

Rather than editing the bundled DDJ-SX files directly, create DDJ-RX-specific copies.

Example:

```text
Pioneer-DDJ-RX.midi.xml
Pioneer-DDJ-RX-scripts.js
```

If the existing JavaScript mapping uses an object such as:

```javascript
PioneerDDJSX
```

create an RX-specific equivalent such as:

```javascript
PioneerDDJRX
```

Update the XML `<scriptfiles>` configuration and any JavaScript callback references accordingly.

The original DDJ-SX mapping must remain unchanged.

---

## Implementation Strategy

Work incrementally.

### Phase 1 — Establish RX Mapping Baseline

Copy the existing working DDJ-SX mapping.

Rename it for DDJ-RX.

Update mapping metadata and JavaScript references.

Verify that functionality currently working through the SX mapping remains working through the new RX mapping.

Baseline controls include:

- Play
- Cue, if currently functional
- Channel faders
- Crossfader
- EQ
- Pitch
- Browse/load, where currently functional

Do not make unrelated behavioral changes during this phase.

### Phase 2 — RGB Hot Cues (Completed)

Status: **Implemented and Verified**
- Implemented fixed unique LED color assignment per pad position (Pads 1–8) on the DDJ-RX performance pads across all 4 decks (`0x30` Pink, `0x20` Yellow, `0x05` Light Blue, `0x15` Green, `0x27` Orange, `0x01` Dark Blue, `0x10` Teal, `0x40` White).
- Active cue points display their respective pad color; clearing a cue point turns the LED off (`0x00`).

### Phase 3 — Jog Wheel Feedback (Completed)

Status: **Implemented and Verified**
- Uses RX-specific `0x9B` illumination control commands (`9B 09 7F` DJ app connect, `9B 00–03` deck loaded, `9B 0C–0F` deck play/pause).
- Platter animation correctly starts when playing and stops when paused.
- Platter remains stationary during Cue preview to prevent visual drift and reinitialization artifacts.

### Phase 4 — Remaining Performance Features

- **Beat Jump Mode**: Implemented via `SHIFT + HOT CUE` button on DDJ-RX across all 4 decks.
  - **Pads 1–2**: -4 / +4 Beats (Pad 1: Dark Orange `0x28`, Pad 2: Green `0x15`)
  - **Pads 3–4**: -8 / +8 Beats (Pad 3: Dark Orange `0x28`, Pad 4: Green `0x15`)
  - **Pads 5–6**: -16 / +16 Beats (Pad 5: Dark Orange `0x28`, Pad 6: Green `0x15`)
  - **Pads 7–8**: -32 / +32 Beats (Pad 7: Dark Orange `0x28`, Pad 8: Green `0x15`)
  - **Press Feedback**: Flashes bright white/cyan (`0x7F`) when touched.
  - **PARAMETER 1 Left / Right**: Halves / doubles `beatjump_size` in Mixxx.

After RGB pads and jog feedback are stable, evaluate:

- Loop controls
- Pad modes
- Sampler
- Slip
- Sync
- Quantize
- Censor/reverse
- FX controls
- Deck switching
- Four-deck support
- Button LEDs
- VU meters
- Other RX-specific illumination

---

## Development Rules

Use the smallest viable changes.

Follow this workflow:

```text
Inspect → Determine Change → Edit → Verify
```

Requirements:

- Inspect the existing DDJ-SX mapping before modifying anything.
- Preserve known-working SX-derived functionality.
- Compare MIDI messages against the official DDJ-RX MIDI specification.
- Prefer modifying existing SX behavior where the architectures overlap.
- Add RX-specific behavior only where required.
- Do not refactor unrelated controller code.
- Do not redesign working Mixxx functionality.
- Do not add dependencies.
- Do not speculate about MIDI values when they can be determined from the Pioneer MIDI specification.
- Keep input mapping and output/LED feedback logically separated where practical.
- Test changes incrementally.
- Avoid excessive MIDI output/update loops that could unnecessarily consume CPU on the Raspberry Pi.

---

## Important Distinction

There are two separate systems:

```text
DDJ-RX
   │
   ├── MIDI
   │     ↓
   │   Mixxx controller mapping
   │     ↓
   │   XML + JavaScript
   │
   └── USB Audio
         ↓
       ALSA
         ↓
       Mixxx Sound Hardware
```

USB audio is already working.

Do NOT attempt to solve controller LED/jog behavior by changing ALSA, PipeWire, or Mixxx Sound Hardware settings.

The current work concerns the **MIDI/controller mapping only**.

---

## Initial Files to Inspect

Before making changes, locate and inspect the exact DDJ-SX mapping currently being used by this Mixxx installation.

Likely files include:

```text
Pioneer-DDJ-SX*.midi.xml
Pioneer-DDJ-SX*.js
```

Do not assume filenames.

Locate them in the Mixxx controller mapping directories.

After locating them:

1. Identify the XML mapping file.
2. Identify all JavaScript files referenced by it.
3. Identify the JavaScript controller object/name.
4. Identify Hot Cue input/output implementation.
5. Identify jog-wheel input/output implementation.
6. Identify LED/MIDI-output helper functions.
7. Identify initialization and shutdown routines.
8. Determine which existing SX MIDI messages correspond directly with RX messages.
9. Document differences before editing.

---

## External Technical Reference

Use the official Pioneer DDJ-RX MIDI message specification when determining RX-specific MIDI messages.

Important areas to identify include:

- Performance pad MIDI input
- Performance pad MIDI output
- RGB/color values
- Hot Cue LEDs
- Jog illumination
- Play/Pause illumination
- Deck-specific MIDI channels
- FX LEDs
- VU meters
- Deck switching
- Other MIDI OUT feedback

Do not blindly copy SX MIDI OUT values simply because the corresponding input controls happen to work.

---

## Immediate Development Goal

The first implementation milestone is:

**Create a dedicated DDJ-RX mapping derived from the existing DDJ-SX mapping without breaking currently working controls.**

After establishing that baseline, prioritize:

1. RGB Hot Cue synchronization
2. Jog/platter playback illumination

Do not attempt a complete controller rewrite during the first implementation pass.

---

## Verification

After creating the DDJ-RX mapping, verify:

- DDJ-RX appears as a controller in Mixxx.
- New DDJ-RX mapping can be selected.
- Track playback controls still work.
- Channel faders still work.
- Crossfader still works.
- EQ controls still work.
- Existing audio configuration remains unaffected.
- Hot Cue buttons trigger the correct Mixxx cues.
- Hot Cue LEDs display the corresponding Mixxx colors.
- Changing a cue color in Mixxx updates the hardware pad.
- Deleting a Hot Cue clears/updates its pad illumination.
- Jog illumination responds to deck playback.
- Jog/playhead indication remains synchronized with the appropriate deck.
- Deck 1/2 feedback does not cross-control the other deck.
- No excessive CPU usage or MIDI traffic is introduced on the Raspberry Pi 500+.