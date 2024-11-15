import { ThemeVars } from "@mysten/dapp-kit";

export const cityTheme: ThemeVars = {
  blurs: {
    modalOverlay: "blur(10px)",
  },
  backgroundColors: {
    primaryButton: "white",
    primaryButtonHover: "rgb(0, 0, 0, 0.3)",
    outlineButtonHover: "#F4F4F5",
    modalOverlay: "rgba(24 36 53 / 10%)",
    modalPrimary: "white",
    modalSecondary: "#F7F8F8",
    iconButton: "#F0F1F2",
    iconButtonHover: "white",
    dropdownMenu: "rgba(24 36 53 / 10%)",
    dropdownMenuSeparator: "#F7F8F8",
    walletItemSelected: "white",
    walletItemHover: "#3C424226",
  },
  borderColors: {
    outlineButton: "#E4E4E7",
  },
  colors: {
    primaryButton: "#373737",
    outlineButton: "#373737",
    iconButton: "#000000",
    body: "#182435",
    bodyMuted: "#767A81",
    bodyDanger: "#FF794B",
  },
  radii: {
    small: "4px",
    medium: "4px",
    large: "6px",
    xlarge: "8px",
  },
  shadows: {
    primaryButton: "2px 4px 0px rgba(0, 0, 0, 0.2)",
    walletItemSelected: "20px 4px 0px rgba(0, 0, 0, 0.2)",
  },
  fontWeights: {
    normal: "normal",
    medium: "normal",
    bold: "normal",
  },
  fontSizes: {
    small: "100%",
    medium: "100%",
    large: "120%",
    xlarge: "120%",
  },
  typography: {
    fontFamily: '"Helvetica" ,"Helvetica Light","Helvetica Bold"',
    fontStyle: "normal",
    lineHeight: "1.3",
    letterSpacing: "1",
  },
};
