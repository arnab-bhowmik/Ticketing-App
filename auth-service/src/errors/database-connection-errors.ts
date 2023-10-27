
export class DatabaseConnectionError extends Error {
    statusCode = 500;
    reason = "Error connecting to Database";

    constructor() {
        super();

        //We are extending a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype); 
    }

    serializeErrors() {
        return [{ message: this.reason }];
    }
}