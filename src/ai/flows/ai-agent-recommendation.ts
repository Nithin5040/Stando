
'use server';

/**
 * @fileOverview An AI-powered tool that analyzes historical queue data to predict wait times and recommend the optimal time for the customer to arrive, minimizing their waiting period.
 *
 * - getOptimalArrivalTime - A function that handles the queue time prediction process.
 * - GetOptimalArrivalTimeInput - The input type for the getOptimalArrivalTime function.
 * - GetOptimalArrivalTimeOutput - The return type for the getOptimalArrivalTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getLocalWeatherForecast } from '../tools/weather';
import { WeatherSchema } from '../schemas/weather';

const GetOptimalArrivalTimeInputSchema = z.object({
  serviceType: z.string().describe('The type of service the user is booking (e.g., passport office, temple darshan).'),
  location: z.string().describe('The location of the service.'),
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
  currentTime: z.string().describe('The current time, in ISO format.'),
});
export type GetOptimalArrivalTimeInput = z.infer<typeof GetOptimalArrivalTimeInputSchema>;

const GetOptimalArrivalTimeOutputSchema = z.object({
  predictedWaitTime: z.number().describe('The predicted wait time in minutes.'),
  recommendedArrivalTime: z.string().describe('The recommended arrival time, in ISO format.'),
  confidenceLevel: z.string().describe('The confidence level of the prediction (e.g., high, medium, low).'),
  weather: WeatherSchema.describe('The weather forecast object for the recommended time.'),
});
export type GetOptimalArrivalTimeOutput = z.infer<typeof GetOptimalArrivalTimeOutputSchema>;

export async function getOptimalArrivalTime(input: GetOptimalArrivalTimeInput): Promise<GetOptimalArrivalTimeOutput> {
  return getOptimalArrivalTimeFlow(input);
}

// We need to define a separate tool for the flow that wraps our async function.
const getWeatherToolForFlow = ai.defineTool(
    {
      name: 'getWeatherForecast',
      description: 'Returns the weather forecast for a given geographical location (latitude and longitude).',
      inputSchema: z.object({
        latitude: z.number().describe('The latitude of the location.'),
        longitude: z.number().describe('The longitude of the location.'),
      }),
      outputSchema: WeatherSchema,
    },
    async (input) => await getLocalWeatherForecast(input)
);


const prompt = ai.definePrompt({
  name: 'getOptimalArrivalTimePrompt',
  input: {schema: GetOptimalArrivalTimeInputSchema},
  output: {schema: GetOptimalArrivalTimeOutputSchema},
  tools: [getWeatherToolForFlow],
  prompt: `You are an AI assistant that analyzes historical queue data from past agent visits to predict wait times and recommend the optimal time for a customer to arrive, minimizing their waiting period. 
  
You will be provided the current time, the service type, and the location (with coordinates). 

You must use the getWeatherForecast tool to get the weather for the provided latitude and longitude.

You will return the predicted wait time, the recommended arrival time, a confidence level based on the amount of data available, and the full weather object you received from the tool.

Service Type: {{{serviceType}}}
Location: {{{location}}}
Current Time: {{{currentTime}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const getOptimalArrivalTimeFlow = ai.defineFlow(
  {
    name: 'getOptimalArrivalTimeFlow',
    inputSchema: GetOptimalArrivalTimeInputSchema,
    outputSchema: GetOptimalArrivalTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
