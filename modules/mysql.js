const path = require('path');
const fs = require('fs');
const logger = require('../modules/logger');
const mysql = require("mysql2");

const path_bot = path.resolve(__dirname, '..');
const configFile = path.join(path_bot, '/jsons/configs/config_secret.json');
const configSecret = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const pool = require('mysql2/promise').createPool({
  host: configSecret.mysql.host,
  user: configSecret.mysql.user,
  password: configSecret.mysql.password,
  database: configSecret.mysql.database,
});

const checkAndCreateTable = async (walletTableName, tradesTableName) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS ${walletTableName} (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          montant TEXT, 
          dateheure TEXT
        )`
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS ${tradesTableName} (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          type TEXT, 
          montantCrypto TEXT, 
          montantUsd TEXT, 
          symbol TEXT, 
          prix TEXT, 
          dateheure TEXT
        )`
      );

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};


async function getDataFromTable(tableName) {
  const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
  return JSON.stringify(rows);
}

async function readDataFromTables(walletTableName, tradesTableName) {
  try {
    // Vérifie que les tables existent et crée les tables si nécessaire
    await checkAndCreateTable(walletTableName, tradesTableName);

    const walletData = await getDataFromTable(walletTableName);
    const tradesData = await getDataFromTable(tradesTableName);

    return {
      walletData: walletData,
      tradesData: tradesData
    }
  } catch (error) {
    return error;
  }
}


module.exports = {
  addDataToWallet: async (tableName, data) => {
    try {
      const sql = `INSERT INTO ${tableName} (montant, dateheure) VALUES (?, ?)`;
      const results = await pool.query(sql, [data.montant, data.dateheure]);
      logger.info(`${data.etiquette_bot} Data successfully added to ${tableName}`);
      return results;
    } catch (error) {
      logger.error(`${data.etiquette_bot} Error adding data to ${tableName}: ${error}`);
      throw error;
    }
  },
  addDataToTrades: async (tableName, data) => {
    const sql = `INSERT INTO ${tableName} (
      type, 
      montantCrypto, 
      montantUsd, 
      symbol, 
      prix, 
      dateheure
    ) VALUES (?, ?, ?, ?, ?, ?)`;
    try {
      const results = await pool.query(sql, [
        data.type,
        data.montantCrypto,
        data.montantUsd,
        data.symbol,
        data.prix,
        data.dateheure,
      ]);
      logger.info(`${data.etiquette_bot} Data successfully added to ${tableName}`);
      return results;
    } catch (error) {
      logger.error(`${data.etiquette_bot} Error adding data to ${tableName}: ${error}`);
      throw error;
    }
  },
  checkAndCreateTable: checkAndCreateTable,
  readDataFromTables : readDataFromTables
};


      