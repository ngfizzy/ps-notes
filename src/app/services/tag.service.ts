
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {map, catchError} from 'rxjs/operators';


import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';


import { apiBaseUrl } from '../../env';
import { Tag} from '../models';
import { PlainTagsResponse, TagsResponse } from '../models/server-responses/tags-response.interface';

@Injectable()
export class TagService {
    constructor(private http: HttpClient) { }

    /**
     * Get all notes belonging to a user
     *
     * @returns {Observable<string[]| string>} observable of tags or error message
     */
    getAll(): any {
        return this.http.get(`${apiBaseUrl}/tags`,{observe: 'response'}).pipe(
            map((response: HttpResponse<any>) => response.body.notes),
            catchError(this.handleError.bind(this)),);
    }

    /**
     * It adds a tag to a user's note
     *
     * @param {string} tag
     * @param {number} noteId Id of the note i want to send
     *
     * @return {Observable<Tag[] | {} | string} Observable of Array of Tags, empty object or error message
     */
    tagNote(tag: string, noteId: number): Observable<Tag[] |{}| string> {
        const url = `${apiBaseUrl}/notes/tags/${noteId}`;
        return this.http
            .put<TagsResponse>(url, { tag }, {observe: 'response'}).pipe(
            map((response: HttpResponse<TagsResponse>) => {
               return  response.body.tags;
            }),
            catchError(this.handleError.bind(this)),);
    }

    /**
     * It removes a tag from a note
     *
     * @param noteId Id of the note to be deleted
     * @param tagId  Id of the tag to be deleted
     *
     * @return {Observable<any>}
     */
    removeTagFromNote(noteId: number, tagId: number): Observable<any> {
        return this.http.delete(`${apiBaseUrl}/notes/${noteId}/tags/${tagId}`).pipe(
            map((response: any) => response.tags),
            catchError(this.handleError.bind(this)),);
    }

    /**
     * Fetch tags of a note belonging to current
     * user
     *
     * @param {number} noteId Id of note to fetch
     *
     * @returns {Observable<string[]|string} tags or error message
     */
    fetchNoteTags(noteId: number):
     Observable<Tag[] | {}  | string> {
        const url = `${apiBaseUrl}/notes/tags/${noteId}`;

        return this.http.get<TagsResponse>(url, {observe: 'response'}).pipe(
            map((response: HttpResponse<TagsResponse>) =>
                response.body.tags),
            catchError(this.handleError.bind(this)),);
    }

    private handleError(response: HttpResponse<any>): Observable<string> {

        switch (response.status) {
            case 404:
                return this.handleNotFoundError(response);
            default:
                return this.handleServerError();
        }
    }

    private handleNotFoundError(response: HttpResponse<any>): Observable<string> {
        const contentType = response.headers
            .get('content-type')
            .toLocaleLowerCase();

        if (contentType !== 'application\\json') {
            return observableThrowError('Not Found');
        }

        return observableThrowError(response.body.message);
    }

    /**
     * It finds a tag by it's name from an array of tags
     *
     * @param {Tag[]} tags an array of tags to search from
     * @param {string} tagToFind tag name to find
     *
     * @return {Tag}
     */
    findTagByName(tags: Tag[], tagToFind: string): Tag {
        return tags.find(tag => tag.name.trim() === tagToFind.trim());
    }

    /**
     * Search for tags that matches a particular name
     *
     * @param {string} tag the tag you're searching for
     *
     * @returns {Observable<string | string[]>} an array of tags belonging to
     * the current user or an error message
     */
    search(tag: string): Observable<Tag[] | string> {
        const url = `${apiBaseUrl}/tags/search?query=${tag}`;

        return this.http.get<TagsResponse>(url, { observe: 'response'}).pipe(
            map((response: HttpResponse<TagsResponse>) => response.body.tags as Tag[]),
            catchError(this.handleError),);
    }

    /**
     * @returns {Observable<string>}
     */
    private handleServerError(): Observable<string> {
        return observableThrowError('an error occurred while trying to carry out his operation');
    }
}
