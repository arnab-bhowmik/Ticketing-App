import Link from "next/link";

const Landing = ({ tickets, currentUser }) => {
    const ticketList = tickets.map((ticket) => {
        return (
          <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>{ticket.price}</td>
            <td>
              <Link href="/ticket/[ticketId]" as={`/ticket/${ticket.id}`}>
                View
              </Link>
            </td>
          </tr>
        );
      });
    
    return (
    <div>
        <h1>Tickets</h1>
        <table className="table">
        <thead>
            <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
            </tr>
        </thead>
        <tbody>{ticketList}</tbody>
        </table>
    </div>
    );
};

// Method allows to fetch data that needs to be shown on the UI Component. Importing buildClient as client lets us create an Axios instance.
Landing.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};
   
export default Landing;