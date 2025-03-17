import { Express } from "express";
import iotRouter from "./iot-data/iot.route";
import ENV from "../configs/env";

const endpointWithPrefix = (endpoint: string) => {
  return `${ENV.PREFIX_PATH ? "/" + ENV.PREFIX_PATH : ""}/${endpoint}`;
};
const initServerRoutes = async (app: Express) => {
  console.log(endpointWithPrefix("iot"));

  app.use(endpointWithPrefix("iot"), iotRouter);
};

export default initServerRoutes;
