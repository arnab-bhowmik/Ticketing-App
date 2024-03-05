import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const showTicket = ({ currentUser, ticket }) => {
  const { doRequest, errors } = useRequest();

  // Function to get invoked on user clicking the 'Purchase' button
  const purchaseTicket = async () => {
    doRequest({ 
      url: '/api/orders',
      method: 'post',
      body: { ticketId: ticket.id },
      onSuccess: (order) => Router.push('/order/[orderId]', `/order/${order.id}`),
      props: {}
    });
  }

  // Function to get invoked on user clicking the 'Delete' button
  const deleteTicket = async () => {
    doRequest({ 
      url: `/api/tickets/${ticket.id}`,
      method: 'delete',
      body: {},
      onSuccess: () => Router.push('/'),
      props: {}
    });
  }
  
  return (
      <div>
        <h1>Name: {ticket.title}</h1>
        <h2>Price: {ticket.price}</h2>
        {errors}
        {currentUser && (ticket.userId !== currentUser.id
          ? ( <button onClick={purchaseTicket} className="btn btn-primary">Purchase</button> )
          : ( <button onClick={deleteTicket} className="btn btn-danger">Delete</button> )
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