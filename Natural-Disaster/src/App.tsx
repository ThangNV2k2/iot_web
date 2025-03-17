import { Map, Overlay, View } from "ol";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";
import { useEffect, useMemo, useRef, useState } from "react";
import WarningSystem, { WaterLevel } from "./component/NoteShape";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Shape from "./component/Shape";
import { createRoot } from "react-dom/client";
import { Box, Button, Card, CardContent, Divider, Drawer, Stack, Typography, Grid } from "@mui/material";
import { geodeticToECEF } from "./math";
import { connectMQTT } from "./mqtt";
import ChartRover from "./component/ChartRover";
interface IBase {
  device_id: number;
  dev_type: number;
  lat: number;
  lng: number;
  alt: number;
  fix_type: number;
  satellites: number;
  timestamp: Date;
}

type DataStructure = [IBase[], IBase | null, IBase | null, IBase | null];

export default function App() {
  const [drawer, setDrawer] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [moc, setMoc] = useState<[number, number, number]>([0, 0, 0]);
  const [data, setData] = useState({
    "data": [
      {
        "device_id": 2812726964,
        "dev_type": 2,
        "lat": 22.497766,
        "lng": 103.901157,
        "alt": 1268,
        "fix_type": 2,
        "satellites": 48,
        "timestamp": new Date("2025-03-10T17:41:22")
      },
      {
        "device_id": 3918273645,
        "dev_type": 2,
        "lat": 22.502642,
        "lng": 103.909869,
        "alt": 1270,
        "fix_type": 2,
        "satellites": 45,
        "timestamp": new Date("2025-03-10T17:42:35")
      },
      {
        "device_id": 7123456789,
        "dev_type": 2,
        "lat": 22.504926,
        "lng": 103.910596,
        "alt": 1269,
        "fix_type": 3,
        "satellites": 47,
        "timestamp": new Date("2025-03-10T17:42:48")
      },
      {
        "device_id": 8526419730,
        "dev_type": 2,
        "lat": 22.504339,
        "lng": 103.915314,
        "alt": 1272,
        "fix_type": 2,
        "satellites": 44,
        "timestamp": new Date("2025-03-10T17:43:12")
      },
      {
        "device_id": 418302100,
        "dev_type": 3,
        "lat": 22.502476,
        "lng": 103.912851,
        "alt": 1272,
        "fix_type": 2,
        "satellites": 43,
        "timestamp": new Date("2025-03-10T17:41:18"),
        "sensors": { "H1": 171, "H2": -1, "D": "111111" }
      },
      {
        "device_id": 123456789,
        "dev_type": 4,
        "lat": 22.498558,
        "lng": 103.914161,
        "alt": 1271,
        "fix_type": 1,
        "satellites": 39,
        "timestamp": new Date("2025-03-10T17:42:10"),
        "signal_strength": 85
      },
      {
        "device_id": 987654321,
        "dev_type": 1,
        "lat": 22.495414,
        "lng": 103.910340,
        "alt": 1273,
        "fix_type": 3,
        "satellites": 50,
        "timestamp": new Date("2025-03-10T17:43:00"),
        "alert_count": 5
      },
    ],
    "base_station": {
      "mode": 2,
      "ecef_x": -1619338.8093,
      "ecef_y": 5730716.3346,
      "ecef_z": 2276572.7906
    }
  });
  

  const [satLo, mucNuoc, truyenThong, gatWay] = useMemo<DataStructure>(() =>
    data.data.reduce<DataStructure>(
      (acc, item) => {
        if (item.dev_type === 1) acc[3] = item;
        if (item.dev_type === 2 && !acc[0].some(i => i.device_id === item.device_id)) acc[0].push(item);
        if (item.dev_type === 3) acc[1] = item;
        if (item.dev_type === 4) acc[2] = item;
        return acc;
      },
      [[], null, null, null]
    )
    , [data]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const center = useMemo(() => {
    if (!data?.data.length) return fromLonLat([22.497709, 103.897874]);
    const avgLat = data?.data.reduce((sum, d) => sum + d.lat, 0) / data?.data.length;
    const avgLng = data?.data.reduce((sum, d) => sum + d.lng, 0) / data?.data.length;
    return fromLonLat([avgLng, avgLat]);
  }, [data]);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectMQTT((topic, message) => {
      console.log(topic, message);
      // setData(message);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyBDPoRviLuxTEZXN-iEPXD2r58g-yS3tlM`,
          }),
        }),
        new VectorLayer({ source: new VectorSource() }),
      ],
      view: new View({
        center: fromLonLat([103.907575, 22.501523]),
        zoom: 15.2,
      }),
      controls: [],
    });

    const newOverlays = [];
    const devices = [...satLo, mucNuoc, truyenThong, gatWay].filter(Boolean);

    devices.forEach((device) => {
      const { lat, lng } = device;
      const coordinate = fromLonLat([lng, lat]);

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.transform = "translate(-50%, -50%)";

      const overlay = new Overlay({
        position: coordinate,
        positioning: "center-center",
        element: container,
      });

      mapInstance.addOverlay(overlay);
      newOverlays.push(overlay);

      createRoot(container).render(
        <ShowDetail device={device} isOnline moc={moc} setDrawer={() => setDrawer(device)} />
      );
    });

    setOverlays(newOverlays);

    return () => {
      mapInstance.setTarget(undefined);
      newOverlays.forEach((overlay) => mapInstance.removeOverlay(overlay));
    };
  }, [satLo, mucNuoc, truyenThong, gatWay]);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "700px" }} />
      <div>
        <WarningSystem />
      </div>
      <div>
        <ChartRover />
      </div>

      {drawer !== null && <DrawerDetail data={drawer} toggleDrawer={() => setDrawer(null)} moc={[data.base_station.ecef_x, data.base_station.ecef_y, data.base_station.ecef_z]} />}
    </>
  )
}

