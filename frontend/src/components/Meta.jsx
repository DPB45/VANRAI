import React from 'react';
import { Helmet } from 'react-helmet-async';

// NOTE: React 19 removed support for `Component.defaultProps` on function
// components (it's a no-op there), so defaults are declared directly in the
// function signature instead.
const Meta = ({
  title = 'Vanrai Spices | Authentic Indian Masalas',
  description = 'Buy the best authentic Indian spices, masalas, and herbs. 100% natural and FSSAI certified.',
  keywords = 'spices, masala, indian food, turmeric, chilli powder, vanrai',
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default Meta;