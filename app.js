const activeNotes = [];
let combo = 0;

window.addEventListener("keydown", e => {
    const key = document.getElementById(e.key);
    if (key) {
        key.classList.add("pressed");
        judge(e.key);
    }
});

window.addEventListener("keyup", e => {
    const key = document.getElementById(e.key);
    if (key) key.classList.remove("pressed")
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("notes.json")
        .then(response => response.json())
        .then(notes => {
            notes.forEach(note => {
                scheduleNote(note);
            });
        });
});

function scheduleNote(note) {
    const appearTime = note.time * 1000; // 초 → 밀리초

    setTimeout(() => {
        spawnNote(note.key);
    }, appearTime);
}

function spawnNote(key) {
    const chart = document.querySelector(".chart");
    const keyDiv = document.getElementById(key.toLowerCase());

    if (!keyDiv) return;

    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");

    const keyRect = keyDiv.getBoundingClientRect();
    const chartRect = chart.getBoundingClientRect();
    const offsetLeft = keyRect.left;

    noteDiv.style.left = `${offsetLeft}px`;

    chart.appendChild(noteDiv);

    animateNote(noteDiv);

    activeNotes.push({ key: key.toLowerCase(), element: noteDiv, judged: false });
}

function animateNote(noteDiv) {
    noteDiv.classList.add("falling");

    noteDiv.addEventListener("animationend", () => {
        showJudgment(`Miss`);
        noteDiv.remove();
    });
}

function judge(key) {
    const line = document.querySelector(".line");
    const lineRect = line.getBoundingClientRect();
    const lineY = lineRect.top;

    // 해당 key와 일치하고 아직 판정되지 않은 노트 중에서
    const candidates = activeNotes.filter(note =>
        note.key === key.toLowerCase() && !note.judged
    );

    if (candidates.length === 0) return;

    let bestNote = null;
    let bestDiff = Infinity;

    for (const note of candidates) {
        const noteRect = note.element.getBoundingClientRect();
        const noteY = noteRect.top;
        const diff = Math.abs(noteY - lineY);

        if (diff < bestDiff) {
            bestDiff = diff;
            bestNote = note;
        }
    }

    if (bestNote) {
        let result = "";
        if (bestDiff <= 40) {
            result = `Perfect`;
            showJudgment(result);
            bestNote.judged = true;
            bestNote.element.remove();
        } else if (bestDiff <= 80) {
            result = `Good`;
            showJudgment(result);
            bestNote.judged = true;
            bestNote.element.remove();
        } else if (bestDiff <= 200) {
            result = `Miss`;
            showJudgment(result);
            bestNote.judged = true;
            bestNote.element.remove();
        }

        // 필요 시 activeNotes 배열에서 제거
    }
}

function showJudgment(text) {
    const game = document.querySelector(".game");

    const div = document.createElement("div");
    div.textContent = text;
    div.className = "judgment-text";

    game.appendChild(div);

    setTimeout(() => {
        div.style.opacity = 0;
        setTimeout(() => div.remove(), 500);
    }, 300);
}
