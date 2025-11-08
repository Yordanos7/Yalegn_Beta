"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { trpc } from "../utils/trpc";

// Mock data for demonstration due to API rate limits
const mockGlobalQuoteData = {
  "Global Quote": {
    "01. symbol": "IBM",
    "02. open": "170.0000",
    "03. high": "172.5000",
    "04. low": "169.0000",
    "05. price": "171.2500",
    "06. volume": "5000000",
    "07. latest trading day": "2025-11-07",
    "08. previous close": "169.5000",
    "09. change": "1.7500",
    "10. change percent": "1.0324%",
  },
};

const mockDailyTimeSeriesData = {
  "Meta Data": {
    "1. Information": "Daily Prices and Volumes for a Stock",
    "2. Symbol": "IBM",
    "3. Last Refreshed": "2025-11-07",
    "4. Output Size": "Full size",
    "5. Time Zone": "US/Eastern",
  },
  "Time Series (Daily)": {
    "2025-11-03": {
      "1. open": "165.0000",
      "2. high": "167.0000",
      "3. low": "164.5000",
      "4. close": "166.5000",
      "5. volume": "4000000",
    },
    "2025-11-04": {
      "1. open": "166.0000",
      "2. high": "168.5000",
      "3. low": "165.5000",
      "4. close": "167.8000",
      "5. volume": "4500000",
    },
    "2025-11-05": {
      "1. open": "167.5000",
      "2. high": "170.0000",
      "3. low": "167.0000",
      "4. close": "169.2000",
      "5. volume": "4800000",
    },
    "2025-11-06": {
      "1. open": "169.0000",
      "2. high": "171.0000",
      "3. low": "168.5000",
      "4. close": "170.5000",
      "5. volume": "5200000",
    },
    "2025-11-07": {
      "1. open": "170.0000",
      "2. high": "172.5000",
      "3. low": "169.0000",
      "4. close": "171.2500",
      "5. volume": "5000000",
    },
  },
};

const mockCurrencyExchangeRateData = {
  "Realtime Currency Exchange Rate": {
    "1. From_Currency Code": "USD",
    "2. From_Currency Name": "United States Dollar",
    "3. To_Currency Code": "JPY",
    "4. To_Currency Name": "Japanese Yen",
    "5. Exchange Rate": "151.8000",
    "6. Last Refreshed": "2025-11-07 16:00:00",
    "7. Time Zone": "UTC",
    "8. Bid Price": "151.7900",
    "9. Ask Price": "151.8100",
  },
};

interface GlobalQuoteData {
  "Global Quote"?: {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
  Information?: string; // To capture API rate limit message
}

interface DailyTimeSeriesData {
  "Meta Data"?: {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)"?: {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
  Information?: string; // To capture API rate limit message
}

interface CurrencyExchangeRateData {
  "Realtime Currency Exchange Rate"?: {
    "1. From_Currency Code": string;
    "2. From_Currency Name": string;
    "3. To_Currency Code": string;
    "4. To_Currency Name": string;
    "5. Exchange Rate": string;
    "6. Last Refreshed": string;
    "7. Time Zone": string;
    "8. Bid Price": string;
    "9. Ask Price": string;
  };
  Information?: string; // To capture API rate limit message
}

const GlobalMarketCharts: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState("IBM"); // Default stock symbol
  const [fromCurrency, setFromCurrency] = useState("USD"); // Default from currency
  const [toCurrency, setToCurrency] = useState("JPY"); // Default to currency

  const {
    data: liveGlobalQuote,
    isLoading: isLoadingQuote,
    error: globalQuoteError,
  } = trpc.alphaVantage.getGlobalQuote.useQuery({ symbol: stockSymbol });
  const {
    data: liveDailyTimeSeries,
    isLoading: isLoadingTimeSeries,
    error: dailyTimeSeriesError,
  } = trpc.alphaVantage.getDailyTimeSeries.useQuery({ symbol: stockSymbol });
  const {
    data: liveCurrencyExchangeRate,
    isLoading: isLoadingCurrencyExchangeRate,
    error: currencyExchangeRateError,
  } = trpc.alphaVantage.getCurrencyExchangeRate.useQuery({
    from_currency: fromCurrency,
    to_currency: toCurrency,
  });

  // Determine if we should use mock data
  const useMockData =
    liveGlobalQuote?.Information ||
    globalQuoteError ||
    liveDailyTimeSeries?.Information ||
    dailyTimeSeriesError ||
    liveCurrencyExchangeRate?.Information ||
    currencyExchangeRateError;

