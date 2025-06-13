class BitcoinWebSocket {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      this.ws.onopen = () => {
        console.log('Bitcoin WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const formattedData = {
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume: parseFloat(data.v),
          timestamp: new Date(),
        };
        
        this.notifySubscribers(formattedData);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (this.subscribers.size === 1) {
      this.connect();
    }
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }

  notifySubscribers(data) {
    this.subscribers.forEach((callback) => callback(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new BitcoinWebSocket();
