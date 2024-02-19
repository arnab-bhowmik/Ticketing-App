import axios from 'axios';
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    // doRequest method to take an optional props value and append it to the body of the axios request
    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });
            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (error) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oops...</h4>
                    <ul className="my-0">
                        {error.response.data.errors.map(err => <li key={err.message}>{err.message}</li>)}
                    </ul>
                </div>
            );
        }
    };

    return { doRequest, errors };
};