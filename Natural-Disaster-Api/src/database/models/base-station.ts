import { sequelize } from "../index";
import { DataTypes, Model } from "sequelize";

class BaseStation extends Model {}
BaseStation.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    mode: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ecef_x: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    ecef_y: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    ecef_z: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "base_stations",
    modelName: "BaseStation",
    sequelize: sequelize,
  }
);

export interface IBaseStation {
  mode: number;
  ecef_x: number;
  ecef_y: number;
  ecef_z: number;
}

export default BaseStation;
