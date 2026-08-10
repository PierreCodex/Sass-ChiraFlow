"use client";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { IconSearch } from "@tabler/icons-react";

interface Props {
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
}

/** Campo de búsqueda para la cabecera de las tablas. */
const BuscadorTabla = ({ valor, onChange, placeholder = "Buscar…" }: Props) => (
  <TextField
    size="small"
    value={valor}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    sx={{ minWidth: { xs: "100%", sm: 240 } }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <IconSearch size={18} />
          </InputAdornment>
        ),
      },
    }}
  />
);

export default BuscadorTabla;
