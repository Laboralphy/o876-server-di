/**
 * A simple type with two properties
 * success
 * failure
 * Usefull for processes that returns an outcome that can be success, failure, or none (ongoing)
 */
export type SuccessFailureOutcome = { success: boolean; failure: boolean };
