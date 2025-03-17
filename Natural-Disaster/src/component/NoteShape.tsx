import { Box, Typography } from "@mui/material";
import Shape from "./Shape";

const WarningIcon = ({ color, text }: { color: string, text: string }) => (
  <Box display="flex" alignItems="center" mb={1}>
    <Shape shape="circle" color={color} size={20} border borderColor="blue" borderSize={1} />
    <Typography variant="body2" ml={1} color="red">{text}</Typography>
  </Box>
);

export const WaterLevel = ({mucNuoc, isNote = true}: {mucNuoc: number, isNote: boolean}) => {
  const levels = ["red", "#ffcc00", "yellow", "#0000ff", "#00ff00", "white"];
  return (
    <Box display="flex" flexDirection="row" alignItems="start">
      <Box display="flex" flexDirection="column">
        {levels.map((color, index) => (
          <Box key={index} display="flex" alignItems="center">
            <Shape shape="square" color={color} size={16} paddingY={2} border borderSize={1} borderColor="#8B0000" />
            {isNote && index === 0 && <Typography variant="body2" color="red" paddingInlineStart={2} marginBlockEnd={2}>Mực nước có 6 mức nước. Khi nước ở mức nào thì mũi tên sẽ chỉ vào ô đó</Typography>}
            {mucNuoc === 5 - index && (
              <Box minWidth="80px" marginLeft={1}>
                <Typography variant="body1" color="red">
                  ⬅ MỨC NƯỚC
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default function WarningSystem() {
  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" p={3}>
      <Box>
        <WarningIcon color="gray" text="Đây là ICON cho các mạch cảnh báo sạt lở khi chưa có kết nối ONLINE VỚI SERVER" />
        <WarningIcon color="#00ff00" text="Đây là ICON cho các mạch cảnh báo sạt lở khi có kết nối ONLINE VỚI SERVER  " />
        <WarningIcon color="yellow" text="Đây là ICON cho các mạch cảnh báo sạt lở khi sạt lở mức trung bình" />
        <WarningIcon color="red" text="ICON cảnh báo nguy hiểm" />
      </Box>
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Shape shape="square" color="gray" size={40} border borderSize={1} borderColor="#8B0000" />
          <Typography variant="body2" color="red">Đo mức nước dâng túi nước khi chưa Online</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Shape shape="square" color="#00ff00" size={40} border borderSize={1} borderColor="#8B0000" />
          <Typography variant="body2" color="red">Đo mức nước dâng túi nước khi chưa Online</Typography>
        </Box>
      </Box>
      <WaterLevel mucNuoc={0} />
    </Box>
  );
}