
export class DatabaseConnectionError extends Error {
    reason = "Error connecting to Database";
    constructor() {
        super();

        //We are extending a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype); 
    }
}