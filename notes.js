// window.onload = function() {
var output = document.getElementById("output");
var input = document.getElementById("input");

document.getElementById("input").addEventListener("input", convert);

function convert() {

    var notes = input.value.split(" "); // array
    if(notes[notes.length-1] === "") notes.pop();

    output.value = "][2] = {\n";

    // console.log(notes);

    var validNotes = [];

    for(var i = 0; i < notes.length; i++) {
        var note = notes[i];

        if(note.length > 1 && note.length < 5)  {
            var midi = 0;
            var length = 1;

            if(note[0] === ".") { // rest
                midi = 0;
                length = note[1];
            } else { // actual note
                midi = noteToMidi(note.slice(0, -1)); // everything but the last character

                length = note[note.length-1]; // last character
            }

            if(midi !== false && !isNaN(midi)) { // valid note
                validNotes.push([note.slice(0, -1).toUpperCase(), length]);
                output.value += "\t{" + midi + ", " + length + "}";
                if(i !== notes.length - 1) output.value += ",";
                if(midi) { // is a note
                    output.value += " // " + note.slice(0, -1).toUpperCase();
                } else { // is a rest
                    output.value += " // rest " + length;
                }
            } else { // invalid note
                output.value += "\t// \"" + note + "\" ???";
            }

            if(i !== notes.length - 1) output.value += "\n";
        }
    }
    output.value = "int notes[" + validNotes.length + output.value + "\n};";

    updateStaff(validNotes);
}

function noteToMidi(note) { // e.g. b5# -> 61
    var midi = 12*note[1];
    note = note.toUpperCase();

    if(note[0] === "D") {
        midi += 2;
    } else if(note[0] === "E") {
        midi += 4;
    } else if(note[0] === "F") {
        midi += 5;
    } else if(note[0] === "G") {
        midi += 7;
    } else if(note[0] === "A") {
        midi += 9;
    } else if(note[0] === "B") {
        midi += 11;
    } else {
        if(note[0] !== "C") return false;
    }

    if(note.length === 3) {
        if(note[2] === "#") {
            midi++;
        } else if(note[2] === "B") { // because the whole note is capitalized
            midi--;
        } else {
            return false;
        }
    }

    return midi;
}



var canvas = document.getElementById("piano");
var ctx = canvas.getContext("2d");

var mouse = {
	x: null,
	y: null
};

var pressed = {
    x: null,
    y: null
};

canvas.addEventListener("mousemove", function(event) {
	mouse.x = event.layerX;
	mouse.y = event.layerY;
}, false);

canvas.addEventListener("click", function() {
	pressed.x = mouse.x;
	pressed.y = mouse.y;
}, false);

var keyWidth = 44;
var keyHeight = 140;

var blackKeyWidth = 24;
var blackKeyHeight = 90;

var keysPerRow = 14;

var noteNames = ["C", "D", "E", "F", "G", "A", "B"];

ctx.strokeStyle = "#999";

function update() {
    for(var r = 0; r < 3; r++) {
        var startY = r*(keyHeight+20);

        for(var i = 0; i < keysPerRow; i++) {
            ctx.fillStyle = "#fff";

            var octave = (2*r+1);
            if(i > 6) octave++;
            var name = noteNames[i % noteNames.length] + octave;

            if(name === "C4") ctx.fillStyle = "#ccc";

            if(
                mouse.x > i*keyWidth + i - 1 &&
                mouse.x < (i + 1)*keyWidth + i - 1 &&
                mouse.y > startY &&
                mouse.y < startY + keyHeight
            ) ctx.fillStyle = "#81f782";

            if(
                pressed.x > i*keyWidth + i - 1 &&
                pressed.x < (i + 1)*keyWidth + i - 1 &&
                pressed.y > startY &&
                pressed.y < startY + keyHeight
            ) {
                pressed.x = null;
                pressed.y = null;
                if(input.value[input.value.length-1] !== " " && input.value) input.value += " ";
                input.value += name + "2";
                convert();
            }

            ctx.fillRect(i*keyWidth + i - 1, startY, keyWidth, keyHeight);

            ctx.beginPath();
            ctx.moveTo(i*keyWidth + i - 1, startY);
            ctx.lineTo(i*keyWidth + i - 1, startY+keyHeight);
            ctx.stroke();

            ctx.fillStyle = "#000";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(name, i*keyWidth + i - 1 + keyWidth/2, startY + keyHeight - 15);

        }


        for(var j = 0; j < keysPerRow; j++) {
            if(j !== 2 && j !== 6 && j !== 9 && j !== 13) {
                var startX = (j+1)*keyWidth + j - blackKeyWidth/2;

                ctx.fillStyle = "#000";

                if(
                    mouse.x > startX &&
                    mouse.x < startX + blackKeyWidth &&
                    mouse.y > startY &&
                    mouse.y < startY + blackKeyHeight
                ) ctx.fillStyle = "#278828";

                if(
                    pressed.x > startX &&
                    pressed.x < startX + blackKeyWidth &&
                    pressed.y > startY &&
                    pressed.y < startY + blackKeyHeight
                ) {
                    pressed.x = null;
                    pressed.y = null;

                    var whiteOctave = (2*r+1);
                    if(j > 6) whiteOctave++;
                    var whiteKeyName = noteNames[j % noteNames.length] + whiteOctave;

                    if(input.value[input.value.length-1] !== " " && input.value) input.value += " ";
                    input.value += whiteKeyName + "#2";
                    convert();
                }

                ctx.fillRect(startX, startY, blackKeyWidth, blackKeyHeight);
            }
        }
    }

    window.requestAnimationFrame(update);
}
update();

