import { ValidationError } from "express-validator";
import { CustomError } from "./custom-errors";

export class RequestValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super('Invalid Request Parameters');

        //We are extending a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype); 
    }
    
    serializeErrors() {
        const formattedError = this.errors.map((error) => {
            return { message: error.msg };
            // if (error.type === 'field') {
            //   return { message: error.msg, field: error.path };
            // }
        });
        return formattedError;
    }
}