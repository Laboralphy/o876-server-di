export enum CLIENT_STATES {
    NONE, // not connected
    LOGIN,
    CREATE_ACCOUNT,
    AUTHENTICATED, // client has successfully authenticated
    IN_GAME, // the client is currently playing the game
    CHANGE_PASSWORD_PROMPT, // user has requested to change password
    PAUSE, // client is temporary in pause ignoring any message
}
