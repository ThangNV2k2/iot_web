import express from "express";
import ENV from "./configs/env";
import bodyParser from "body-parser";
import cors from "cors";
import initServerRoutes from "./routes";
import errorHandler from "./middlewares/error-handler";
import { connectMQTT } from "./brokers";
import { MqttClient } from "mqtt";
import { syncDatabase } from "./database";
import { logger } from "./configs/logger";
const app = express();
let mqttClient: MqttClient;
const startUp = async () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(
    cors({
      origin: ENV.ALLOWED_ORIGINS,
      methods: ENV.ALLOWED_METHODS,
      credentials: true,
    })
  );
  await initServerRoutes(app);
  app.use(errorHandler);
  if (ENV.SYNC_DB) {
    await syncDatabase();
  }
};

startUp()
  .then(() => {
    const port = ENV.PORT;

    app.listen(port, () => {
      logger.info(`[server]: Server is running at http://localhost:${port}`);

      mqttClient = connectMQTT();
    });
  })
  .catch((e) => {
    logger.error(e);
  });
