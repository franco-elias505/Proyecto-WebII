import axiosClient from '../config/axiosClient';

export const getInscripcionList = () =>
    new Promise((resolve, reject) => {
        axiosClient
            .get('/inscripciones')
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const getInscripcionById = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .get(`/inscripciones/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const insertInscripcion = (data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .post('/inscripciones', data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const updateInscripcion = (id, data) =>
    new Promise((resolve, reject) => {
        axiosClient
            .put(`/inscripciones/${id}`, data)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export const deleteInscripcion = (id) =>
    new Promise((resolve, reject) => {
        axiosClient
            .delete(`/inscripciones/${id}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
