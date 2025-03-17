import { sequelize } from "../index";
import { DataTypes, Model } from "sequelize";

class Milestone extends Model {}
Milestone.init(
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
    alt: {
      type: DataTypes.DOUBLE,
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
  },
  {
    tableName: "milestones",
    modelName: "Milestone",
    sequelize: sequelize,
  }
);

export interface IMilestone {
  id?: number;
  device_id: number;
  alt: number;
  lat: number;
  lng: number;
}

export default Milestone;
