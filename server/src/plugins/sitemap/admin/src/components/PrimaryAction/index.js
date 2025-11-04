import PropTypes from "prop-types";
import { Button } from "@strapi/design-system/Button";

const PrimaryAction = ({ children, onClick, size, variant }) => (
  <Button onClick={onClick} variant={variant} size={size}>
    {children}
  </Button>
);

PrimaryAction.defaultProps = {
  size: 'L',
  variant: 'default',
};

PrimaryAction.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  variant: PropTypes.string,
};

export default PrimaryAction;