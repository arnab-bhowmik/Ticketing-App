import { CustomError } from "./custom-errors";

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = "Error connecting to Database";

    constructor() {
        super('Error connecting to DB');

        //We are extending a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype); 
    }

    serializeErrors() {
        return [{ message: this.reason }];
    }
}