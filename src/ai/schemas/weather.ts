
import { z } from 'zod';

export const WeatherSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    precipitation: z.number().describe('The current precipitation probability in percent.'),
    conditions: z.string().describe('A brief description of the weather conditions (e.g., Sunny, Cloudy, Rain).'),
});
