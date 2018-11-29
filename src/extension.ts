'use strict';
import * as vscode from 'vscode';

class MockCommentsProvider implements vscode.DocumentCommentProvider {
    private _onDidChangeCommentThreads: vscode.EventEmitter<vscode.CommentThreadChangedEvent> = new vscode.EventEmitter<vscode.CommentThreadChangedEvent>();
    public onDidChangeCommentThreads: vscode.Event<vscode.CommentThreadChangedEvent> = this._onDidChangeCommentThreads.event;

    get startDraftLabel(): string {
        return 'Start a review';
    }
    get deleteDraftLabel(): string {
        return 'Dismiss your review';
    }
    get finishDraftLabel(): string {
        return 'Submit your review';
    }

    private _inDraft: boolean = false;
    private _comments: vscode.Comment[];
    private _commentThread: vscode.CommentThread;

    constructor() {
        this._comments = [
            {
                body: new vscode.MarkdownString('My first comment'),
                userName: 'rebornix',
                commentId: '1',
                isDraft: this._inDraft,
            }
        ];
    }

    async provideDocumentComments(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CommentInfo> {
        this._commentThread = {
            collapsibleState: vscode.CommentThreadCollapsibleState.Collapsed,
            comments: this._comments,
            range: new vscode.Range(0, 0, 0, 1),
            resource: document.uri,
            threadId: 'mock'
        };

        let result: vscode.CommentInfo = {
            threads: [ this._commentThread ],
            commentingRanges: [new vscode.Range(0, 0, document.lineCount - 1, 0)],
            inDraftMode: this._inDraft
        };

        return result;
    }

    createNewCommentThread(document: vscode.TextDocument, range: vscode.Range, text: string, token: vscode.CancellationToken): Promise<vscode.CommentThread> {
        throw new Error("Method not implemented.");
    }

    editComment(document: vscode.TextDocument, comment: vscode.Comment, text: string, token: vscode.CancellationToken): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deleteComment(document: vscode.TextDocument, comment: vscode.Comment, token: vscode.CancellationToken): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async replyToCommentThread(document: vscode.TextDocument, range: vscode.Range, commentThread: vscode.CommentThread, text: string, token: vscode.CancellationToken): Promise<vscode.CommentThread> {
        let newComment: vscode.Comment = {
            body: new vscode.MarkdownString(text),
            userName: 'rebornix',
            commentId: `${this._comments.length + 1}`,
            isDraft: this._inDraft,
        };

        this._comments.push(newComment);
        commentThread.comments.push(newComment);

        return commentThread;
    }

    async startDraft(token: vscode.CancellationToken): Promise<void> {
        this._inDraft = true;
        this._onDidChangeCommentThreads.fire({
            added: [],
            removed: [],
            changed: [],
            inDraftMode: this._inDraft
        });
    }

    async deleteDraft(token: vscode.CancellationToken): Promise<void> {
        let comments = this._comments.filter(comment => !comment.isDraft);
        this._comments = comments;
        this._commentThread.comments = comments;
        this._inDraft = false;
        this._onDidChangeCommentThreads.fire({
            added: [],
            removed: [],
            changed: [
                this._commentThread
            ],
            inDraftMode: this._inDraft
        })
    }

    async finishDraft(token: vscode.CancellationToken): Promise<void> {
        this._inDraft = false;
        this._comments.forEach(comment => comment.isDraft = false);

        this._onDidChangeCommentThreads.fire({
            added: [],
            removed: [],
            changed: [
                this._commentThread
            ],
            inDraftMode: this._inDraft
        })
    }

}
export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.registerDocumentCommentProvider(new MockCommentsProvider());
}

// this method is called when your extension is deactivated
export function deactivate() {
}