export enum CLIENT_STATES {
    NONE, // not connected
    LOGIN,
    CREATE_ACCOUNT,
    TEXT_EDITOR,
    AUTHENTICATED, // client has successfully authenticated
    IN_GAME, // the client is currently playing the game
    CHANGE_PASSWORD, // user has requested to change password
    PAUSE, // client is temporary in pause ignoring any message
    LOGOUT, // client is loging out
}
