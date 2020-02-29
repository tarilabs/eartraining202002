# eartraining202002

Goals:
- A bespoke exercise propaedeutic to melodic dictation, as an excuse to learn Web MIDI API

Non-Goals:
- using web-frameworks; for this exercise it should be enough manipulating the DOM directly

## Basic Instructions

Start a Midi synth for a piano. On Mac for instance, start Garage Band and select Piano.

Select a Midi out for dictation: it will be used to play the note to be guessed.
On Mac for instance, select "IAC Driver" for dictation; if that is not available, use "audio MIDI Setup" to enable it.

Select a Midi in device to be used for answering: you will use it to guess the note which has been played.
