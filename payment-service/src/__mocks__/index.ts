const exchange = 'ticketing-app-exchange';
const queue    = 'payment-service-queue';

// Define a mock channel implementation
const channel = {
  publish: jest.fn().mockImplementation((exchange: string, routingKey: string, content: Buffer, type?: string) => {}),
  close: jest.fn().mockImplementation(() => {}),
};

// Define a mock connection implementation
const connection = {
  createChannel: jest.fn().mockResolvedValue(channel),
};

export { connection, exchange, queue };