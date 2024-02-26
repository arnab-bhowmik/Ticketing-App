import { useEffect, useState } from "react";
// import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const showOrder = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    // useEffect() function lets us calculate the remaining time for Order Expiration
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
    // Mark the Order as expired if the set time period for Order expiration completes 
    if (timeLeft < 0) {
        Router.push('/order');
    }

    // doRequest function invokes the useRequest() method which in turn calls the backend route
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: { orderId: order.id },                    // The body also contains the params razorpayOrderId & razorpayPaymentId which is incorporated by doRequest() function under the hood
        onSuccess: (payment) => Router.push('/order')
    });

    // Initialize the Razorpay Checkout Form and append it to the document.body as a child element
    const initializeRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => { resolve(true); };
            script.onerror = () => { resolve(false); };
            document.body.appendChild(script);
        });
    };
    // Function to get invoked on user clicking the 'Pay with Razorpay' button
    const createRazorpayCheckout = async () => {
        const res = await initializeRazorpay();
        if (!res) {
          alert("Razorpay SDK Failed to load");
          return;
        }
        // Create the options object to be sent to the Payment Checkout 
        const orderAmount = (order.ticket.price * 100);
        var options = {
          key: process.env.RAZORPAY_KEY_ID, 
          name: 'Ticket_Mart',
          currency: 'INR',
          amount: orderAmount,
          order_id: order.rzpOrderId,
          description: `Payment created by User - ${order.userId}`,
          handler: function (response) {
            alert(`Payment successful for RazorPay Order ${response.razorpay_order_id}. Payment Reference Id - ${response.razorpay_payment_id}`);
            // Invoke the doRequest() function to invoke the /api/payments route
            doRequest({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id });
          }
        };
        // Instantiate the Payment Object and invoke the open() method for loading the Razorpay payment checkout form
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };
    
    return (
        <div>
          <h1>Order Id: {order.id}</h1>
          <h4>Time left to pay: {timeLeft} seconds </h4>
          {/* 
          ----------------- Following setion commented out as payments via Stripe aren't supported in India -----------------
          <StripeCheckout 
            // The doRequest() function is being invoked using the token as an additional property so that it will be used within the body while making a request to the backend route
            token={({ id }) => doRequest({ token: id })}
            stripeKey="pk_test_51OklBxSGpgG0gu7SuyWdBvpPt7eAapz48l7q5IE5Tu52kYhs6Fd8zMwTOZAKnse3yFUYd1TyCvylc71wcClww83B00dBLiGYYY"
            amount={order.ticket.price * 100}
            email={currentUser.email}
          /> 
          ------------------------------------------------------- End ------------------------------------------------------- 
          */}
          <button onClick={createRazorpayCheckout} className="btn btn-primary">Pay with Razorpay</button>
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