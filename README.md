# ![artifacter-logo](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/src/rsz_artifacter-logo.png)@artifacter/core

### Artifacter's artifacts core generation service

#### What's this? - Intro
This is Artifacter's core module (previously known as @artifacter/worker), it makes use of the template engine to build all the artifacts required via a RESTful API or the Programmatic API. Artifacter provides any necessary details about its current configuration via the same RESTful and Programmatic APIs. On an artifact generation request, Artifacter will take its input and process it through its configuration, the outcome of this is a zip file, which is stored in a temporary folder until a get request is issued to retrieve this file.

#### How do I use this?
You can git clone this same repo and start it just like this
```bash
git clone https://github.com/arthmoeros/artifacter-core/
npm install
npm start
```

...or use it as a npm package, and start it using the provided bin
```bash
npm install --save @artifacter/core
node_modules/.bin/artifacter
```

In both cases, by default the config and temporary directories are within the core base folder, you can customize these paths using the environment variables *ARTIFACTER_CONFIG* and *ARTIFACTER_TMP*, here is a unix example:

```bash
# Default is ./config
export ARTIFACTER_CONFIG=/etc/artifacter_custom
# Default is ./tmp
export ARTIFACTER_TMP=/var/artifacter_custom
```

#### What's in here? - API
Artifacter is meant to be run as a server, although it can be accessed as a Programmatic API too, there are 4 services available in the API, via REST and Programmatic methods.

---------------------------------
##### Get Configurations list

###### Programmatic API
Class Name | Method
---------- | ------
Artifacter | #getConfigurations(): string[]

###### RESTful API
Resource | Method | Request ContentType   |    Response ContentType
-------- | ------ | --------------------- | -----------------------
/configurations | GET | application/x-www-form-urlencoded | application/json

Retrieves a list of presumably valid configurations ids on the configuration path of Artifacter. It returns a string array containing each configuration ID.

---------------------------------
##### Get Configuration

###### Programmatic API
Class Name | Method
---------- | ------
Artifacter | #getConfiguration(id: string): string

###### RESTful API
Resource | Method | Request ContentType   |    Response ContentType
-------- | ------ | --------------------- | -----------------------
/configurations/:id | GET | application/x-www-form-urlencoded | application/json

Retrieves the contents of a identified configuration file on Artifacter as a json string.

---------------------------------
##### Request Artifact Generation

###### Programmatic API
Class Name | Method
---------- | ------
Artifacter | #requestArtifactGeneration(request: {}): string

###### RESTful API
Resource | Method | Request ContentType   |    Response ContentType
-------- | ------ | --------------------- | -----------------------
/generatedArtifacts | POST | application/json | application/json

Requests an artifact generation and returns an uuid to retrieve the generated artifacts. The RESTful API responds with the location of the created resource (generated artifact) in the **Location** header.

---------------------------------
##### Retrieve generated artifacts

###### Programmatic API
Class Name | Method
---------- | ------
Artifacter | #getGeneratedArtifacts(uuid: string): Buffer

###### RESTful API
Resource | Method | Request ContentType   |    Response ContentType
-------- | ------ | --------------------- | -----------------------
/generatedArtifacts/:uuid | GET | application/x-www-form-urlencoded | application/zip

Retrieves a generated artifact, once is retrieved it is deleted from the temporary folder, any subsequent try to get the same artifact will result in a 404 status code.

---------------------------------
#### How do I make a Configuration? - Configuration "Schema"
Configurations in Artifacter are JSON files with expected properties to define how a client can request an artifact generation, this configuration will be explained using the sample configuration bundled with it.

##### Forms
The root of each Configuration is a forms array, each contains a name, description and input data required to be submitted.
A forms begins like this:

```js
{
    /* 
        A forms array, each one represent a possible input for a single generator and task,
        it is suggested that one group of forms = 1 generator.
    */
    "$forms": [ 
        {
            /*
                A display name and description for the Form
            */
            "$formName": "Sample Form 1",
            "$formDescription": "Blah blah blah...",
```

##### Request Schema
This is 'like' a Schema, and since there is no yet a single decent json schema parser in npm (and the standard is not finished), this one will do for now.
At its base has static data for internal referencing, such as its own configuration name, generation name and its underlying task name, these must be provided as is in each request that uses this structure, Artifacter expects this data to work.
The rest of the structure is what it should be expected when a request for artifact generation is submitted along with the before mentioned static data, except each last child in each hierarchy, which have a type definition and miscellaneous information, such as:

"Tag" | Meaning
----- | -------
@type | Describes the data/field type (string,number,date,array,choice)
@defaultValue | Default value provided by the configuration
@required | A flag that indicates that this value is required by its underlying templates
@options | Used by a 'choice' @type, must provide a string array for fixed options of this value
@item | Used by an 'array' @type, must provide a underlying element(s) with its own type and miscellaneous information

