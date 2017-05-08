# ![artifacter-logo](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/src/rsz_artifacter-logo.png)@artifacter/worker

### Artifacter's artifacts generation service

#### What's this? - Intro
This is Artifacter's worker module, it makes use of the template engine to build all the artifacts required by the UI via a REST service, of course this service can be consumed by other users, but must be aware of its configuration available (maybe in the future another REST service will provide this). The worker will take its input and process it through its configuration, this could be several atmpl files, folders and static files, all of this is packaged into a zip file and returned into the same REST service response (there are plans of making an asynchronous version of this service, where the artifacts generation may be queued and sent via email as a attached zip).

#### What's in here? - API
The worker is meant to be run as a server, via **npm start**, the only API available for now is the REST service.

##### [POST] /artifactGenerationRequest

Request ContentType   |    Response ContentType
----- | -----
application/json | application/zip

Sends an artifact generation request, the data provided must match the worker's own configuration. Responds synchronously with a zip file containing the generated artifacts

#### What's wrong here? - Known Issues
This worker has a great flaw, because it has a tight coupling with @artifacter/ui when it comes down to the configuration and the values map that must be sent to the worker, I'm still thinking how to loose this coupling and make the worker more cohesive.

#### What's coming next? - Planned features for a future release
A lot, I want to implement asynchronous generation requests using any queue provider, also I want to improve its tightened coupling with @artifacter/ui, maybe implementing methods for querying the configuration state of the worker, but as I mentioned before, I still have to put some thought into that.
