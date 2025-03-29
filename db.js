import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config()
const pool  = mysql.createConnection({
    host : process.env.MYSQL_HOST,
    user : process.env.MY_ROOT_USER,
    password : process.env.MY_PASSWORD,
    database : process.env.MYSQL_DATABASE

})
pool.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log("MySQL Connected");
});
// const result  = await pool.query("SELECT * FROM schooldb.schools")
// console.log(result[0]);

export default pool