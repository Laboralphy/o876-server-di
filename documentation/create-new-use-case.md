# How to create a new use case

## Definition

Use cases are classes that do one only thing, fulfilling a single user's need.

Examples:

- Creating a user.
- Logging a user in.
- Getting a list of items.

## Structure

Each use case is a class providing a method called `execute`.
This method may accept parameters, however if complex parameters are needed, like providing properties for an entity,
you should create a dedicated DTO.

Because of the adopted `Dependency Injection` pattern, use case classes must accept a cradle parameters in their 
constructor.

```typescript
export class UseCaseName {
    private readonly someRepository: ISomeRepository;
    private readonly someService: ISomeService;

    constructor(cradle: Cradle) {
        this.someRepository = cradle.userRepository;
        this.someService = cradle.someService;
    }
    
    async execute(someParameters: any) {
        /* ... */
    }
}
```

## Location

Use cases are located in `src/application/use-cases`

