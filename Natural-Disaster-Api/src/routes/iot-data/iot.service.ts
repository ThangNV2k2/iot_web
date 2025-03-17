import BaseStation, { IBaseStation } from "../../database/models/base-station";
import Milestone, { IMilestone } from "../../database/models/milestone";
import Statistical, { IStatistical } from "../../database/models/statistical";
import { Op } from "sequelize";

const saveStatisticals = async (data: IStatistical[]) => {
  if (data && data.length > 0) {
    const resolvedData = data.map(d => {
      if(!d.timestamp){
        return {
          ...d,
          timestamp: new Date().toString()
        }
      }
      return d
    })
    await Statistical.bulkCreate(resolvedData as any);
  }
};

const getStatisticalList = async (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    const statisticals = await Statistical.findAll({
      order: ["timestamp"],});
    return statisticals;
  }

  const statisticals = await Statistical.findAll({
    where: {
      timestamp: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: ["timestamp"],
  });
  return statisticals;
};

const updateMilestone = async (data: IMilestone) => {
  const { device_id, lat, lng, alt } = data;
  const existingData = await Milestone.findOne({
    where: {
      device_id,
    },
  });

  if (existingData) {
    existingData.update({
      lat,
      lng,
      alt,
    });
    return;
  }

  await Milestone.create({
    device_id,
    lat,
    lng,
    alt,
  });
};

const saveBaseStation = async (data: IBaseStation) => {
  const { mode, ecef_x, ecef_y, ecef_z } = data;

  await BaseStation.create({
    mode,
    ecef_x,
    ecef_y,
    ecef_z,
  });
};

const getBaseStation = async () => {
  const latestBaseStation = await BaseStation.findOne({
    order: ["createdAt"],
  });
  return latestBaseStation;
};

const getMilestoneList = async () => {
  const milestones = await Milestone.findAll({});
  return milestones;
};

const getMilestoneById = async (device_id: string) => {
  return await Milestone.findOne({
    where: {
      device_id,
    },
  });
};

const IotService = {
  saveStatisticals,
  getStatisticalList,
  updateMilestone,
  getMilestoneList,
  getMilestoneById,
  saveBaseStation,
  getBaseStation,
};

export default IotService;