var staffCanvas = document.getElementById("staff");
var ctx2 = staffCanvas.getContext("2d");

function drawLines() {
    ctx2.lineWidth = 2;
    for(var s = 1; s < canvas.width/16; s++) {
        ctx2.strokeStyle = "#ccc";
        if(s > 2 && s < 8) ctx2.strokeStyle = "#444";

        ctx2.beginPath();
        ctx2.moveTo(0, 16*s);
        ctx2.lineTo(staffCanvas.width, 16*s);
        ctx2.stroke();
    }
}

drawLines();

function updateStaff(notes) {
    console.table(notes);
    ctx2.clearRect(0, 0, staffCanvas.width, staffCanvas.height);

    drawLines();

    ctx2.fillStyle = "#000";
    ctx2.strokeStyle = "#000";
    ctx2.lineWidth = 2;

    var startX = 10;

    for(var n = 0; n < notes.length; n++) {
        var note = notes[n][0];
        var noteN = noteNames.indexOf(note[0]);
        var noteM = (note[1]-4)*64+(note[1]-4)*-8;
        var startY = (staffCanvas.height-23)-(noteN*8)-noteM; // midi

        startX += 30;

        if(note[2] === "#") {
            ctx2.beginPath();
            ctx2.moveTo(startX-8, startY-8);
            ctx2.lineTo(startX-8, startY+9);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.moveTo(startX-2, startY-8);
            ctx2.lineTo(startX-2, startY+9);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.moveTo(startX-12, startY-2);
            ctx2.lineTo(startX+1, startY-4);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.moveTo(startX-12, startY+5);
            ctx2.lineTo(startX+1, startY+3);
            ctx2.stroke();

            startX += 10;
        } else if(note[2] === "B") {

            ctx2.beginPath();
            ctx2.moveTo(startX-8, startY-13);
            ctx2.lineTo(startX-8, startY+5);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.moveTo(startX-8, startY+5);
            ctx2.lineTo(startX-3, startY);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.arc(startX-5.5, startY-2.5, 3, Math.PI*5/4, Math.PI/4, false);
            ctx2.stroke();

            startX += 10;
        }

        ctx2.beginPath();
        ctx2.arc(startX, startY+1, 7, Math.PI*2, false);
        ctx2.fill();

        ctx2.beginPath();
        ctx2.moveTo(startX+6, startY);
        ctx2.lineTo(startX+6, startY-35);
        ctx2.stroke();

        if(+notes[n][1] === 1 || +notes[n][1] === 2 || +notes[n][1] === 3) { // 0.25 or 0.5 or 0.75 beats
            ctx2.beginPath();
            ctx2.moveTo(startX+6, startY-35);
            ctx2.lineTo(startX+11, startY-30);
            ctx2.stroke();

            ctx2.beginPath();
            ctx2.moveTo(startX+11, startY-30);
            ctx2.lineTo(startX+16, startY-35);
            ctx2.stroke();
            if(+notes[n][1] === 1) { // 0.25 beats
                ctx2.beginPath();
                ctx2.moveTo(startX+6, startY-28);
                ctx2.lineTo(startX+11, startY-23);
                ctx2.stroke();

                ctx2.beginPath();
                ctx2.moveTo(startX+11, startY-23);
                ctx2.lineTo(startX+16, startY-28);
                ctx2.stroke();
            }
        } if(+notes[n][1] === 3 || +notes[n][1] === 6) { // 0.75 or 1.5 beats
            ctx2.beginPath();
            ctx2.arc(startX+12, startY+3, 2, Math.PI*2, false);
            ctx2.fill();
        } else if(+notes[n][1] === 8) { // 2 beats
            ctx2.beginPath();
            ctx2.arc(startX, startY+1, 5, Math.PI*2, false);
            ctx2.fillStyle = "#fff";
            ctx2.fill();
            ctx2.fillStyle = "#000";
        }

    }
}
// };
