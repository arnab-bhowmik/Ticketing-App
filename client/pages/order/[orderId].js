import { useEffect, useState } from "react";
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const showOrder = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    // doRequest function invokes the useRequest() method which in turn calls the backend route
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: { orderId: order.id  },                   // The body also contains the token param which is incorporated by doRequest() function under the hood
        onSuccess: (payment) => Router.push('/orders')
    });

    useEffect(() => {
        // Function findTimeLeft() when invoked will update the time remaining until Order expiry via setTimeLeft()
        const findTimeLeft = () => {
            const timeLeftInMs = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(timeLeftInMs/1000));
        };
        
        // Function findTimeLeft() will get invoked every second, i.e. every 1000 ms
        findTimeLeft();                     // First invocation is done manually
        const timerId = setInterval(findTimeLeft, 1000);

        // On User navigating away from this Component/Page, the invocation of findTimeLeft() will end
        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) {
        return <div><h2>Order Expired</h2></div>
    }
    
    return (
        <div>
          <h1>Order Id: {order.id}</h1>
          <h4>Time left to pay: {timeLeft} seconds </h4>
          <StripeCheckout 
            // The doRequest() function is being invoked using the token as an additional property so that it will be used within the body while making a request to the backend route
            token={({ id }) => doRequest({ token: id })}
            stripeKey="pk_test_51OklBxSGpgG0gu7SuyWdBvpPt7eAapz48l7q5IE5Tu52kYhs6Fd8zMwTOZAKnse3yFUYd1TyCvylc71wcClww83B00dBLiGYYY"
            amount={order.ticket.price * 100}
            email={currentUser.email}
          />
          {errors}
        </div>
    );
};

showOrder.getInitialProps = async (context, client) => {
    // context.query returns the wildcard part of the route to be invoked i.e. orderId
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data }; 
};

export default showOrder;