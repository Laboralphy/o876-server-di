import { SuccessFailureOutcome } from '../../domain/types/SuccessFailureOutcome';

export type Outcome = SuccessFailureOutcome & Record<string, any>;

/**
 * This interface will be implemented in message processor that can read several messages
 * and update a complexe state and finally deliver an outcome
 * (an extension of SuccessFailureOutcome with additionnal propoerties)
 */
export interface IControllerMessageProcessor<T extends Outcome> {
    /**
     * Process a message and returns an outcome which is an extension of SuccessFailure
     * @param message
     */
    processMessage(message: string): Promise<T>;
}
