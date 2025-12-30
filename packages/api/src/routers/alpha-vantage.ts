import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import axios from "axios";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Assuming API key is stored in .env

export const alphaVantageRouter = router({
  getGlobalQuote: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.warn("Alpha Vantage API key not configured. Returning mock data.");
        return {
          "Global Quote": {
            "01. symbol": input.symbol,
            "02. open": "150.00",
            "03. high": "155.00",
            "04. low": "148.00",
            "05. price": "152.50",
            "06. volume": "1000000",
            "07. latest trading day": new Date().toISOString().split('T')[0],
            "08. previous close": "151.00",
            "09. change": "1.50",
            "10. change percent": "1.00%"
          },
          Information: "Demo Mode: API key not configured."
        };
      }
      console.log("Fetching GLOBAL_QUOTE for symbol:", input.symbol);
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: input.symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      return response.data;
    }),

  getDailyTimeSeries: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.warn("Alpha Vantage API key not configured. Returning mock data.");
        return {
          "Time Series (Daily)": {
            [new Date().toISOString().split('T')[0]]: {
              "1. open": "150.00",
              "2. high": "155.00",
              "3. low": "148.00",
              "4. close": "152.50",
              "5. volume": "1000000"
            }
          },
          Information: "Demo Mode: API key not configured."
        };
      }
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: input.symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      return response.data;
    }),

  getCurrencyExchangeRate: publicProcedure
    .input(z.object({ from_currency: z.string(), to_currency: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.warn("Alpha Vantage API key not configured. Returning mock data.");
        return {
          "Realtime Currency Exchange Rate": {
            "1. From_Currency Code": input.from_currency,
            "2. From_Currency Name": input.from_currency,
            "3. To_Currency Code": input.to_currency,
            "4. To_Currency Name": input.to_currency,
            "5. Exchange Rate": "1.0000",
            "6. Last Refreshed": new Date().toISOString(),
            "7. Time Zone": "UTC",
            "8. Bid Price": "0.9999",
            "9. Ask Price": "1.0001"
          },
          Information: "Demo Mode: API key not configured."
        };
      }
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "CURRENCY_EXCHANGE_RATE",
          from_currency: input.from_currency,
          to_currency: input.to_currency,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      return response.data;
    }),
});
