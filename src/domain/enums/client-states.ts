export enum CLIENT_STATES {
    NONE, // not connected
    LOGIN_PROMPT_USERNAME, // waiting for username or "new"
    LOGIN_PROMPT_PASSWORD, // client has entered a username, waiting for password
    CREATE_ACCOUNT_PROMPT_USERNAME, // client has entered "new" as username : this is the new user creation phase
    CREATE_ACCOUNT_PROMPT_PASSWORD, // client is required to enter a password
    CREATE_ACCOUNT_PROMPT_EMAIL, // client is asked to enter a valid email address
    CREATE_ACCOUNT_PROMPT_DISPLAYNAME, // client is asked to enter a display name
    AUTHENTICATED, // client has successfully authenticated
    IN_GAME, // the client is currently playing the game
    CHANGE_PASSWORD_PROMPT, // user has requested to change password
    PAUSE, // client is temporary in pause ignoring any message
}
