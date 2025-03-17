import { sequelize } from "../index";
import { DataTypes, Model } from "sequelize";

class Statistical extends Model {}
Statistical.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    device_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    dev_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    alt: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    fix_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    lng: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    satellites: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sensors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "statisticals",
    modelName: "Statistical",
    sequelize: sequelize,
  }
);

interface ISensor {
  D: string;
  H1: number;
  H2: number;
}

export interface IStatistical {
  id?: number;
  device_id: number;
  dev_type: number;
  alt: number;
  fix_type: number;
  lat: number;
  lng: number;
  satellites: number;
  sensors?: ISensor;
  timestamp: string;
}

export default Statistical;
