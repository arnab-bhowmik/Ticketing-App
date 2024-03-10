import { useState } from "react";
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const updateTicket = () => {
    const { id , title: initialTitle, price: initialPrice } = Router.query;
    const [title, setTitle] = useState(initialTitle);
    const [price, setPrice] = useState(initialPrice);
    const { doRequest, errors } = useRequest();

    // onSubmit function invokes the doRequest() method
    const onSubmit = (event) => {
        event.preventDefault();
        doRequest({ 
            url: `/api/tickets/${id}`,
            method: 'put',
            body: { title, price },
            onSuccess: () => Router.push('/'),
            props: {}
          });
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
            <h1>Update Ticket Details</h1>
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
                <button className="btn btn-primary">Update</button>
            </form>
        </div>
    );
};

export default updateTicket;