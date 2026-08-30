import React from 'react';

const Badge = ({ children, variant = 'primary', icon: Icon, className = '', style = {} }) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
