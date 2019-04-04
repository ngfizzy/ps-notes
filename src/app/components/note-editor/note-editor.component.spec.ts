import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { NoteEditorComponent } from './note-editor.component';
import { NoteService } from '../../services/note.service';
import { TagService } from '../../services/tag.service';
import { Note, Tag } from '../../models';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NoteEditorComponent', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NoteEditorComponent,
      ],
      providers: [
        NoteService,
        TagService,
        {provide: APP_BASE_HREF, useValue: '/'},
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NoteEditorComponent);
  }));

  it('should have a title', () => {
    const title = fixture.debugElement
      .query(By.css('.title'))
      .nativeElement;

    expect(title).toBeTruthy();
  });

  it('should have a body', async(() => {
    const body = fixture.debugElement.query(By.css('.content'))
      .nativeElement;

    expect(body).toBeTruthy();
  }));

  it('can save a note', async(() => {
    const noteEditor = fixture.debugElement;
    const componentInstance = fixture.componentInstance;
    const saveButton = noteEditor.query(By.css('button.submit'));
    const noteService: NoteService = TestBed.get(NoteService);
    const createNote = spyOn(noteService, 'createNote').
      and.callFake((note: Note) => of(1));
    componentInstance.note = {
      title: 'the title',
      content: 'the body'
    };
    fixture.detectChanges();

    saveButton.nativeElement.click();
    fixture.detectChanges();

    expect(componentInstance.note.id).toEqual(1);
  }));

  it('should have a close button', async(() => {
    const noteEditorDebugElement = fixture.debugElement;
    const componentInstance = fixture.componentInstance;
    const closeButtton: HTMLButtonElement = noteEditorDebugElement
      .query(By.css('.cancel')).nativeElement;
    componentInstance.isEditing = true;
    componentInstance.note = {} as Note;
    fixture.detectChanges();

    closeButtton.click();
    fixture.detectChanges();

    expect(componentInstance.isEditing).toBe(false);
  }));

  it('should have a tag button that opens an input box', async(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.note = { tags: [] } as Note;
    fixture.detectChanges();
    const closeButton: HTMLButtonElement = fixture.debugElement
      .query(By.css('button.add-tag'))
      .nativeElement;

      closeButton.click();
      fixture.detectChanges();
      const tagInputBox = fixture.debugElement.query(By.css('input[name="tag"]'));

    expect(tagInputBox).toBeTruthy();
  }));

  it('should have a tag button that closes tag input when clicked twice', async(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.note = { tags: []} as Note;
    fixture.detectChanges();
    const debugElement = fixture.debugElement;
    const tagButton: HTMLButtonElement = debugElement.query(By.css('button.add-tag')).nativeElement;

    tagButton.click();
    tagButton.click();
    fixture.detectChanges();
    const tagInputBox = fixture.debugElement.query(By.css('input[name="tag"]'));

    expect(tagInputBox).toBeFalsy();
  }));

  // test failed. to be fixed later
  xit('can add a tag to note', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    const tagService: TagService = fixture.componentRef.injector.get(TagService);
    const tagNote = spyOn(tagService, 'tagNote')
      .and
      .callFake(() => of([{name: 'tag'}]));

    componentInstance.note = { tags: []} as Note;
    componentInstance.isTagInputOpen = true;
    fixture.detectChanges();
    const tagInput = fixture.debugElement
      .query(By.css('[name="tag"]'));

    tagInput.nativeElement.value = 'tag 1';
    fixture.detectChanges();

        fixture.debugElement
          .query(By.css('.tag-form'))
          .triggerEventHandler('submit', null);
          tick();
          fixture.detectChanges();
        expect(tagNote).toHaveBeenCalled();
  }));

  it('can delete tag', async(() => {
    const tagService: TagService = TestBed.get(TagService);
    spyOn(tagService, 'removeTagFromNote').and.returnValue(of([]));
    const tagsContainer = fixture.debugElement.query(By.css('.tags-container'));
    const componentInstance = fixture.componentInstance;
    componentInstance.note = { tags: [
        {name: 'tag 1', id: 1},
        {name: 'tag 2', id: 2}
      ]} as Note;
    fixture.detectChanges();
    const tags: NodeList = tagsContainer.nativeElement.querySelectorAll('.tag');
    let tagToDelete: HTMLElement;
    tags.forEach(tag => {
      if (tag.textContent.indexOf('tag 1') >= 0 ) {
        tagToDelete = tag as HTMLElement;
      }
    });

    (tagToDelete.querySelector('.delete') as HTMLElement).click();

    expect(tagService.removeTagFromNote).toHaveBeenCalledTimes(1);
  }));

  it('can edit an existing note ', async(() => {
      const noteService: NoteService = TestBed.get(NoteService);
      spyOn(noteService, 'editNote').and.returnValue(of({}));
      const componentInstance = fixture.componentInstance;
      const note: Note = {
        title: 'the title',
        content: 'the content',
        id: 1
      };
      componentInstance.note = note;
      componentInstance.isEditing = true;
      fixture.detectChanges();

      fixture.debugElement.query(By.css('form.note-form')).triggerEventHandler('submit', null);
      fixture.detectChanges();

      expect(noteService.editNote).toHaveBeenCalled();
  }));
});
