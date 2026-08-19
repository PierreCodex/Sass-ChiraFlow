'use client'
import { CustomizerContext } from "@/context/customizerContext";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import config from '@/context/config'
import Image from "next/image";
import { useContext } from "react";

interface Props {
  /** A dónde lleva el logo al hacer click. Por defecto, el dashboard del negocio. */
  href?: string;
}

const Logo = ({ href = "/" }: Props) => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,

    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "block",
  }));

  if (activeDir === "ltr") {
    return (
      <LinkStyled href={href}>
        {activeMode === "dark" ? (
          <Image
            src="/images/logos/light-logo.svg"
            alt="logo"
            height={TopbarHeight}
            width={174}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/dark-logo.svg"}
            alt="logo"
            height={TopbarHeight}
            width={174}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href={href}>
      {activeMode === "dark" ? (
        <Image
          src="/images/logos/dark-rtl-logo.svg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      ) : (
        <Image
          src="/images/logos/light-logo-rtl.svg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
