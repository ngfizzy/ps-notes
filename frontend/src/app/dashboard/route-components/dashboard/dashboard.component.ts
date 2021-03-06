import { Component, OnInit } from '@angular/core';
import md5 from 'md5';

import { UserService } from '../../../services/user.service';
import { Note, Tag, User } from '../../../models';
import { NoteService } from '../../../services/note.service';
import { AlertService } from '../../../services/alert.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ida-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isEditorOpen = false;
  isEditorCreating = true;
  searchTerms = '';
  // email needs to be hashed for gravatar
  profilePictureUrl: string;
  pageContentDescription = '';
  note: Note = {
    title: '',
    content: ''
  };
  notes: Array<any>;
  isUserOptionsVisible = false;
  noNotes = false;
  isGridView = true;
  isLargeDevice: boolean;
  filteredNotes:  Note[];

  constructor(private userService: UserService,
    private noteService: NoteService,
    private alert: AlertService) {}


  filterByTag(tag: Tag) {
    if(tag) {
      this.noteService.findNotesByTag(tag.id)
        .pipe(take(1))
        .subscribe((notes) => {
          this.filteredNotes = notes as Note[];
        });
    } else {
      this.filteredNotes = null;
    }
  }


  setIsLargeDevice() {
    this.isLargeDevice = window.innerWidth >= 992;
  }

  /**
   * Checks if notes ar-e already loaded in memory
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.setIsLargeDevice()
    this.fetchNotes();
    this.setPageContentDescription();
    this.currentUser = this.userService.getCurrentUserFromLocalStorage();
    const hashedEmail = this.currentUser ? this
      .hashUserEmail(this.currentUser.email) : '';
    this.profilePictureUrl = `https://gravatar.com/avatar/${hashedEmail}`;
  }

  /**
   * This method sets page header to search terms
   *
   * @returns {void}
   */
  setPageContentDescription(): void {
    if (!this.searchTerms) {
      this.pageContentDescription = 'all your notes';
    } else {
      this.pageContentDescription =
        `all notes that best match your search terms: ${this.searchTerms}`;
    }
  }

  toggleView(isGrid: boolean) {
    this.isGridView = isGrid;
  }

  /**
   * Fetches all notes using user service
   *
   * @returns {void}
   */
  fetchNotes(): void {
    this.notes = this.noteService.getFetchedNotes();

    if (!this.notes.length) {
      this.noteService.fetchNotes()
        .subscribe({
          next: (notes) => this.renderNotes(notes),
          error: () => this.handleNotesFetchingError(),
        });
    }
  }

  /**
   * Renders notes
   *
   * @param {object[]} notes an array of notes
   *
   * @returns {void}
   */
  renderNotes(notes: any): void {
    this.noNotes = this.notes.length > 0 ? true : false;
    this.notes = notes;
  }

  handleNotesFetchingError() {
    this.noNotes = this.notes.length > 0 ? true : false;
    const errorMessage =
      `It might be that you have not created any note.
    if you have, please reload your page`;
    this.alert.open(errorMessage);
  }

  /**
   * Shows users options whenever you hover over user icon
   *
   * @returns {void}
   */
  showUserOptions(): void {
    this.isUserOptionsVisible = true;
  }

  /**
   * Hides options whenever you hover over the user data
   *
   * @returns {void}
   */
  hideUserOptions(): void {
    this.isUserOptionsVisible = false;
  }

  /**
   * It logs user out
   *
   * @returns {void}
   */
  logout(): void {
    const labels =       {
      alert: 'You are about to logout. Are you sure?',
      confirm: 'Logout',
      dismiss: 'Stay'
    };

    const actions = {
      afterConfirm: () => {
        this.userService.logout();
      },
      afterClose:() => {}
    }

    this.alert.openConfirm(
      labels,
      actions
    );
  }

  /**
   * It opens note editor by setting the isEditingOption variable to true
   *
   * @returns {void}
   */
  addNewNote(): void {
    this.isEditorOpen = true;
    this.note = {} as Note;
    this.isEditorCreating = true;
  }

  handleTagsUpdate(event) {
    this.note.tags = event;
  }

  /**
   * It opens the note editor
   *
   * @param note
   */
  editNote(note: Note) {
    this.isEditorOpen = true;
    this.note = note;
    this.isEditorCreating = false;
  }

  /**
   * Closes note editor by setting the closeNoteEditor to false
   *
   * @returns {void}
   */
  closeNoteEditor(): void {
    this.isEditorOpen = false;
  }

  /**
   * Searches for notes by their titles.
   *
   * @returns {void}
   */
  searchNotes() {
    this.setPageContentDescription();
    this.noteService.searchNotesByTitle(this.searchTerms)
      .subscribe(
        (notes) => {
          this.noNotes = false;
          this.notes = notes;
        },
        () => {
          this.noNotes = true;
          this.notes = [];
        }
      );
  }

  showProfile() {
    const profile = this.collateUserInfo(this.currentUser);
    this.alert.open(profile, 'Close');
  }

  /**
   * Hash user email. This is necessary for getting user profil picture via gravatar
   *
   * @param email
   *
   * @returns {string} get user email
   */
  public hashUserEmail(email: string): string {
    return md5(email);
  }

  private collateUserInfo(user: User): string {
    const { firstname, lastname, username, email } = user;

    return `
      Firstname: ${firstname} <br />
      Lastname:  ${lastname} <br />
      Username:  ${username} <br />
      Email:     ${email} <br />
    `;
  }
}
