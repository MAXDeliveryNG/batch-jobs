
import pool from "../configs/connection.js";
import {getContractsQuery, getChampionsWithoutContractQuery} from "../configs/queryConstants.js";

const getContracts = (request, response) => {
  pool.query(getContractsQuery, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getChampionsWithoutContract = async (days) => {
  const query = getChampionsWithoutContractQuery(days);
  const result = await pool.query(query);
  return result.rows || [];
};

export {
  getContracts,
  getChampionsWithoutContract
};
