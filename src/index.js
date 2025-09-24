let localStorageLocation = "notes";

var SelectedNote = null;

class NotesManager {

  static notesManager;
  root;
  noteMap;
  n = 0;

  constructor() {
    this.root = new Note({
      noteId: 0,
      title: "",
      body: "",
      children: []
    });

    this.noteMap = {}
    this.noteMap[this.n++] = this.root;
  }

  static getInstance() {
    if (!this.notesManager) {
      this.notesManager = new NotesManager();
    }

    return this.notesManager;
  }

  addChildNoteTo(id, title, body) {

    let note = new Note({
      noteId: this.n,
      title: title,
      body: body,
      children: []
    });

    this.noteMap[id]?.addChildNote(note);
    this.noteMap[this.n++] = note;
  }

  serialize() {
    let serialized = JSON.stringify(this.root.serialize());
    localStorage.setItem(localStorageLocation, serialized);
    return serialized;
  }

  // deserialize the json string to form the notes hierarchy from it.
  deserialize(inputData) {
    this.root = this.root.deserialize(inputData, this.noteMap) ?? this.root;
    return this.root;
  }

  getNote(id) {
    if (!id || !this.noteMap[id]) return;
    return this.noteMap[id];
  }

  getHTMLChildren() {
    return this.root.getHTMLChildren();
  }
}

class Note {

  noteId
  title
  body
  children // Child Notes

  constructor({
    noteId,
    title,
    body,
    children
  }) {

    this.noteId = noteId;
    this.title = title;
    this.body = body;
    this.children = children;
  }

  updateHeading(newHeading) {
    this.title = newHeading;
  }

  updateBody(newBody) {
    this.body = newBody;
  }

  addChildNote(note) {
    if (!note) return false;

    this.children.push(note);
    return true;
  }

  deleteChildNote(childId) {

    let length = this.children.length;

    this.children = this.children.filter((note) => {

      if (childId == note.noteId) {
        console.log("Class Note -> deleteChildNote: found and remove the child note " + note.title.slice(0, 10));
        return false;
      }

      return true;
    })

    if (length != this.children.length) {
      return true;
    }

    return false;
  }

  serialize() {

    if (!this.children.length) {
      return {
        noteId: String(this.noteId),
        title: this.title,
        body: this.body,
        children: JSON.stringify([])
      };
    }

    let children = this.children.map((currNote) => {
      return JSON.stringify(currNote.serialize());
    })

    return {
      noteId: String(this.noteId),
      title: this.title,
      body: this.body,
      children: JSON.stringify(children)
    };
  }

  deserialize(noteString, noteMap) {

    if (!noteMap || !noteString) {
      return null;
    }

    let note = JSON.parse(noteString);

    if (note.children.length === 0) {
      return null;
    }

    note.children = JSON.parse(note.children).map((c) => this.deserialize(c, noteMap)).filter((n) => n != null);

    noteMap[note.noteId] = new Note(note);
    return noteMap[note.noteId];
  }

  getHTMLChildren() {
    return this.children.map((ch) => {
      return `
      <div class="note-item" id="${ch.noteId}">
        <div class="note-item-header">
          <div onclick="expandContractChildren(${ch.noteId}, ${this.noteId})" class="expand-toggle"> > </div>
          <h3 class="note-item-title" onclick="selectNote(${ch.noteId})">${ch.title}</h3>
        </div>
        <div id='${ch.noteId}-children'></div>
      </div>`;
    }).join("");
  }
}

// setup
let nm = NotesManager.getInstance();

if (localStorage.getItem(localStorageLocation) != null) {
  nm.deserialize(localStorage.getItem(localStorageLocation));
} else {

  // dummy data
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      nm.addChildNoteTo(i, "note " + j, "test body");
      // for (let k = 0; k < 5; k++) {
      //   nm.addChildNoteTo(j, "note " + k, "test body");
      // }
    }
  }

  console.log("[MESSSGE] notes serialized");
  nm.serialize();
}

const testElement = document.getElementById("0-children");
if (testElement !== null) {
  testElement.innerHTML = nm.getHTMLChildren();
}

function hi() {
  console.log("hi");
}

function expandContractChildren(noteId) {

  if (nm.noteMap[noteId] == null) {
    return null;
  }

  let id = `${noteId}-children`;

  let innerHtml = document.getElementById(id).innerHTML;

  // toggle functionality.
  if (!innerHtml) {
    let html = nm.noteMap[noteId].getHTMLChildren();
    document.getElementById(id).innerHTML = html;
  } else {
    document.getElementById(id).innerHTML = "";
  }
}

function selectNote(id) {

  if (!id) return;

  let note = nm.getNote(id);

  let titleElement = document.getElementById("selectedNoteTitle");
  let bodyElement = document.getElementById("selectedNoteBody");

  if (titleElement && bodyElement) {
    titleElement.innerText = note.title;
    bodyElement.innerText = note.body;

    SelectedNote = note;

    document.getElementById("save-button").style = ""
  }
}

function saveNotes() {
  nm.serialize();
}

// update SelectedNote values on changes made to div
const selectedNoteBody = document.getElementById("selectedNoteBody");
const selectedNoteTitle = document.getElementById("selectedNoteTitle");

selectedNoteBody.addEventListener("blur", () => {
  SelectedNote.body = selectedNoteBody.innerText;
});

selectedNoteTitle.addEventListener("blur", () => {
  SelectedNote.title = selectedNoteTitle.innerText;
});
