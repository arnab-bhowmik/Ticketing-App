import { CustomError } from "./custom-errors";

export class NotFoundError extends CustomError {
    statusCode = 404;

    constructor() {
        super('Route Not Found');

        //We are extending a built-in class
        Object.setPrototypeOf(this, NotFoundError.prototype); 
    }

    serializeErrors() {
        return [{ message: 'Not Found' }];
    }
}