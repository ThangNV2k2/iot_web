import { logger } from "../configs/logger";
import mqtt from "mqtt";
import IotService from "../routes/iot-data/iot.service";

export const connectMQTT = () => {
  const MQTT_BROKER_WS = "wss://broker.emqx.io:8084/mqtt";

  const MQTT_DATA_TOPIC = "langsan/data";
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

  const client = mqtt.connect(MQTT_BROKER_WS, {
    clientId,
    username: "",
    password: "",
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    console.log("Connected");

    client.subscribe(MQTT_DATA_TOPIC, { qos: 1 });
  });

  client.on("message", (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    if (topic === MQTT_DATA_TOPIC) {
      try {
        const { data, base_station } = JSON.parse(message.toString());
        if(data){
          IotService.saveStatisticals(data);
          IotService.saveBaseStation(base_station);
        }
      } catch (e) {
        logger.error(e);
      }
    }
  });

  client.on("error", (err) => {
    console.error("❌ Failed to connect mqtt:", err);
  });

  client.on("reconnect", () => {
    console.log("🔄 Reconnecting...");
  });

  return client;
};
