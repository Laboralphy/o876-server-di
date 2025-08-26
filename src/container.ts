import { createContainer, asClass } from 'awilix';
import { UserRepository } from './infrastructure/persistance/InMemory/UserRepository';
// import { UserRepository } from './infrastructure/repositories/UserRepository';
// import { UserService } from './application/services/UserService';
// import { UserController } from './interfaces/controllers/UserController';

// Container creation
const container = createContainer();

// Registering dependencies
container.register({
    userRepository: asClass(UserRepository).scoped(),
});

export default container;
