import { Map, Overlay, View } from "ol";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WarningSystem, { WaterLevel } from "./component/NoteShape";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Shape from "./component/Shape";
import { createRoot } from "react-dom/client";
import { Box, Button, Card, CardContent, Divider, Drawer, Grid, Stack, Typography, } from "@mui/material";
import { ecefToGeodetic, geodeticToECEF } from "./math";
import { connectMQTT } from "./mqtt";
import ChartRover from "./component/ChartRover";
import axiosInstance from "./axios";
import _ from "lodash";
import { forEach, intersect } from "mathjs";
import OffPre from "./assets/img/off_re.png";
import LuSatLo from "./assets/img/lu_satlo-removebg-preview (1).png";
import SatLoWarning from "./assets/img/sat_lo-removebg-preview.png";
import H4 from "./assets/img/h_4-removebg-preview.png";

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

type DataStructure = [IBase[], IBase | null, IBase | null];
interface BaseStation {
    ecef_x: number;
    ecef_y: number;
    ecef_z: number;
    mode: number;
}

export default function App() {
    const [drawer, setDrawer] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [statisticals, setStatisticals] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [virtualData, setVirtualData] = useState([]);
    const [isVirtual, setIsVirtual] = useState(false);
    const [baseStation, setBaseStation] = useState<BaseStation>({
        ecef_x: -1619338.8093,
        ecef_y: 5730716.3346,
        ecef_z: 2276572.7906,
        mode: 2
    });

    useEffect(() => {
        axiosInstance.get("/iot/statisticals").then(({ data }) => {
            return setStatisticals(data);
        });

        connectMQTT((topic, message) => {
            if (topic === "langsan/data") {
                setStatisticals(_.unionWith(statisticals, message.data, _.isEqual));
            }
            if (topic === "langsan/virtual") {
                if (message.enable_virtual) {
                    setIsVirtual(true);
                    if (Array.isArray(message.virtual_cm)) {
                        const virtual = message.virtual_cm.forEach((item, index) => {
                            const device = {
                                label: `Sạt lở ${index + 1}`,
                                data: [{
                                    chartData: item,
                                    timestamp: new Date(),
                                }]
                            }
                            setVirtualData((prev) => {
                                const index = prev.findIndex((i) => i.label === device.label);
                                if (index !== -1) {
                                    const newData = [...prev[index].data, device.data[0]];
                                    const newPrev = [...prev];
                                    newPrev[index] = { ...prev[index], data: newData };
                                    return newPrev;
                                } else {
                                    return [...prev, { label: device.label, data: [device.data[0]] }];
                                }
                            });
                        });
                    }
                } else {
                    setIsVirtual(false);
                }
            }
            console.log("MQTT", topic, message);
        });
    }, []);

    useEffect(() => {
        axiosInstance
            .get("/iot/milestones")
            .then(({ data }) => data && setMilestones(data));
    }, [setMilestones]);

    const [satLo, mucNuoc, truyenThong] = useMemo<DataStructure>(
        () =>
            statisticals?.reduce<DataStructure>(
                (acc, item) => {
                    if (
                        item.dev_type === 2 &&
                        !acc[0].some((i) => i.device_id === item.device_id)
                    )
                        acc[0].push(item);
                    if (item.dev_type === 3) acc[1] = item;
                    if (item.dev_type === 4) {
                        item.lat = 10.731839
                        item.lng = 106.697546
                        acc[2] = item
                    };
                    return acc;
                },
                [[], null, null]
            ),
        [statisticals.toString()]
    );
    const gateWay = useMemo(() => {
        const [lat, lng, alt] = ecefToGeodetic(baseStation.ecef_x, baseStation.ecef_y, baseStation.ecef_z);
        return {
            device_id: 1,
            dev_type: 1,
            lat: lat,
            lng: lng,
            alt: alt,
            fix_type: 1,
            satellites: 10,
            timestamp: new Date(),
        };
        // return {
        //     device_id: 1,
        //     dev_type: 1,
        //     lat: 10.731734956192984,
        //     lng: 106.69803721044785,
        //     alt: 1268,
        //     fix_type: 1,
        //     satellites: 10,
        //     timestamp: new Date(),
        // };
    }, [baseStation]);
    const canhBaoTypeF = () => {
        const distance = (curr) => {
            const milestone = milestones.find(
                (m) => m.device_id === curr.device_id
            );
            if (!milestone) {
                return 0;
            }
            const [x1, y1, z1] = geodeticToECEF(
                milestone.lat,
                milestone.lng,
                milestone.alt
            );

            const [x2, y2, z2] = geodeticToECEF(curr.lat, curr.lng, curr.alt);

            return Math.sqrt(
                (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2
            );
        };


        const canhBaoSatLo = satLo.length == 0 ? 0 : satLo.reduce((sum, d) => sum + distance(d), 0) / satLo.length;
        const h = mucNuoc?.sensors?.H1 ?? 0;
        const canhBaoTruyenThong = (typeof truyenThong?.sensors?.D !== String) ? false : (truyenThong?.sensors?.D.split("0").length - 1) < 3 ? false : true;
        if (canhBaoSatLo < 20 && h < 120 && !canhBaoTruyenThong) return 1;
        if (canhBaoSatLo > 20 && h < 120 && !canhBaoTruyenThong) return 2;
        if (canhBaoSatLo < 20 && (h >= 120 || canhBaoTruyenThong)) return 3;
        if (canhBaoSatLo >= 20 && h >= 120 && canhBaoTruyenThong) return 4;
        return 0;
    }

    const center = useMemo(() => {
        if (!satLo || satLo.length === 0) return fromLonLat([106.69803721044785, 10.731734956192984]);
        const avgLat =
            satLo?.reduce((sum, d) => sum + d.lat, 0) / satLo?.length;
        const avgLng =
            satLo?.reduce((sum, d) => sum + d.lng, 0) / satLo?.length;
        return fromLonLat([avgLng, avgLat]);
    }, [satLo]);

    const newOverlays = [];
    const devices = [...satLo, mucNuoc, truyenThong, gateWay].filter(Boolean);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    const overlayRefs = useRef<Overlay[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new Map({
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
                    center: center,
                    zoom: 18,
                }),
                controls: [],
            });
        }

        const mapInstance = mapInstanceRef.current;
        const type = canhBaoTypeF();

        overlayRefs.current.forEach((overlay) => mapInstance.removeOverlay(overlay));
        overlayRefs.current = []; 

        const newOverlays: Overlay[] = devices.map((device) => {
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

            createRoot(container).render(
                <ShowDetail device={device} isOnline setDrawer={() => setDrawer(device)} type={type} />
            );

            return overlay;
        });

        overlayRefs.current = newOverlays;

    }, [satLo, mucNuoc, truyenThong, gateWay, center]);


    const chartDataSet = useMemo(() => {
        const set = [];
        const { satLo } = statisticals.reduce((prev, curr) => {
            if (curr.dev_type === 2) {
                if (!prev.satLo) {
                    prev.satLo = [];
                }
                const distance = (() => {
                    const milestone = milestones.find(
                        (m) => m.device_id === curr.device_id
                    );
                    if (!milestone) {
                        return 0;
                    }
                    const [x1, y1, z1] = geodeticToECEF(
                        milestone.lat,
                        milestone.lng,
                        milestone.alt
                    );

                    const [x2, y2, z2] = geodeticToECEF(curr.lat, curr.lng, curr.alt);

                    return Math.sqrt(
                        (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2
                    );
                })();

                prev.satLo.push({
                    ...curr,
                    chartData: distance,
                });
            }
            // else if (curr.dev_type === 3) {
            //     if (!prev.mucNuoc) {
            //         prev.mucNuoc = [];
            //     }

            //     prev.mucNuoc.push({...curr, chartData: curr?.sensors?.H1 ?? 0});
            // }

            return prev;
        }, {});
        if (satLo) {
            Object.values(_.groupBy(satLo, 'device_id')).forEach((deviceData, index) => {
                set.push({
                    label: "Sạt lở " + (index + 1),
                    type: 2,
                    data: deviceData,
                });
            })
        }
        // if (mucNuoc) {
        //     Object.values(_.groupBy(mucNuoc, 'device_id')).forEach((deviceData, index) => {
        //         set.push({
        //             label: "Mực nước " + (index + 1),
        //             type: 3,
        //             data: deviceData,
        //         });
        //     })
        // }

        return set;
    }, [milestones, statisticals]);
    const h = mucNuoc?.sensors?.H1 ?? 0;
    const mucNuocCurr = h <= 40 ? 0 : h <= 80 ? 1 : h <= 120 ? 2 : h <= 160 ? 3 : h <= 200 ? 4 : 5;
    return (
        <>
            <div ref={mapRef} style={{ width: "100%", height: "700px" }} />
            <div>
                <WarningSystem mucNuoc={mucNuocCurr} />
            </div>
            <div>
                <ChartRover dataSet={isVirtual ? virtualData : chartDataSet} />
            </div>

            {drawer !== null && (
                <DrawerDetail
                    data={drawer}
                    toggleDrawer={() => setDrawer(null)}
                    type={canhBaoTypeF()}
                />
            )}
        </>
    );
}

