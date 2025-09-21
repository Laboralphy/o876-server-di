import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/InMemory/UserRepository';
import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';

// Container creation
const container = createContainer();

// Registering dependencies
container.register({
    // repositories
    userRepository: asClass(UserRepository).scoped(),
    // services
    encryptor: asClass(Encryptor).scoped(),
    uidGenerator: asClass(UIDGenerator).scoped(),
});

export default container;
