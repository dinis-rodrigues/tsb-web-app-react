import { ThemeType } from "react-rainbow-components/components/Application";

const rainbowDarkTheme: ThemeType = {
  rainbow: {
    palette: {
      mainBackground: "#363636",
    },
  },
};

const rainbowWhiteTheme: ThemeType = {
  rainbow: {
    palette: {
      mainBackground: "#fff",
      brand: "#01B6F5",
      error: "#FE4849",
      warning: "#FC0",
      success: "#1DE9B6",
    },
  },
};

const meetingIcons = {
  "General Meeting": `fa fa-globe-europe bg-night-fade`,
  "Electrical Systems Meeting": `fa fa-lightbulb bg-sunny-morning`,
  "Management and Marketing Meeting": `fa fa-chart-line bg-grow-early`,
  "Mechanical Systems Meeting": `fa fa-cogs bg-happy-itmeo`,
  "Design and Composites Meeting": `fa fa-anchor bg-happy-fisher`,
  "Hydrogen Fuel Cell Meeting": `fa fa-atom bg-mixed-hopes`,
};

const departmentColors: {
  "General Meeting": string;
  "Leaders Meeting": string;
  "Electrical Systems Meeting": string;
  "Mechanical Systems Meeting": string;
  "Design and Composites Meeting": string;
  "Management and Marketing Meeting": string;
  "Hydrogen Fuel Cell Meeting": string;
  "Sponsor Meeting": string;
  Competition: string;
  Other: string;
} = {
  "General Meeting": "bg-night-fade",
  "Leaders Meeting": "bg-strong-blis",
  "Electrical Systems Meeting": "bg-sunny-morning",
  "Management and Marketing Meeting": "bg-tempting-azure",
  "Mechanical Systems Meeting": "bg-happy-itmeo",
  "Design and Composites Meeting": "bg-happy-fisher",
  "Hydrogen Fuel Cell Meeting": "bg-mixed-hopes",
  "Sponsor Meeting": "bg-amy-crisp",
  Competition: "bg-amy-crisp",
  Other: "bg-premium-dark",
};

const customInputs: { [key: string]: React.CSSProperties } = {
  datePicker: {
    backgroundColor: "red",
  },
  datePickerDisabled: {
    backgroundColor: "blue !important",
  },
};

export {
  rainbowDarkTheme,
  meetingIcons,
  departmentColors,
  customInputs,
  rainbowWhiteTheme,
};
