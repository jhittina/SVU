import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

/**
 * Modern DateInput component — use throughout the app.
 * Props:
 *  label:    string
 *  value:    string (YYYY-MM-DD) or dayjs object
 *  onChange: (dateString: string) => void
 *  size:     "small" | "medium"
 *  fullWidth: boolean
 *  ...rest:  passed to DatePicker
 */
export default function DateInput({
  label,
  value,
  onChange,
  size = "small",
  fullWidth = true,
  ...rest
}) {
  const handleChange = (newVal) => {
    if (newVal && newVal.isValid()) {
      onChange(newVal.format("YYYY-MM-DD"));
    } else {
      onChange("");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size,
            fullWidth,
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                background: "rgba(255,255,255,0.03)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(255,255,255,0.06)",
                },
                "&.Mui-focused": {
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "0 0 0 2px rgba(139,92,246,0.25)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(148,163,184,0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(139,92,246,0.4)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#94a3b8",
                "&.Mui-focused": { color: "#8b5cf6" },
              },
              "& .MuiSvgIcon-root": {
                color: "#8b5cf6",
              },
            },
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                bgcolor: "#1e293b",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: 3,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              },
              "& .MuiPickersDay-root": {
                color: "#f1f5f9",
                borderRadius: 2,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "rgba(139,92,246,0.15)",
                },
                "&.Mui-selected": {
                  bgcolor: "#8b5cf6 !important",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
                  "&:hover": {
                    bgcolor: "#7c3aed !important",
                  },
                },
                "&.MuiPickersDay-today": {
                  border: "1px solid #ff6b35",
                  color: "#ff6b35",
                  fontWeight: 600,
                },
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "#64748b",
                fontWeight: 600,
                fontSize: 12,
              },
              "& .MuiPickersCalendarHeader-root": {
                color: "#f1f5f9",
                "& .MuiPickersCalendarHeader-label": {
                  fontWeight: 700,
                  color: "#f1f5f9",
                },
                "& .MuiIconButton-root": {
                  color: "#8b5cf6",
                  "&:hover": {
                    bgcolor: "rgba(139,92,246,0.15)",
                  },
                },
              },
              "& .MuiPickersYear-yearButton": {
                color: "#f1f5f9",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "rgba(139,92,246,0.15)",
                },
                "&.Mui-selected": {
                  bgcolor: "#8b5cf6 !important",
                  color: "#fff",
                  fontWeight: 700,
                },
              },
              "& .MuiPickersMonth-monthButton": {
                color: "#f1f5f9",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "rgba(139,92,246,0.15)",
                },
                "&.Mui-selected": {
                  bgcolor: "#8b5cf6 !important",
                  color: "#fff",
                  fontWeight: 700,
                },
              },
              "& .MuiPickersArrowSwitcher-root .MuiIconButton-root": {
                color: "#8b5cf6",
              },
              "& .MuiDialogActions-root .MuiButton-root": {
                color: "#8b5cf6",
                fontWeight: 600,
              },
            },
          },
        }}
        {...rest}
      />
    </LocalizationProvider>
  );
}
