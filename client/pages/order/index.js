import Link from "next/link";

const orderIndex = ({ orders, currentUser }) => {
    const orderList = orders.map((order) => {
        return (
          <tr key={order.id}>
            <td>{order.ticket.title}</td>
            <td>{order.status}</td>
            {currentUser && (order.status === 'Created'
              ? ( <td>
                    <Link href="/order/[orderId]" as={`/order/${order.id}`}>
                        Complete Payment
                    </Link>
                  </td> 
                )
              : ( order.status === 'Completed' ? (<td>Payment Successful</td>) : (<td>Payment Not Allowed</td>))
            )}
          </tr>
        );
    });

    return (
    <div>
        <h1>Orders</h1>
        <table className="table">
        <thead>
            <tr>
            <th>Ticket Title</th>
            <th>Order Status</th>
            <th>Payment Status</th>
            </tr>
        </thead>
        <tbody>{orderList}</tbody>
        </table>
    </div>
    );
};

orderIndex.getInitialProps = async (context, client) => {
const { data } = await client.get('/api/orders');
return { orders: data };
};

export default orderIndex;  