import { useState } from "react";
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const createTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');

    // doRequest function invokes the useRequest() method which in turn calls the backend route
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: { title, price },
        onSuccess: () => Router.push('/')
    });

    // onSubmit function invokes the doRequest() method
    const onSubmit = (event) => {
        event.preventDefault();
        doRequest();
    };

    // onBlur function converts a number to decimal value until 2 places after the decimal point
    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    };

    return (
        <div>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input value={price} onBlur={onBlur} onChange={(e) => setPrice(e.target.value)} className="form-control" />
                </div>
                {errors}
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default createTicket;