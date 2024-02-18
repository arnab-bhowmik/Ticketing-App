import useRequest from "../../hooks/use-request";

const showTicket = ({ ticket }) => {
    // doRequest function invokes the useRequest() method which in turn calls the backend route
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: { ticketId: ticket.id },
        onSuccess: (order) => console.log(order)
    });
    
    return (
        <div>
          <h1>Name: {ticket.title}</h1>
          <h2>Price: {ticket.price}</h2>
          {errors}
          <button onClick={doRequest} className="btn btn-primary">Purchase</button>
        </div>
    );
};

showTicket.getInitialProps = async (context, client) => {
    // context.query returns the wildcard part of the route to be invoked i.e. ticketId
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data }; 
};

export default showTicket;