```js
            /*
                The main input object, the contents of this element must be used as a reference
                for an artifact generation request
            */
            "$requestSchema": {
                /* ***** Static Data Section ***** */
                /* Self reference to this processor file */
                "$configuration" : "sample-arch-osb-form",
                /* Identifier for the linked generator for artifact generation */
                "$generator" : "sample-arch-osb-gen",
                /* Underlying task in the generator, it is suggested that 1 input(form) = 1 task */
                "$task": "generate-sample-arch-osb",

                /* ***** Variable Data Section ***** */
                /*
                    Schema definition, the elements can be nested at whatever level necessary,
                    the last child elements must have a type and miscellaneous definition,
                    except when it is an array, which must have an item definition
                */
                "generalInfo": {
                    "additionalFolders": {
                        "@type": "boolean",
                        "@defaultValue": true,
                        "@required": true
                    }
                },
                "schemaInfo": {
                    "schemas": {
                        "@type": "array",
                        "@required": false,
                        "@item": {
                            "schemaName": {
                                "@type": "string",
                                "@required": true
                            }
                        }
                    }
                }
```

##### Input Display Data
Additional metadata for the input definition, inputDisplayData defines how can the data required be labeled and further supported, this information is essential for a better understanding of the data required by the form.

```js
            "$inputDisplayData": {
                "generalInfo": {
                    "label": "General Information"
                },
                "generalInfo.additionalFolders": {
                    "label": "Additional Folders",
                    "helptext": "Indicates whether or not to generate additional empty folders"
                },
                "generalInfo.bizDomain": {
                    "label": "Business Domain",
                    "helptext": "Service's business domain, default is \"General\""
                },
                "schemasInfo": {
                    "label": "Provide information about support schemas to include"
                },
                "schemasInfo.schemas": {
                    "label": "Schemas List"
                },
                "schemasInfo.schemas.schemaName": {
                    "label": "Schema Name",
                    "helptext": "The support schema name"
                }
```

##### Declared Post Processors
Declared post processors for the submitted values, these are run before any template processing, just after recieving the request.

Artifacter for now supports these:
- string.allLowerCase
- string.allUpperCase
- string.startWithUpperCase
- string.startWithLowerCase
- string.blanksToCamelCase

```js
            "$declaredPostProcessors": {
                "generalInfo.bizEntity": [
                    "string.allLowerCase",
                    "string.blanksToCamelCase",
                    "string.startWithUpperCase"
                ],
                "generalInfo.specificInfo.serviceName": [
                    "string.allLowerCase",
                    "string.blanksToCamelCase",
                    "string.startWithUpperCase"
                ],
                "generalInfo.specificInfo.serviceVersion": [
                    "string.allLowerCase"
                ]
            }
```

#### I saw something about a Generator? - Generator "Schema"
Just like the Configuration json files, there are Generator json files, these contains tasks that can be executed for a corresponding artifact generation.

Each task can contain a subset of instructions for the internal generator processor to read and execute, these instructions have their underlying properties and can be nested and represent for each task the outcome structure of the artifacts generated. Some properties uses the same template engine and input values for processing template'd values.

Instruction | Properties | Description
----------- | ---------- | -----------
rootContents | - | Array that describes the root point from where the outcome of the generation is output'd, is treated like a folder instruction
folder | - | Outputs a folder
\- | includeif | A mapped expression those result will be used as a boolean to determine if this element and its nested elements will be included in the generated artifacts
\- | targetName | A template name for the expected name of the folder
\- | contents | Nested instructions for more output elements
atmpl | - | Outputs a file using an atmpl template file
\- | includeif | A mapped expression those result will be used as a boolean to determine if this element will be included in the generated artifacts
\- | location | Path to look for the atmpl file, this is relative to the *ARTIFACTER_CONFIG*/config/atmpl/<generator-name> folder
\- | targetName | A template name for the expected name of the resulting artifact
\- | parameters | Passed parameters to the Template Processor, for use with Parameterized Expressions
static | - | Outputs a file in a static way, in other words, it just makes a copy of it
\- | includeif | A mapped expression those result will be used as a boolean to determine if this element will be included in the generated artifacts
\- | location | Path to look for the static file, this is relative to the ***ARTIFACTER_CONFIG*/config/atmpl/<generator-name>** folder
\- | targetName | A template name for the expected name of the resulting artifact
foreach | - | Instruction to iterate a contained element given a specific array, if you wish to iterate more than one object, use a folder instruction
\- | expression | A valid foreach expression, like *'item in items'*, within this instruction the 'item' value is available but must not override a existing property in the original request, otherwise it will throw an error
\- | <instruction> | A nested instruction (folder, atmpl or static), a nested foreach won't work, if you need to nest a foreach, use a folder and then a foreach
\- | includeif | A mapped expression those result will be used as a boolean to determine if this foreach will be processed

#### What's coming next? - Planned features for a future release
Not much, this is a second version and I already covered pretty everything I wanted to achieve, it is still lacking a configuration validation check and maybe some queued generation with some queue framework, if you have any other suggestion I would gladly hear you out, along with a use case.
