/**
 * An error whose message is safe to show to the person who triggered it
 * ("You are signed out", "Invalid id"). Every other error (database, network, bugs)
 * is logged on the server and replaced by a generic message, so SQL text, table names
 * or stack details never reach the browser.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}
