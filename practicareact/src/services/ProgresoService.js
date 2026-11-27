import axiosClient from '../config/axiosClient';

export const getProgresoList = () =>
    new Promise((resolve, reject) => {
        axiosClient
            .get('/progresos')
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const getProgresoById = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .get(`/progresos/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const insertProgreso = (data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .post('/progresos', data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const updateProgreso = (id, data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .put(`/progresos/${id}`, data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const deleteProgreso = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .delete(`/progresos/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
