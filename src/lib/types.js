
// This file can be used for JSDoc type definitions if needed.
// For example:
/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} eta
 * @property {string} phone
 * @property {{lat: number, lng: number}} location
 */

/**
 * @typedef {'Pending' | 'Queued' | 'In Progress' | 'Completed' | 'Cancelled'} BookingStatus
 */

/**
 * @typedef {object} Booking
 * @property {string} id
 * @property {string} customer
 * @property {number} customer_id
 * @property {string} customerPhone
 * @property {string} service
 * @property {string} location
 * @property {number} [latitude]
 * @property {number} [longitude]
 * @property {BookingStatus} status
 * @property {string} [instructions]
 * @property {Agent} [agent]
 * @property {boolean} [locationVerified]
 * @property {number} [queuePosition]
 * @property {number} [totalInQueue]
 * @property {number} [progress]
 * @property {number} [estimatedCost]
 * @property {number} [finalCost]
 * @property {number} [durationMinutes]
 * @property {number} [agentPayout]
 */
