# CHANGELOG

## v1.2.4
- Add subscribe 'safeMode' parameter and use seconds for delay parameters

## v1.2.3
- Update Release Instructions

## v1.2.2
- Update Subscripte logging

## v1.2.1
- Publish via actions.
- More logging for subscribe.

## v1.2.0
- Add a subscribe command for performing actions on a databases' changes feed

## v1.1.0
- Add `restore-deleted-doc` command.


## v1.0.2
- In `pre-warm-views`, prevent out of memory errors in script by requesting zero rows when indexing views
- In `pre-warm-views`, reduce number of requests to CouchDB when it is still indexing by sleeping for 5 seconds when a request times out. 

## v1.0.1
- Make pre-warm-views less prone to crashing CouchDB by indexing one view at a time.
- Upgrade axios to 0.21.1.


