const exchange = 'ticketing-app-exchange';
const queue    = 'auth-service-queue';      // Doesn't exist yet, included for future implementations if any

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