const DrawerDetail = ({
    data,
    toggleDrawer,
    type
}: {
    data: any;
    toggleDrawer: () => void;
    type: number
}) => {
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
                <SatLo device={data} />
            ) : data?.dev_type === 3 ? (
                <MucNuoc device={data} />
            ) : data?.dev_type === 4 ? (
                <MachTruyenThong device={data} />
            ) : (
                <GatWay type={type} width={70} height={50} />
            )}
        </Drawer>
    );
};

const MucNuoc = ({ device }: { device: any }) => {
    const h = device.sensors.H1;
    const mucNuoc =
        h <= 40 ? 0 : h <= 80 ? 1 : h <= 120 ? 2 : h <= 160 ? 3 : h <= 200 ? 4 : 5;
    return (
        <>
            <Typography variant="h6" color="primary" fontWeight="bold">
                Mực nước H: {h} cm
            </Typography>
            <WaterLevel isNote={false} mucNuoc={mucNuoc} />
        </>
    );
};

const SatLo = ({
    device,
}: {
    device: any;
}) => {
    const { lat, lng, alt, device_id } = device;
    const [milestones, setMilestones] = useState(device);

    const [x1, y1, z1] = geodeticToECEF(
        milestones.lat,
        milestones.lng,
        milestones.alt
    );

    const [x2, y2, z2] = geodeticToECEF(lat, lng, alt);

    useEffect(() => {
        axiosInstance
            .get("/iot/milestones/" + device_id)
            .then(({ data }) => data && setMilestones(data));
    }, [device_id, setMilestones]);

    const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

    const handleReset = useCallback(() => {
        axiosInstance
            .post("/iot/save-milestone", {
                data: { lat, lng, alt, device_id },
            })
            .then(() => setMilestones({ lat, lng, alt, device_id }));
    }, [axiosInstance, setMilestones, lat, lng, alt, device_id]);

    return (
        <Card sx={{ boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" color="primary" fontWeight="bold">
                    Rover sạt lở
                </Typography>
                <Box
                    sx={{
                        bgcolor: "#f5f5f5",
                        p: 2,
                        borderRadius: 2,
                        mt: 1,
                        fontFamily: "monospace",
                    }}
                >
                    X: {x1.toFixed(2)} <br />
                    Y: {y1.toFixed(2)} <br />
                    Z: {z1.toFixed(2)}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                    sx={{
                        bgcolor: "#f5f5f5",
                        p: 2,
                        borderRadius: 2,
                        mt: 1,
                        fontFamily: "monospace",
                    }}
                >
                    X: {x2.toFixed(2)} <br />
                    Y: {y2.toFixed(2)} <br />
                    Z: {z2.toFixed(2)}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" fontWeight="bold">
                    D:{" "}
                    <Typography component="span" color="error" fontWeight="bold">
                        {distance.toFixed(2)} cm
                    </Typography>
                </Typography>

                <Button
                    onClick={handleReset}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Reset
                </Button>
            </CardContent>
        </Card>
    );
};

const MachTruyenThong = ({ device }: { device: any }) => {
    const items = [
        ["A1", "D1"],
        ["A2", "D2"],
        ["A3", "D3"],
        ["A4", "D4"],
        ["A5", "D5"],
        ["A6", "D6"],
    ];
    const { sensors } = device;
    const [d1, d2, d3, d4, d5] = sensors.D;
    const checkPress = (text: string) => {
        if (text === "D5" && d5 === 0) return true;
        if (text === "D4" && d4 === 0) return true;
        if (text === "D3" && d3 === 0) return true;
        if (text === "D2" && d2 === 0) return true;
        if (text === "D1" && d1 === 0) return true;
        return false;
    }
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
                                    backgroundColor: `${checkPress(text) ? "#00ff00" : "#FFEB99"}`,
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

const GatWay = ({ type, width, height }: { type: number; width: number, height: number }) => {
    return (
        <div>
            <img src={type == 1 ? OffPre : type == 2 ? SatLoWarning : type == 3 ? H4 : LuSatLo} alt="gateway" height={height} />
        </div>
    )
}

const ShowDetail = ({
    device,
    isOnline,
    setDrawer,
    type
}: {
    device: any;
    isOnline: boolean;
    setDrawer: () => void;
    type: number
}) => {
    const { lat, lng, alt, dev_type } = device;
    const coordinate = fromLonLat([lng, lat]);
    const [color, setColor] = useState("");

    if (dev_type === 1) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <GatWay width={35} height={35} type={type} />
                <Shape
                    shape="rectangle"
                    color={isOnline ? "#00ff00" : "gray"}
                    border
                    borderColor="#8B0000"
                    onClick={setDrawer}
                    text={
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                fontSize={8}
                                fontWeight={500}
                                color="red"
                                display="block"
                            >
                                GATE WAY
                            </Typography>
                            <Typography
                                fontSize={8}
                                fontWeight={500}
                                color="blue"
                                display="block"
                            >
                                CẢNH BÁO
                            </Typography>
                        </Box>
                    }
                    size={32}
                />

                <Shape
                    shape="hexagon"
                    size={30}
                    color={"purple"}
                    border
                    borderColor="#8B0000"
                />
            </Box>
        );
    }

    if (dev_type === 2) {
        const [x1, y1, z1] = geodeticToECEF(lat, lng, alt);
        const [x2, y2, z2] = geodeticToECEF(22.4965, 103.899, 1268);

        const distance = Math.sqrt(
            Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2)
        );
        return (
            <Shape
                shape="circle"
                size={15}
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
                size={20}
                color={isOnline ? "#00ff00" : "gray"}
                border
                borderColor="#8B0000"
                onClick={setDrawer}
            />
        );
    }

    if (dev_type === 4) {
        return (
            <Stack spacing={1}>
                {/* <Typography color="yellow" display="inline-block">Mạch truyền thông</Typography> */}
                <Shape
                    shape="ellipse"
                    size={25}
                    color="#00ff00"
                    border
                    borderColor="red"
                    borderSize={1}
                    onClick={setDrawer}
                />
            </Stack>
        );
    }

    return <></>;
};
