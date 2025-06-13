export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    notation = 'standard',
    compactDisplay = 'short'
  } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
    compactDisplay
  }).format(value);
};

export const formatPercentage = (value, showSign = true) => {
  const formatted = Math.abs(value).toFixed(2);
  if (showSign) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${formatted}%`;
};

export const formatNumber = (value, options = {}) => {
  const { notation = 'standard', minimumFractionDigits = 0 } = options;
  
  return new Intl.NumberFormat('en-US', {
    notation,
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits + 2
  }).format(value);
};

export const formatBitcoinAmount = (btc) => {
  if (btc >= 1) {
    return `${btc.toFixed(4)} BTC`;
  } else if (btc >= 0.001) {
    return `${(btc * 1000).toFixed(2)} mBTC`;
  } else {
    return `${(btc * 100000000).toFixed(0)} sats`;
  }
};

export const formatMarketCap = (value) => {
  return formatCurrency(value, {
    notation: 'compact',
    maximumFractionDigits: 2
  });
};

export const formatVolume = (value) => {
  return formatCurrency(value, {
    notation: 'compact',
    maximumFractionDigits: 1
  });
};
