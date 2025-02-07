#!/usr/bin/env node
var program = require('commander')
const version = require('./package.json').version

program
  .version(version)
  .command('replicate-all-dbs', 'replicate all databases from one couchdb to another')
  .command('delete-all-dbs', 'delete all databases on a couchdb')
  .command('pre-warm-views', 'Hit all views in a couchdb to pre-warm them')
  .command('restore-deleted-doc', 'Undelete a doc')
  .command('pull-json', 'Pull documents from a View in CouchDB returning just an array of the documents, not additional metadata that CouchDB usually does.')
  .command('push-json', 'Push an array of documents to a CouchDB database. Accepts STDIN over a pipe.')
  .command('doc-history', 'Revs with docs attached')
  .command('subscribe', 'Subscribe to the changes feed of a database and act on it.')
  .parse(process.argv);
