const meetingIcons = {
  "General Meeting": `fa fa-globe-europe bg-night-fade`,
  "Electrical Systems Meeting": `fa fa-lightbulb bg-sunny-morning`,
  "Management and Marketing Meeting": `fa fa-chart-line bg-grow-early`,
  "Mechanical Systems Meeting": `fa fa-cogs bg-happy-itmeo`,
  "Design and Composites Meeting": `fa fa-anchor bg-happy-fisher`,
  "Hydrogen Meeting": `fa fa-atom bg-mixed-hopes`,
};

const departmentColors: {
  "General Meeting": string;
  "Leaders Meeting": string;
  "Electrical Systems Meeting": string;
  "Mechanical Systems Meeting": string;
  "Design and Composites Meeting": string;
  "Management and Marketing Meeting": string;
  "Hydrogen Meeting": string;
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
  "Hydrogen Meeting": "bg-mixed-hopes",
  "Sponsor Meeting": "bg-amy-crisp",
  Competition: "bg-amy-crisp",
  Other: "bg-premium-dark",
};

export { meetingIcons, departmentColors };