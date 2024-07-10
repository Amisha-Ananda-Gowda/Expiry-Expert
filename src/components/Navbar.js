import React from 'react';

const Navbar = ({ categories, onCategoryClick, onCategoryEdit }) => {
  return (
    <nav>
      <ul>
        {categories.map((category) => (
          <li key={category} onClick={() => onCategoryClick(category)}>
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
