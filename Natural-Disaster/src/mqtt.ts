import mqtt from "mqtt";

export const connectMQTT = (onMessage: (topic: string, payload: Object) => void) => {
  const MQTT_BROKER_WS = "wss://broker.emqx.io:8084/mqtt";

  const MQTT_TOPIC = "langsan/data";
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

  const client = mqtt.connect(MQTT_BROKER_WS, {
    clientId,
    username: "",
    password: "",
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    console.log("Connected");

    client.subscribe(MQTT_TOPIC, { qos: 0 });
  });

  client.on("message", (topic, message) => {
    onMessage(topic, JSON.parse(message.toString()))
  });

  client.on("error", (err) => {
    console.error("❌ Failed to connect mqtt:", err);
  });

  client.on("reconnect", () => {
    console.log("🔄 Reconnecting...");
  });

  return client;
};