  const globalQuote = useMockData ? mockGlobalQuoteData : liveGlobalQuote;
  const dailyTimeSeries = useMockData
    ? mockDailyTimeSeriesData
    : liveDailyTimeSeries;
  const currencyExchangeRate = useMockData
    ? mockCurrencyExchangeRateData
    : liveCurrencyExchangeRate;

  const [chartData, setChartData] = useState<
    { date: string; price: number; volume: number }[]
  >([]);

  useEffect(() => {
    if (dailyTimeSeries?.["Time Series (Daily)"]) {
      const timeSeries = dailyTimeSeries["Time Series (Daily)"] as Record<
        string,
        DailyTimeSeriesData["Time Series (Daily)"][string]
      >;
      const formattedData = Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          price: parseFloat(values["4. close"]),
          volume: parseFloat(values["5. volume"]),
        }))
        .reverse(); // To show oldest data first
      setChartData(formattedData);
    }
  }, [dailyTimeSeries]);

  if (isLoadingQuote || isLoadingTimeSeries || isLoadingCurrencyExchangeRate) {
    return <div>Loading global market data...</div>;
  }

  // No need for this check if we are using mock data on failure
  // if (!globalQuote || !dailyTimeSeries || !currencyExchangeRate) {
  //   return <div>Failed to load global market data.</div>;
  // }

  const currentPrice =
    globalQuote?.["Global Quote"] &&
    parseFloat(globalQuote["Global Quote"]["05. price"]);
  const changePercent =
    globalQuote?.["Global Quote"] &&
    parseFloat(globalQuote["Global Quote"]["10. change percent"]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Global Market Dashboard</h1>

      {/* Stock Market Section */}
      <div className="mb-8 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Stock Market Data</h2>
        <div className="mb-4">
          <label
            htmlFor="stock-symbol-input"
            className="block text-sm font-medium text-gray-700"
          >
            Enter Stock Symbol:
          </label>
          <input
            type="text"
            id="stock-symbol-input"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., IBM, AAPL, MSFT"
          />
        </div>

        {globalQuote["Global Quote"] ? (
          <div className="mb-8 p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              {globalQuote["Global Quote"]["01. symbol"]} - Current Quote
            </h2>
            <p>Price: {currentPrice?.toFixed(2)}</p>
            <p
              className={changePercent > 0 ? "text-green-500" : "text-red-500"}
            >
              Change Percent: {changePercent?.toFixed(2)}%
            </p>
            <p>Volume: {globalQuote["Global Quote"]["06. volume"]}</p>
          </div>
        ) : (
          <div className="mb-8 p-4 border rounded-lg shadow-md text-red-500">
            No global quote data available for {stockSymbol}. Please check the
            symbol.
          </div>
        )}
      </div>

      {/* Currency Exchange Section */}
      <div className="mb-8 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Currency Exchange Rate</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="from-currency-input"
              className="block text-sm font-medium text-gray-700"
            >
              From Currency:
            </label>
            <input
              type="text"
              id="from-currency-input"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., USD"
            />
          </div>
          <div>
            <label
              htmlFor="to-currency-input"
              className="block text-sm font-medium text-gray-700"
            >
              To Currency:
            </label>
            <input
              type="text"
              id="to-currency-input"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., JPY"
            />
          </div>
        </div>

        {currencyExchangeRate["Realtime Currency Exchange Rate"] ? (
          <div className="p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              {
                currencyExchangeRate["Realtime Currency Exchange Rate"][
                  "1. From_Currency Code"
                ]
              }
              /
              {
                currencyExchangeRate["Realtime Currency Exchange Rate"][
                  "3. To_Currency Code"
                ]
              }{" "}
              Exchange Rate
            </h2>
            <p>
              Rate:{" "}
              {parseFloat(
                currencyExchangeRate["Realtime Currency Exchange Rate"][
                  "5. Exchange Rate"
                ]
              ).toFixed(4)}
            </p>
            <p>
              Last Refreshed:{" "}
              {
                currencyExchangeRate["Realtime Currency Exchange Rate"][
                  "6. Last Refreshed"
                ]
              }
            </p>
          </div>
        ) : (
          <div className="p-4 border rounded-lg shadow-md text-red-500">
            No currency exchange rate data available for {fromCurrency}/
            {toCurrency}. Please check the symbols.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Close Price</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volume" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GlobalMarketCharts;
