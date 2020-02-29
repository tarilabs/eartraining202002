import webmidijs from "webmidi";

let lowerBound: number = 55;
updateMinLabel();
let upperBound: number = 84;
updateMaxLabel();
let randomSpan: number = 2;

let prevNote: number = 69;
let curNote: number = 69;

let playNoteFinite: (note: number) => void = () => {};

if (navigator.requestMIDIAccess) {
    console.log('navigator.requestMIDIAccess true');
    navigator.requestMIDIAccess().then(onMIDISuccess, (f) => {console.log('WebMIDI failed.');});
} else {
    console.log('navigator.requestMIDIAccess false');
}

function onMIDISuccess(midiAccess : WebMidi.MIDIAccess) {
    populateDictate(midiAccess);
    populateAnswer(midiAccess);

    (<HTMLSelectElement>document.getElementById("dictate-using"))?.addEventListener("change", 
    function fn(event) {
        const element = event?.target as HTMLSelectElement;
        const value = element.value;
        console.log(value);
        const output = midiAccess.outputs.get(value);
        if (output != undefined) {
            playNoteFinite = (n) => {
                output.send([144, n, 127]);
                setTimeout(() => {
                    output.send([128, n, 127]);
                    output.send([144, n, 0]);
                }, 3000);
            }
            playNoteFinite(curNote);
        }
    }
    );

    (<HTMLSelectElement>document.getElementById("answer-using"))?.addEventListener("change", 
    function fn(event) {
        const element = event?.target as HTMLSelectElement;
        const value = element.value;
        console.log(value);
        midiAccess.inputs.get(value)?.addEventListener('midimessage', (msg) => {
            const note = msg.data[1];
            switch(msg.data[0]) {
                case 144: 
                    if (msg.data[2]>0) { // note ON
                        console.log("Received 'noteon' message (" + msg.data + ").");
                        if (note != curNote) {
                            document.getElementById("cur-note")?.setAttribute("style", "color:red;");
                        } else {
                            (<HTMLInputElement> document.getElementById("cur-note")).value = numberToNoteName(curNote);
                            document.getElementById("cur-note")?.setAttribute("style", "color:green;");
                        }
                        break;
                    } 
                    // else fall back into note OFF:
                case 128: // note OFF
                    console.log("Received 'noteoff' message (" + msg.data + "). ");
                    document.getElementById("cur-note")?.removeAttribute("style");
                    (<HTMLInputElement> document.getElementById("cur-note")).value = "?";
                    if (note == curNote) {
                        generateNewCurNote();
                    }
                    break;
            }
        });
    }
    );
}


webmidijs.enable(function (err) {
    console.log(webmidijs.inputs);
    console.log(webmidijs.outputs);

    // let output = webmidijs.outputs[2];

    // playNoteFinite = (value : number) => {
    //     output.playNote(value, 10, {duration: 3000, rawVelocity: true, velocity: 127});
    // }

    // let input = webmidijs.inputs[1];

    // input.addListener('noteon', "all",
    // function (e) {
    //     console.log("Received 'noteon' message (" + e.note.name + e.note.octave + "). " + e.note.number + " min: " + lowerBound);
    //     if (e.note.number != curNote) {
    //         document.getElementById("cur-note")?.setAttribute("style", "color:red;");
    //     } else {
    //         (<HTMLInputElement> document.getElementById("cur-note")).value = ""+curNote;
    //         document.getElementById("cur-note")?.setAttribute("style", "color:green;");
    //     }
    // }
    // );

    // input.addListener('noteoff', "all",
    // function (e) {
    //     console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + "). " + e.note.number + " min: " + lowerBound);
    //     document.getElementById("cur-note")?.removeAttribute("style");
    //     (<HTMLInputElement> document.getElementById("cur-note")).value = "?";
    //     if (e.note.number == curNote) {
    //         generateNewCurNote();
    //     }
    // }
    // );

    // playNoteFinite(curNote);
});

updatePrevNote(69);

function populateDictate(midiAccess: WebMidi.MIDIAccess) {
    let select = (<HTMLSelectElement>document.getElementById("dictate-using"));
    let opt = document.createElement("option");
    opt.selected = true;
    opt.disabled = true;
    opt.text = "Choose device";
    select.remove(0);
    select.add(opt);
    for (let [key, value] of midiAccess.outputs) {
        let opt = document.createElement("option");
        opt.value = key;
        opt.text = "" + value.name;
        select.add(opt);
    }
}

function populateAnswer(midiAccess: WebMidi.MIDIAccess) {
    let select = (<HTMLSelectElement>document.getElementById("answer-using"));
    let opt = document.createElement("option");
    opt.selected = true;
    opt.disabled = true;
    opt.text = "Choose device";
    select.remove(0);
    select.add(opt);
    for (let [key, value] of midiAccess.inputs) {
        let opt = document.createElement("option");
        opt.value = key;
        opt.text = "" + value.name;
        select.add(opt);
    }
}

function updatePrevNote(value : number) {
    prevNote = value;
    (<HTMLInputElement> document.getElementById("prev-note")).value = numberToNoteName(prevNote);
}

function numberToNoteName(pitch : number) : string {
    const KEYS: string[] = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
    const ordinal = pitch % 12;
    const name = KEYS[ordinal];
    const octave = Math.floor(pitch / 12)-1;
    return name + octave;
}

function generateNewCurNote() {
    updatePrevNote(curNote);
    const min = Math.max(lowerBound, curNote - randomSpan); // "ceil" between these two
    const max = Math.min(upperBound, curNote + randomSpan); // and "floor"
    curNote = getRandomIntInclusive(min, max);
    setTimeout(() => { playNoteFinite(curNote); }, 2000);
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
    updateMinLabel();
}
);
document.getElementById("max-number-input")?.addEventListener("input", 
function showCurrentValue(event) {
    const element = event?.target as HTMLInputElement;
    const value = element.value;
    const valueNum = parseInt(value);
    console.log(valueNum);
    upperBound = valueNum;
    updateMaxLabel();
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
function updateMinLabel() {
    (<HTMLElement>document.getElementById("min-number-input-name")).innerText = numberToNoteName(lowerBound);
}
function updateMaxLabel() {
    (<HTMLElement>document.getElementById("max-number-input-name")).innerText = numberToNoteName(upperBound);
}
