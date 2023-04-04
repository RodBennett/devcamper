// parent Error class is core module of Node.js
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode
    }
}

module.exports = ErrorResponse;