import { IClientContext } from '../classes/IClientContext';

export interface IApiContextBuilder {
    buildApiContext(): IClientContext;
}
