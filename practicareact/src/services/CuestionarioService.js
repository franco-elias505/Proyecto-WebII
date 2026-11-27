import axiosClient from '../config/axiosClient';

export const getCuestionarioList = () =>
    new Promise((resolve, reject) => {
        axiosClient
            .get('/cuestionarios')
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const getCuestionarioById = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .get(`/cuestionarios/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const insertCuestionario = (data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .post('/cuestionarios', data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const updateCuestionario = (id, data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .put(`/cuestionarios/${id}`, data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const deleteCuestionario = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .delete(`/cuestionarios/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
