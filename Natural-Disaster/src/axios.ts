import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://luquetvasatlodat.io.vn/api",
});

export default axiosInstance;