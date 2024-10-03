const mysql = require("mysql2/promise");
require("dotenv").config();

const sqlConnect = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  async function dbConnection() {
    let sqlConnection;
    try {
      sqlConnection=await sqlConnect.getConnection();
      
      await  sqlConnection.query("CREATE DATABASE IF NOT EXISTS totle_portfolio")
      console.log('Database "totle_portfolio" created or already exists.');
    
      await sqlConnection.query('USE totle_portfolio');
      // console.log('totle_db started');
    
      const createContactUsTableQuery = `
              CREATE TABLE IF NOT EXISTS CONTACT_US (
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                message VARCHAR(255) NOT NULL
              )
            `;
      await sqlConnection.query(createContactUsTableQuery)      
      console.log("CONTACT  US table created or already exists");

    //   const createCareersTableQuery=``
    //   await sqlConnection.query(createCareersTableQuery);
    //   console.log('Carreers table created or already exists')
    } catch (error) {
      console.error('Error during database initialization: ',err);
    } finally{
      if(sqlConnection) sqlConnection.release();
    }
  }
  dbConnection()
  
  module.exports = sqlConnect;