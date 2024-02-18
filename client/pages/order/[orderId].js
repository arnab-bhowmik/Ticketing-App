import { useEffect, useState } from "react";

const showOrder = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState(0);

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
        return <div>Order Expired</div>
    }
    
    return (
        <div>
          <h1>Order Id: {order.id}</h1>
          <h4>Time left to pay: {timeLeft} seconds </h4>
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