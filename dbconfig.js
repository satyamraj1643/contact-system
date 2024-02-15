const { Pool } = require('pg');

// Create a new PostgreSQL client instance
const pool = new Pool({
    host: 'dpg-cn3p0dtjm4es73bm9m2g-a.oregon-postgres.render.com',
    port: 5432,
    user: 'satyam',
    password: 'cDOqjGHjIPLnJL1RkXV9RoRGyoSZxqYi',
    database: 'portfoliocontactsystem'
});

module.exports={
    pool
}