import BaseStation, { IBaseStation } from "../../database/models/base-station";
import { logger } from "../../configs/logger";
import Milestone from "../../database/models/milestone";
import Statistical, { IStatistical } from "../../database/models/statistical";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Op, where } from "sequelize";
import IotService from "./iot.service";

const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).send("ok");
};

const saveStatisticals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body.data;
    await IotService.saveStatisticals(data);
    res.status(StatusCodes.OK).json({status: 'ok'});
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getStatisticalList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start, end } = req.query;
    const statisticals = await IotService.getStatisticalList(
      start as string,
      end as string
    );
    res.status(StatusCodes.OK).json(statisticals);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const updateMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body.data;
    await IotService.updateMilestone(data);

    res.status(StatusCodes.OK).json({status: 'ok'});
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const saveBaseStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body.data as IBaseStation;
    await IotService.saveBaseStation(data);
    res.status(StatusCodes.OK).json({status: 'ok'});
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getBaseStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const milestones = await IotService.getBaseStation();
    res.status(StatusCodes.OK).json(milestones);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error: (error as Error).message });
  }
};

const getMilestoneList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const milestones = await IotService.getMilestoneList();
    res.status(StatusCodes.OK).json(milestones);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error: (error as Error).message });
  }
};

const getMilestoneById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const device_id = req.params.device_id;
    const milestones = await IotService.getMilestoneById(device_id);
    res.status(StatusCodes.OK).json(milestones);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error: (error as Error).message });
  }
};

const IotController = {
  healthCheck,
  saveStatisticals,
  getStatisticalList,
  updateMilestone,
  getMilestoneList,
  getMilestoneById,
  saveBaseStation,
  getBaseStation,
};

export default IotController;
