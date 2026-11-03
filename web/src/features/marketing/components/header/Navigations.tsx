"use client";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

/**
 * Anclas dentro de la misma landing — no hay páginas separadas de
 * Nosotros/Blog/Portafolio como en la demo (esas no aplican a este SaaS).
 */
export const NavLinks = [
  { title: "Características", href: "#caracteristicas" },
  { title: "Precios", href: "#planes" },
  { title: "Preguntas frecuentes", href: "#faq" },
];

const Navigations = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const StyledButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: "15px",
  }));

  return (
    <>
      {NavLinks.map((navlink) => (
        <StyledButton key={navlink.href} color="inherit" variant="text" href={navlink.href}>
          {navlink.title}
        </StyledButton>
      ))}
    </>
  );
};

export default Navigations;
