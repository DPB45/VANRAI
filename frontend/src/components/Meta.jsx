import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
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

Meta.defaultProps = {
  title: 'Vanrai Spices | Authentic Indian Masalas',
  description: 'Buy the best authentic Indian spices, masalas, and herbs. 100% natural and FSSAI certified.',
  keywords: 'spices, masala, indian food, turmeric, chilli powder, vanrai',
};

export default Meta;