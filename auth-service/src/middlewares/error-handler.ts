import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/request-validation-errors';
import { DatabaseConnectionError } from '../errors/database-connection-errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    
    // === Old Code ===
    // if (err instanceof RequestValidationError) {
    //     console.log('Handling this error as Request Validation Error!');
    // }

    // if (err instanceof DatabaseConnectionError) {
    //     console.log('Handling this error as DB Connection Error!');
    // }

    // res.status(400).send({
    //     message: err.message
    // });

    // === Updated Code ===
    if (err instanceof RequestValidationError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }

    if (err instanceof DatabaseConnectionError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }

    res.status(400).send({ errors: [{ message: 'Unhandled Error!' }] });

};