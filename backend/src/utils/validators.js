const validators = {
  name: (name) => {
    if (!name || name.length < 20 || name.length > 60) {
      return 'Name must be between 20 and 60 characters';
    }
    return null;
  },

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (password) => {
    if (!password || password.length < 8 || password.length > 16) {
      return 'Password must be 8-16 characters';
    }
    return null;
  },

  address: (address) => {
    if (!address || address.length > 400) {
      return 'Address must not exceed 400 characters';
    }
    return null;
  },

  rating: (rating) => {
    const num = parseInt(rating);
    if (isNaN(num) || num < 1 || num > 5) {
      return 'Rating must be between 1 and 5';
    }
    return null;
  },

  validateAll: (data, fields) => {
    const errors = {};
    fields.forEach(field => {
      if (validators[field]) {
        const error = validators[field](data[field]);
        if (error) errors[field] = error;
      }
    });
    return Object.keys(errors).length > 0 ? errors : null;
  }
};

module.exports = validators;