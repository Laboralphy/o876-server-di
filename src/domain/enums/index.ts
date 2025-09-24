export enum Roles {
    NONE,
    USER,
    MODERATOR,
    GAME_MASTER,
    ADMIN,
}

export enum HttpStatus {
    OK = 200, // request successful
    CREATED = 201, // entity successfully created
    ACCEPTED = 202, // request accepted but process is async
    NO_CONTENT = 204, // operation successful ; no content returned
    MULTI_STATUS = 207, // partial response

    MOVED_PERMANENTLY = 301, // permanent redirection
    FOUND = 302, // temporary redirection
    SEE_OTHER = 303, // redirection with cache (GET method)
    NOT_MODIFIED = 304, // unmodified (used with ETag/If-None-Match)

    BAD_REQUEST = 400, // Invalid or missing parameters
    UNAUTHORIZED = 401, // No authentication information (anonymous user)
    FORBIDDEN = 403, // This user cannot access this resource
    NOT_FOUND = 404, // Resource not found
    METHOD_NOT_ALLOWED = 405, // Not allowed to use this method on this resource (ex: GET instead of POST)
    CONFLICT = 409, // ex: primary key duplication
    GONE = 410, // deleted or unavailable resource
    LENGTH_REQUIRED = 411, // missing content-length
    PRECONDITION_FAILED = 412, // failed if-match
    PAYLOAD_TOO_LARGE = 413, // self-explanatory.
    URI_TOO_LONG = 414, // self-explanatory.
    UNSUPPORTED_MEDIA_TYPE = 415, // unsupported media type
    RANGE_NOT_SATISFIABLE = 416, // trying to read a file part after end of file
    EXPECTATION_FAILED = 417, // request too long
    IM_A_TEAPOT = 418, // wrong type of device : ex: trying to get coffee from a teapot
    UNPROCESSABLE_ENTITY = 422, // invalid DTO (bad properties...)
    TOO_MANY_REQUESTS = 429, // too many request for a given duration

    INTERNAL_SERVER_ERROR = 500, // internal server error, uncatched errors
    NOT_IMPLEMENTED = 501, // end point not implemented
    BAD_GATEWAY = 502, // bad gateway
    SERVICE_UNAVAILABLE = 503, // server not listening
    GATEWAY_TIMEOUT = 504, // gateway timeout (thrown by network devices)
    HTTP_VERSION_NOT_SUPPORTED = 505, // http version not supported (thrown by http frameworks)
}
