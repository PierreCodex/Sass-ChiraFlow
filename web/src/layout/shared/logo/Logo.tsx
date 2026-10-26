'use client'
import { CustomizerContext } from "@/context/customizerContext";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import config from '@/context/config'
import Image from "next/image";
import { useContext } from "react";

/*
 * El logo de tivu: símbolo a la izquierda y la palabra detrás. Con el menú
 * plegado el enlace mide 40 px y solo asoma el símbolo, que ocupa ~38 px a
 * esta altura. Por eso el símbolo tiene que ir siempre a la izquierda,
 * también en RTL: el logo de una marca no se espeja.
 *
 * Dos versiones porque la palabra es azul profundo: en modo oscuro se usa la
 * de texto blanco. El símbolo es el mismo en las dos.
 */
const ALTO_LOGO = 36;
const ANCHO_LOGO = 112; // 498 × 160 px en origen

/** `href`: a dónde lleva. El panel va a `/`; la landing, a sí misma. */
const Logo = ({ href = "/" }: { href?: string }) => {
  const { isCollapse, isSidebarHover, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,

    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  }));

  return (
    <LinkStyled href={href}>
      <Image
        src={activeMode === "dark" ? "/images/logos/tivu-logo-blanco.png" : "/images/logos/tivu-logo.png"}
        alt="tivu"
        height={ALTO_LOGO}
        width={ANCHO_LOGO}
        style={{ flexShrink: 0 }}
        priority
      />
    </LinkStyled>
  );
};

export default Logo;
