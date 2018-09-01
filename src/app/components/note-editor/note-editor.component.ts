import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Subject } from 'rxjs/Rx';
import { fromEvent } from 'rxjs/observable/fromEvent';

import { Note } from '../../models';
import { NoteService } from '../../services/note.service';
import { TagService } from '../../services/tag.service';


@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css'],
})
export class NoteEditorComponent implements OnChanges {

  @Input() isClose = true;
  @Input() note: Note;
  @Input() isEditing;
  @Output() close = new EventEmitter<null>();
  @Output() updateTags = new EventEmitter<any[]>();

  @ViewChild('tagInput', { read: ElementRef }) tagInput: ElementRef;

  error: boolean;
  status = 'saved';
  isTagInputOpen = false;
  tag = ''; // new tag to add
  tags = [];
  foundTags: string[] = []; // results while/ searching for tags
  tagActionText = '+';
  tagSearchListener: Subscription;
  constructor(private noteService: NoteService,
    private tagService: TagService) { }

  ngOnChanges() {
    const body = document.querySelector('body');

    if (!this.isClose) {
      body.style.overflowY = 'hidden';
    } else {
      body.style.overflowY = 'scroll';
    }
  }

  /**
   * It submits a note using the note service
   *
   * @returns {Subscription}
   */
  submitNote(): Subscription {
    if (this.isEditing) {
      return this.submitEditedNote();
    } else {
      return this.createNewNote();
    }
  }

  /**
   * Creates a new note
   *
   * @returns {Subscription}
   */
  createNewNote(): Subscription {
    return this.noteService.createNote(this.note)
      .subscribe(
        (noteId) => {
          this.note.id = noteId;
          this.isEditing = true;
          this.updateNoteSavedStatus();
        },
        this.updateNoteErrorStatus.bind(this)
      );
  }

  /**
   * It opens and closes tag input box
   *
   * @return {void}
   */
  toggleTagInput(): void {
    if (this.tagSearchListener) {
      this.tagSearchListener.unsubscribe();
    }

    this.isTagInputOpen = !this.isTagInputOpen;
  }

  /**
   * It adds a tag to a note
   *
   * @return {Subscription}
   */
  addTag(): Subscription {
    this.tagInput
      .nativeElement
      .setSelectionRange(0, this.tag.length);

    if (!this.isEditing) {
      return this.createNewNote()
        .add(this.tagNote.bind(this));
    }

    return this.tagNote();
  }

  /**
   * Tag list uses this to opimize tags
   * rendering when rendering using "trackBy"
   *
   * @param index Tag's Index
   * @param tag tags index
   */
  trackTagsById(index, tag): string {
    return tag ? tag.id : null;
  }

  /**
   * It adds a tag to a note
   *
   * @returns {Subscription}
   */
  private tagNote(): Subscription {
    return this.tagService
      .tagNote(this.tag, this.note.id)
      .subscribe(
        (tags: any[]) => {
          if (tags && tags.length > this.note.tags.length) {

            this.note.tags = tags;
          }
        },
        this.updateNoteErrorStatus.bind(this)
      );
  }

  /**
   * When tag input receives focus,
   * this method registers registers the
   * input a keyup event listener.
   *
   * @param {FocusEvent} event FocusEvent
   *
   * @returns {void}
   */
  createTagSearchListener(event: FocusEvent) {
    event.preventDefault();

     this.tagSearchListener =  fromEvent(this.tagInput.nativeElement, 'keyup')
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe(
          (evt: KeyboardEvent) => this.performTagSearch(evt, this.tag)
        );
  }

  /**
   * It searches for tags similar to the tag
   * provided
   *
   * @param {KeyboardEvent} event Keyboard Event
   * @param {string} tag The tag to search
   *
   * @return {Subscription}
   */
  private performTagSearch(event: KeyboardEvent, tag): Subscription {
    if (event.key !== 'Enter') {
      return this.tagService.search(this.tag)
        .subscribe(
          (found) => {
            this.foundTags = found;
          },
          () => {
            this.foundTags = [];
          },
        );
    }
  }

  /**
   * Submit edited note.
   *
   * @returns {Subscription}
   */
  submitEditedNote(): Subscription {
    return this.noteService.editNote(this.note)
      .subscribe(
        this.updateNoteSavedStatus.bind(this),
        this.updateNoteErrorStatus.bind(this)
      );
  }

  /**
   * Updates status when note is saved
   *
   * @return {void}
   */
  updateNoteSavedStatus(): void {
    this.status = 'saved';
    this.error = false;
  }

  /**
   * Updates status when an error occurs
   *
   * @param {string} message Error message
   */
  updateNoteErrorStatus(message = 'an error occurred'): void {
    this.status = message;
    this.error = true;
  }

  /**
   * Emits custom angular close event which is used to update
   * the state of the editor stored in dashboard component.
   *
   * @param {Event} event angular events
   *
   * @returns {void}
   */
  cancel(event): void {
    const { className } = event.target;
    if (className === 'wrapper' || className === 'cancel') {
      this.close.emit();
    }
  }
}
