import { MySqlDialect } from '@sequelize/mysql';
import ENV from '../configs/env';
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  database: ENV.DB_DATABASE,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  sync: {
    force: true
  }
});

export const syncDatabase = async () => {
    await sequelize.sync({ force: true });
}