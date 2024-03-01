import { EmptyFileSystem, URI } from 'langium';
import { startLanguageServer } from 'langium/lsp';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createHelloWorldServices } from './hello-world-module.js';

declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared } = createHelloWorldServices({ connection, ...EmptyFileSystem });

const documentBuilder = shared.workspace.DocumentBuilder
const documents = shared.workspace.TextDocuments
const mutex = shared.workspace.WorkspaceLock

async function onDidClose(uri: URI) {
  await mutex.write(token => documentBuilder.update([], [uri], token))
}

documents.onDidClose(async event => {
  await onDidClose(URI.parse(event.document.uri))
})

startLanguageServer(shared);

