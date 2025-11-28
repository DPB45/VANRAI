// This is the static data for recipes and articles
export const recipeData = [
  {
    slug: 'ultimate-chicken-tikka-masala',
    title: 'The Ultimate Chicken Tikka Masala',
    description: 'Master this iconic Indian curry at home with our signature spice blend. A perfect weekend delight for the family.',
    imageUrl: '/images/chicken-tikka.jpg', // MUST be in public/images/
    tags: ['Non-Veg', 'Dinner', 'Curry'],
    prepTime: '20 min',
    totalTime: '45 min',
    type: 'article',
    content: {
      videoUrl: 'https://www.youtube.com/embed/wm5vqZcl8BQ', // Correct embed format
      ingredients: [
        '500g chicken breast, cubed',
        '1 cup yogurt',
        '1 tbsp Vanrai Tikka Masala',
        '1 tsp Vanrai Turmeric Powder',
        '1 tsp Vanrai Red Chilli Powder',
        '1 tbsp ginger-garlic paste',
        '1 cup tomato puree',
        '1/2 cup heavy cream',
        'Salt to taste'
      ],
      steps: [
        'Marinate the chicken with yogurt, ginger-garlic paste, and all the Vanrai spice powders for at least 1 hour.',
        'Grill or pan-sear the chicken until cooked through. Set aside.',
        'In a pan, heat a little oil. Add the tomato puree and cook for 5-7 minutes.',
        'Stir in the heavy cream and the cooked chicken pieces.',
        'Simmer for 10 minutes. Serve hot with naan or rice.'
      ]
    }
  },
  {
    slug: 'spiced-lentil-soup',
    title: 'Hearty & Humble Spiced Lentil Soup',
    description: 'A comforting blend of lentils, infused with cumin, coriander, and ginger. A perfect meal for a cozy evening.',
    imageUrl: '/images/hearty-soup.jpg', // MUST be in public/images/
    tags: ['Vegetarian', 'Healthy', 'Quick Meal'],
    prepTime: '10 min',
    totalTime: '30 min',
    type: 'article',
    content: {
      videoUrl: 'https://www.youtube.com/embed/7HaIYuRzRok', // Correct embed format
      ingredients: [
        '1 cup red lentils (masoor dal)',
        '4 cups vegetable broth',
        '1 onion, chopped',
        '2 carrots, chopped',
        '1 tsp Vanrai Cumin Seeds',
        '1 tsp Vanrai Coriander Powder',
        '1/2 tsp Vanrai Turmeric Powder',
        '1 tbsp olive oil'
      ],
      steps: [
        'Heat olive oil in a pot. Add cumin seeds and let them splutter.',
        'Add onion and sauté until golden.',
        'Add carrots, lentils, broth, and the remaining spices.',
        'Bring to a boil, then simmer for 20 minutes until lentils are soft.',
        'Blend half the soup for a creamy texture, then return to the pot. Serve hot.'
      ]
    }
  },
  {
    slug: 'demystifying-garam-masala',
    title: 'Demystifying Garam Masala: A Blend of History',
    description: 'Explore the ancient origins and diverse regional variations of India\'s most famous spice blend.',
    imageUrl: '/images/garm-masala.jpg', // New local placeholder
    tags: ['Culture', 'DIY', 'Spices'],
    prepTime: 'N/A',
    totalTime: '5 min read',
    type: 'article',
    content: {
      videoUrl: 'https://www.youtube.com/embed/f5_E0SknU7Q', // Placeholder
      articleBody: [
        'Garam Masala, which translates to "hot spice," is the heart of many Indian dishes. But it\'s not just about heat; it\'s about warmth and complexity.',
        'The blend varies dramatically from region to region. A Punjabi Garam Masala might be heavy on black cardamom and cumin, while a Bengali version might include nutmeg and mace.',
        'At Vanrai Spices, our Garam Masala is a traditional blend designed for balance and aroma, perfect for finishing curries, dals, and vegetable dishes. It combines cinnamon, cloves, black pepper, and cardamom to create a symphony of flavor.'
      ]
    }
  },
  {
    slug: 'creamy-coconut-lentil-curry-video',
    title: 'VIDEO: Creamy Coconut Lentil Curry',
    description: 'Watch and learn how to prepare a quick, delicious, and vegan coconut lentil curry using Vanrai Spices.',
    imageUrl: '/images/coconut-curry.jpg', // MUST be in public/images/
    tags: ['Video', 'Vegan', 'Quick Meal'],
    prepTime: '5 min',
    totalTime: '20 min',
    type: 'video',
    content: {
      videoUrl: 'https://www.youtube.com/embed/6WoImGpSGq8', // Correct embed format
      ingredients: [
        '1 cup green lentils',
        '1 can coconut milk',
        '1 tbsp Vanrai Garam Masala',
        '1 onion, chopped',
        '2 cloves garlic, minced'
      ],
      steps: [
        'Sauté onion and garlic in a pot.',
        'Add lentils, 3 cups of water, and Garam Masala. Simmer for 15 minutes.',
        'Stir in coconut milk and cook for another 5 minutes.',
        'Serve over rice.'
      ]
    }
  },
  {
    slug: 'classic-paneer-tikka',
    title: 'Classic Paneer Tikka (Grilled Indian Cheese)',
    description: 'Deliciously marinated cubes of paneer grilled to perfection. A popular appetizer or snack.',
    imageUrl: '/images/paneer-tikka.jpg', // New local placeholder
    tags: ['Vegetarian', 'Appetizer', 'Grill'],
    prepTime: '15 min + marination',
    totalTime: '30 min',
    type: 'article',
    content: {
      videoUrl: 'https://www.youtube.com/embed/c-oVDb-O2Q8',
      ingredients: [
        '250g paneer, cut into 1-inch cubes',
        '1/2 cup thick yogurt (hung curd)',
        '1 tbsp ginger-garlic paste',
        '1 tbsp Vanrai Tandoori Masala (or Garam Masala)',
        '1 tsp Vanrai Red Chilli Powder',
        '1/2 tsp Vanrai Turmeric Powder',
        '1 tbsp lemon juice',
        '1 tbsp gram flour (besan), lightly roasted',
        'Salt to taste',
        '1 onion, cut into chunks',
        '1 bell pepper (capsicum), cut into chunks',
        'Oil for grilling'
      ],
      steps: [
        'In a bowl, mix yogurt, ginger-garlic paste, Vanrai spices, lemon juice, roasted besan, and salt.',
        'Gently fold in the paneer cubes, onion chunks, and bell pepper chunks. Ensure everything is well coated.',
        'Marinate for at least 30 minutes (or longer in the refrigerator).',
        'Thread the marinated paneer and vegetables onto skewers.',
        'Grill on a hot grill, tandoor, or pan-sear until golden brown and slightly charred.',
        'Brush with a little oil or butter while grilling.',
        'Serve hot with mint chutney and lemon wedges.'
      ]
    }
  },
  {
    slug: 'quick-aloo-bhaji',
    title: 'Quick & Spicy Aloo Curry',
    description: 'A simple yet flavorful potato stir-fry that\'s perfect as a side dish or for filling dosas and poori.',
    imageUrl: '/images/aloo-curry.jpg', // New local placeholder
    tags: ['Cooking 101', 'Vegetarian'],
    prepTime: '10 min',
    totalTime: '25 min',
    type: 'article',
    content: {
      videoUrl: 'https://www.youtube.com/embed/k4Su_9NdraE',
      ingredients: [
        '3 large potatoes, boiled and cubed',
        '1 tsp Vanrai Cumin Seeds',
        '1 tsp Vanrai Mustard Seeds',
        '1/2 tsp Vanrai Turmeric Powder',
        '1 green chili, chopped',
        'Fresh coriander for garnish'
      ],
      steps: [
        'Heat oil in a pan. Add mustard seeds and cumin seeds.',
        'Once they pop, add the green chili and turmeric powder.',
        'Add the boiled potato cubes and salt. Stir gently to coat the potatoes with the spices.',
        'Cook for 5-7 minutes until slightly browned.',
        'Garnish with fresh coriander and serve.'
      ]
    }
  },
];