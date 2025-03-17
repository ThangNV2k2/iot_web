import React, { useState, useMemo } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateFakeData = (startDate: Dayjs, endDate: Dayjs) => {
    const data = [];
    let currentDate = startDate;
  
    // Giá trị ban đầu của từng rover
    let rover1 = Math.floor(Math.random() * 100) + 50;
    let rover2 = Math.floor(Math.random() * 100) + 50;
    let rover3 = Math.floor(Math.random() * 100) + 50;
    let rover4 = Math.floor(Math.random() * 100) + 50;
  
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const getNextValue = (currentValue: number) => {
        const delta = Math.floor(Math.random() * 6) + 5;
        return Math.max(0, Math.min(240, currentValue + (Math.random() < 0.5 ? -delta : delta)));
      };
  
      rover1 = getNextValue(rover1);
      rover2 = getNextValue(rover2);
      rover3 = getNextValue(rover3);
      rover4 = getNextValue(rover4);
  
      data.push({
        date: currentDate.format("YYYY-MM-DD"),
        rover1,
        rover2,
        rover3,
        rover4,
      });
  
      currentDate = currentDate.add(1, "day");
    }
  
    return data;
  };

// Hàm xác định màu sắc theo giá trị
const getColor = (value: number) => {
  if (value <= 40) return "#A9A9A9"; // Màu xám cho 0-40
  if (value <= 80) return "#4CAF50"; // Xanh lá cho 41-80
  if (value <= 120) return "#2196F3"; // Xanh dương cho 81-120
  if (value <= 160) return "#FFEB3B"; // Vàng cho 121-160
  if (value <= 200) return "#FF9800"; // Cam cho 161-200
  return "#D32F2F"; // Đỏ cho 201-240
};

const CustomAreaChart = ({ data, dataKey, title }: { data: any[], dataKey: string, title: string }) => {
    return (
      <Box sx={{ height: 300, width: '100%' }}>
        <Typography variant="h6">{title}</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
          >
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#36A2EB" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              angle={45} 
              textAnchor="start" 
              height={60} 
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              domain={[0, 240]}
              label={{ value: "", angle: -90, position: "insideLeft", dx: -20 }}
            />
            <Tooltip 
              formatter={(value) => [`${value} cm`, dataKey]}
              labelFormatter={(label) => `Ngày: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#36A2EB" 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              isAnimationActive={false}
              name={title}
              dot={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  

const ChartRover = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(15, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const data = useMemo(() => generateFakeData(startDate, endDate), [startDate, endDate]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Chọn khoảng ngày */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption">Từ ngày</Typography>
            <DatePicker
              value={startDate}
              onChange={(newValue) => setStartDate(newValue ?? dayjs())}
              maxDate={endDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption">Đến ngày</Typography>
            <DatePicker
              value={endDate}
              onChange={(newValue) => setEndDate(newValue ?? dayjs())}
              minDate={startDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {["rover1", "rover2", "rover3", "rover4"].map((rover, index) => (
          <Grid item xs={12} md={6} key={index}>
            <CustomAreaChart 
              data={data} 
              dataKey={rover} 
              title={`Rover ${index + 1} sạt lở`} 
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChartRover;