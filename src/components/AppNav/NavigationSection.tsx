type Props = {
  children?: React.ReactNode;
};

const NavigationSection = ({ children }: Props) => {
  return <div className="metismenu vertical-nav-menu">{children}</div>;
};

export default NavigationSection;
