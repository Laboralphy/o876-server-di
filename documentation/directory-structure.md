# Directory structure

```
src/
├── application/       
│   ├── features       # Use Cases 
│   ├── integrations   # Interfaces for externals
│   └── interfaces     # Interfaces for business logic and repositories
├── domain/            # Domain entities and interfaces
│   ├── value-objects  # Value objects
│   └── entities       # Entities
├── infrastructure/    # Implementations
│   ├── persistance    # Database
│   └── services       # Services
├── container.ts       # Awilix configuration
├── server.ts          # Application entry point
└── tsconfig.json      # TypeScript Configuration
```