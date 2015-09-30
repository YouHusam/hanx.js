'use strict';

/**
 * Returns a better error message because waterline's errors are terrible.
 * The order of the errors is the same order of the rules in the model.
 * To change priority, change the order of rules.
 * @param err Error object passed.
 * @returns {string} Error message to be sent in reply.
 */
exports.getErrorMessage = function (err) {
  var message = '';

  if (err.code === 'E_VALIDATION') {
    for (var attribute in err.invalidAttributes) {
      for (var errRule in err.invalidAttributes[attribute]) {
        switch (err.invalidAttributes[attribute][errRule].rule) {
          case 'required':
            attribute = attribute.charAt(0).toUpperCase() + attribute.substring(1);
            message = attribute + ' cannot be blank';
            break;
          case 'email':
            message = 'Invalid email format.';
            break;
          case 'unique':
            attribute = attribute.charAt(0).toUpperCase() + attribute.substring(1);
            message = attribute + ' already exists.';
            break;
          case 'password':
            message = 'Password should be at least 6 characters long.';
            break;
          default:
            attribute = attribute.charAt(0).toUpperCase() + attribute.substring(1);
            message = attribute + ' is invalid.';
        }
      }
    }
  } else {
    message = 'Something went wrong';
  }

  return message;
};
