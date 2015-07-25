(function () {
    /**
     * Creates a new ErrorResponder primed with an Error object.
     *
     * This ErrorResponder's error code and status code are set in the constructor
     * based on the existence of an errorCode attached to the Error object. If errorCodes
     * are not attached to the Error object, fallbacks are used but can be overwritten
     * using this ErrorResponder's .setErrorCode() and .setStatus() functions.
     *
     * @param error
     * @constructor
     */
    var ErrorResponder = function (error) {
        this.error = error || new Error('Unknown error');
        this.errorCode = this.error[ErrorResponder._config.errorCodeKey] || ErrorResponder._config.fallbackErrorCode;
        this.status = ErrorResponder._config.codeStatusMap[this.errorCode] || ErrorResponder._config.fallbackStatus;
        this._buildPayload();
    };

    /**
     * Builds the response payload from current data
     *
     * @private
     */
    ErrorResponder.prototype._buildPayload = function () {
        this.payload = {
            error: {
                code: this.errorCode,
                message: this.error.message,
                stack: ErrorResponder._config.stackEnvironments.hasOwnProperty(process.env.NODE_ENV) ? this.error.stack : undefined
            }
        };
    };

    /**
     * Causes this ErrorResponder to perform the response.
     *
     * @param res The Express response object that this error is for.
     * @returns {ErrorResponder}
     */
    ErrorResponder.prototype.send = function (res) {
        res.status(this.status).json(this.payload);
        return this;
    };

    /**
     * Sets the error code for this ErrorResponder. Setting the error code also causes the status code
     * to update since the error code infers the status code.
     *
     * @param errorCode
     * @returns {ErrorResponder}
     */
    ErrorResponder.prototype.setErrorCode = function (errorCode) {
        this.errorCode = errorCode;
        this.status = ErrorResponder._config.codeStatusMap[this.errorCode] || ErrorResponder._config.fallbackStatus;
        this._buildPayload();
        return this;
    };

    /**
     * Sets the status code for this ErrorResponder. The error code will remain unchaged because the status
     * code does not infer the error code.
     *
     * @param statusCode
     * @returns {ErrorResponder}
     */
    ErrorResponder.prototype.setStatus = function (statusCode) {
        this.status = statusCode;
        return this;
    };

    /**
     * Get the errorCode
     *
     * @returns {errorCode|string}
     */
    ErrorResponder.prototype.getErrorCode = function () {
        return this.errorCode;
    };

    /**
     * Get the status code
     *
     * @returns {status|number}
     */
    ErrorResponder.prototype.getStatus = function () {
        return this.status;
    };

    /**
     * Get the current payload of this ErrorResponder that would be sent in a response
     *
     * @returns {{error: {code: (*|string), message: string, stack: *}}|*}
     */
    ErrorResponder.prototype.getPayload = function () {
        return this.payload;
    };

    /**
     * The default configs for all instances of ErrorResponder
     *
     * @type {{codeStatusMap: {UNKNOWN_ERROR: number}, stackEnvironments: {development: boolean}, errorCodeKey: string, fallbackStatus: number}}
     * @private
     */
    ErrorResponder._config = {
        codeStatusMap: {
            UNKNOWN_ERROR: 500
        },
        errorCodeKey: 'code',
        fallbackErrorCode: 'UNKNOWN_ERROR',
        fallbackStatus: 500,
        stackEnvironments: {
            development: true
        }
    };

    /**
     * Allow for overriding default configs.
     *
     * @param config Configs to override
     */
    ErrorResponder.config = function (config) {
        for (key in config) {
            ErrorResponder._config[key] = config[key];
        }
    };

    /**
     * Factory to create a new ErrorResponder. Just a convenience really to avoid using new in code.
     *
     * @param error
     * @returns {ErrorResponder}
     */
    ErrorResponder.build = function (error) {
        return new ErrorResponder(error);
    };

    module.exports = ErrorResponder;

}).call(this);
