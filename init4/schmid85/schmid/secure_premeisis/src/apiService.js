import axios from 'axios';
const base_url = 'http://localhost:5003/api/people'
const API_URL = 'http://127.0.0.1:5000/api/create-person';
const get_URL = 'http://localhost:5003/api/people';
// const update_URL = "http://localhost:5003/api/people"
export const getPeople = async () => {
  try {
    const response = await axios.get(base_url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};



export const updatePerson = async (_id, data) => {
  try {
    const response = await axios.put(`${base_url}/${_id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
};

export const createPerson = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
};

export const deletePerson = async (name) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${name}`);
    if (response.status === 200) {
      console.log('Record deleted successfully');
    } else {
      console.error('Failed to delete record');
    }
    return response.data; // If you need to return data after deletion
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
};





