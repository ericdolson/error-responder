Create a standardized error-responsed through your apis very easily. The ErrorResponder formats the error response body, assigns the appropriate status code based on the error code, and sends the response.
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