const DrawerDetail = ({ data, toggleDrawer, moc }: { data: any, toggleDrawer: () => void, moc: [number, number, number] }) => {
  return (
    <Drawer
      open={Boolean(data)}
      onClose={toggleDrawer}
      anchor="right"
      sx={{ "& .MuiDrawer-paper": { width: 350, p: 2 } }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Thông tin chi tiết
      </Typography>

      {data?.dev_type === 2 ? (
        <SatLo device={data} moc={moc} />
      ) : data?.dev_type === 3 ? (
        <MucNuoc device={data} />
      ) : data?.dev_type === 4 ? (
        <MachTruyenThong device={data} />
      ): (
        <Typography variant="body1">No data available</Typography>
      )}
    </Drawer>
  );
};

const MucNuoc = ({ device }: { device: any }) => {
  const h = device.sensors.H1
  const mucNuoc = h <= 40 ? 0 : h <= 80 ? 1 : h <= 120 ? 2 : h <= 160 ? 3 : h <= 200 ? 4 : 5;
  return (
    <>
      <Typography variant="h6" color="primary" fontWeight="bold">
        Mực nước H: {h} cm
      </Typography>
      <WaterLevel isNote={false} mucNuoc={mucNuoc} />
    </>
  )
}

const SatLo = ({ device, moc }: { device: any, moc: [number, number, number] }) => {
  const { lat, lng, alt } = device;
  const [x1, y1, z1] = geodeticToECEF(lat, lng, alt);
  const [x2, y2, z2] = geodeticToECEF(22.496500, 103.899000, 1269);

  const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Rover sạt lở
        </Typography>
        <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mt: 1, fontFamily: "monospace" }}>
          X: {x1.toFixed(2)} <br />
          Y: {y1.toFixed(2)} <br />
          Z: {z1.toFixed(2)}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mt: 1, fontFamily: "monospace" }}>
          X: {x2.toFixed(2)} <br />
          Y: {y2.toFixed(2)} <br />
          Z: {z2.toFixed(2)}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight="bold">
          D:{" "}
          <Typography component="span" color="error" fontWeight="bold">
            {/* {distance.toFixed(2)} cm */}
            3.5 cm
          </Typography>
        </Typography>

        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Reset
        </Button>
      </CardContent>
    </Card>
  );
};

const MachTruyenThong = ({device}:{device:any}) => {
  const items = [
    ["A1", "D1"],
    ["A2", "D2"],
    ["A3", "D3"],
    ["A4", "D4"],
    ["A5", "D5"],
    ["A6", "D6"],
  ];
  return (
    <Grid container spacing={2} direction="column">
      {items.map(([left, right], index) => (
        <Grid container item key={index} justifyContent="center" spacing={2}>
          {[left, right].map((text) => (
            <Grid item key={text}>
              <Box
                sx={{
                  width: 60,
                  height: 40,
                  backgroundColor: `${text === "D5" ? "#00ff00" :"#FFEB99"}`,
                  border: "1px solid red",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "red",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {text}
              </Box>
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  );
};

const ShowDetail = ({ device, isOnline, moc, setDrawer }: { device: any, isOnline: boolean, moc: [number, number, number], setDrawer: () => void }) => {
  const { lat, lng, alt, dev_type } = device;
  const coordinate = fromLonLat([lng, lat]);
  const [color, setColor] = useState("");

  if (dev_type === 1) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
        <Shape
          shape="rectangle"
          color={isOnline ? "#00ff00" : "gray"}
          border
          borderColor="#8B0000"
          onClick={setDrawer}
          text={
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
              <Typography fontSize={10} fontWeight={500} color="red" display="block">GATE WAY</Typography>
              <Typography fontSize={10} fontWeight={500} color="blue" display="block">CẢNH BÁO</Typography>
            </Box>
          }
          size={50}
        />

        <Shape
          shape="hexagon"
          size={40}
          color={"purple"}
          border
          borderColor="#8B0000"
        />
      </Box>
    )
  }

  if (dev_type === 2) {
    const [x1, y1, z1] = geodeticToECEF(lat, lng, alt);
    const [x2, y2, z2] = geodeticToECEF(22.496500, 103.899000, 1268);

    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
    return (
      <Shape
        shape="circle"
        size={16}
        // color={!isOnline ? "gray" : distance <= 5 ? "#00ff00" : distance <= 20 ? "yellow" : "red"}
        color="#00ff00"
        border
        borderColor="blue"
        borderSize={1}
        onClick={setDrawer}
      />
    );
  }

  if (dev_type === 3) {
    return (
      <Shape
        shape="square"
        size={28}
        color={isOnline ? "#00ff00" : "gray"}
        border
        borderColor="#8B0000"
        onClick={setDrawer}
      />
    )
  }

  if (dev_type === 4) {
    return (
      <Stack spacing={1}>
        {/* <Typography color="yellow" display="inline-block">Mạch truyền thông</Typography> */}
        <Shape
          shape="ellipse"
          size={40}
          color="#00ff00"
          border
          borderColor="red"
          borderSize={1}
          onClick={setDrawer}
        />
      </Stack>
    )
  }

  return <></>
}
