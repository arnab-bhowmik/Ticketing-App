import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super();

        //We are extending a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype); 
    }

    serializeErrors() {
        const formattedErrors = this.errors.map((error) => {
            if (error.type === 'field') {
              return { message: error.msg, field: error.path };
            }
        });
        return formattedErrors;
    }
}