# Add a new server configuration variable

1. Add variable, default value, and documentation in `./server-config.yaml`
2. Go to `src/domain/types/ServerConfig.ts` and modify zod type to add the new variable.
3. Go to `src/infrastructure/services/ServerConfig.ts` and add a new property in the config object in the constructor.
4. You may user serverConfig.getVariable().xxxx to use your new variable.