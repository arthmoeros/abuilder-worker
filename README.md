# ![artifacter-logo](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/src/rsz_artifacter-logo.png)@artifacter/worker

### Artifacter's artifacts generation service

#### What's this? - Intro
This is Artifacter's worker module, it makes use of the template engine to build all the artifacts required by the UI via a REST service, of course this service can be consumed by other users, but must be aware of its configuration available (a future major version of this module will provide this through another REST service). Worker will take its input and process it through its configuration, this could be several atmpl files, folders and static files, all of this is packaged into a zip file and stored in wait until a get request is issued to retrieve this file.

#### What's in here? - API
The worker is meant to be run as a server, via **npm start**, there are 2 REST services available in the API.

##### [POST] /artifactGenerationRequest

Request ContentType   |    Response ContentType
----- | -----
application/json | application/zip

Sends an artifact generation request, the data provided must match the worker's own configuration. Responds synchronously with an UUID for the zip file retrieval.

##### [GET] /generatedArtifacts

Request ContentType   |    Response ContentType
----- | -----
application/x-www-form-urlencoded | application/zip

Given an UUID, it will fetch a generated artifacts zip file that matches with it, once it is retrieved, the stored file will be deleted on the server and any subsequent calls to this service with the same uuid will return a 410 code, if something that is not a UUID is sent a 403 code will be returned.

#### What's wrong here? - Known Issues
Currently this module has a design flaw, because it has a tight coupling with @artifacter/ui module when it comes down to the configuration and the values map that must be sent to the worker, a major release will fix this flaw by making Worker the master of this configuration and providing a REST API for it.

#### What's coming next? - Planned features for a future release
A lot, I want to implement asynchronous generation requests using any queue provider, also I want to improve its tightened coupling with @artifacter/ui.

#### How do I run this?
Just do a *npm start*, which will start the server.
