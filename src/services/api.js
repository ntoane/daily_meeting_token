import axios from 'axios';

const API_URL = 'https://fwfbtw6ad5.execute-api.af-south-1.amazonaws.com/api';

export const getRoomTokens = async (bookingId) => {
  const response = await axios.get(`${API_URL}/bookings/generate_unprotected_meeting_token/${bookingId}`);
  return response.data;
};