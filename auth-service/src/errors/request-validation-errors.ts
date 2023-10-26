import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
    constructor(public errors: ValidationError[]) {
        super();

        //We are extending a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype); 
    }
}