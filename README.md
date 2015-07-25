Create a standardized error-response through your apis very easily. The ErrorResponder formats the error response body, assigns the appropriate status code based on the error code, and sends the response.
```javascript
// STATUS: 400 (bad request)
{
  "error" : {
    "code": "MISSING_REQUIRED_PARAMETER",
    "message": "Missing required parameter: name"
  }
}
```

## Installation
```javascript
$ npm install error-responder --save
```

## Quickstart
```javascript
// Load the module
var ErrorResponder = require('error-responder');

// Add your errorCode-to-statusCode mappings (just do this once when the app loads)
ErrorResponder.config({
  codeStatusMap: {
    SOME_ERROR_CODE: 400,
    ANOTHER_ERROR_CODE: 400,
    123: 403,
    456: 404
    UNAUTHORIZED: 401,
    BAD_THINGS_HAPPENED: 500
  }
});

// Use the ErrorResponder to respond with an error
app.get('/api/me', function (req, res) {
  var error = new Error('You need to be logged in to do that');
  error.code = "UNAUTHORIZED";
  ErrorResponder.build(error).send(res);
  
  // -->
  // STATUS 401
  // {
  //   "error" : {
  //     "code": "UNAUTHORIZED",
  //     "message": "You need to be logged in to do that"
  //   }
  // }
});
```
The above example responded with a `401` status because we mapped `UNAUTHORIZED` to it in the `codeStatusMap` in the configs.

## Advanced Usage

### Configs

This is where you make ErrorResponder your own.

  - **codeStatusMap:** (Deafault: {UNKNOWN_ERROR: 500}) The most important (and required really) part is determining all the error codes for your application. Each error code naturally maps to an HTTP status in the response.
  - **errorKeyCode:** (Default: 'code') When calling `ErrorResponder.build(error)` the ErrorReponder will look for `error.code` (assuming default) to draw the error code. Overrride this deault if you fear that this will cause a collision.
  - **fallbackErrorCode:** (Default: 'UNKOWN_ERROR') If the Error object passed in to `.build()` does not have an error code property as specified by the above config, ErrorResponder will fall back to this as the error code.
  - **fallbackStatus:** (Default: 500) If the `codeStatusMap` does not have a mapping for the error code (or there is no error code on the Error object), then this will be the fallback status returned from the call.
  - **stackEnvironments:** (Default: {development: true}) For convenience, ErrorReponder will attach the Error's stack trace in addition to the returned `code` and `message` properties if a key in the `stackEnvironments` object matches `process.env.NODE_ENV`. This will be added as the `stack` property. *Note: this is an object instead of an array for performance reasons. The property keys are the only things that matter - not the value. So even {development: false} will still be seen as a match for including the stack trace.*
 
##### Example overriding all defaults:
```javascript
ErrorResponder.config({
  codeStatusMap: {
    SOME_ERROR_CODE: 400,
    ANOTHER_ERROR_CODE: 400
    // ...
  },
  errorKeyCode: 'myOwnKeyForTheErrorCode',
  fallbackErrorCode: 'NO_ERROR_CODE_FOUND',
  fallbackStatus: 501,
  stackEnvironments: {
    'development': true,
    'qa': true
  }
});
```

### API

We will skip the `config` api here since it was covered above. The following are all functions that can be chained to `ErrorResponder.build(error)`

  - **.setErrorCode('SOME_ERROR_CODE'):** This will cause the ErrorResponder to update its error code with the value given. A side effect of this is that the status will also be updated to match the newly updated error code.
  - **.setStatus(403):** This will update the ErrorResponder's status that is will use when sending the json response.
  - **.send(res):** Executes a response using the ErrorResponder's current state (error code, status code, etc.)

You can also use ErrorResponder as the object is is to get data from it:
```javascript
var error = new Error('Oh no!');
error.code = 20;
var er = ErrorResponder.build(error);
var code = er.getErrorCode();  // --> 20
var status = er.getStatus();   // --> 400
var payload = er.getPayload(); // --> {error: {code: 20, message: 'Oh no!}}
```

### Missing error codes on Error objects

The best idea (IMHO) is to attach error code directly to the Error objects. This makes the error code portable with the error itself. When an error occurs deep within your application, it is at that point that the reason for the error is known and an appropriate errorCode can be attached. Now when that error is propogate to the reponse, everything is in place for the ErrorResponder to proovide great error messages.

But if for some reason Errors will not be carrying error codes, ErrorResponder will use the fallbacks as described in the Configs section or you can force your own error/status codes as described in the API section.
