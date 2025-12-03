# Adding a new Service in Client Api Context

## Steps

1) Create a new class in `src/infrastructure/services/context-services`.
2) Declare a new entry in `src/application/ports/classes/IClientContextServices`.
3) Declare this class as scoped class in `boot/container`
4) Declare scoped instanciation in `src/infrastructure/services/ApiContextBuilder.ts`

## Detailled steps

Let's see with an exemple : MailContextService.

### Create a new class in `src/infrastructure/services/context-services`.

Create `src/infrastructure/services/context-services/MailContextService.ts`.
This class should extend `AbstractContextService` if you want acces to some useful basic I/O communication methods.

```typescript
import { User } from '../../../domain/entities/User';
import { SendMail } from '../../../application/use-cases/mail/SendMail';
import { CheckMailInbox, CheckMailInboxEntry } from '../../../application/use-cases/mail/CheckMailInbox';
import { ScopedCradle } from '../ApiContextBuilder';
import { AbstractContextService } from './AbstractContextService';

export class MailContextService extends AbstractContextService {
    private readonly sendMail: SendMail;
    private readonly checkMailInbox: CheckMailInbox;

    constructor(cradle: ScopedCradle) {
        super(cradle);
        this.sendMail = cradle.sendMail;
        this.checkMailInbox = cradle.checkMailInbox;
    }

    /**
     * Sends a message to all specified users
     * @param recipients list of recipient users
     * @param topic topic of the message
     * @param message content of the message
     */
    async sendMessage(recipients: User[], topic: string, message: string): Promise<void> {
        const user = this.user;
        return this.sendMail.execute(
            user.id,
            recipients.map((user) => user.id),
            topic,
            message
        );
    }

    /**
     * Checks context user inbox
     */
    async checkInbox(): Promise<CheckMailInboxEntry[]> {
        const user = this.user;
        return this.checkMailInbox.execute(user.id);
    }

    /**
     * Reads a specific message.
     * @param tag message tag
     */
    async readMessage(tag: number) {
        // ...
    }
    
    // ... other methods
}
```


### Declare a new entry in `src/application/ports/classes/IClientContextServices`.

Open the file and adds your service like this :

```typescript
import { MailContextService } from '../../../infrastructure/services/context-services/MailContextService';

export type IClientContextServices = {
    // ... other services
    mail: MailContextService;
    // ... other services
};
```

In this example we have decided to call our service : `mail`. It will be exposed as this identifier.

### Declare this class as scoped class in `boot/container`

Open `src/boot/container.ts`.

In the last part of the file, extend Cradle type :

```typescript
import { createContainer, asClass, asValue } from 'awilix';
// ... all previous imports
import { MailContextService } from '../infrastructure/services/context-services/MailContextService';

export interface Cradle {

    // ... Previous entries
    // ... Previous entries
    // ... Previous entries
    
    mailContextService: MailContextService; // <-- out new mail service class

}
```
... and add a new Registration entry, note that the class must be __scoped__ :

```typescript
// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({

    // ... Previous registered entries
    // ... Previous registered entries
    // ... Previous registered entries

    mailContextService: asClass(MailContextService).scoped(), // <-- our new mail service
});

```

### Declare scoped instanciation in `src/infrastructure/services/ApiContextBuilder.ts`

```typescript
const cmdContext: IClientContext = {

    // ... other declaration
    // ... other declaration
    // ... other declaration
    
    /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
    /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
    /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/

    // ... other context services
    // ... other context services

    mail: scope.resolve('mailContextService'), // <-- our new mail service
};

```
