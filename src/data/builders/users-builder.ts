import CONFIG from '@config/configManager';
import type { User } from '@data/models/users';
import { faker } from '@faker-js/faker';

// This builder demonstrates various mechanisms that can be used by the builder pattern to create data required by tests.
export class UserBuilder implements User {
  // Default values - These could be randomly generated (e.g. using the faker library) or hardcoded strings.
  username: string = faker.internet.userName();
  password: string = faker.internet.password();

  // You could set individual values in the builder - this provides granular control
  setUsername(username: string): UserBuilder {
    this.username = username;
    return this;
  }

  setPassword(password: string): UserBuilder {
    this.password = password;
    return this;
  }

  // You could set multiple values at once to encapsulate related data - this lets you operate on the data you're building at a higher-level
  setUser(user: User): UserBuilder {
    this.username = user.username;
    this.password = user.password;
    return this;
  }

  // You could set multiple values without parameters - this avoids having to repeat code using the same arguments, but may be less viable if there are many combinations of arguments (e.g lots of user types)
  setLockedOutUser(): UserBuilder {
    this.username = CONFIG.ui.swagLabs.testUsers.lockedOutUser.username;
    this.password = CONFIG.ui.swagLabs.testUsers.lockedOutUser.password;
    return this;
  }

  // Returns an instance of the User object
  build(): User {
    return this;
  }
}
