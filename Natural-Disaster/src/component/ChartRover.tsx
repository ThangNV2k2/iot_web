import React, {useMemo, useState} from "react";
import {Box, Grid, MenuItem, Select, Stack, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {Dayjs} from "dayjs";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const calculateDataByDate = (data) => {
    const formatDate = (timestamp) => dayjs(timestamp).format('DD-MM-YYYY');

    const groupedData = data.reduce((acc, record) => {
        const date = formatDate(record.timestamp);
        if (!acc[date]) acc[date] = {total: 0, count: 0};

        acc[date].total += record.chartData;
        acc[date].count += 1;

        return acc;
    }, {});

    return Object.entries(groupedData).map(([time, values]) => ({
        time,
        chartData: values.count ? values.total / values.count : 0
    }));
}

const calculateDataByMinute = (data) => {
    const formatDate = (timestamp) => dayjs(timestamp).format('HH:mm DD-MM-YYYY');

    const groupedData = data.reduce((acc, record) => {
        const time = formatDate(record.timestamp);
        if (!acc[time]) acc[time] = {total: 0, count: 0};

        acc[time].total += record.chartData;
        acc[time].count += 1;

        return acc;
    }, {});

    return Object.entries(groupedData).map(([time, values]) => ({
        time,
        chartData: values.count ? values.total / values.count : 0
    }));
}

const calculateDataByHour = (data) => {
    const formatDate = (timestamp) => dayjs(timestamp).format('HH DD-MM-YYYY');

    const groupedData = data.reduce((acc, record) => {
        const time = formatDate(record.timestamp);
        if (!acc[time]) acc[time] = {total: 0, count: 0};

        acc[time].total += record.chartData;
        acc[time].count += 1;

        return acc;
    }, {});

    return Object.entries(groupedData).map(([time, values]) => ({
        time,
        chartData: values.count ? values.total / values.count : 0
    }));
}

const CustomAreaChart = ({data, dataKey, title, statisticBy = 'time', startTime, endTime}: {
    data: any[],
    dataKey: string,
    title: string,
    statisticBy: 'date' | 'hour' | 'minute',
    startTime: string,
    endTime: string,
}) => {
    const resolvedData = useMemo(() => {
        const filteredDataByDateRange = data.filter(record => {
            const recordTime = dayjs(record.timestamp);
            return (recordTime.isAfter(dayjs(startTime).subtract(1, 'day')) && recordTime.isBefore(dayjs(endTime).add(1, 'day')));
        });

        if (statisticBy === 'minute') {
            return calculateDataByMinute(filteredDataByDateRange)
        } else if (statisticBy === 'hour') {
            return calculateDataByHour(filteredDataByDateRange)
        }
        return calculateDataByDate(filteredDataByDateRange);
    }, [data, endTime, startTime, statisticBy]);

    return (
        <Box sx={{height: 300, width: '100%'}}>
            <Typography variant="h6" color={'primary'}>{title}</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={resolvedData}
                    margin={{top: 5, right: 30, left: 20, bottom: 50}}
                >
                    <defs>
                        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#36A2EB" stopOpacity={0.2}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis
                        dataKey="time"
                        angle={45}
                        textAnchor="start"
                        height={60}
                        tick={{fontSize: 10}}
                    />
                    <YAxis
                        domain={[0, 60]}
                        label={{value: "", angle: -90, position: "insideLeft", dx: -20}}
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


const ChartRover = (props) => {
    const {dataSet} = props;
    const [startDate, setStartDate] = useState(dayjs().subtract(15, "day"));
    const [endDate, setEndDate] = useState(dayjs());
    const [statisticalType, setStatisticalType] = useState('date');

    return (
        <Box sx={{p: 2}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="h6" color={'primary'}>Từ ngày</Typography>
                        <DatePicker
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue ?? dayjs())}
                            maxDate={endDate}
                            slotProps={{textField: {size: 'small', fullWidth: true}}}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" color={'primary'}>Đến ngày</Typography>
                        <DatePicker
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue ?? dayjs())}
                            minDate={startDate}
                            slotProps={{textField: {size: 'small', fullWidth: true}}}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>
            <Stack direction="column">
                <Typography variant={'h6'} color={'primary'}>Thống kê theo</Typography>
                <Select
                    variant={'outlined'}
                    value={statisticalType}
                    onChange={(value) => setStatisticalType(value.target.value)}
                >
                    <MenuItem value={'date'}>Ngày</MenuItem>
                    <MenuItem value={'hour'}>Giờ</MenuItem>
                    <MenuItem value={'minute'}>Phút</MenuItem>
                </Select>
            </Stack>
            <Grid container spacing={2} sx={{mt: 2}}>
                {dataSet.map((rover, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <CustomAreaChart
                            data={rover.data}
                            dataKey={'chartData'}
                            title={rover.label}
                            startTime={startDate}
                            endTime={endDate}
                            statisticBy={statisticalType}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ChartRover;