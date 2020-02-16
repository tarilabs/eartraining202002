import WebMidi from "webmidi";

let lowerBound: number = 55;
let upperBound: number = 84;
let randomSpan: number = 2;

let prevNote: number = 69;
let curNote: number = 69;

let playNoteFinite: (note: number) => void = () => {};

WebMidi.enable(function (err) {
    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);


    let output = WebMidi.outputs[2];

    playNoteFinite = (value : number) => {
        output.playNote(value, 10, {duration: 3000, rawVelocity: true, velocity: 127});
    }

    let input = WebMidi.inputs[1];

    input.addListener('noteon', "all",
    function (e) {
        console.log("Received 'noteon' message (" + e.note.name + e.note.octave + "). " + e.note.number + " min: " + lowerBound);
        if (e.note.number != curNote) {
            document.getElementById("cur-note")?.setAttribute("style", "color:red;");
        } else {
            (<HTMLInputElement> document.getElementById("cur-note")).value = ""+curNote;
            document.getElementById("cur-note")?.setAttribute("style", "color:green;");
        }
    }
    );

    input.addListener('noteoff', "all",
    function (e) {
        console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + "). " + e.note.number + " min: " + lowerBound);
        document.getElementById("cur-note")?.removeAttribute("style");
        (<HTMLInputElement> document.getElementById("cur-note")).value = "?";
        if (e.note.number == curNote) {
            generateNewCurNote();
        }
    }
    );

    playNoteFinite(curNote);
});

updatePrevNote(69);
function updatePrevNote(value : number) {
    prevNote = value;
    (<HTMLInputElement> document.getElementById("prev-note")).value = ""+prevNote;
}

function generateNewCurNote() {
    updatePrevNote(curNote);
    const min = Math.max(lowerBound, curNote - randomSpan); // "ceil" between these two
    const max = Math.min(upperBound, curNote + randomSpan); // and "floor"
    curNote = getRandomIntInclusive(min, max);
    setTimeout(() => { playNoteFinite(curNote); }, 1000);
}

function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

document.getElementById("min-number-input")?.addEventListener("input", 
function showCurrentValue(event) {
    const element = event?.target as HTMLInputElement;
    const value = element.value;
    const valueNum = parseInt(value);
    console.log(valueNum);
    lowerBound = valueNum;
}
);
document.getElementById("max-number-input")?.addEventListener("input", 
function showCurrentValue(event) {
    const element = event?.target as HTMLInputElement;
    const value = element.value;
    const valueNum = parseInt(value);
    console.log(valueNum);
    upperBound = valueNum;
}
);
document.getElementById("span-number-input")?.addEventListener("input", 
function showCurrentValue(event) {
    const element = event?.target as HTMLInputElement;
    const value = element.value;
    const valueNum = parseInt(value);
    console.log(valueNum);
    randomSpan = valueNum;
}
);
document.getElementById("prev-note-replay")?.addEventListener("click", 
function showCurrentValue(event) {
    playNoteFinite(prevNote);
}
);
document.getElementById("cur-note-replay")?.addEventListener("click", 
function showCurrentValue(event) {
    playNoteFinite(curNote);
}
);