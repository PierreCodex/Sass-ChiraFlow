"use client";
import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import { IconArrowUp } from "@tabler/icons-react";

/** Copiado tal cual de `shared/scroll-to-top` — 100% genérico, sin nada que adaptar. */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.pageYOffset > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <Fab
      color="primary"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      sx={{ position: "fixed", right: "30px", bottom: "30px" }}
    >
      <IconArrowUp size={24} />
    </Fab>
  );
};

export default ScrollToTop;
