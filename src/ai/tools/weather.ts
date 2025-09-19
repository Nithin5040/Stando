
'use server';
/**
 * @fileOverview A tool to get the weather forecast for a given location using the Open-Meteo API.
 */

import { ai } from '@/ai/genkit';
import { fetchWeatherApi } from 'openmeteo';
import { z } from 'zod';
import { WeatherSchema } from '../schemas/weather';


// This is a standard async function that can be called from anywhere on the server.
// It contains the core logic for fetching weather data.
export async function getLocalWeatherForecast(input: { latitude: number; longitude: number; }) {
  const params = {
      "latitude": input.latitude,
      "longitude": input.longitude,
      "current": ["temperature_2m", "precipitation_probability", "weather_code"],
      "temperature_unit": "celsius",
      "wind_speed_unit": "kmh",
      "precipitation_unit": "mm",
      "timezone": "auto"
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  
  try {
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0]; // Process first location
      
      const current = response.current();

      if (!current) {
          throw new Error('Could not retrieve current weather data.');
      }

      const temp = current.variables(0)!.value();
      const precip = current.variables(1)!.value();
      const weatherCode = current.variables(2)!.value();

      const conditions = mapWeatherCode(weatherCode);

      return {
          temperature: Math.round(temp),
          precipitation: Math.round(precip),
          conditions: conditions,
      };

  } catch (error) {
      console.error("Failed to fetch weather data:", error);
      // Re-throw the error to be handled by the calling function
      throw new Error('Failed to fetch weather data from the external API.');
  }
}


// This defines the AI tool for Genkit, which wraps our standard async function.
const getWeatherForecastTool = ai.defineTool(
  {
    name: 'getWeatherForecastTool',
    description: 'Returns the weather forecast for a given geographical location (latitude and longitude).',
    inputSchema: z.object({
      latitude: z.number().describe('The latitude of the location.'),
      longitude: z.number().describe('The longitude of the location.'),
    }),
    outputSchema: WeatherSchema,
  },
  async (input) => {
    // The tool simply calls our exported async function.
    return getLocalWeatherForecast(input);
  }
);


function mapWeatherCode(code: number): string {
    const mapping: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return mapping[Math.round(code)] || 'Unknown weather';
}

