import { User } from '../types';

export const USERS: User[] = [
    {
        id: '1',
        username: 'admin',
        password: 'password123',
        name: 'Administrador',
        role: 'admin'
    },
    {
        id: '2',
        username: 'operador',
        password: 'password123',
        name: 'Operador',
        role: 'operator'
    },
    {
        id: '3',
        username: 'bodega',
        password: 'password123',
        name: 'Bodeguero',
        role: 'warehouse'
    }
];
