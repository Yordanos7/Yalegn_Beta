import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import axios from "axios";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Assuming API key is stored in .env

export const alphaVantageRouter = router({
  getGlobalQuote: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.error("Alpha Vantage API key not configured.");
        throw new Error("Alpha Vantage API key not configured.");
      }
      console.log("Fetching GLOBAL_QUOTE for symbol:", input.symbol);
      console.log(
        "Using API Key (first 5 chars):",
        ALPHA_VANTAGE_API_KEY.substring(0, 5)
      );
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: input.symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      console.log("GLOBAL_QUOTE API Response:", response.data);
      return response.data;
    }),

  getDailyTimeSeries: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.error("Alpha Vantage API key not configured.");
        throw new Error("Alpha Vantage API key not configured.");
      }
      console.log("Fetching TIME_SERIES_DAILY for symbol:", input.symbol);
      console.log(
        "Using API Key (first 5 chars):",
        ALPHA_VANTAGE_API_KEY.substring(0, 5)
      );
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: input.symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      console.log("TIME_SERIES_DAILY API Response:", response.data);
      return response.data;
    }),

  getCurrencyExchangeRate: publicProcedure
    .input(z.object({ from_currency: z.string(), to_currency: z.string() }))
    .query(async ({ input }) => {
      if (!ALPHA_VANTAGE_API_KEY) {
        console.error("Alpha Vantage API key not configured.");
        throw new Error("Alpha Vantage API key not configured.");
      }
      console.log(
        "Fetching CURRENCY_EXCHANGE_RATE for:",
        input.from_currency,
        input.to_currency
      );
      console.log(
        "Using API Key (first 5 chars):",
        ALPHA_VANTAGE_API_KEY.substring(0, 5)
      );
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "CURRENCY_EXCHANGE_RATE",
          from_currency: input.from_currency,
          to_currency: input.to_currency,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      console.log("CURRENCY_EXCHANGE_RATE API Response:", response.data);
      return response.data;
    }),
});
