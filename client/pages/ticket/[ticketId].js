import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const showTicket = ({ currentUser, ticket }) => {
  // doRequest function invokes the useRequest() method which in turn calls the backend route
  const { doRequest, errors } = useRequest({
      url: '/api/orders',
      method: 'post',
      body: { ticketId: ticket.id },
      onSuccess: (order) => Router.push('/order/[orderId]', `/order/${order.id}`)
  });
  
  return (
      <div>
        <h1>Name: {ticket.title}</h1>
        <h2>Price: {ticket.price}</h2>
        {errors}
        {currentUser && (ticket.userId !== currentUser.id
          ? ( <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button> )
          : ( <button onClick={() => doRequest()} className="btn btn-danger">Delete</button> )
        )}
        {!currentUser && ( <span>Please Sign Up/Sign In To Purchase</span> )}
      </div>
  );
};

showTicket.getInitialProps = async (context, client, currentUser) => {
    // context.query returns the wildcard part of the route to be invoked i.e. ticketId
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data }; 
};

export default showTicket;