
class NotesManager {

  static notesManager;
  root;
  noteMap;
  n = 0;

  constructor() {
    this.root = new Note({
      noteId: 0,
      title: "", 
      body : "", 
      children : []
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
    return JSON.stringify(this.root.serialize());
  }

  // deserialize the json string to form the notes hierarchy from it.
  deserialize(inputData) {
    this.root = this.root.deserialize(inputData, this.noteMap) ?? this.root;
    return this.root;
  }

}

class Note {

  noteId;
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

}

const testElement = document.getElementById("test");
if (testElement !== null) {
  setTimeout(() => {
    testElement.innerText = "this is a test update from typescript.";
  }, 1000)
}

let nm = NotesManager.getInstance();

for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    nm.addChildNoteTo(i, "note " + j, "test body");
  }
}

let st = nm.serialize();

console.log(nm.deserialize(st));