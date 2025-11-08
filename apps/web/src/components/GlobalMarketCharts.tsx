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

interface GlobalQuoteData {
  "Global Quote": {
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
}

interface DailyTimeSeriesData {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
}

const GlobalMarketCharts: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState("IBM"); // Default stock symbol
  const [fromCurrency, setFromCurrency] = useState("USD"); // Default from currency
  const [toCurrency, setToCurrency] = useState("JPY"); // Default to currency

  const { data: globalQuote, isLoading: isLoadingQuote } =
    trpc.alphaVantage.getGlobalQuote.useQuery({ symbol: stockSymbol });
  const { data: dailyTimeSeries, isLoading: isLoadingTimeSeries } =
    trpc.alphaVantage.getDailyTimeSeries.useQuery({ symbol: stockSymbol });
  const {
    data: currencyExchangeRate,
    isLoading: isLoadingCurrencyExchangeRate,
  } = trpc.alphaVantage.getCurrencyExchangeRate.useQuery({
    from_currency: fromCurrency,
    to_currency: toCurrency,
  });

  const [chartData, setChartData] = useState<
    { date: string; price: number; volume: number }[]
  >([]);

  useEffect(() => {
    if (dailyTimeSeries && dailyTimeSeries["Time Series (Daily)"]) {
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

  if (!globalQuote || !dailyTimeSeries || !currencyExchangeRate) {
    return <div>Failed to load global market data.</div>;
  }

  const currentPrice =
    globalQuote["Global Quote"] &&
    parseFloat(globalQuote["Global Quote"]["05. price"]);
  const changePercent =
    globalQuote["Global Quote"] &&
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
